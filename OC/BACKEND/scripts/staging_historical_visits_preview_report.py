#!/usr/bin/env python3
"""
Reporte agregado de preview ENERO 2026 (Fase 2C.3).

No imprime nombres de socios. No escribe CSV. Solo conteos para validación staging.

Uso:
  python scripts/staging_historical_visits_preview_report.py
  python scripts/staging_historical_visits_preview_report.py --source fixtures/OCCALISTHENICS.xlsx
"""
from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path

import pandas as pd

BACKEND_ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(BACKEND_ROOT))

from app.database import SessionLocal
from app.models import MembershipCycle, MembershipPayment, User
from app.services.historical_visit_import_service import build_visit_preview_from_dataframe

DEFAULT_SOURCE = BACKEND_ROOT / "fixtures" / "OCCALISTHENICS.xlsx"
DEFAULT_SHEET = "ENERO 2026"


def main() -> int:
    parser = argparse.ArgumentParser(description="Preview agregado visitas historicas")
    parser.add_argument("--source", type=Path, default=DEFAULT_SOURCE)
    parser.add_argument("--sheet", default=DEFAULT_SHEET)
    args = parser.parse_args()

    if not args.source.exists():
        print(json.dumps({"error": "archivo_no_encontrado", "path": str(args.source)}))
        return 1

    db = SessionLocal()
    try:
        admin = db.query(User).filter(User.role == "admin").first()
        if not admin:
            print(json.dumps({"error": "admin_no_encontrado_en_bd"}))
            return 2

        users_before = db.query(User).count()
        payments_before = db.query(MembershipPayment).count()
        cycles_before = db.query(MembershipCycle).count()

        df = pd.read_excel(args.source, sheet_name=args.sheet, header=None)
        result = build_visit_preview_from_dataframe(
            db,
            df=df,
            sheet_name=args.sheet,
            filename=args.source.name,
            admin_user=admin,
            persist=False,
        )

        users_after = db.query(User).count()
        payments_after = db.query(MembershipPayment).count()
        cycles_after = db.query(MembershipCycle).count()

        ps = result["preview_summary"]
        payload = {
            "sheet_name": args.sheet,
            "sheet_type": result["sheet_type"],
            "payment_block_detected": result["diagnosis"].get("payment_block_detected"),
            "distinct_members": ps["distinct_members"],
            "total_summaries": ps["total_summaries"],
            "total_visits": ps["total_visits"],
            "visits_by_period": ps["visits_by_period"],
            "matched_members": ps["matched_members"],
            "new_candidates": ps["new_candidates"],
            "ambiguous_members": ps["ambiguous_members"],
            "unmatched_members": ps["unmatched_members"],
            "can_commit": ps["can_commit"],
            "blocking_errors": ps["blocking_errors"],
            "side_effects": {
                "users_created": users_after - users_before,
                "payments_created": payments_after - payments_before,
                "cycles_created": cycles_after - cycles_before,
            },
            "note": "Salida agregada sin nombres. No usar como CSV productivo.",
        }
        print(json.dumps(payload, ensure_ascii=False, indent=2, default=str))
        return 0
    finally:
        db.close()


if __name__ == "__main__":
    raise SystemExit(main())
