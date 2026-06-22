#!/usr/bin/env python3
"""
Parser read-only del bloque superior de visitas (Fase 2C.1).

No escribe en BD ni genera CSV productivo. Por defecto imprime diagnóstico agregado.

Uso:
  python scripts/parse_occalisthenics_visit_block.py
  python scripts/parse_occalisthenics_visit_block.py --sheet "ENERO 2026"
  python scripts/parse_occalisthenics_visit_block.py --write-example fixtures/historical_visit_summary_template.csv.example
"""
from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path

import pandas as pd

BACKEND_ROOT = Path(__file__).resolve().parents[1]
if str(BACKEND_ROOT) not in sys.path:
    sys.path.insert(0, str(BACKEND_ROOT))

from app.services.historical_visit_parser import classify_sheet_content, parse_visit_summaries

DEFAULT_SOURCE = BACKEND_ROOT / "fixtures" / "OCCALISTHENICS.xlsx"
DEFAULT_SHEET = "ENERO 2026"


def main() -> int:
    parser = argparse.ArgumentParser(description="Extrae bloque superior de visitas agregadas.")
    parser.add_argument("--source", type=Path, default=DEFAULT_SOURCE)
    parser.add_argument("--sheet", default=DEFAULT_SHEET)
    parser.add_argument("--write-example", type=Path, default=None, help="Escribe CSV anonimizado .example")
    args = parser.parse_args()

    if not args.source.exists():
        print(json.dumps({"error": "archivo_no_encontrado", "path": str(args.source)}, ensure_ascii=False))
        return 1

    df = pd.read_excel(args.source, sheet_name=args.sheet, header=None)
    result = parse_visit_summaries(df, sheet_name=args.sheet)
    sheet_type = classify_sheet_content(df, sheet_name=args.sheet)

    payload = {
        "sheet_name": args.sheet,
        "sheet_type": sheet_type,
        "layout_detected": result.layout is not None,
        "header_row_excel": (result.layout.header_row_index + 1) if result.layout else None,
        "summaries_count": len(result.summaries),
        "skipped_rows": result.skipped_rows,
        "invalid_values": result.invalid_values,
        "payment_block_detected": result.payment_block_detected,
        "diagnostics": result.diagnostics,
        "note": "Salida agregada; no incluye nombres de socios.",
    }
    print(json.dumps(payload, ensure_ascii=False, indent=2, default=str))

    if args.write_example:
        example_rows = [
            {
                "raw_member_name": "Socio Demo A",
                "normalized_member_name": "socio demo a",
                "period_month": "2025-10-01",
                "visits_count": 12,
                "source_sheet": args.sheet,
                "source_row": 3,
                "match_status": "matched",
            },
            {
                "raw_member_name": "Socio Demo B",
                "normalized_member_name": "socio demo b",
                "period_month": "2026-01-01",
                "visits_count": 4,
                "source_sheet": args.sheet,
                "source_row": 4,
                "match_status": "new_candidate",
            },
        ]
        out_df = pd.DataFrame(example_rows)
        args.write_example.parent.mkdir(parents=True, exist_ok=True)
        out_df.to_csv(args.write_example, index=False)
        print(f"Ejemplo anonimizado: {args.write_example}", file=sys.stderr)

    return 0 if result.layout else 2


if __name__ == "__main__":
    raise SystemExit(main())
