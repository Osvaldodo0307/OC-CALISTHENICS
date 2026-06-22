"""
Parser de bloques de visitas agregadas en matrices OCCALISTHENICS (Fase 2C.1).

Extrae conteos mensuales por socio — NO eventos diarios, NO montos en MXN.
"""
from __future__ import annotations

import re
import unicodedata
from dataclasses import dataclass, field
from datetime import date
from typing import Any

import pandas as pd

MONTH_LABELS: dict[str, int] = {
    "ENERO": 1,
    "FEBRERO": 2,
    "MARZO": 3,
    "ABRIL": 4,
    "MAYO": 5,
    "JUNIO": 6,
    "JULIO": 7,
    "AGOSTO": 8,
    "SEPTIEMBRE": 9,
    "OCTUBRE": 10,
    "NOVIEMBRE": 11,
    "DICIEMBRE": 12,
}

SKIP_NAME_TOKENS = {"X", "TOTAL", "NOMBRE", "MENSUAL", "SUBTOTAL", "SUMA", "OCCALISTHENICSMX"}
AGGREGATE_NAME_KEYWORDS = ("TOTAL", "SUBTOTAL", "SUMA", "INVITADOS")
MAX_VISITS_PER_MONTH = 35
PAYMENT_BLOCK_MARKERS = ("MEMBRESIA", "COSTO PLAN", "TIPO DE PLAN")


def normalize_member_name(value: str | None) -> str:
    if not value:
        return ""
    text = unicodedata.normalize("NFKD", value.strip().lower())
    text = "".join(ch for ch in text if not unicodedata.combining(ch))
    text = re.sub(r"[^a-z0-9\s]", " ", text)
    return re.sub(r"\s+", " ", text).strip()


def _sheet_year(sheet_name: str) -> int | None:
    match = re.search(r"(20\d{2})", sheet_name or "")
    return int(match.group(1)) if match else None


def _sheet_anchor_month(sheet_name: str) -> int | None:
    upper = (sheet_name or "").upper()
    for label, month_num in MONTH_LABELS.items():
        if label in upper:
            return month_num
    return None


def period_month_from_label(month_label: str, *, sheet_name: str) -> date | None:
    label = (month_label or "").strip().upper()
    month_num = MONTH_LABELS.get(label)
    if not month_num:
        return None
    sheet_year = _sheet_year(sheet_name)
    anchor_month = _sheet_anchor_month(sheet_name)
    if not sheet_year or not anchor_month:
        return None
    year = sheet_year if month_num <= anchor_month else sheet_year - 1
    return date(year, month_num, 1)


def is_aggregate_row_name(name: str) -> bool:
    upper = (name or "").strip().upper()
    if not upper or upper in SKIP_NAME_TOKENS:
        return True
    return any(keyword in upper for keyword in AGGREGATE_NAME_KEYWORDS)


def is_payment_block_header(row_values: list[Any]) -> bool:
    texts = [str(v).strip().upper() for v in row_values if pd.notna(v)]
    joined = " ".join(texts)
    return sum(marker in joined for marker in PAYMENT_BLOCK_MARKERS) >= 2


@dataclass(frozen=True)
class VisitBlockLayout:
    sheet_name: str
    header_row_index: int
    name_column_index: int
    month_columns: dict[int, str]
    data_start_row_index: int
    data_end_row_index: int | None = None


@dataclass
class ParsedVisitSummary:
    raw_member_name: str
    normalized_member_name: str
    period_month: date
    month_label: str
    visits_count: int
    source_sheet: str
    source_row: int
    source_column_index: int
    warnings: list[str] = field(default_factory=list)


@dataclass
class VisitParseResult:
    layout: VisitBlockLayout | None
    summaries: list[ParsedVisitSummary]
    skipped_rows: int
    invalid_values: int
    payment_block_detected: bool
    diagnostics: dict[str, Any]


def detect_visit_block(df: pd.DataFrame, *, sheet_name: str) -> VisitBlockLayout | None:
    """Detecta bloque superior de visitas (nombres en col C típica, meses por etiqueta)."""
    payment_block_row: int | None = None
    for idx in range(min(len(df), 80)):
        row_vals = [df.iloc[idx, col] if col < df.shape[1] else None for col in range(min(30, df.shape[1]))]
        if is_payment_block_header(row_vals):
            payment_block_row = idx
            break

    search_until = payment_block_row if payment_block_row is not None else min(45, len(df))
    for header_idx in range(min(8, search_until)):
        month_columns: dict[int, str] = {}
        name_col: int | None = None
        for col_idx in range(min(20, df.shape[1])):
            raw = df.iloc[header_idx, col_idx]
            if pd.isna(raw):
                continue
            label = str(raw).strip().upper()
            if label in MONTH_LABELS:
                month_columns[col_idx] = label
            if label == "X" and name_col is None:
                name_col = col_idx

        if len(month_columns) >= 2 and name_col is not None:
            data_end = (payment_block_row - 1) if payment_block_row is not None else None
            return VisitBlockLayout(
                sheet_name=sheet_name,
                header_row_index=header_idx,
                name_column_index=name_col,
                month_columns=month_columns,
                data_start_row_index=header_idx + 1,
                data_end_row_index=data_end,
            )
    return None


