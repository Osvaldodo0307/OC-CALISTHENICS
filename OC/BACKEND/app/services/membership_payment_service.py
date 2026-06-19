from __future__ import annotations

from datetime import date, datetime

from sqlalchemy import and_, or_
from sqlalchemy.orm import Session

from app.domain.membership_renewal import RenewalInput, compute_renewal, infer_payment_action
from app.models import Membership, MembershipCycle, MembershipCycleAudit, MembershipPayment, User


def _cycle_snapshot(cycle: MembershipCycle) -> dict:
    return {
        "id": cycle.id,
        "membership_type": cycle.membership_type,
        "cost": cycle.cost,
        "start_date": cycle.start_date.isoformat() if cycle.start_date else None,
        "end_date": cycle.end_date.isoformat() if cycle.end_date else None,
        "status": cycle.status,
        "is_active_cycle": cycle.is_active_cycle,
    }


def _sync_membership_expiry(db: Session, cycle: MembershipCycle) -> None:
    membership = db.query(Membership).filter(Membership.id == cycle.membership_id).first()
    if membership:
        membership.expires_at = datetime.combine(cycle.end_date, datetime.max.time())
        membership.plan = cycle.membership_type
        if cycle.status != "suspendida":
            membership.status = "active"


def record_cycle_audit(
    db: Session,
    *,
    cycle: MembershipCycle,
    changed_by: int,
    reason: str,
    event: str,
    old_payload: dict,
    new_payload: dict,
) -> None:
    db.add(
        MembershipCycleAudit(
            membership_cycle_id=cycle.id,
            changed_by=changed_by,
            reason=reason,
            old_payload={"event": event, **old_payload},
            new_payload={"event": event, **new_payload},
        )
    )


def resolve_payment_flags(
    *,
    payment_method: str,
    payment_action: str,
    counts_as_income: bool | None,
    applies_to_balance: bool | None,
) -> tuple[bool, bool]:
    if payment_method == "cortesia" or payment_action == "courtesy_extend":
        return False, False
    if payment_action == "admin_adjustment":
        income = counts_as_income if counts_as_income is not None else False
        balance = applies_to_balance if applies_to_balance is not None else income
        return income, balance
    if counts_as_income is not None or applies_to_balance is not None:
        income = counts_as_income if counts_as_income is not None else True
        balance = applies_to_balance if applies_to_balance is not None else income
        return income, balance
    return True, True


def apply_payment_to_cycle(
    db: Session,
    *,
    cycle: MembershipCycle,
    payment: MembershipPayment,
    payment_action: str,
    payment_day: date,
    period_start: date | None,
    period_end: date | None,
    period_duration_months: int | None,
    renewal_start_date: date | None,
    admin_user: User,
) -> dict:
    old_snapshot = _cycle_snapshot(cycle)
    previous_end = cycle.end_date

    renewal = compute_renewal(
        RenewalInput(
            current_start_date=cycle.start_date,
            current_end_date=cycle.end_date,
            payment_date=payment_day,
            payment_action=payment_action,
            period_start=period_start,
            period_end=period_end,
            period_duration_months=period_duration_months,
            renewal_start_date=renewal_start_date,
        )
    )

    payment.period_start_date = renewal.period_start
    payment.period_end_date = renewal.period_end

    if renewal.should_extend and renewal.new_end_date:
        payment.previous_end_date = previous_end
        payment.extended_end_date = renewal.new_end_date
        if renewal.new_start_date:
            cycle.start_date = renewal.new_start_date
        cycle.end_date = renewal.new_end_date
        cycle.updated_by = admin_user.id
        _sync_membership_expiry(db, cycle)
        record_cycle_audit(
            db,
            cycle=cycle,
            changed_by=admin_user.id,
            reason=f"Cambio de vigencia por pago #{payment.id} ({payment_action})",
            event="payment_vigencia_extended",
            old_payload={**old_snapshot, "payment_id": payment.id},
            new_payload={**_cycle_snapshot(cycle), "payment_id": payment.id, "payment_action": payment_action},
        )

    record_cycle_audit(
        db,
        cycle=cycle,
        changed_by=admin_user.id,
        reason=f"Registro de pago #{payment.id} ({payment_action})",
        event="payment_registered",
        old_payload=old_snapshot,
        new_payload={
            **_cycle_snapshot(cycle),
            "payment_id": payment.id,
            "payment_action": payment_action,
            "amount": payment.amount,
            "payment_method": payment.payment_method,
            "counts_as_income": payment.counts_as_income,
            "applies_to_balance": payment.applies_to_balance,
        },
    )

    return {
        "previous_end_date": previous_end.isoformat(),
        "new_end_date": cycle.end_date.isoformat(),
        "vigencia_extended": renewal.should_extend,
    }


def revert_payment_vigencia(
    db: Session,
    *,
    payment: MembershipPayment,
    cycle: MembershipCycle,
    admin_user: User,
    reason: str,
) -> bool:
    if not payment.extended_end_date or not payment.previous_end_date:
        return False
    if cycle.end_date != payment.extended_end_date:
        return False

    old_snapshot = _cycle_snapshot(cycle)
    cycle.end_date = payment.previous_end_date
    cycle.updated_by = admin_user.id
    _sync_membership_expiry(db, cycle)
    record_cycle_audit(
        db,
        cycle=cycle,
        changed_by=admin_user.id,
        reason=f"Reversa de vigencia por pago #{payment.id}: {reason}",
        event="payment_vigencia_reverted",
        old_payload={**old_snapshot, "payment_id": payment.id},
        new_payload={**_cycle_snapshot(cycle), "payment_id": payment.id, "reversal_reason": reason},
    )
    return True


class PaymentReversalBlockedError(Exception):
    def __init__(self, message: str):
        self.message = message
        super().__init__(message)


def validate_payment_reversal(db: Session, payment: MembershipPayment, cycle: MembershipCycle) -> None:
    """
    Bloquea reversas fuera de orden (LIFO): solo el pago activo mas reciente del ciclo puede revertirse.
    Evita corromper vigencia cuando hay renovaciones posteriores.
    """
    if payment.reversed_at:
        raise PaymentReversalBlockedError("El pago ya fue revertido")

    later_payment = (
        db.query(MembershipPayment)
        .filter(
            MembershipPayment.membership_cycle_id == payment.membership_cycle_id,
            MembershipPayment.reversed_at.is_(None),
            MembershipPayment.id != payment.id,
            or_(
                MembershipPayment.payment_date > payment.payment_date,
                and_(
                    MembershipPayment.payment_date == payment.payment_date,
                    MembershipPayment.id > payment.id,
                ),
            ),
        )
        .order_by(MembershipPayment.payment_date.desc(), MembershipPayment.id.desc())
        .first()
    )
    if later_payment:
        raise PaymentReversalBlockedError(
            "No se puede revertir este pago porque hay pagos posteriores en el mismo ciclo. "
            "Revierte primero el pago mas reciente (orden inverso al registro)."
        )

    if payment.extended_end_date and cycle.end_date != payment.extended_end_date:
        raise PaymentReversalBlockedError(
            "La vigencia actual del ciclo no coincide con la extension de este pago. "
            "Es posible que un pago posterior haya modificado la vigencia. Revierte primero el pago mas reciente."
        )
