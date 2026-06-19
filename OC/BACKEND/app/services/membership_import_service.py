from __future__ import annotations

import calendar
import hashlib
import io
import json
import re
import secrets
import unicodedata
from dataclasses import asdict, dataclass, field
from datetime import date, datetime
from typing import Any

import pandas as pd
from sqlalchemy.orm import Session

from app.core.security import hash_password
from app.domain.membership_renewal import VALID_PAYMENT_ACTIONS
from app.models import (
    Membership,
    MembershipCycle,
    MembershipImportBatch,
    MembershipImportRecord,
    MembershipNote,
    MembershipPayment,
    User,
)
from app.services.membership_payment_service import apply_payment_to_cycle, record_cycle_audit, resolve_payment_flags

MAX_IMPORT_FILE_BYTES = 5 * 1024 * 1024
MAX_IMPORT_ROWS = 5000

TEMPLATE_COLUMNS = [
    "socio_nombre",
    "telefono",
    "plan",
    "fecha_pago",
    "monto_pagado",
    "metodo_pago",
    "periodo_inicio",
    "periodo_fin",
    "payment_action",
    "counts_as_income",
    "applies_to_balance",
    "saldo_pendiente",
    "nota",
    "fuente_archivo",
    "referencia_externa",
]

REQUIRED_COLUMNS = {"socio_nombre", "fecha_pago", "monto_pagado", "metodo_pago"}

IMPORT_PAYMENT_METHODS = {
    "efectivo",
    "transferencia",
    "tarjeta_terminal",
    "cortesia",
    "ajuste",
    # Solo importación histórica: no usar en cobros operativos ni UI de membresías.
    "historico_sin_metodo",
}

COLUMN_ALIASES: dict[str, list[str]] = {
    "socio_nombre": [
        "socio_nombre", "nombre", "nombre_socio", "nombre_del_socio", "socio", "cliente", "name", "alumno",
    ],
    "telefono": ["telefono", "teléfono", "phone", "celular", "movil", "móvil", "whatsapp"],
    "plan": ["plan", "tipo_plan", "tipo_membresia", "tipo_de_membresia", "membresia", "membership_type", "tipo"],
    "fecha_pago": ["fecha_pago", "fecha", "fecha_de_pago", "payment_date", "fecha de pago", "fecha cobro"],
    "monto_pagado": ["monto_pagado", "monto", "amount", "importe", "pago", "cantidad"],
    "metodo_pago": [
        "metodo_pago", "método_pago", "metodo", "payment_method", "forma_pago", "forma_de_pago",
    ],
    "periodo_inicio": ["periodo_inicio", "inicio", "start_date", "period_start", "desde"],
    "periodo_fin": ["periodo_fin", "fin", "end_date", "period_end", "hasta", "vencimiento"],
    "payment_action": ["payment_action", "accion_pago", "acción_pago", "accion"],
    "counts_as_income": ["counts_as_income", "cuenta_ingreso", "ingreso"],
    "applies_to_balance": ["applies_to_balance", "aplica_saldo", "saldo"],
    "saldo_pendiente": ["saldo_pendiente", "adeudo", "pendiente", "deuda"],
    "nota": ["nota", "observaciones", "observations", "comentario", "comentarios", "notas"],
    "fuente_archivo": ["fuente_archivo", "fuente", "archivo", "source"],
    "referencia_externa": ["referencia_externa", "referencia", "id_externo", "external_ref", "folio"],
    "mes": ["mes", "month", "periodo_mes"],
}

PAYMENT_METHOD_VALUE_ALIASES: dict[str, str] = {
    "efectivo": "efectivo",
    "cash": "efectivo",
    "transferencia": "transferencia",
    "spei": "transferencia",
    "transfer": "transferencia",
    "tarjeta_terminal": "tarjeta_terminal",
    "tarjeta terminal": "tarjeta_terminal",
    "terminal": "tarjeta_terminal",
    "tarjeta": "tarjeta_terminal",
    "cortesia": "cortesia",
    "cortesía": "cortesia",
    "cortesia_extend": "cortesia",
    "ajuste": "ajuste",
    "adjustment": "ajuste",
    "historico_sin_metodo": "historico_sin_metodo",
}

DIAGNOSIS_HINT_COLUMNS = [
    "socio_nombre",
    "telefono",
    "fecha_pago",
    "monto_pagado",
    "metodo_pago",
    "plan",
    "periodo_inicio",
    "periodo_fin",
    "mes",
    "saldo_pendiente",
    "nota",
]


@dataclass
class ParsedWorkbook:
    sheets: list[str]
    dataframe: pd.DataFrame
    sheet_name: str | None


@dataclass
class RowIssue:
    code: str
    message: str


@dataclass
class NormalizedImportRow:
    row_number: int
    socio_nombre: str | None = None
    telefono: str | None = None
    plan: str | None = None
    fecha_pago: date | None = None
    monto_pagado: float | None = None
    metodo_pago: str | None = None
    periodo_inicio: date | None = None
    periodo_fin: date | None = None
    payment_action: str | None = None
    counts_as_income: bool | None = None
    applies_to_balance: bool | None = None
    saldo_pendiente: float | None = None
    nota: str | None = None
    fuente_archivo: str | None = None
    referencia_externa: str | None = None
    mes: str | None = None
    socio_match: str = "pending"
    matched_user_id: int | None = None
    candidate_user_ids: list[int] = field(default_factory=list)
    status: str = "pending"
    errors: list[RowIssue] = field(default_factory=list)
    warnings: list[RowIssue] = field(default_factory=list)
    duplicate_key: str | None = None
    is_duplicate_in_file: bool = False
    is_duplicate_in_db: bool = False
    will_create_cycle: bool = False
    will_update_active_cycle: bool = False
    estimated_income: float = 0.0


