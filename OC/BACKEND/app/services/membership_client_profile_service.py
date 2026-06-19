"""
Expediente administrativo completo de un socio (Fase 2B.1).
"""
from __future__ import annotations

from datetime import date

from sqlalchemy.orm import Session

from app.domain.membership_rules import MembershipStatusContext, resolve_membership_status
from app.models import Membership, MembershipCycle, MembershipFollowUp, MembershipNote, MembershipPayment, User
from app.services.membership_admin import (
    _days_meta,
    _last_payment_for_user,
    build_client_entry,
    cycle_balance_paid,
    resolve_expiring_soon_days,
)
from app.services.membership_followup_service import (
    _is_contacted_recently,
    list_user_followups,
)
from app.services.membership_payment_service import PaymentReversalBlockedError, validate_payment_reversal
from app.utils.timezone import operational_now, operational_today


def _payment_reversal_meta(db: Session, payment: MembershipPayment, cycle: MembershipCycle | None) -> dict:
    if payment.reversed_at:
        return {"can_reverse": False, "reversal_block_reason": "Pago ya revertido"}
    if not cycle:
        return {"can_reverse": False, "reversal_block_reason": "Ciclo no encontrado"}
    try:
        validate_payment_reversal(db, payment, cycle)
        return {"can_reverse": True, "reversal_block_reason": None}
    except PaymentReversalBlockedError as exc:
        return {"can_reverse": False, "reversal_block_reason": exc.message}


def _cycle_payment_stats(payments: list[MembershipPayment]) -> dict:
    active = [p for p in payments if not p.reversed_at]
    reversed_count = sum(1 for p in payments if p.reversed_at)
    courtesies = sum(
        1 for p in active if p.payment_method == "cortesia" or p.payment_action == "courtesy_extend"
    )
    adjustments = sum(
        1
        for p in active
        if p.payment_method == "ajuste" or p.payment_action == "admin_adjustment"
    )
    return {
        "payments_count": len(active),
        "reversed_payments_count": reversed_count,
        "courtesies_count": courtesies,
        "adjustments_count": adjustments,
        "courtesies_total": float(sum(p.amount for p in active if p.payment_method == "cortesia")),
        "adjustments_total": float(
            sum(p.amount for p in active if p.payment_method == "ajuste" or p.payment_action == "admin_adjustment")
        ),
    }


def _status_tags(status: str, *, contacted_recently: bool, pending_balance: float) -> list[str]:
    tags: list[str] = []
    mapping = {
        "activa": "al_corriente",
        "proxima_a_vencer": "por_vencer",
        "vence_hoy": "vence_hoy",
        "vencida": "vencido",
        "con_adeudo": "con_adeudo",
        "suspendida": "suspendido",
    }
    if status in mapping:
        tags.append(mapping[status])
    if contacted_recently:
        tags.append("contactado_recientemente")
    if pending_balance > 0 and "con_adeudo" not in tags and status != "con_adeudo":
        tags.append("con_adeudo")
    return tags


