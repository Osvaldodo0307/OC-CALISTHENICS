"""
Helpers para panel admin de membresías: resúmenes, alertas y filas de clientes.
"""
from __future__ import annotations

from datetime import date, datetime

from sqlalchemy import and_, exists, func, or_
from sqlalchemy.orm import Session

from app.domain.membership_rules import MembershipStatusContext, resolve_membership_status
from app.utils.timezone import operational_day_bounds, operational_today, payment_to_operational_date
from app.models import Membership, MembershipCycle, MembershipPayment, User

STATUS_FILTER_ALIASES = {
    "al_corriente": "activa",
    "por_vencer": "proxima_a_vencer",
    "vencido": "vencida",
    "suspendido": "suspendida",
}

DEFAULT_CLIENTS_LIMIT = 200
MAX_CLIENTS_LIMIT = 500


def normalize_status_filter(status: str) -> str:
    value = (status or "todos").strip().lower()
    return STATUS_FILTER_ALIASES.get(value, value)


def resolve_expiring_soon_days() -> int:
    import os

    return int(os.getenv("MEMBERSHIP_EXPIRING_SOON_DAYS", "3"))


def _socio_is_active_filter():
    """Incluye socios activos y filas legacy sin is_active explícito (NULL)."""
    return or_(User.is_active.is_(True), User.is_active.is_(None))


def cycle_balance_paid(db: Session, cycle_id: int) -> float:
    return float(
        db.query(func.coalesce(func.sum(MembershipPayment.amount), 0.0))
        .filter(MembershipPayment.membership_cycle_id == cycle_id)
        .filter(MembershipPayment.reversed_at.is_(None))
        .filter(MembershipPayment.applies_to_balance.is_(True))
        .scalar()
        or 0.0
    )


def _cycle_total_paid(db: Session, cycle_id: int) -> float:
    return cycle_balance_paid(db, cycle_id)


def _last_payment_for_user(db: Session, user_id: int) -> MembershipPayment | None:
    return (
        db.query(MembershipPayment)
        .filter(MembershipPayment.user_id == user_id, MembershipPayment.reversed_at.is_(None))
        .order_by(MembershipPayment.payment_date.desc(), MembershipPayment.created_at.desc())
        .first()
    )


def _days_meta(end_date: date | None, today: date) -> dict:
    if not end_date:
        return {"days_remaining": None, "days_overdue": None}
    delta = (end_date - today).days
    if delta >= 0:
        return {"days_remaining": delta, "days_overdue": None}
    return {"days_remaining": None, "days_overdue": abs(delta)}


def is_historical_only_member(db: Session, membership_id: int) -> bool:
    """True si el socio solo tiene ciclos marcados como importacion historica."""
    has_cycles = (
        db.query(MembershipCycle.id)
        .filter(MembershipCycle.membership_id == membership_id)
        .first()
    )
    if not has_cycles:
        return False
    has_operational = (
        db.query(MembershipCycle.id)
        .filter(
            MembershipCycle.membership_id == membership_id,
            MembershipCycle.is_historical_import.is_(False),
        )
        .first()
    )
    return has_operational is None


def _bulk_historical_only_membership_ids(db: Session, membership_ids: list[int]) -> set[int]:
    if not membership_ids:
        return set()
    with_operational = {
        row[0]
        for row in db.query(MembershipCycle.membership_id)
        .filter(
            MembershipCycle.membership_id.in_(membership_ids),
            MembershipCycle.is_historical_import.is_(False),
        )
        .distinct()
        .all()
    }
    with_any = {
        row[0]
        for row in db.query(MembershipCycle.membership_id)
        .filter(MembershipCycle.membership_id.in_(membership_ids))
        .distinct()
        .all()
    }
    return with_any - with_operational