def _normalize_header(value: Any) -> str:
    text = str(value or "").strip().lower()
    text = unicodedata.normalize("NFKD", text)
    text = "".join(ch for ch in text if not unicodedata.combining(ch))
    text = re.sub(r"\s+", "_", text)
    return text


def _normalize_name(value: str | None) -> str:
    if not value:
        return ""
    text = unicodedata.normalize("NFKD", value.strip().lower())
    text = "".join(ch for ch in text if not unicodedata.combining(ch))
    text = re.sub(r"[^a-z0-9\s]", " ", text)
    return re.sub(r"\s+", " ", text).strip()


def _normalize_phone(value: Any) -> str | None:
    if value is None or (isinstance(value, float) and pd.isna(value)):
        return None
    if isinstance(value, float):
        value = int(round(value))
    if isinstance(value, int):
        digits = str(value)
    else:
        text = str(value).strip()
        if text.endswith(".0"):
            text = text[:-2]
        digits = re.sub(r"\D", "", text)
    if not digits:
        return None
    if len(digits) > 10:
        digits = digits[-10:]
    return digits if len(digits) >= 10 else digits or None


def _parse_bool(value: Any) -> bool | None:
    if value is None or (isinstance(value, float) and pd.isna(value)):
        return None
    if isinstance(value, bool):
        return value
    text = str(value).strip().lower()
    if text in {"1", "true", "si", "sí", "yes", "y", "verdadero"}:
        return True
    if text in {"0", "false", "no", "n", "falso"}:
        return False
    return None


def _parse_amount(value: Any) -> float | None:
    if value is None or (isinstance(value, float) and pd.isna(value)):
        return None
    if isinstance(value, (int, float)):
        return float(value)
    text = str(value).strip().replace("$", "").replace(",", "")
    if not text:
        return None
    try:
        return float(text)
    except ValueError:
        return None


def _parse_date_value(value: Any) -> date | None:
    if value is None or (isinstance(value, float) and pd.isna(value)):
        return None
    if isinstance(value, datetime):
        return value.date()
    if isinstance(value, date):
        return value
    if isinstance(value, pd.Timestamp):
        return value.date()
    text = str(value).strip()
    if not text:
        return None
    for fmt in ("%Y-%m-%d", "%d/%m/%Y", "%d-%m-%Y", "%Y/%m/%d", "%d.%m.%Y"):
        try:
            return datetime.strptime(text, fmt).date()
        except ValueError:
            continue
    try:
        parsed = pd.to_datetime(text, dayfirst=True, errors="coerce")
        if pd.isna(parsed):
            return None
        return parsed.date()
    except Exception:
        return None


def _parse_month_period(value: Any) -> tuple[date, date] | None:
    if value is None or (isinstance(value, float) and pd.isna(value)):
        return None
    if isinstance(value, (datetime, date, pd.Timestamp)):
        base = value.date() if not isinstance(value, date) else value
        if isinstance(value, pd.Timestamp):
            base = value.date()
        last_day = calendar.monthrange(base.year, base.month)[1]
        return date(base.year, base.month, 1), date(base.year, base.month, last_day)
    text = str(value).strip().lower()
    if not text:
        return None
    match = re.match(r"^(\d{4})[-/](\d{1,2})$", text)
    if match:
        year, month = int(match.group(1)), int(match.group(2))
        if 1 <= month <= 12:
            last_day = calendar.monthrange(year, month)[1]
            return date(year, month, 1), date(year, month, last_day)
    parsed = pd.to_datetime(text, errors="coerce")
    if pd.isna(parsed):
        return None
    base = parsed.date()
    last_day = calendar.monthrange(base.year, base.month)[1]
    return date(base.year, base.month, 1), date(base.year, base.month, last_day)


def _auto_column_mapping(columns: list[str]) -> dict[str, str]:
    normalized_cols = {_normalize_header(col): col for col in columns}
    mapping: dict[str, str] = {}
    for target, aliases in COLUMN_ALIASES.items():
        for alias in aliases:
            key = _normalize_header(alias)
            if key in normalized_cols:
                mapping[target] = normalized_cols[key]
                break
    return mapping


def _read_workbook(file_bytes: bytes, filename: str, sheet_name: str | None = None) -> ParsedWorkbook:
    lower = filename.lower()
    if lower.endswith(".numbers"):
        raise ValueError("No se aceptan archivos .numbers. Exporta a .xlsx o .csv desde Numbers.")
    if lower.endswith(".csv"):
        for encoding in ("utf-8-sig", "latin-1"):
            try:
                df = pd.read_csv(io.BytesIO(file_bytes), encoding=encoding)
                return ParsedWorkbook(sheets=["CSV"], dataframe=df, sheet_name="CSV")
            except UnicodeDecodeError:
                continue
        raise ValueError("No se pudo leer el archivo CSV. Usa UTF-8.")
    if lower.endswith((".xlsx", ".xls")):
        workbook = pd.ExcelFile(io.BytesIO(file_bytes))
        sheets = workbook.sheet_names
        selected = sheet_name if sheet_name in sheets else sheets[0]
        df = workbook.parse(selected)
        return ParsedWorkbook(sheets=sheets, dataframe=df, sheet_name=selected)
    raise ValueError("Formato no soportado. Usa .xlsx o .csv exportado desde Excel/Numbers.")


