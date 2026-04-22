from __future__ import annotations

from dataclasses import dataclass
from datetime import date


@dataclass(frozen=True)
class MembershipStatusContext:
    status_flag: str | None
    end_date: date | None
    cost: float
    total_paid: float
    today: date
    expiring_soon_days: int


def resolve_membership_status(ctx: MembershipStatusContext) -> str:
    """
    Precedencia unica de estatus (de mayor a menor prioridad):
    1) suspendida
    2) vencida
    3) con_adeudo
    4) proxima_a_vencer
    5) activa
    """
    if ctx.status_flag == "suspendida":
        return "suspendida"
    if ctx.end_date and ctx.end_date < ctx.today:
        return "vencida"
    if (ctx.cost - ctx.total_paid) > 0.009:
        return "con_adeudo"
    if ctx.end_date and (ctx.end_date - ctx.today).days <= ctx.expiring_soon_days:
        return "proxima_a_vencer"
    return "activa"


@dataclass(frozen=True)
class DebtBreakdown:
    current_pending_balance: float
    historical_pending_balance: float

    @property
    def total_pending_balance(self) -> float:
        return self.current_pending_balance + self.historical_pending_balance