def _bulk_cycle_paid_totals(db: Session, cycle_ids: list[int]) -> dict[int, float]:
    if not cycle_ids:
        return {}
    rows = (
        db.query(
            MembershipPayment.membership_cycle_id,
            func.coalesce(func.sum(MembershipPayment.amount), 0.0),
        )
        .filter(MembershipPayment.membership_cycle_id.in_(cycle_ids))
        .filter(MembershipPayment.reversed_at.is_(None))
        .filter(MembershipPayment.applies_to_balance.is_(True))
        .group_by(MembershipPayment.membership_cycle_id)
        .all()
    )
    return {cycle_id: float(paid) for cycle_id, paid in rows}


def _bulk_last_payments(db: Session, user_ids: list[int]) -> dict[int, MembershipPayment]:
    if not user_ids:
        return {}
    latest_ids = (
        db.query(func.max(MembershipPayment.id).label("payment_id"))
        .filter(MembershipPayment.user_id.in_(user_ids))
        .filter(MembershipPayment.reversed_at.is_(None))
        .group_by(MembershipPayment.user_id)
        .subquery()
    )
    payments = (
        db.query(MembershipPayment)
        .join(latest_ids, MembershipPayment.id == latest_ids.c.payment_id)
        .all()
    )
    return {payment.user_id: payment for payment in payments}


def _bulk_pick_cycles(
    db: Session,
    membership_ids: list[int],
    *,
    historical: bool,
) -> dict[int, MembershipCycle]:
    if not membership_ids:
        return {}
    cycles = (
        db.query(MembershipCycle)
        .filter(
            MembershipCycle.membership_id.in_(membership_ids),
            MembershipCycle.is_historical_import.is_(historical),
        )
        .order_by(MembershipCycle.membership_id, MembershipCycle.end_date.desc(), MembershipCycle.id.desc())
        .all()
    )
    if not historical:
        cycles = [cycle for cycle in cycles if cycle.is_active_cycle]
    picked: dict[int, MembershipCycle] = {}
    for cycle in cycles:
        if cycle.membership_id not in picked:
            picked[cycle.membership_id] = cycle
    return picked


def _bulk_cycles_by_membership(db: Session, membership_ids: list[int]) -> dict[int, list[MembershipCycle]]:
    if not membership_ids:
        return {}
    cycles = db.query(MembershipCycle).filter(MembershipCycle.membership_id.in_(membership_ids)).all()
    grouped: dict[int, list[MembershipCycle]] = {}
    for cycle in cycles:
        grouped.setdefault(cycle.membership_id, []).append(cycle)
    return grouped


def _resolve_display_cycle(
    db: Session,
    membership_id: int,
    *,
    include_historical: bool,
    operational_cycle: MembershipCycle | None = None,
    historical_cycle: MembershipCycle | None = None,
) -> MembershipCycle | None:
    if operational_cycle is None:
        operational_cycle = (
            db.query(MembershipCycle)
            .filter(
                MembershipCycle.membership_id == membership_id,
                MembershipCycle.is_historical_import.is_(False),
                MembershipCycle.is_active_cycle.is_(True),
            )
            .order_by(MembershipCycle.end_date.desc())
            .first()
        )
    if operational_cycle:
        return operational_cycle
    if not include_historical:
        return None
    if historical_cycle is not None:
        return historical_cycle
    return (
        db.query(MembershipCycle)
        .filter(
            MembershipCycle.membership_id == membership_id,
            MembershipCycle.is_historical_import.is_(True),
        )
        .order_by(MembershipCycle.end_date.desc())
        .first()
    )


def _cycle_historical_meta(cycle: MembershipCycle | None) -> dict:
    if not cycle:
        return {
            "is_historical_import": False,
            "historical_source": None,
            "import_batch_id": None,
            "is_historical_only_member": False,
        }
    return {
        "is_historical_import": bool(cycle.is_historical_import),
        "historical_source": cycle.historical_source,
        "import_batch_id": cycle.import_batch_id,
    }