def diagnose_dataframe(df: pd.DataFrame, column_mapping: dict[str, str] | None = None) -> dict[str, Any]:
    mapping = column_mapping or _auto_column_mapping(list(df.columns))
    columns_detected = [str(c) for c in df.columns]
    empty_columns = [str(col) for col in df.columns if df[col].isna().all()]
    row_count = int(len(df))

    duplicate_rows: list[dict[str, Any]] = []
    incomplete_rows = 0
    invalid_dates = 0
    invalid_amounts = 0
    name_variants: dict[str, set[str]] = {}
    blocking_errors: list[str] = []

    mapped_required = [c for c in REQUIRED_COLUMNS if c in mapping]
    if len(mapped_required) < len(REQUIRED_COLUMNS):
        missing = sorted(REQUIRED_COLUMNS - set(mapping.keys()))
        blocking_errors.append(f"Faltan columnas obligatorias mapeadas: {', '.join(missing)}")

    seen_keys: dict[str, list[int]] = {}
    for idx, row in df.iterrows():
        row_number = int(idx) + 2
        raw_name = row.get(mapping.get("socio_nombre", ""), None) if mapping.get("socio_nombre") else None
        name = str(raw_name).strip() if raw_name is not None and not (isinstance(raw_name, float) and pd.isna(raw_name)) else ""
        phone = _normalize_phone(row.get(mapping.get("telefono", ""), None) if mapping.get("telefono") else None)
        pay_date = _parse_date_value(row.get(mapping.get("fecha_pago", ""), None) if mapping.get("fecha_pago") else None)
        amount = _parse_amount(row.get(mapping.get("monto_pagado", ""), None) if mapping.get("monto_pagado") else None)
        method_raw = row.get(mapping.get("metodo_pago", ""), None) if mapping.get("metodo_pago") else None
        method = str(method_raw).strip().lower() if method_raw is not None and not (isinstance(method_raw, float) and pd.isna(method_raw)) else ""

        if not name or pay_date is None or amount is None or not method:
            incomplete_rows += 1
        if mapping.get("fecha_pago") and row.get(mapping["fecha_pago"]) is not None and pay_date is None:
            invalid_dates += 1
        if mapping.get("monto_pagado") and row.get(mapping["monto_pagado"]) is not None and amount is None:
            invalid_amounts += 1

        norm_name = _normalize_name(name)
        if norm_name:
            key = phone or norm_name
            name_variants.setdefault(key, set()).add(name.strip())
            dup_key = f"{phone or norm_name}|{pay_date.isoformat() if pay_date else ''}|{amount}|{method}"
            seen_keys.setdefault(dup_key, []).append(row_number)

    for key, rows in seen_keys.items():
        if len(rows) > 1 and key.split("|")[1]:
            duplicate_rows.append({"duplicate_key": key, "row_numbers": rows})

    ambiguous_names = [
        {"match_key": key, "variants": sorted(variants)}
        for key, variants in name_variants.items()
        if len(variants) > 1
    ]

    inferred_columns = {target: source for target, source in mapping.items() if target in DIAGNOSIS_HINT_COLUMNS}

    return {
        "columns_detected": columns_detected,
        "column_mapping_suggested": mapping,
        "inferred_columns": inferred_columns,
        "row_count": row_count,
        "empty_columns": empty_columns,
        "duplicate_rows": duplicate_rows,
        "incomplete_rows": incomplete_rows,
        "invalid_dates": invalid_dates,
        "invalid_amounts": invalid_amounts,
        "name_variants": ambiguous_names,
        "blocking_errors": blocking_errors,
        "can_preview": len(blocking_errors) == 0 and row_count > 0,
        "can_import": False,
    }


def _row_dict_from_series(row: pd.Series, mapping: dict[str, str]) -> dict[str, Any]:
    raw: dict[str, Any] = {}
    for target, source in mapping.items():
        if source in row.index:
            value = row[source]
            if isinstance(value, float) and pd.isna(value):
                value = None
            elif pd.isna(value):
                value = None
            raw[target] = value
    return raw


def _infer_payment_action(method: str, explicit: str | None, has_period: bool) -> str:
    if explicit:
        return explicit
    if method == "cortesia":
        return "courtesy_extend"
    if method == "ajuste":
        return "admin_adjustment"
    if has_period:
        return "register_only"
    return "register_only"


def _match_users(db: Session, *, phone: str | None, name: str | None) -> tuple[str, int | None, list[int]]:
    if phone:
        users = (
            db.query(User)
            .filter(User.role == "socio", User.phone.isnot(None))
            .all()
        )
        matched = [u for u in users if _normalize_phone(u.phone) == phone]
        if len(matched) == 1:
            return "existing", matched[0].id, []
        if len(matched) > 1:
            return "ambiguous", None, [u.id for u in matched]
        # Teléfono en archivo sin coincidencia en BD → socio nuevo (no ambiguar por nombre)
        return "new", None, []

    norm = _normalize_name(name)
    if not norm or len(norm) < 3:
        return "new", None, []

    candidates: list[User] = []
    for user in db.query(User).filter(User.role == "socio").all():
        user_norm = _normalize_name(user.name)
        if user_norm == norm:
            candidates.append(user)
        elif norm in user_norm or user_norm in norm:
            candidates.append(user)

    if len(candidates) == 1:
        return "existing", candidates[0].id, []
    if len(candidates) > 1:
        return "ambiguous", None, [u.id for u in candidates]
    return "new", None, []


def _duplicate_key(phone: str | None, name: str | None, pay_date: date | None, amount: float | None, method: str | None) -> str:
    identity = phone or _normalize_name(name or "")
    return f"{identity}|{pay_date.isoformat() if pay_date else ''}|{amount}|{method or ''}"


