"""
Bandeja de seguimiento administrativo (Fase 2B).
"""
from __future__ import annotations

from datetime import datetime, timedelta

from sqlalchemy.orm import Session

from app.models import Membership, MembershipFollowUp, MembershipFollowUpAudit, User
from app.services.membership_admin import list_client_entries, resolve_expiring_soon_days
from app.utils.timezone import operational_now, operational_today

VALID_FOLLOWUP_TYPES = {"por_vencer", "vence_hoy", "vencido", "adeudo", "renovacion", "otro"}
VALID_CHANNELS = {"whatsapp", "llamada", "presencial", "nota_interna"}
VALID_FOLLOWUP_STATUSES = {
    "pendiente",
    "contactado",
    "respondio",
    "sin_respuesta",
    "renovado",
    "descartado",
}

PRIORITY_RANK = {
    "vencidos_con_adeudo": 1,
    "vence_hoy": 2,
    "vencidos_sin_contacto": 3,
    "por_vencer": 4,
    "seguimientos_atrasados": 5,
    "seguimientos_hoy": 6,
    "suspendidos_con_adeudo": 7,
    "con_adeudo": 8,
    "vencido": 9,
    "suspendido": 10,
    "otro": 99,
}

RECOMMENDED_ACTIONS = {
    "vencidos_con_adeudo": "Contactar por adeudo y renovacion urgente",
    "vence_hoy": "Recordar vencimiento hoy y ofrecer renovacion",
    "vencidos_sin_contacto": "Contactar socio vencido sin seguimiento reciente",
    "por_vencer": "Recordar vencimiento proximo",
    "seguimientos_atrasados": "Retomar seguimiento atrasado",
    "seguimientos_hoy": "Ejecutar seguimiento programado para hoy",
    "suspendidos_con_adeudo": "Revisar suspension y adeudo pendiente",
    "con_adeudo": "Gestionar saldo pendiente",
    "vencido": "Ofrecer renovacion",
    "suspendido": "Revisar estado de suspension",
    "otro": "Dar seguimiento",
}


def _followup_snapshot(f: MembershipFollowUp) -> dict:
    return {
        "id": f.id,
        "user_id": f.user_id,
        "status": f.status,
        "channel": f.channel,
        "followup_type": f.followup_type,
        "contact_at": f.contact_at.isoformat() if f.contact_at else None,
        "next_followup_at": f.next_followup_at.isoformat() if f.next_followup_at else None,
        "note": f.note,
    }


def record_followup_audit(
    db: Session,
    *,
    followup: MembershipFollowUp,
    changed_by: int,
    event: str,
    old_payload: dict,
    new_payload: dict,
    reason: str | None = None,
) -> None:
    db.add(
        MembershipFollowUpAudit(
            followup_id=followup.id,
            changed_by=changed_by,
            event=event,
            reason=reason,
            old_payload=old_payload,
            new_payload=new_payload,
        )
    )


def _is_contacted_recently(followup: MembershipFollowUp | None, now: datetime) -> bool:
    if not followup:
        return False
    if followup.status not in {"contactado", "respondio", "renovado"}:
        return False
    ref = followup.contact_at or followup.updated_at or followup.created_at
    if not ref:
        return False
    if ref.tzinfo is None:
        ref = ref.replace(tzinfo=now.tzinfo)
    return (now - ref) <= timedelta(hours=24)


def _infer_followup_type_from_status(membership_status: str) -> str:
    mapping = {
        "proxima_a_vencer": "por_vencer",
        "vence_hoy": "vence_hoy",
        "vencida": "vencido",
        "con_adeudo": "adeudo",
        "suspendida": "otro",
        "activa": "otro",
    }
    return mapping.get(membership_status, "otro")