def _payment_payload(payment: MembershipPayment | None) -> dict | None:
    if not payment:
        return None
    return {
        "payment_id": payment.id,
        "payment_date": payment.payment_date.isoformat() if payment.payment_date else None,
        "amount": float(payment.amount),
        "payment_method": payment.payment_method,
    }


def _compose_client_entry(
    *,
    user: User,
    membership: Membership,
    cycle: MembershipCycle | None,
    today: date,
    expiring_soon_days: int,
    historical_only: bool,
    total_paid: float,
    historical_pending: float,
    last_payment: MembershipPayment | None,
) -> dict:
    last_payment_payload = _payment_payload(last_payment)

    if not cycle:
        meta = _days_meta(None, today)
        return {
            "user_id": user.id,
            "membership_id": membership.id,
            "cycle_id": None,
            "name": user.name,
            "phone": user.phone,
            "created_at": user.created_at.isoformat() if user.created_at else None,
            "membership_type": None,
            "cost": 0.0,
            "start_date": None,
            "end_date": None,
            "status": "vencida",
            "total_paid": 0.0,
            "pending_balance": 0.0,
            "historical_pending_balance": 0.0,
            "pending_balance_total": 0.0,
            "last_payment": last_payment_payload,
            "is_historical_only_member": historical_only,
            **_cycle_historical_meta(None),
            **meta,
        }

    forced = cycle.status if cycle.status == "suspendida" else None
    current_status = resolve_membership_status(
        MembershipStatusContext(
            status_flag=forced,
            end_date=cycle.end_date,
            cost=cycle.cost,
            total_paid=total_paid,
            today=today,
            expiring_soon_days=expiring_soon_days,
        )
    )
    pending_balance = max(float(cycle.cost) - total_paid, 0.0)
    meta = _days_meta(cycle.end_date, today)

    return {
        "user_id": user.id,
        "membership_id": membership.id,
        "cycle_id": cycle.id,
        "name": user.name,
        "phone": user.phone,
        "created_at": user.created_at.isoformat() if user.created_at else None,
        "membership_type": cycle.membership_type,
        "cost": float(cycle.cost),
        "start_date": cycle.start_date.isoformat(),
        "end_date": cycle.end_date.isoformat(),
        "status": current_status,
        "total_paid": float(total_paid),
        "pending_balance": pending_balance,
        "historical_pending_balance": historical_pending,
        "pending_balance_total": pending_balance + historical_pending,
        "last_payment": last_payment_payload,
        "is_historical_only_member": historical_only,
        **_cycle_historical_meta(cycle),
        **meta,
    }


def build_client_entry(
    db: Session,
    user: User,
    membership: Membership,
    today: date,
    expiring_soon_days: int,
    *,
    include_historical: bool = False,
) -> dict:
    historical_only = is_historical_only_member(db, membership.id)
    cycle = _resolve_display_cycle(
        db,
        membership.id,
        include_historical=include_historical or historical_only,
    )

    last_payment = _last_payment_for_user(db, user.id)
    if not cycle:
        return _compose_client_entry(
            user=user,
            membership=membership,
            cycle=None,
            today=today,
            expiring_soon_days=expiring_soon_days,
            historical_only=historical_only,
            total_paid=0.0,
            historical_pending=0.0,
            last_payment=last_payment,
        )

    total_paid = _cycle_total_paid(db, cycle.id)
    historical_pending = 0.0
    previous_cycles = (
        db.query(MembershipCycle)
        .filter(MembershipCycle.membership_id == membership.id, MembershipCycle.id != cycle.id)
        .all()
    )
    for old_cycle in previous_cycles:
        old_paid = _cycle_total_paid(db, old_cycle.id)
        historical_pending += max(float(old_cycle.cost) - old_paid, 0.0)

    return _compose_client_entry(
        user=user,
        membership=membership,
        cycle=cycle,
        today=today,
        expiring_soon_days=expiring_soon_days,
        historical_only=historical_only,
        total_paid=total_paid,
        historical_pending=historical_pending,
        last_payment=last_payment,
    )