def _payment_exists_in_db(
    db: Session,
    *,
    user_id: int,
    pay_date: date,
    amount: float,
    method: str,
    referencia_externa: str | None,
    batch_id: int | None = None,
) -> bool:
    if referencia_externa:
        existing_ref = (
            db.query(MembershipImportRecord)
            .filter(
                MembershipImportRecord.referencia_externa == referencia_externa,
                MembershipImportRecord.payment_id.isnot(None),
                MembershipImportRecord.status == "imported",
            )
            .first()
        )
        if existing_ref:
            return True
        idem = f"historical-import:{referencia_externa}"
        if db.query(MembershipPayment).filter(MembershipPayment.idempotency_key == idem).first():
            return True

    day_start = datetime.combine(pay_date, datetime.min.time())
    day_end = datetime.combine(pay_date, datetime.max.time())
    return (
        db.query(MembershipPayment)
        .filter(
            MembershipPayment.user_id == user_id,
            MembershipPayment.payment_date >= day_start,
            MembershipPayment.payment_date <= day_end,
            MembershipPayment.amount == amount,
            MembershipPayment.payment_method == method,
            MembershipPayment.reversed_at.is_(None),
        )
        .first()
        is not None
    )


def _normalize_payment_method(value: Any) -> str | None:
    if value is None or (isinstance(value, float) and pd.isna(value)):
        return None
    text = str(value).strip().lower()
    if not text:
        return None
    text = unicodedata.normalize("NFKD", text)
    text = "".join(ch for ch in text if not unicodedata.combining(ch))
    return PAYMENT_METHOD_VALUE_ALIASES.get(text, text)


def normalize_row(
    db: Session,
    *,
    row_number: int,
    raw: dict[str, Any],
    filename: str | None,
    file_duplicate_keys: set[str],
) -> NormalizedImportRow:
    item = NormalizedImportRow(row_number=row_number)
    item.socio_nombre = str(raw.get("socio_nombre") or "").strip() or None
    item.telefono = _normalize_phone(raw.get("telefono"))
    item.plan = str(raw.get("plan") or "").strip() or None
    item.fecha_pago = _parse_date_value(raw.get("fecha_pago"))
    item.monto_pagado = _parse_amount(raw.get("monto_pagado"))
    item.metodo_pago = _normalize_payment_method(raw.get("metodo_pago"))
    item.periodo_inicio = _parse_date_value(raw.get("periodo_inicio"))
    item.periodo_fin = _parse_date_value(raw.get("periodo_fin"))
    item.mes = str(raw.get("mes") or "").strip() or None
    item.counts_as_income = _parse_bool(raw.get("counts_as_income"))
    item.applies_to_balance = _parse_bool(raw.get("applies_to_balance"))
    item.saldo_pendiente = _parse_amount(raw.get("saldo_pendiente"))
    item.nota = str(raw.get("nota") or "").strip() or None
    item.fuente_archivo = str(raw.get("fuente_archivo") or filename or "").strip() or None
    item.referencia_externa = str(raw.get("referencia_externa") or "").strip() or None

    explicit_action = str(raw.get("payment_action") or "").strip().lower() or None
    if explicit_action and explicit_action not in VALID_PAYMENT_ACTIONS:
        item.errors.append(RowIssue("invalid_payment_action", f"payment_action invalido: {explicit_action}"))
    elif explicit_action:
        item.payment_action = explicit_action

    if not item.socio_nombre or len(item.socio_nombre) < 2:
        item.errors.append(RowIssue("missing_name", "socio_nombre es obligatorio y debe tener al menos 2 caracteres"))
    if item.fecha_pago is None:
        item.errors.append(RowIssue("invalid_date", "fecha_pago invalida o faltante"))
    if item.monto_pagado is None:
        item.errors.append(RowIssue("invalid_amount", "monto_pagado invalido o faltante"))
    elif item.metodo_pago != "cortesia" and item.monto_pagado <= 0:
        item.errors.append(RowIssue("invalid_amount", "monto_pagado debe ser mayor a 0 salvo cortesia"))
    elif item.metodo_pago == "cortesia" and item.monto_pagado < 0:
        item.errors.append(RowIssue("invalid_amount", "monto de cortesia no puede ser negativo"))
    if not item.metodo_pago:
        item.errors.append(RowIssue("missing_method", "metodo_pago es obligatorio"))
    elif item.metodo_pago not in IMPORT_PAYMENT_METHODS:
        item.errors.append(RowIssue("invalid_method", f"metodo_pago no permitido: {item.metodo_pago}"))

    if item.periodo_inicio and item.periodo_fin and item.periodo_fin < item.periodo_inicio:
        item.errors.append(RowIssue("invalid_period", "periodo_fin debe ser mayor o igual a periodo_inicio"))

    if not item.periodo_inicio and not item.periodo_fin and item.mes:
        month_period = _parse_month_period(item.mes)
        if month_period:
            item.periodo_inicio, item.periodo_fin = month_period
            item.warnings.append(RowIssue("month_inferred_period", "Periodo generado desde columna mes"))
        else:
            item.warnings.append(RowIssue("invalid_month", "No se pudo interpretar la columna mes"))

    has_period = bool(item.periodo_inicio and item.periodo_fin)
    if not has_period:
        item.warnings.append(RowIssue("no_period", "Sin periodo: el pago se registrara como historico sin modificar vigencia activa"))

    if not item.payment_action:
        item.payment_action = _infer_payment_action(item.metodo_pago or "", None, has_period)

    if item.payment_action in {"renew_extend", "courtesy_extend"} and not has_period:
        item.warnings.append(RowIssue("extend_without_period", "Accion de extension sin periodo definido; requiere confirmacion en commit"))

    income, balance = resolve_payment_flags(
        payment_method=item.metodo_pago or "",
        payment_action=item.payment_action or "register_only",
        counts_as_income=item.counts_as_income,
        applies_to_balance=item.applies_to_balance,
    )
    item.counts_as_income = income
    item.applies_to_balance = balance
    item.estimated_income = float(item.monto_pagado or 0) if income else 0.0

    if not item.telefono:
        item.warnings.append(RowIssue("missing_phone", "Socio sin telefono; coincidencia solo por nombre"))

    match_type, matched_id, candidates = _match_users(db, phone=item.telefono, name=item.socio_nombre)
    item.socio_match = match_type
    item.matched_user_id = matched_id
    item.candidate_user_ids = candidates
    if match_type == "ambiguous":
        item.warnings.append(RowIssue("ambiguous_socio", "Coincidencia ambigua de socio; requiere resolucion manual"))

    if item.fecha_pago and item.monto_pagado is not None and item.metodo_pago:
        item.duplicate_key = _duplicate_key(item.telefono, item.socio_nombre, item.fecha_pago, item.monto_pagado, item.metodo_pago)
        if item.duplicate_key in file_duplicate_keys:
            item.is_duplicate_in_file = True
            item.warnings.append(RowIssue("duplicate_in_file", "Posible duplicado dentro del archivo"))
        if matched_id and _payment_exists_in_db(
            db,
            user_id=matched_id,
            pay_date=item.fecha_pago,
            amount=item.monto_pagado,
            method=item.metodo_pago,
            referencia_externa=item.referencia_externa,
        ):
            item.is_duplicate_in_db = True
            item.warnings.append(RowIssue("duplicate_in_db", "Posible duplicado ya existente en la base"))

    if item.errors:
        item.status = "error"
    elif item.is_duplicate_in_file or item.is_duplicate_in_db:
        item.status = "duplicate"
    elif item.warnings:
        item.status = "warning"
    else:
        item.status = "ready"

    return item


