#!/usr/bin/env python3
"""
Diagnóstico read-only hoja ENERO 2026 (Fase 2B.9).

No escribe en BD. Por defecto imprime JSON agregado a stdout (sin listar nombres completos).

Uso:
  python scripts/diagnose_enero_2026_sheet.py
  python scripts/diagnose_enero_2026_sheet.py --verbose
"""
from __future__ import annotations

import argparse
import json
import re
import sys
from pathlib import Path

import pandas as pd

BACKEND_ROOT = Path(__file__).resolve().parents[1]
DEFAULT_SOURCE = BACKEND_ROOT / "fixtures" / "OCCALISTHENICS.xlsx"
SHEET = "ENERO 2026"

AGGREGATE_KEYWORDS = ("TOTAL", "MENSUAL", "WELLHUB", "SUBTOTAL", "SUMA", "CLASES")


def _is_aggregate(name: str) -> bool:
    upper = name.strip().upper()
    return any(keyword in upper for keyword in AGGREGATE_KEYWORDS)


def _parse_amount(value) -> float | None:
    if pd.isna(value):
        return None
    try:
        return float(value)
    except (TypeError, ValueError):
        return None


def analyze(df: pd.DataFrame, *, verbose: bool) -> dict:
    # --- Sección 1: visitas (filas ~2-39, nombres col 2, meses col 3-6) ---
    visit_month_cols = {3: "OCTUBRE", 4: "NOVIEMBRE", 5: "DICIEMBRE", 6: "ENERO"}
    visit_socios = 0
    visit_cells = 0
    visit_max = 0.0
    visit_names: list[str] = []

    for idx in range(2, min(40, len(df))):
        raw = df.iloc[idx, 2]
        if pd.isna(raw):
            continue
        name = str(raw).strip()
        if not name or name.upper() in {"X", "TOTAL"}:
            continue
        visit_socios += 1
        if verbose:
            visit_names.append(name)
        for col in visit_month_cols:
            amount = _parse_amount(df.iloc[idx, col] if col < df.shape[1] else None)
            if amount is not None and amount > 0:
                visit_cells += 1
                visit_max = max(visit_max, amount)

    # --- Sección 2: pagos (header fila 42, nombres col 11) ---
    header_idx = 41
    name_col = 11
    cost_col = 14
    plan_col = 15
    month_cols: dict[int, str] = {}
    for col in range(df.shape[1]):
        label = str(df.iloc[header_idx, col]).strip().upper() if pd.notna(df.iloc[header_idx, col]) else ""
        if label in {"SEPTIEMBRE", "OCTUBRE", "NOVIEMBRE", "DICIEMBRE", "ENERO"}:
            month_cols[col] = label.title()

    enero_col = next((col for col, label in month_cols.items() if label.upper() == "ENERO"), None)
    payment_socios = 0
    enero_payment_rows = 0
    enero_aggregate_rows = 0
    enero_income_real = 0.0
    enero_income_with_aggregates = 0.0
    plan_counts: dict[str, int] = {}
    payment_names: list[str] = []

    if enero_col is not None:
        for idx in range(header_idx + 1, len(df)):
            raw = df.iloc[idx, name_col]
            if pd.isna(raw):
                continue
            name = str(raw).strip()
            if not name or name.upper() in {"NOMBRE", "OCCALISTHENICSMX"}:
                continue
            payment_socios += 1
            amount = _parse_amount(df.iloc[idx, enero_col])
            if amount is None or amount <= 0:
                continue
            enero_payment_rows += 1
            enero_income_with_aggregates += amount
            if _is_aggregate(name):
                enero_aggregate_rows += 1
                continue
            enero_income_real += amount
            plan = str(df.iloc[idx, plan_col]).strip() if pd.notna(df.iloc[idx, plan_col]) else "(vacio)"
            plan_counts[plan] = plan_counts.get(plan, 0) + 1
            if verbose:
                payment_names.append(name)

    importer_fields = {
        "socio_nombre": "parcial — solo bloque inferior (col 11)",
        "fecha_pago": "inferible (2026-01-01) — no explícita",
        "monto_pagado": "parcial — bloque inferior; riesgo si se mezcla con visitas",
        "metodo_pago": "ausente",
        "periodo_inicio": "inferible",
        "periodo_fin": "inferible",
        "referencia_externa": "generable en ETL",
        "telefono": "ausente",
    }

    compatible_payment_import = False
    if enero_col and enero_income_real > 0:
        compatible_payment_import = False  # requiere ETL dedicado; transform actual falla

    return {
        "sheet": SHEET,
        "rows_total": int(len(df)),
        "sheet_type": "mezcla_visitas_y_pagos",
        "section_1_visits": {
            "header_labels": list(visit_month_cols.values()) + ["Visitas (col 10)"],
            "socios_count": visit_socios,
            "value_range_interpretation": "enteros 0-31 (conteo de visitas, no MXN)",
            "nonzero_visit_cells": visit_cells,
            "max_cell_value": visit_max,
            "socios_sample": visit_names[:8] if verbose else [],
        },
        "section_2_payments": {
            "header_row_excel": header_idx + 1,
            "name_column_index": name_col,
            "month_columns_detected": month_cols,
            "socios_count": payment_socios,
            "enero_rows_with_amount_gt_0": enero_payment_rows,
            "enero_aggregate_rows": enero_aggregate_rows,
            "enero_real_payment_rows": enero_payment_rows - enero_aggregate_rows,
            "enero_income_real_mxn": round(enero_income_real, 2),
            "enero_income_including_aggregates_mxn": round(enero_income_with_aggregates, 2),
            "plan_counts_enero": plan_counts,
            "socios_sample": payment_names[:8] if verbose else [],
        },
        "transform_occalisthenics_matrix": {
            "enero_2026_supported": False,
            "reason": "No detecta columnas de mes con fecha; nombres no están en columna 0; hoja dual",
        },
        "importer_template_compatibility": importer_fields,
        "compatible_with_payment_importer_as_is": compatible_payment_import,
        "recommendation": "enero_asistencias_checkins",
        "recommendation_detail": (
            "La sección superior es control de visitas. "
            "La sección inferior tiene pagos tipo matriz pero requiere ETL distinto y limpieza; "
            "no usar el transformador actual ni mezclar visitas con pagos."
        ),
    }


def main() -> int:
    parser = argparse.ArgumentParser(description="Diagnóstico ENERO 2026 (solo lectura)")
    parser.add_argument("--file", type=Path, default=DEFAULT_SOURCE)
    parser.add_argument("--verbose", action="store_true", help="Incluir muestras de nombres en salida")
    args = parser.parse_args()

    if not args.file.exists():
        print(json.dumps({"error": f"No existe {args.file}"}, ensure_ascii=False))
        return 1

    df = pd.read_excel(args.file, sheet_name=SHEET, header=None)
    report = analyze(df, verbose=args.verbose)
    print(json.dumps(report, indent=2, ensure_ascii=False))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