def _clients_base_query(
    db: Session,
    *,
    search: str,
    active_only: bool,
    include_historical: bool,
):
    has_operational_cycle = exists().where(
        and_(
            MembershipCycle.membership_id == Membership.id,
            MembershipCycle.is_historical_import.is_(False),
        )
    )
    has_any_cycle = exists().where(MembershipCycle.membership_id == Membership.id)

    query = (
        db.query(User, Membership)
        .join(Membership, Membership.user_id == User.id)
        .filter(User.role == "socio")
    )
    if active_only:
        query = query.filter(_socio_is_active_filter())
    if search.strip():
        like_term = f"%{search.strip()}%"
        query = query.filter((User.name.ilike(like_term)) | (User.phone.ilike(like_term)))
    if not include_historical:
        query = query.filter(or_(~has_any_cycle, has_operational_cycle))
    return query


def list_client_entries(
    db: Session,
    *,
    status_filter: str = "todos",
    search: str = "",
    active_only: bool = True,
    include_historical: bool = False,
    limit: int | None = DEFAULT_CLIENTS_LIMIT,
    offset: int = 0,
) -> list[dict]:
    today = operational_today()
    expiring_soon_days = resolve_expiring_soon_days()
    normalized_filter = normalize_status_filter(status_filter)

    if limit is not None:
        limit = max(1, min(int(limit), MAX_CLIENTS_LIMIT))
    offset = max(0, int(offset or 0))

    query = _clients_base_query(
        db,
        search=search,
        active_only=active_only,
        include_historical=include_historical,
    )
    query = query.order_by(User.name.asc(), User.id.asc())
    if limit is not None:
        query = query.offset(offset).limit(limit)
    pairs = query.all()
    if not pairs:
        return []

    membership_ids = [membership.id for _, membership in pairs]
    user_ids = [user.id for user, _ in pairs]

    historical_only_ids = _bulk_historical_only_membership_ids(db, membership_ids)
    operational_cycles = _bulk_pick_cycles(db, membership_ids, historical=False)
    historical_cycles = _bulk_pick_cycles(db, membership_ids, historical=True)
    cycles_by_membership = _bulk_cycles_by_membership(db, membership_ids)
    last_payments = _bulk_last_payments(db, user_ids)

    display_cycles: dict[int, MembershipCycle | None] = {}
    for membership_id in membership_ids:
        historical_only = membership_id in historical_only_ids
        display_cycles[membership_id] = _resolve_display_cycle(
            db,
            membership_id,
            include_historical=include_historical or historical_only,
            operational_cycle=operational_cycles.get(membership_id),
            historical_cycle=historical_cycles.get(membership_id),
        )

    cycle_ids_for_paid = [cycle.id for cycle in display_cycles.values() if cycle is not None]
    other_cycle_ids = [
        cycle.id
        for membership_id, cycles in cycles_by_membership.items()
        for cycle in cycles
        if display_cycles.get(membership_id) is None or cycle.id != display_cycles[membership_id].id
    ]
    paid_totals = _bulk_cycle_paid_totals(db, list(set(cycle_ids_for_paid + other_cycle_ids)))

    result: list[dict] = []
    for user, membership in pairs:
        historical_only = membership.id in historical_only_ids
        cycle = display_cycles.get(membership.id)
        total_paid = paid_totals.get(cycle.id, 0.0) if cycle else 0.0

        historical_pending = 0.0
        for old_cycle in cycles_by_membership.get(membership.id, []):
            if cycle and old_cycle.id == cycle.id:
                continue
            old_paid = paid_totals.get(old_cycle.id, 0.0)
            historical_pending += max(float(old_cycle.cost) - old_paid, 0.0)

        entry = _compose_client_entry(
            user=user,
            membership=membership,
            cycle=cycle,
            today=today,
            expiring_soon_days=expiring_soon_days,
            historical_only=historical_only,
            total_paid=total_paid,
            historical_pending=historical_pending,
            last_payment=last_payments.get(user.id),
        )
        if normalized_filter != "todos" and entry["status"] != normalized_filter:
            continue
        result.append(entry)

    result.sort(key=lambda item: item["end_date"] or "9999-12-31")
    return result