def _serialize_row(item: NormalizedImportRow, raw: dict[str, Any]) -> dict[str, Any]:
    payload = asdict(item)
    payload["errors"] = [asdict(e) for e in item.errors]
    payload["warnings"] = [asdict(e) for e in item.warnings]
    payload["fecha_pago"] = item.fecha_pago.isoformat() if item.fecha_pago else None
    payload["periodo_inicio"] = item.periodo_inicio.isoformat() if item.periodo_inicio else None
    payload["periodo_fin"] = item.periodo_fin.isoformat() if item.periodo_fin else None
    payload["raw"] = raw
    return payload


def build_preview_summary(rows: list[NormalizedImportRow]) -> dict[str, Any]:
    return {
        "total_rows": len(rows),
        "new_members": sum(1 for r in rows if r.socio_match == "new" and r.status != "error"),
        "existing_members": sum(1 for r in rows if r.socio_match == "existing" and r.status != "error"),
        "ambiguous_members": sum(1 for r in rows if r.socio_match == "ambiguous"),
        "payments_to_create": sum(1 for r in rows if r.status in {"ready", "warning", "duplicate"}),
        "cycles_to_create": sum(1 for r in rows if r.will_create_cycle and r.status != "error"),
        "error_rows": sum(1 for r in rows if r.status == "error"),
        "warning_rows": sum(1 for r in rows if r.warnings),
        "duplicate_rows": sum(1 for r in rows if r.status == "duplicate" or r.is_duplicate_in_file or r.is_duplicate_in_db),
        "estimated_real_income": round(sum(r.estimated_income for r in rows if r.status != "error"), 2),
        "estimated_courtesies": sum(1 for r in rows if r.metodo_pago == "cortesia" and r.status != "error"),
        "estimated_adjustments": sum(1 for r in rows if r.metodo_pago == "ajuste" and r.status != "error"),
        "estimated_pending_balance": round(
            sum(float(r.saldo_pendiente or 0) for r in rows if r.status != "error" and (r.saldo_pendiente or 0) > 0),
            2,
        ),
        "blocking_errors": sum(1 for r in rows if r.status == "error") > 0,
    }


def create_import_preview(
    db: Session,
    *,
    file_bytes: bytes,
    filename: str,
    admin_user: User,
    sheet_name: str | None = None,
    column_mapping: dict[str, str] | None = None,
) -> dict[str, Any]:
    if len(file_bytes) > MAX_IMPORT_FILE_BYTES:
        raise ValueError(f"Archivo demasiado grande. Maximo {MAX_IMPORT_FILE_BYTES // (1024 * 1024)} MB.")
    if not file_bytes:
        raise ValueError("Archivo vacio.")

    parsed = _read_workbook(file_bytes, filename, sheet_name)
    if len(parsed.dataframe) > MAX_IMPORT_ROWS:
        raise ValueError(f"Demasiadas filas. Maximo {MAX_IMPORT_ROWS}.")

    mapping = column_mapping or _auto_column_mapping(list(parsed.dataframe.columns))
    diagnosis = diagnose_dataframe(parsed.dataframe, mapping)
    diagnosis["sheets"] = parsed.sheets
    diagnosis["selected_sheet"] = parsed.sheet_name

    normalized_rows: list[NormalizedImportRow] = []
    file_dup_keys: set[str] = set()
    provisional_keys: list[tuple[str, int]] = []
    for idx, series in parsed.dataframe.iterrows():
        raw = _row_dict_from_series(series, mapping)
        row_number = int(idx) + 2
        item = normalize_row(db, row_number=row_number, raw=raw, filename=filename, file_duplicate_keys=set())
        if item.duplicate_key:
            provisional_keys.append((item.duplicate_key, row_number))
        normalized_rows.append((item, raw))

    dup_counts: dict[str, int] = {}
    for key, _ in provisional_keys:
        dup_counts[key] = dup_counts.get(key, 0) + 1
    file_dup_keys = {k for k, count in dup_counts.items() if count > 1}

    final_rows: list[tuple[NormalizedImportRow, dict[str, Any]]] = []
    for item, raw in normalized_rows:
        refreshed = normalize_row(db, row_number=item.row_number, raw=raw, filename=filename, file_duplicate_keys=file_dup_keys)
        if refreshed.periodo_inicio and refreshed.periodo_fin and refreshed.matched_user_id:
            refreshed.will_create_cycle = not _find_matching_cycle(
                db, user_id=refreshed.matched_user_id,
                period_start=refreshed.periodo_inicio,
                period_end=refreshed.periodo_fin,
            )
        elif refreshed.fecha_pago and refreshed.status != "error":
            refreshed.will_create_cycle = True
        final_rows.append((refreshed, raw))

    rows = [r for r, _ in final_rows]
    summary = build_preview_summary(rows)
    diagnosis["can_import"] = diagnosis["can_preview"] and not summary["blocking_errors"]

    file_hash = hashlib.sha256(file_bytes).hexdigest()
    batch = MembershipImportBatch(
        created_by=admin_user.id,
        status="preview",
        filename=filename,
        sheet_name=parsed.sheet_name,
        file_sha256=file_hash,
        column_mapping=mapping,
        diagnosis=diagnosis,
        preview_summary=summary,
    )
    db.add(batch)
    db.flush()

    serialized_rows = []
    for item, raw in final_rows:
        db.add(
            MembershipImportRecord(
                batch_id=batch.id,
                row_number=item.row_number,
                status=item.status,
                raw_data=raw,
                normalized_data=_serialize_row(item, raw),
                errors=[asdict(e) for e in item.errors],
                warnings=[asdict(w) for w in item.warnings],
                referencia_externa=item.referencia_externa,
                matched_user_id=item.matched_user_id,
            )
        )
        serialized_rows.append(_serialize_row(item, raw))

    db.commit()
    db.refresh(batch)

    return {
        "batch_id": batch.id,
        "status": batch.status,
        "diagnosis": diagnosis,
        "column_mapping": mapping,
        "preview_summary": summary,
        "rows": serialized_rows,
    }


