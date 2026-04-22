from datetime import date, datetime
from zoneinfo import ZoneInfo


MX_TZ = ZoneInfo("America/Mexico_City")


def mx_now() -> datetime:
    return datetime.now(MX_TZ)


def mx_today() -> date:
    return mx_now().date()


def parse_yyyy_mm_dd(value: str) -> date:
    return datetime.strptime(value, "%Y-%m-%d").date()