def build_membership_summary(db: Session) -> dict:
    entries = list_client_entries(db, status_filter="todos", active_only=True, limit=None)
    today = operational_today()
    month_start = today.replace(day=1)
    day_start, day_end = operational_day_bounds(today)

    month_income = float(
        db.query(func.coalesce(func.sum(MembershipPayment.amount), 0.0))
        .filter(MembershipPayment.reversed_at.is_(None))
        .filter(MembershipPayment.counts_as_income.is_(True))
        .filter(MembershipPayment.payment_date >= datetime.combine(month_start, datetime.min.time()))
        .scalar()
        or 0.0
    )
    today_payments = (
        db.query(MembershipPayment)
        .filter(MembershipPayment.reversed_at.is_(None))
        .filter(MembershipPayment.counts_as_income.is_(True))
        .all()
    )
    today_income = sum(
        float(p.amount)
        for p in today_payments
        if payment_to_operational_date(p.payment_date) == today
    )
    month_courtesies = float(
        db.query(func.coalesce(func.sum(MembershipPayment.amount), 0.0))
        .filter(MembershipPayment.reversed_at.is_(None))
        .filter(MembershipPayment.payment_method == "cortesia")
        .filter(MembershipPayment.payment_date >= datetime.combine(month_start, datetime.min.time()))
        .scalar()
        or 0.0
    )
    month_adjustments = float(
        db.query(func.coalesce(func.sum(MembershipPayment.amount), 0.0))
        .filter(MembershipPayment.reversed_at.is_(None))
        .filter(MembershipPayment.payment_method == "ajuste")
        .filter(MembershipPayment.payment_date >= datetime.combine(month_start, datetime.min.time()))
        .scalar()
        or 0.0
    )
    month_adjustments_income = float(
        db.query(func.coalesce(func.sum(MembershipPayment.amount), 0.0))
        .filter(MembershipPayment.reversed_at.is_(None))
        .filter(MembershipPayment.payment_method == "ajuste")
        .filter(MembershipPayment.counts_as_income.is_(True))
        .filter(MembershipPayment.payment_date >= datetime.combine(month_start, datetime.min.time()))
        .scalar()
        or 0.0
    )

    pending_estimate = sum(float(e.get("pending_balance_total") or 0.0) for e in entries)

    def count_status(*statuses: str) -> int:
        return sum(1 for e in entries if e["status"] in statuses)

    return {
        "month_income": month_income,
        "today_income": today_income,
        "month_courtesies": month_courtesies,
        "month_adjustments": month_adjustments,
        "month_adjustments_income": month_adjustments_income,
        "pending_estimate": pending_estimate,
        "counts": {
            "al_corriente": count_status("activa"),
            "por_vencer": count_status("proxima_a_vencer"),
            "vence_hoy": count_status("vence_hoy"),
            "vencidos": count_status("vencida"),
            "con_adeudo": count_status("con_adeudo"),
            "suspendidos": count_status("suspendida"),
            "total_socios": len(entries),
        },
        "expiring_soon_days": resolve_expiring_soon_days(),
        "operational_timezone": str(operational_day_bounds()[0].tzinfo),
        "is_estimate": True,
    }


def build_membership_alerts(db: Session) -> dict:
    entries = list_client_entries(db, status_filter="todos", active_only=True, limit=None)

    def pick(statuses: list[str]) -> list[dict]:
        return [e for e in entries if e["status"] in statuses]

    return {
        "vence_hoy": pick(["vence_hoy"]),
        "proximos_3_dias": pick(["proxima_a_vencer"]),
        "vencidos": pick(["vencida"]),
        "con_adeudo": pick(["con_adeudo"]),
        "suspendidos": pick(["suspendida"]),
    }