def _get_or_create_membership(db: Session, user_id: int) -> Membership:
    membership = db.query(Membership).filter(Membership.user_id == user_id).first()
    if membership:
        return membership
    membership = Membership(user_id=user_id, status="expired", plan="grupal", expires_at=None)
    db.add(membership)
    db.flush()
    return membership


def _unique_username(db: Session, base: str) -> str:
    candidate = re.sub(r"[^a-z0-9_]", "", base.lower())[:40] or "socio"
    if not db.query(User).filter(User.username == candidate).first():
        return candidate
    for i in range(2, 500):
        option = f"{candidate[:35]}_{i}"
        if not db.query(User).filter(User.username == option).first():
            return option
    return f"{candidate}_{secrets.token_hex(3)}"


def _create_socio_user(db: Session, *, name: str, phone: str | None) -> User:
    base_username = f"socio_{phone}" if phone else _normalize_name(name).replace(" ", "_")
    username = _unique_username(db, base_username)
    password = secrets.token_urlsafe(16)
    user = User(
        username=username,
        name=name.strip(),
        password_hash=hash_password(password),
        role="socio",
        phone=phone,
    )
    db.add(user)
    db.flush()
    _get_or_create_membership(db, user.id)
    return user


def _find_matching_cycle(db: Session, *, user_id: int, period_start: date, period_end: date) -> MembershipCycle | None:
    return (
        db.query(MembershipCycle)
        .filter(
            MembershipCycle.user_id == user_id,
            MembershipCycle.start_date == period_start,
            MembershipCycle.end_date == period_end,
        )
        .order_by(MembershipCycle.id.desc())
        .first()
    )


def _find_active_cycle(db: Session, user_id: int) -> MembershipCycle | None:
    return (
        db.query(MembershipCycle)
        .filter(MembershipCycle.user_id == user_id, MembershipCycle.is_active_cycle == True)
        .order_by(MembershipCycle.created_at.desc())
        .first()
    )


def _extract_historical_source(fuente_archivo: str | None) -> str:
    text = (fuente_archivo or "").strip().upper()
    if "OCCALISTHENICS" in text:
        return "OCCALISTHENICS"
    if text:
        return text.split("::")[0].split(".")[0][:60] or "IMPORTACION_HISTORICA"
    return "IMPORTACION_HISTORICA"


def _create_historical_cycle(
    db: Session,
    *,
    membership: Membership,
    user_id: int,
    plan: str,
    cost: float,
    start_date: date,
    end_date: date,
    admin_user: User,
    batch_id: int,
    historical_source: str | None = None,
) -> MembershipCycle:
    source = historical_source or "IMPORTACION_HISTORICA"
    is_past = end_date < date.today()

    active = _find_active_cycle(db, user_id)
    is_active = False
    if not is_past and active is None:
        is_active = True
    elif not is_past and end_date >= active.end_date:
        db.query(MembershipCycle).filter(
            MembershipCycle.membership_id == membership.id,
            MembershipCycle.is_historical_import.is_(False),
        ).update({MembershipCycle.is_active_cycle: False})
        is_active = True

    cycle = MembershipCycle(
        membership_id=membership.id,
        user_id=user_id,
        membership_type=plan,
        cost=float(cost),
        start_date=start_date,
        end_date=end_date,
        status="vencida" if is_past else "activa",
        is_active_cycle=is_active,
        is_historical_import=True,
        historical_source=source,
        import_batch_id=batch_id,
        created_by=admin_user.id,
        updated_by=admin_user.id,
    )
    db.add(cycle)
    db.flush()
    record_cycle_audit(
        db,
        cycle=cycle,
        changed_by=admin_user.id,
        reason=f"Ciclo historico creado por importacion lote #{batch_id}",
        event="historical_import_cycle_created",
        old_payload={},
        new_payload={"batch_id": batch_id, "cycle_id": cycle.id, "historical_source": source},
    )
    if is_active and not is_past:
        membership.plan = plan
        membership.expires_at = datetime.combine(end_date, datetime.max.time())
        membership.status = "active"
    return cycle