def _assign_priority_category(
    entry: dict,
    latest_followup: MembershipFollowUp | None,
    today,
    now: datetime,
) -> str:
    status = entry.get("status") or ""
    pending = float(entry.get("pending_balance_total") or entry.get("pending_balance") or 0.0)
    contacted_recently = _is_contacted_recently(latest_followup, now)

    if latest_followup and latest_followup.next_followup_at:
        next_day = (
            latest_followup.next_followup_at.date()
            if hasattr(latest_followup.next_followup_at, "date")
            else latest_followup.next_followup_at
        )
        if (
            latest_followup.status in {"pendiente", "contactado", "sin_respuesta"}
            and next_day < today
        ):
            return "seguimientos_atrasados"
        if (
            latest_followup.status in {"pendiente", "contactado", "sin_respuesta"}
            and next_day == today
        ):
            return "seguimientos_hoy"

    if pending > 0 and status in {"vencida", "con_adeudo"}:
        return "vencidos_con_adeudo"
    if status == "vence_hoy":
        return "vence_hoy"
    if status == "vencida" and not contacted_recently:
        return "vencidos_sin_contacto"
    if status == "proxima_a_vencer":
        return "por_vencer"
    if status == "suspendida" and pending > 0:
        return "suspendidos_con_adeudo"
    if status == "con_adeudo":
        return "con_adeudo"
    if status == "vencida":
        return "vencido"
    if status == "suspendida":
        return "suspendido"
    return "otro"


def _latest_followups_by_user(db: Session) -> dict[int, MembershipFollowUp]:
    followups = (
        db.query(MembershipFollowUp)
        .order_by(MembershipFollowUp.user_id, MembershipFollowUp.created_at.desc())
        .all()
    )
    result: dict[int, MembershipFollowUp] = {}
    for f in followups:
        if f.user_id not in result:
            result[f.user_id] = f
    return result


def _followup_to_payload(f: MembershipFollowUp, creators: dict[int, str]) -> dict:
    return {
        "id": f.id,
        "user_id": f.user_id,
        "membership_id": f.membership_id,
        "membership_cycle_id": f.membership_cycle_id,
        "followup_type": f.followup_type,
        "channel": f.channel,
        "status": f.status,
        "contact_at": f.contact_at.isoformat() if f.contact_at else None,
        "next_followup_at": f.next_followup_at.isoformat() if f.next_followup_at else None,
        "note": f.note,
        "created_by": f.created_by,
        "updated_by": f.updated_by,
        "created_at": f.created_at.isoformat() if f.created_at else None,
        "updated_at": f.updated_at.isoformat() if f.updated_at else None,
        "created_by_name": creators.get(f.created_by),
        "updated_by_name": creators.get(f.updated_by) if f.updated_by else None,
    }


def build_followup_inbox(
    db: Session,
    *,
    status_filter: str = "todos",
    search: str = "",
    include_historical: bool = False,
) -> list[dict]:
    today = operational_today()
    now = operational_now()
    expiring_days = resolve_expiring_soon_days()
    entries = list_client_entries(
        db,
        status_filter="todos",
        search=search,
        active_only=True,
        include_historical=include_historical,
    )
    latest_by_user = _latest_followups_by_user(db)
    creators = {u.id: u.name for u in db.query(User).all()}

    inbox: list[dict] = []
    for entry in entries:
        membership_status = entry.get("status") or ""
        pending = float(entry.get("pending_balance_total") or entry.get("pending_balance") or 0.0)
        latest = latest_by_user.get(entry["user_id"])

        relevant = membership_status in {
            "proxima_a_vencer",
            "vence_hoy",
            "vencida",
            "con_adeudo",
            "suspendida",
        }
        has_followup_due = False
        if latest and latest.next_followup_at and latest.status in {"pendiente", "contactado", "sin_respuesta"}:
            next_day = latest.next_followup_at.date() if isinstance(latest.next_followup_at, datetime) else latest.next_followup_at
            has_followup_due = next_day <= today

        if not relevant and not has_followup_due:
            if latest and latest.status == "pendiente":
                pass
            else:
                continue

        if membership_status == "suspendida" and pending <= 0 and not has_followup_due:
            continue

        if not include_historical and entry.get("is_historical_only_member"):
            continue
        if not include_historical and entry.get("is_historical_import"):
            continue

        priority_category = _assign_priority_category(entry, latest, today, now)
        if priority_category == "otro" and not has_followup_due:
            continue

        contacted_recently = _is_contacted_recently(latest, now)
        item = {
            **entry,
            "priority_category": priority_category,
            "priority_rank": PRIORITY_RANK.get(priority_category, 99),
            "recommended_action": RECOMMENDED_ACTIONS.get(priority_category, "Dar seguimiento"),
            "last_followup": _followup_to_payload(latest, creators) if latest else None,
            "active_followup_id": latest.id if latest else None,
            "followup_status": latest.status if latest else None,
            "next_followup_at": latest.next_followup_at.isoformat() if latest and latest.next_followup_at else None,
            "contacted_recently": contacted_recently,
            "expiring_soon_days": expiring_days,
        }
        inbox.append(item)

    inbox.sort(key=lambda x: (x["priority_rank"], x.get("end_date") or "9999-12-31", x["name"]))
    return _apply_inbox_filter(inbox, status_filter, today)


