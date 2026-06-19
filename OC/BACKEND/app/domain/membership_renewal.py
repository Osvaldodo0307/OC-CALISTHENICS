from __future__ import annotations

import calendar
from dataclasses import dataclass
from datetime import date


VALID_PAYMENT_ACTIONS = {
    "register_only",
    "renew_extend",
    "partial_debt",
    "courtesy_extend",
    "admin_adjustment",
}

VALID_DURATION_MONTHS = {1, 3, 6, 12}


def add_months(base: date, months: int) -> date:
    if months <= 0:
        raise ValueError("months must be positive")
    month_index = base.month - 1 + months
    year = base.year + month_index // 12
    month = month_index % 12 + 1
    last_day = calendar.monthrange(year, month)[1]
    day = min(base.day, last_day)
    return date(year, month, day)


@dataclass(frozen=True)
class RenewalInput:
    current_start_date: date
    current_end_date: date
    payment_date: date
    payment_action: str
    period_start: date | None = None
    period_end: date | None = None
    period_duration_months: int | None = None
    renewal_start_date: date | None = None


@dataclass(frozen=True)
class RenewalResult:
    should_extend: bool
    new_start_date: date | None
    new_end_date: date | None
    period_start: date | None
    period_end: date | None


def infer_payment_action(
    *,
    explicit_action: str | None,
    payment_method: str,
    amount: float,
    pending_balance: float,
) -> str:
    if explicit_action:
        return explicit_action
    if payment_method == "cortesia":
        return "courtesy_extend"
    if payment_method == "ajuste":
        return "admin_adjustment"
    if pending_balance > 0 and amount >= pending_balance:
        return "renew_extend"
    if pending_balance > 0:
        return "partial_debt"
    return "register_only"


def compute_renewal(result_input: RenewalInput) -> RenewalResult:
    action = result_input.payment_action
    if action in {"register_only", "partial_debt"}:
        # Pagos parciales acumulados NO extienden vigencia automaticamente.
        # El admin debe registrar explicitamente renew_extend cuando el periodo quede cubierto.
        return RenewalResult(False, None, None, result_input.period_start, result_input.period_end)

    if action == "admin_adjustment" and not (
        result_input.period_end or result_input.period_duration_months or result_input.period_start
    ):
        return RenewalResult(False, None, None, result_input.period_start, result_input.period_end)

    if action not in {"renew_extend", "courtesy_extend", "admin_adjustment"}:
        return RenewalResult(False, None, None, result_input.period_start, result_input.period_end)

    payment_day = result_input.payment_date
    current_end = result_input.current_end_date

    if result_input.period_end:
        period_end = result_input.period_end
        if result_input.period_start:
            period_start = result_input.period_start
        elif current_end < payment_day:
            period_start = result_input.renewal_start_date or payment_day
        else:
            period_start = result_input.current_start_date
        return RenewalResult(True, period_start, period_end, period_start, period_end)

    duration = result_input.period_duration_months or 1
    if duration not in VALID_DURATION_MONTHS and result_input.period_duration_months is not None:
        raise ValueError("period_duration_months invalido")

    if current_end >= payment_day:
        base_end = current_end
        new_start = result_input.period_start or result_input.current_start_date
    else:
        base_end = result_input.renewal_start_date or payment_day
        new_start = result_input.period_start or base_end

    new_end = add_months(base_end, duration)
    return RenewalResult(True, new_start, new_end, new_start, new_end)
