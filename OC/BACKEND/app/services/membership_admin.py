"""
Helpers para panel admin de membresías: resúmenes, alertas y filas de clientes.
"""
from __future__ import annotations

from datetime import date, datetime, timedelta

from sqlalchemy import func
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


def normalize_status_filter(status: str) -> str:
    value = (status or "todos").strip().lower()
    return STATUS_FILTER_ALIASES.get(value, value)


def resolve_expiring_soon_days() -> int:
    import os

    return int(os.getenv("MEMBERSHIP_EXPIRING_SOON_DAYS", "3"))


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


def _resolve_display_cycle(
    db: Session,
    membership_id: int,
    *,
    include_historical: bool,
) -> MembershipCycle | None:
    operational = (
        db.query(MembershipCycle)
        .filter(
            MembershipCycle.membership_id == membership_id,
            MembershipCycle.is_historical_import.is_(False),
            MembershipCycle.is_active_cycle.is_(True),
        )
        .order_by(MembershipCycle.end_date.desc())
        .first()
    )
    if operational:
        return operational

    if not include_historical:
        return None

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
    cycle = _resolve_display_cycle(db, membership.id, include_historical=include_historical or historical_only)

    last_payment = _last_payment_for_user(db, user.id)
    last_payment_payload = None
    if last_payment:
        last_payment_payload = {
            "payment_id": last_payment.id,
            "payment_date": last_payment.payment_date.isoformat() if last_payment.payment_date else None,
            "amount": float(last_payment.amount),
            "payment_method": last_payment.payment_method,
        }

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

    total_paid = _cycle_total_paid(db, cycle.id)
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

    historical_pending = 0.0
    previous_cycles = (
        db.query(MembershipCycle)
        .filter(MembershipCycle.membership_id == membership.id, MembershipCycle.id != cycle.id)
        .all()
    )
    for old_cycle in previous_cycles:
        old_paid = _cycle_total_paid(db, old_cycle.id)
        historical_pending += max(old_cycle.cost - old_paid, 0.0)

    pending_balance = max(cycle.cost - total_paid, 0.0)
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


def list_client_entries(
    db: Session,
    *,
    status_filter: str = "todos",
    search: str = "",
    active_only: bool = True,
    include_historical: bool = False,
) -> list[dict]:
    today = operational_today()
    expiring_soon_days = resolve_expiring_soon_days()
    normalized_filter = normalize_status_filter(status_filter)

    users_query = db.query(User).filter(User.role == "socio")
    if active_only:
        users_query = users_query.filter(User.is_active.is_(True))
    if search.strip():
        like_term = f"%{search.strip()}%"
        users_query = users_query.filter((User.name.ilike(like_term)) | (User.phone.ilike(like_term)))
    users = users_query.order_by(User.created_at.desc()).all()

    result: list[dict] = []
    for user in users:
        membership = db.query(Membership).filter(Membership.user_id == user.id).first()
        if not membership:
            continue
        if not include_historical and is_historical_only_member(db, membership.id):
            continue
        entry = build_client_entry(
            db,
            user,
            membership,
            today,
            expiring_soon_days,
            include_historical=include_historical,
        )
        if normalized_filter != "todos" and entry["status"] != normalized_filter:
            continue
        result.append(entry)

    result.sort(key=lambda item: item["end_date"] or "9999-12-31")
    return result


def build_membership_summary(db: Session) -> dict:
    entries = list_client_entries(db, status_filter="todos", active_only=True)
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
    entries = list_client_entries(db, status_filter="todos", active_only=True)

    def pick(statuses: list[str]) -> list[dict]:
        return [e for e in entries if e["status"] in statuses]

    return {
        "vence_hoy": pick(["vence_hoy"]),
        "proximos_3_dias": pick(["proxima_a_vencer"]),
        "vencidos": pick(["vencida"]),
        "con_adeudo": pick(["con_adeudo"]),
        "suspendidos": pick(["suspendida"]),
    }