def _resolve_row_user(
    db: Session,
    item: NormalizedImportRow,
    *,
    resolve_ambiguous: dict[int, int],
    allow_create_users: bool,
) -> User | None:
    if item.socio_match == "existing" and item.matched_user_id:
        return db.query(User).filter(User.id == item.matched_user_id, User.role == "socio").first()
    if item.socio_match == "ambiguous":
        chosen = resolve_ambiguous.get(item.row_number)
        if not chosen:
            return None
        return db.query(User).filter(User.id == chosen, User.role == "socio").first()
    if item.socio_match == "new" and allow_create_users and item.socio_nombre:
        return _create_socio_user(db, name=item.socio_nombre, phone=item.telefono)
    return None


def commit_import_batch(
    db: Session,
    *,
    batch_id: int,
    admin_user: User,
    confirm_duplicate_rows: list[int] | None = None,
    resolve_ambiguous: dict[int, int] | None = None,
    confirm_extend_without_period_rows: list[int] | None = None,
) -> dict[str, Any]:
    batch = db.query(MembershipImportBatch).filter(MembershipImportBatch.id == batch_id).first()
    if not batch:
        raise ValueError("Lote de importacion no encontrado")
    if batch.status == "committed":
        raise ValueError("Este lote ya fue importado")
    if batch.status != "preview":
        raise ValueError("El lote no esta en estado preview")

    confirm_duplicate_rows = set(confirm_duplicate_rows or [])
    resolve_ambiguous = resolve_ambiguous or {}
    confirm_extend_rows = set(confirm_extend_without_period_rows or [])

    imported = 0
    skipped = 0
    failed = 0
    results: list[dict[str, Any]] = []

    records = (
        db.query(MembershipImportRecord)
        .filter(MembershipImportRecord.batch_id == batch_id)
        .order_by(MembershipImportRecord.row_number.asc())
        .all()
    )

    for record in records:
        normalized = record.normalized_data or {}
        item = NormalizedImportRow(
            row_number=record.row_number,
            socio_nombre=normalized.get("socio_nombre"),
            telefono=normalized.get("telefono"),
            plan=normalized.get("plan"),
            fecha_pago=_parse_date_value(normalized.get("fecha_pago")),
            monto_pagado=normalized.get("monto_pagado"),
            metodo_pago=normalized.get("metodo_pago"),
            periodo_inicio=_parse_date_value(normalized.get("periodo_inicio")),
            periodo_fin=_parse_date_value(normalized.get("periodo_fin")),
            payment_action=normalized.get("payment_action"),
            counts_as_income=normalized.get("counts_as_income"),
            applies_to_balance=normalized.get("applies_to_balance"),
            saldo_pendiente=normalized.get("saldo_pendiente"),
            nota=normalized.get("nota"),
            fuente_archivo=normalized.get("fuente_archivo"),
            referencia_externa=normalized.get("referencia_externa"),
            socio_match=normalized.get("socio_match", "pending"),
            matched_user_id=normalized.get("matched_user_id"),
            candidate_user_ids=normalized.get("candidate_user_ids") or [],
            status=record.status,
        )

        # Re-evaluar match en commit: enlazar socios creados en filas anteriores del mismo lote
        match_type, matched_id, candidates = _match_users(
            db, phone=item.telefono, name=item.socio_nombre
        )
        if match_type == "existing":
            item.socio_match = "existing"
            item.matched_user_id = matched_id
        elif match_type == "ambiguous":
            item.socio_match = "ambiguous"
            item.matched_user_id = None
            item.candidate_user_ids = candidates

        if item.status == "error":
            skipped += 1
            record.status = "skipped"
            results.append({"row_number": item.row_number, "status": "skipped", "reason": "error"})
            continue

        if item.status == "duplicate" and item.row_number not in confirm_duplicate_rows:
            skipped += 1
            record.status = "skipped_duplicate"
            results.append({"row_number": item.row_number, "status": "skipped_duplicate"})
            continue

        has_period = bool(item.periodo_inicio and item.periodo_fin)
        if item.payment_action in {"renew_extend", "courtesy_extend"} and not has_period:
            if item.row_number not in confirm_extend_rows:
                skipped += 1
                record.status = "skipped_needs_confirmation"
                results.append({"row_number": item.row_number, "status": "skipped_needs_confirmation"})
                continue

        user = _resolve_row_user(
            db,
            item,
            resolve_ambiguous=resolve_ambiguous,
            allow_create_users=True,
        )
        if not user:
            failed += 1
            record.status = "failed"
            record.errors = (record.errors or []) + [asdict(RowIssue("unresolved_socio", "No se pudo resolver el socio"))]
            results.append({"row_number": item.row_number, "status": "failed", "reason": "unresolved_socio"})
            continue

        if item.telefono and _normalize_phone(user.phone) != item.telefono and user.phone:
            pass
        elif item.telefono and not user.phone:
            user.phone = item.telefono

        membership = _get_or_create_membership(db, user.id)
        plan = item.plan or membership.plan or "grupal"
        amount = float(item.monto_pagado or 0)
        pending = float(item.saldo_pendiente or 0)
        cycle_cost = max(amount + pending, amount, 1.0)

        if has_period:
            cycle = _find_matching_cycle(
                db,
                user_id=user.id,
                period_start=item.periodo_inicio,
                period_end=item.periodo_fin,
            )
            if not cycle:
                cycle = _create_historical_cycle(
                    db,
                    membership=membership,
                    user_id=user.id,
                    plan=plan,
                    cost=cycle_cost,
                    start_date=item.periodo_inicio,
                    end_date=item.periodo_fin,
                    admin_user=admin_user,
                    batch_id=batch_id,
                    historical_source=_extract_historical_source(item.fuente_archivo),
                )
        else:
            pay_day = item.fecha_pago
            cycle = _find_matching_cycle(db, user_id=user.id, period_start=pay_day, period_end=pay_day)
            if not cycle:
                cycle = _create_historical_cycle(
                    db,
                    membership=membership,
                    user_id=user.id,
                    plan=plan,
                    cost=cycle_cost,
                    start_date=pay_day,
                    end_date=pay_day,
                    admin_user=admin_user,
                    batch_id=batch_id,
                    historical_source=_extract_historical_source(item.fuente_archivo),
                )

        if _payment_exists_in_db(
            db,
            user_id=user.id,
            pay_date=item.fecha_pago,
            amount=amount,
            method=item.metodo_pago or "",
            referencia_externa=item.referencia_externa,
            batch_id=batch_id,
        ) and item.row_number not in confirm_duplicate_rows:
            skipped += 1
            record.status = "skipped_duplicate"
            results.append({"row_number": item.row_number, "status": "skipped_duplicate"})
            continue

        idem = (
            f"historical-import:{batch_id}:{item.referencia_externa}"
            if item.referencia_externa
            else f"historical-import:{batch_id}:{item.row_number}"
        )
        payment = MembershipPayment(
            membership_cycle_id=cycle.id,
            user_id=user.id,
            payment_date=datetime.combine(item.fecha_pago, datetime.min.time()),
            amount=amount,
            payment_method=item.metodo_pago or "efectivo",
            concept=f"Importacion historica lote #{batch_id}",
            observations=(
                f"Importado desde archivo historico. Fuente: {item.fuente_archivo or batch.filename}. "
                f"Referencia: {item.referencia_externa or 'N/A'}."
            ),
            idempotency_key=idem,
            payment_action=item.payment_action,
            counts_as_income=bool(item.counts_as_income),
            applies_to_balance=bool(item.applies_to_balance),
            created_by=admin_user.id,
        )
        if has_period:
            payment.period_start_date = item.periodo_inicio
            payment.period_end_date = item.periodo_fin
        db.add(payment)
        db.flush()

        extend_vigencia = item.payment_action in {"renew_extend", "courtesy_extend"} and (
            has_period or item.row_number in confirm_extend_rows
        )
        active_cycle = _find_active_cycle(db, user.id)
        if extend_vigencia and active_cycle and active_cycle.id == cycle.id:
            apply_payment_to_cycle(
                db,
                cycle=cycle,
                payment=payment,
                payment_action=item.payment_action or "register_only",
                payment_day=item.fecha_pago,
                period_start=item.periodo_inicio,
                period_end=item.periodo_fin,
                period_duration_months=None,
                renewal_start_date=None,
                admin_user=admin_user,
            )
        elif has_period:
            payment.period_start_date = item.periodo_inicio
            payment.period_end_date = item.periodo_fin

        note_id = None
        if item.nota:
            note = MembershipNote(
                user_id=user.id,
                membership_id=membership.id,
                membership_cycle_id=cycle.id,
                note=f"[Import lote #{batch_id}] {item.nota}",
                created_by=admin_user.id,
            )
            db.add(note)
            db.flush()
            note_id = note.id

        record.status = "imported"
        record.matched_user_id = user.id
        record.membership_cycle_id = cycle.id
        record.payment_id = payment.id
        record.note_id = note_id
        imported += 1
        results.append(
            {
                "row_number": item.row_number,
                "status": "imported",
                "user_id": user.id,
                "cycle_id": cycle.id,
                "payment_id": payment.id,
            }
        )

    batch.status = "committed"
    batch.committed_at = datetime.utcnow()
    batch.committed_summary = {
        "imported": imported,
        "skipped": skipped,
        "failed": failed,
        "results": results,
    }
    db.commit()

    return {
        "batch_id": batch.id,
        "status": batch.status,
        "summary": batch.committed_summary,
    }