def build_client_profile(db: Session, user: User, membership: Membership) -> dict:
    today = operational_today()
    expiring_days = resolve_expiring_soon_days()
    creators = {u.id: u.name for u in db.query(User).all()}

    summary = build_client_entry(
        db,
        user,
        membership,
        today,
        expiring_days,
        include_historical=True,
    )
    followups = list_user_followups(db, user.id)
    latest_followup = followups[0] if followups else None

    cycles = (
        db.query(MembershipCycle)
        .filter(MembershipCycle.membership_id == membership.id)
        .order_by(MembershipCycle.created_at.desc())
        .all()
    )
    cycle_ids = [c.id for c in cycles]
    cycles_by_id = {c.id: c for c in cycles}

    payments = (
        db.query(MembershipPayment)
        .filter(MembershipPayment.membership_cycle_id.in_(cycle_ids))
        .order_by(MembershipPayment.payment_date.desc(), MembershipPayment.created_at.desc())
        .all()
        if cycle_ids
        else []
    )
    payments_by_cycle: dict[int, list[MembershipPayment]] = {}
    for p in payments:
        payments_by_cycle.setdefault(p.membership_cycle_id, []).append(p)

    notes = (
        db.query(MembershipNote)
        .filter(MembershipNote.user_id == user.id)
        .order_by(MembershipNote.created_at.desc())
        .all()
    )
    notes_by_cycle: dict[int | None, list[MembershipNote]] = {}
    for n in notes:
        notes_by_cycle.setdefault(n.membership_cycle_id, []).append(n)

    active_cycle = next((c for c in cycles if c.is_active_cycle and not c.is_historical_import), None)
    if not active_cycle:
        active_cycle = next((c for c in cycles if c.is_historical_import), None)

    orm_latest = (
        db.query(MembershipFollowUp)
        .filter(MembershipFollowUp.user_id == user.id)
        .order_by(MembershipFollowUp.created_at.desc())
        .first()
    )
    contacted_recently = _is_contacted_recently(orm_latest, operational_now())

    has_pending_followup = bool(
        orm_latest
        and orm_latest.status in {"pendiente", "contactado", "sin_respuesta"}
        and orm_latest.next_followup_at
        and (
            orm_latest.next_followup_at.date()
            if hasattr(orm_latest.next_followup_at, "date")
            else orm_latest.next_followup_at
        )
        <= today
    )

    last_payment = _last_payment_for_user(db, user.id)
    last_payment_payload = None
    if last_payment:
        last_payment_payload = {
            "payment_id": last_payment.id,
            "payment_date": last_payment.payment_date.isoformat() if last_payment.payment_date else None,
            "amount": float(last_payment.amount),
            "payment_method": last_payment.payment_method,
        }

    def cycle_payload(c: MembershipCycle, *, include_notes: bool = False) -> dict:
        cycle_payments = payments_by_cycle.get(c.id, [])
        total_paid = cycle_balance_paid(db, c.id)
        forced = c.status if c.status == "suspendida" else None
        computed_status = resolve_membership_status(
            MembershipStatusContext(
                status_flag=forced,
                end_date=c.end_date,
                cost=c.cost,
                total_paid=total_paid,
                today=today,
                expiring_soon_days=expiring_days,
            )
        )
        stats = _cycle_payment_stats(cycle_payments)
        payload = {
            "id": c.id,
            "membership_id": c.membership_id,
            "user_id": c.user_id,
            "membership_type": c.membership_type,
            "cost": float(c.cost),
            "start_date": c.start_date.isoformat(),
            "end_date": c.end_date.isoformat(),
            "status": computed_status,
            "raw_status": c.status,
            "is_active_cycle": c.is_active_cycle,
            "is_historical_import": bool(c.is_historical_import),
            "historical_source": c.historical_source,
            "import_batch_id": c.import_batch_id,
            "created_at": c.created_at.isoformat() if c.created_at else None,
            "updated_at": c.updated_at.isoformat() if c.updated_at else None,
            "total_paid": total_paid,
            "pending_balance": max(float(c.cost) - total_paid, 0.0),
            **stats,
            **_days_meta(c.end_date, today),
        }
        if include_notes:
            payload["notes"] = [
                {
                    "id": n.id,
                    "note": n.note,
                    "created_at": n.created_at.isoformat() if n.created_at else None,
                    "created_by_name": creators.get(n.created_by),
                    "note_type": "general",
                }
                for n in notes_by_cycle.get(c.id, [])
            ]
        return payload

    historical_pending = 0.0
    current_pending = 0.0
    debts: list[dict] = []
    for c in cycles:
        cp = cycle_payload(c)
        pending = cp["pending_balance"]
        if active_cycle and c.id == active_cycle.id:
            current_pending = pending
        else:
            historical_pending += pending
        if pending > 0:
            debts.append(
                {
                    "cycle_id": c.id,
                    "membership_type": c.membership_type,
                    "concept": f"Ciclo {c.membership_type}",
                    "pending_balance": pending,
                    "is_active_cycle": c.is_active_cycle,
                    "end_date": c.end_date.isoformat(),
                    "days_overdue": cp.get("days_overdue"),
                    "status": cp["status"],
                }
            )

    payment_payloads = []
    for p in payments:
        cycle = cycles_by_id.get(p.membership_cycle_id)
        reversal_meta = _payment_reversal_meta(db, p, cycle)
        payment_payloads.append(
            {
                "id": p.id,
                "membership_cycle_id": p.membership_cycle_id,
                "user_id": p.user_id,
                "payment_date": p.payment_date.isoformat() if p.payment_date else None,
                "amount": float(p.amount),
                "payment_method": p.payment_method,
                "payment_action": p.payment_action,
                "period_start_date": p.period_start_date.isoformat() if p.period_start_date else None,
                "period_end_date": p.period_end_date.isoformat() if p.period_end_date else None,
                "counts_as_income": p.counts_as_income,
                "applies_to_balance": p.applies_to_balance,
                "previous_end_date": p.previous_end_date.isoformat() if p.previous_end_date else None,
                "extended_end_date": p.extended_end_date.isoformat() if p.extended_end_date else None,
                "concept": p.concept,
                "observations": p.observations,
                "created_by": p.created_by,
                "created_at": p.created_at.isoformat() if p.created_at else None,
                "created_by_name": creators.get(p.created_by),
                "reversed_at": p.reversed_at.isoformat() if p.reversed_at else None,
                "reversed_by": p.reversed_by,
                "reversed_by_name": creators.get(p.reversed_by) if p.reversed_by else None,
                "reversal_reason": p.reversal_reason,
                "is_reversed": p.reversed_at is not None,
                "status_label": "REVERTIDO" if p.reversed_at else "ACTIVO",
                "is_historical_import": bool(
                    (cycle and cycle.is_historical_import)
                    or (p.concept and "Importacion historica" in (p.concept or ""))
                ),
                "historical_source": cycle.historical_source if cycle else None,
                "import_batch_id": cycle.import_batch_id if cycle else None,
                **reversal_meta,
            }
        )

    status = summary.get("status") or "vencida"
    total_pending = historical_pending + current_pending
    tags = _status_tags(status, contacted_recently=contacted_recently, pending_balance=total_pending)

    active_cycle_payload = cycle_payload(active_cycle, include_notes=True) if active_cycle else None

    return {
        "user_id": user.id,
        "membership_id": membership.id,
        "name": user.name,
        "phone": user.phone,
        "created_at": user.created_at.isoformat() if user.created_at else None,
        "general": {
            "status": status,
            "membership_type": summary.get("membership_type"),
            "cost": summary.get("cost", 0.0),
            "start_date": summary.get("start_date"),
            "end_date": summary.get("end_date"),
            "days_remaining": summary.get("days_remaining"),
            "days_overdue": summary.get("days_overdue"),
            "total_paid": summary.get("total_paid", 0.0),
            "current_pending_balance": current_pending,
            "historical_pending_balance": historical_pending,
            "total_pending_balance": total_pending,
            "last_payment": last_payment_payload,
            "last_followup": latest_followup,
            "next_followup_at": latest_followup.get("next_followup_at") if latest_followup else None,
            "tags": tags,
            "is_recently_contacted": contacted_recently,
            "has_pending_followup": has_pending_followup,
            "expiring_soon_days": expiring_days,
            "is_historical_only_member": summary.get("is_historical_only_member", False),
            "is_historical_import": summary.get("is_historical_import", False),
            "historical_source": summary.get("historical_source"),
            "import_batch_id": summary.get("import_batch_id"),
        },
        "active_cycle": active_cycle_payload,
        "cycles_history": [cycle_payload(c) for c in cycles],
        "payments": payment_payloads,
        "debts": debts,
        "followups": followups,
        "notes": [
            {
                "id": n.id,
                "user_id": n.user_id,
                "membership_id": n.membership_id,
                "membership_cycle_id": n.membership_cycle_id,
                "note": n.note,
                "created_by": n.created_by,
                "created_at": n.created_at.isoformat() if n.created_at else None,
                "created_by_name": creators.get(n.created_by),
                "note_type": "general",
            }
            for n in notes
        ],
        "flags": {
            "can_register_payment": active_cycle is not None,
            "can_suspend": active_cycle is not None and active_cycle.status != "suspendida",
            "can_unsuspend": active_cycle is not None and active_cycle.status == "suspendida",
            "has_phone": bool(user.phone and str(user.phone).strip()),
            "has_active_cycle": active_cycle is not None,
            "has_payments": len(payment_payloads) > 0,
        },
    }
