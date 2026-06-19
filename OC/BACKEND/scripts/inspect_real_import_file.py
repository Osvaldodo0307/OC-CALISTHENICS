#!/usr/bin/env python3
"""Inspección estructural del archivo histórico real (solo lectura)."""
from __future__ import annotations

import json
import sys
from pathlib import Path

import pandas as pd

BACKEND_ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(BACKEND_ROOT))

from app.services.membership_import_service import _auto_column_mapping, diagnose_dataframe


def inspect_sheet(df: pd.DataFrame, sheet_name: str) -> dict:
    empty_cols = [str(c) for c in df.columns if df[c].isna().all()]
    mapping = _auto_column_mapping([str(c) for c in df.columns])
    diagnosis = diagnose_dataframe(df, mapping)

    # Buscar filas con texto que parezca nombre de socio
    sample_rows = []
    for idx in range(min(30, len(df))):
        row = df.iloc[idx]
        non_null = {str(k): (None if pd.isna(v) else str(v)[:80]) for k, v in row.items() if not pd.isna(v)}
        if non_null:
            sample_rows.append({"excel_row": idx + 1, "cells": non_null})

    return {
        "sheet": sheet_name,
        "rows": int(len(df)),
        "columns_count": int(len(df.columns)),
        "columns": [str(c) for c in df.columns],
        "empty_columns_count": len(empty_cols),
        "empty_columns_sample": empty_cols[:20],
        "auto_mapping": mapping,
        "diagnosis": diagnosis,
        "sample_nonempty_rows": sample_rows[:15],
    }


def find_header_candidates(df: pd.DataFrame) -> list[dict]:
    candidates = []
    for idx in range(min(25, len(df))):
        row = df.iloc[idx]
        texts = [str(v).strip().lower() for v in row if not pd.isna(v)]
        joined = " ".join(texts)
        score = sum(
            kw in joined
            for kw in (
                "nombre", "socio", "telefono", "teléfono", "celular", "monto", "pago",
                "fecha", "plan", "membres", "adeudo", "efectivo", "transfer",
            )
        )
        if score >= 2 or (len(texts) >= 3 and any("nombre" in t or "socio" in t for t in texts)):
            candidates.append({"row": idx + 1, "score": score, "cells": texts[:20]})
    return sorted(candidates, key=lambda x: -x["score"])[:8]


def main() -> int:
    file_path = Path(sys.argv[1]) if len(sys.argv) > 1 else BACKEND_ROOT / "fixtures" / "OCCALISTHENICS.xlsx"
    out_path = BACKEND_ROOT / "fixtures" / "OCCALISTHENICS_inspection.json"

    xl = pd.ExcelFile(file_path)
    report = {
        "file": str(file_path),
        "sheets": xl.sheet_names,
        "per_sheet": [],
    }

    for name in xl.sheet_names:
        df = xl.parse(name, header=None)
        info = inspect_sheet(df, name)
        info["header_candidates"] = find_header_candidates(df)
        report["per_sheet"].append(info)

    out_path.write_text(json.dumps(report, indent=2, ensure_ascii=False, default=str), encoding="utf-8")
    print(f"Written: {out_path}")
    print(f"Sheets: {xl.sheet_names}")
    for s in report["per_sheet"]:
        print(f"  {s['sheet']}: {s['rows']} rows, {s['columns_count']} cols, mapping keys={list(s['auto_mapping'].keys())}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
