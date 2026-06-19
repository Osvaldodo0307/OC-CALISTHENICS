#!/usr/bin/env python3
"""Genera lote piloto diverso (10 filas únicas) desde matriz OCCALISTHENICS.xlsx."""
from __future__ import annotations

import calendar
from datetime import date, datetime
from pathlib import Path

import pandas as pd

BACKEND_ROOT = Path(__file__).resolve().parents[1]
SOURCE = BACKEND_ROOT / "fixtures" / "OCCALISTHENICS.xlsx"
OUT_CSV = BACKEND_ROOT / "fixtures" / "OCCALISTHENICS_real_piloto.csv"


def _parse_header_date(value) -> date | None:
    if value is None or (isinstance(value, float) and pd.isna(value)):
        return None
    if isinstance(value, (datetime, date)):
        return value.date() if isinstance(value, datetime) else value
    try:
        return pd.to_datetime(str(value)).date()
    except Exception:
        return None


def _month_end(d: date) -> date:
    last = calendar.monthrange(d.year, d.month)[1]
    return date(d.year, d.month, last)


def _amount(value) -> float | None:
    if value is None or (isinstance(value, float) and pd.isna(value)):
        return None
    if isinstance(value, (int, float)):
        return float(value)
    text = str(value).strip().upper()
    if text in {"", "X", "✅", "❌"}:
        return None
    try:
        return float(text.replace(",", ""))
    except ValueError:
        return None


def member_snapshot(sheet: str, df: pd.DataFrame, row_idx: int, month_col: int, month_date: date) -> dict:
    name = str(df.iloc[row_idx, 0]).strip()
    plan = str(df.iloc[row_idx, 4]).strip() if pd.notna(df.iloc[row_idx, 4]) else "PLAN OC"
    costo = _amount(df.iloc[row_idx, 3])
    membresia = _amount(df.iloc[row_idx, 2])
    monto = _amount(df.iloc[row_idx, month_col]) or 0.0
    saldo = round(max((costo or 0) - monto, 0), 2) if costo and monto < costo else 0.0

    tags = []
    if monto == 0:
        tags.append("mes_sin_pago")
    if saldo > 0:
        tags.append("adeudo_parcial")
    if plan.upper() == "WELLHUB":
        tags.append("plan_wellhub")
    if membresia and costo and membresia < costo:
        tags.append("col_membresia_menor_costo")

    return {
        "socio_nombre": name,
        "telefono": "",
        "plan": plan,
        "fecha_pago": month_date.isoformat(),
        "monto_pagado": monto,
        "metodo_pago": "",
        "periodo_inicio": month_date.isoformat(),
        "periodo_fin": _month_end(month_date).isoformat(),
        "payment_action": "register_only",
        "counts_as_income": "true",
        "applies_to_balance": "true",
        "saldo_pendiente": saldo,
        "nota": f"Hoja {sheet}; tags={','.join(tags) or 'ok'}; MEMBRESIA={membresia}; COSTO={costo}",
        "fuente_archivo": "OCCALISTHENICS.xlsx",
        "referencia_externa": f"OC-REAL-{name[:10].replace(' ', '_')}-{month_date.strftime('%Y%m')}",
    }


def main() -> int:
    sheet = "NOVIEMBRE 2025"
    df = pd.ExcelFile(SOURCE).parse(sheet, header=None)
    header = df.iloc[1]
    month_cols = [(i, d) for i, v in enumerate(header) if (d := _parse_header_date(v))]
    nov_col = month_cols[-1]  # 2025-11-01

    # Selección manual de filas representativas (índice 0-based en df)
    picks = {
        "TOÑITO OSNAYA": 2,      # al corriente
        "LIRIA VILLEGAS": 3,     # membresia 0
        "FERNANDA ALVA": 6,      # nov=0 vencido
        "URIEL. CARDIEL": 9,     # wellhub ceros previos
        "EDIT": 10,              # plan especial / parcial en otros meses
        "RODRIGO ALVA": 11,      # apellido repetido
        "PEDRO FLORES": 7,
        "LUIS ALBERTO": 8,
        "VALERIA QUINTANA": 4,
        "ARLETTE ROMÁN": 5,
    }

    rows = []
    for name, idx in picks.items():
        rows.append(member_snapshot(sheet, df, idx, nov_col[0], nov_col[1]))

    # Segunda fila mismo socio (varios meses): LUIS ALBERTO octubre
    oct_col = month_cols[-2]
    rows.append(member_snapshot(sheet, df, picks["LUIS ALBERTO"], oct_col[0], oct_col[1]))
    # Reemplazar último pick para mantener 10: quitar ARLETTE, keep luis x2
    rows = rows[:9] + [rows[-1]]

    pd.DataFrame(rows).to_csv(OUT_CSV, index=False, encoding="utf-8-sig")
    print(f"Wrote {len(rows)} rows to {OUT_CSV}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