def _apply_inbox_filter(items: list[dict], status_filter: str, today) -> list[dict]:
    f = (status_filter or "todos").strip().lower()
    if f == "todos":
        return items
    if f == "por_vencer":
        return [i for i in items if i["priority_category"] == "por_vencer" or i.get("status") == "proxima_a_vencer"]
    if f == "vence_hoy":
        return [i for i in items if i.get("status") == "vence_hoy"]
    if f == "vencidos":
        return [i for i in items if i.get("status") == "vencida" or i["priority_category"].startswith("vencido")]
    if f == "adeudo":
        return [i for i in items if float(i.get("pending_balance_total") or i.get("pending_balance") or 0) > 0]
    if f == "seguimiento_pendiente":
        return [i for i in items if i.get("followup_status") == "pendiente"]
    if f == "contactados":
        return [i for i in items if i.get("followup_status") in {"contactado", "respondio"}]
    if f == "sin_respuesta":
        return [i for i in items if i.get("followup_status") == "sin_respuesta"]
    if f == "renovados":
        return [i for i in items if i.get("followup_status") == "renovado"]
    if f == "descartados":
        return [i for i in items if i.get("followup_status") == "descartado"]
    if f == "seguimientos_atrasados":
        return [i for i in items if i["priority_category"] == "seguimientos_atrasados"]
    return items


def build_followup_summary(db: Session, *, include_historical: bool = False) -> dict:
    inbox = build_followup_inbox(db, status_filter="todos", include_historical=include_historical)
    today = operational_today()
    now = operational_now()

    def count_cat(*cats: str) -> int:
        return sum(1 for i in inbox if i["priority_category"] in cats)

    contacted_today = (
        db.query(MembershipFollowUp)
        .filter(MembershipFollowUp.status.in_(["contactado", "respondio", "renovado"]))
        .all()
    )
    contacted_today_count = sum(
        1
        for f in contacted_today
        if f.contact_at and f.contact_at.date() == today
        or (not f.contact_at and f.updated_at and f.updated_at.date() == today)
    )

    renovados_hoy = (
        db.query(MembershipFollowUp)
        .filter(MembershipFollowUp.status == "renovado")
        .all()
    )
    renovados_hoy_count = sum(1 for f in renovados_hoy if f.updated_at and f.updated_at.date() == today)

    pendientes_hoy = count_cat("seguimientos_hoy") + sum(
        1 for i in inbox if i.get("followup_status") == "pendiente" and i["priority_category"] != "seguimientos_atrasados"
    )

    return {
        "pendientes_hoy": pendientes_hoy,
        "vence_hoy": sum(1 for i in inbox if i.get("status") == "vence_hoy"),
        "vencidos": sum(1 for i in inbox if i.get("status") == "vencida"),
        "con_adeudo": sum(1 for i in inbox if float(i.get("pending_balance_total") or 0) > 0),
        "contactados_hoy": contacted_today_count,
        "renovados_despues_seguimiento": renovados_hoy_count,
        "seguimientos_atrasados": count_cat("seguimientos_atrasados"),
        "total_bandeja": len(inbox),
        "operational_date": today.isoformat(),
    }


