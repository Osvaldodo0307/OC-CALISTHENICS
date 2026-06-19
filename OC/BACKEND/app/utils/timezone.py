from __future__ import annotations

import os
from datetime import date, datetime, time, timedelta
from zoneinfo import ZoneInfo, ZoneInfoNotFoundError

_DEFAULT_TZ = "America/Mexico_City"


def get_operational_tz() -> ZoneInfo:
    name = (os.getenv("APP_TIMEZONE") or _DEFAULT_TZ).strip()
    try:
        return ZoneInfo(name)
    except ZoneInfoNotFoundError:
        return ZoneInfo(_DEFAULT_TZ)


def operational_now() -> datetime:
    return datetime.now(get_operational_tz())


def operational_today() -> date:
    """Fecha calendario operativa del gimnasio (vigencias, estados, resumen diario)."""
    return operational_now().date()


def operational_day_bounds(for_day: date | None = None) -> tuple[datetime, datetime]:
    day = for_day or operational_today()
    tz = get_operational_tz()
    start = datetime.combine(day, time.min, tzinfo=tz)
    return start, start + timedelta(days=1)


def payment_to_operational_date(payment_dt: datetime) -> date:
    """
    Normaliza la fecha de un pago a calendario operativo.
    Datetimes naive se interpretan como fecha local operativa (sin convertir UTC).
    """
    if payment_dt.tzinfo is not None:
        return payment_dt.astimezone(get_operational_tz()).date()
    return payment_dt.date()


# Alias retrocompatibles
mx_now = operational_now
mx_today = operational_today


def parse_yyyy_mm_dd(value: str) -> date:
    return datetime.strptime(value, "%Y-%m-%d").date()