def _parse_visit_count(value: Any) -> tuple[int | None, str | None]:
    if value is None or (isinstance(value, float) and pd.isna(value)):
        return None, None
    if isinstance(value, bool):
        return None, "valor_booleano"
    try:
        number = float(value)
    except (TypeError, ValueError):
        return None, "valor_no_entero"
    if number != int(number):
        return None, "valor_decimal"
    count = int(number)
    if count < 0:
        return None, "valor_negativo"
    if count > MAX_VISITS_PER_MONTH:
        return None, "visita_fuera_de_rango"
    return count, None


def parse_visit_summaries(df: pd.DataFrame, *, sheet_name: str) -> VisitParseResult:
    layout = detect_visit_block(df, sheet_name=sheet_name)
    summaries: list[ParsedVisitSummary] = []
    skipped_rows = 0
    invalid_values = 0
    payment_block_detected = False

    for idx in range(min(len(df), 80)):
        row_vals = [df.iloc[idx, col] if col < df.shape[1] else None for col in range(min(30, df.shape[1]))]
        if is_payment_block_header(row_vals):
            payment_block_detected = True
            break

    if not layout:
        return VisitParseResult(
            layout=None,
            summaries=[],
            skipped_rows=0,
            invalid_values=0,
            payment_block_detected=payment_block_detected,
            diagnostics={"error": "bloque_visitas_no_detectado"},
        )

    end_row = layout.data_end_row_index if layout.data_end_row_index is not None else len(df)
    for row_idx in range(layout.data_start_row_index, end_row):
        raw_name = df.iloc[row_idx, layout.name_column_index] if layout.name_column_index < df.shape[1] else None
        if pd.isna(raw_name):
            continue
        member_name = str(raw_name).strip()
        if not member_name or is_aggregate_row_name(member_name):
            skipped_rows += 1
            continue

        normalized = normalize_member_name(member_name)
        for col_idx, month_label in layout.month_columns.items():
            cell = df.iloc[row_idx, col_idx] if col_idx < df.shape[1] else None
            count, err = _parse_visit_count(cell)
            if err:
                if err != "valor_no_entero" or (cell is not None and not pd.isna(cell)):
                    invalid_values += 1
                continue
            if count is None or count == 0:
                continue

            period = period_month_from_label(month_label, sheet_name=sheet_name)
            if not period:
                invalid_values += 1
                continue

            warnings: list[str] = []
            if count > 31:
                warnings.append("conteo_alto_revisar")

            summaries.append(
                ParsedVisitSummary(
                    raw_member_name=member_name,
                    normalized_member_name=normalized,
                    period_month=period,
                    month_label=month_label,
                    visits_count=count,
                    source_sheet=sheet_name,
                    source_row=row_idx + 1,
                    source_column_index=col_idx,
                    warnings=warnings,
                )
            )

    month_totals: dict[str, int] = {}
    for item in summaries:
        key = item.period_month.isoformat()
        month_totals[key] = month_totals.get(key, 0) + item.visits_count

    return VisitParseResult(
        layout=layout,
        summaries=summaries,
        skipped_rows=skipped_rows,
        invalid_values=invalid_values,
        payment_block_detected=payment_block_detected,
        diagnostics={
            "sheet_name": sheet_name,
            "header_row_excel": layout.header_row_index + 1,
            "name_column_index": layout.name_column_index,
            "month_columns": layout.month_columns,
            "summaries_count": len(summaries),
            "distinct_members": len({s.normalized_member_name for s in summaries}),
            "visits_by_period": month_totals,
            "max_visits_cell": max((s.visits_count for s in summaries), default=0),
        },
    )


def classify_sheet_content(df: pd.DataFrame, *, sheet_name: str) -> str:
    """Clasifica hoja: visitas_agregadas, pagos_matriz, mixta, desconocida."""
    visit_result = parse_visit_summaries(df, sheet_name=sheet_name)
    has_visits = bool(visit_result.summaries)
    has_payments = visit_result.payment_block_detected
    if has_visits and has_payments:
        return "mixta_visitas_y_pagos"
    if has_visits:
        return "visitas_agregadas"
    if has_payments:
        return "pagos_matriz"
    return "desconocida"