def create_followup(
    db: Session,
    *,
    admin: User,
    payload: dict,
) -> MembershipFollowUp:
    user = db.query(User).filter(User.id == payload["user_id"], User.role == "socio").first()
    if not user:
        raise ValueError("Cliente no encontrado")

    followup_type = payload.get("followup_type", "otro")
    channel = payload.get("channel", "nota_interna")
    status = payload.get("status", "pendiente")
    if followup_type not in VALID_FOLLOWUP_TYPES:
        raise ValueError("Tipo de seguimiento invalido")
    if channel not in VALID_CHANNELS:
        raise ValueError("Canal invalido")
    if status not in VALID_FOLLOWUP_STATUSES:
        raise ValueError("Estado de seguimiento invalido")

    membership = db.query(Membership).filter(Membership.user_id == user.id).first()
    cycle_id = payload.get("membership_cycle_id")
    contact_at = payload.get("contact_at")
    if status in {"contactado", "respondio", "renovado"} and not contact_at:
        contact_at = operational_now()

    followup = MembershipFollowUp(
        user_id=user.id,
        membership_id=membership.id if membership else None,
        membership_cycle_id=cycle_id,
        followup_type=followup_type,
        channel=channel,
        status=status,
        contact_at=contact_at,
        next_followup_at=payload.get("next_followup_at"),
        note=(payload.get("note") or "").strip() or None,
        created_by=admin.id,
        updated_by=admin.id,
    )
    db.add(followup)
    db.flush()
    record_followup_audit(
        db,
        followup=followup,
        changed_by=admin.id,
        event="followup_created",
        old_payload={},
        new_payload=_followup_snapshot(followup),
        reason="Creacion de seguimiento",
    )
    return followup


def update_followup(
    db: Session,
    *,
    followup: MembershipFollowUp,
    admin: User,
    updates: dict,
) -> MembershipFollowUp:
    old = _followup_snapshot(followup)
    events: list[str] = []

    if updates.get("followup_type") is not None:
        if updates["followup_type"] not in VALID_FOLLOWUP_TYPES:
            raise ValueError("Tipo de seguimiento invalido")
        followup.followup_type = updates["followup_type"]
        events.append("type_changed")
    if updates.get("channel") is not None:
        if updates["channel"] not in VALID_CHANNELS:
            raise ValueError("Canal invalido")
        followup.channel = updates["channel"]
    if updates.get("status") is not None:
        if updates["status"] not in VALID_FOLLOWUP_STATUSES:
            raise ValueError("Estado invalido")
        followup.status = updates["status"]
        events.append("status_changed")
        if updates["status"] in {"contactado", "respondio", "renovado"} and not followup.contact_at:
            followup.contact_at = operational_now()
            events.append("marked_contacted")
    if "contact_at" in updates:
        followup.contact_at = updates["contact_at"]
    if "next_followup_at" in updates:
        followup.next_followup_at = updates["next_followup_at"]
        events.append("next_date_changed")
    if updates.get("note") is not None:
        followup.note = updates["note"].strip() or None
        events.append("note_updated")

    followup.updated_by = admin.id
    record_followup_audit(
        db,
        followup=followup,
        changed_by=admin.id,
        event=",".join(events) or "followup_updated",
        old_payload=old,
        new_payload=_followup_snapshot(followup),
    )
    return followup


def list_user_followups(db: Session, user_id: int) -> list[dict]:
    creators = {u.id: u.name for u in db.query(User).all()}
    rows = (
        db.query(MembershipFollowUp)
        .filter(MembershipFollowUp.user_id == user_id)
        .order_by(MembershipFollowUp.created_at.desc())
        .all()
    )
    return [_followup_to_payload(f, creators) for f in rows]