def get_import_batch(db: Session, batch_id: int) -> dict[str, Any] | None:
    batch = db.query(MembershipImportBatch).filter(MembershipImportBatch.id == batch_id).first()
    if not batch:
        return None
    records = (
        db.query(MembershipImportRecord)
        .filter(MembershipImportRecord.batch_id == batch_id)
        .order_by(MembershipImportRecord.row_number.asc())
        .all()
    )
    return {
        "batch_id": batch.id,
        "status": batch.status,
        "filename": batch.filename,
        "sheet_name": batch.sheet_name,
        "created_at": batch.created_at.isoformat() if batch.created_at else None,
        "committed_at": batch.committed_at.isoformat() if batch.committed_at else None,
        "diagnosis": batch.diagnosis,
        "preview_summary": batch.preview_summary,
        "committed_summary": batch.committed_summary,
        "records": [
            {
                "row_number": r.row_number,
                "status": r.status,
                "errors": r.errors,
                "warnings": r.warnings,
                "referencia_externa": r.referencia_externa,
                "matched_user_id": r.matched_user_id,
                "payment_id": r.payment_id,
                "membership_cycle_id": r.membership_cycle_id,
                "note_id": r.note_id,
            }
            for r in records
        ],
    }


def get_import_errors_report(db: Session, batch_id: int) -> list[dict[str, Any]]:
    records = (
        db.query(MembershipImportRecord)
        .filter(
            MembershipImportRecord.batch_id == batch_id,
            MembershipImportRecord.status.in_(["error", "warning", "duplicate", "failed", "skipped", "skipped_duplicate"]),
        )
        .order_by(MembershipImportRecord.row_number.asc())
        .all()
    )
    report = []
    for record in records:
        report.append(
            {
                "row_number": record.row_number,
                "status": record.status,
                "referencia_externa": record.referencia_externa,
                "errors": record.errors or [],
                "warnings": record.warnings or [],
                "raw_data": record.raw_data,
                "normalized_data": record.normalized_data,
            }
        )
    return report


def template_csv_content() -> str:
    from pathlib import Path

    path = Path(__file__).resolve().parents[2] / "templates" / "membership_historical_import_template.csv"
    return path.read_text(encoding="utf-8")
