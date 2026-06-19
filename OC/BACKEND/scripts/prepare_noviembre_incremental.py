#!/usr/bin/env python3
"""Analiza estado noviembre 2025 y genera CSV incremental."""
from __future__ import annotations

import csv
import json
import os
import sys
from collections import Counter
from pathlib import Path

BACKEND_ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(BACKEND_ROOT))

from dotenv import load_dotenv
from sqlalchemy import create_engine, text

FIXTURES = BACKEND_ROOT / "fixtures"
REVIEW = FIXTURES / "OCCALISTHENICS_review_noviembre_2025.csv"
FINAL = FIXTURES / "OCCALISTHENICS_final_noviembre_2025.csv"
INCREMENTAL = FIXTURES / "OCCALISTHENICS_final_noviembre_2025_incremental.csv"
CONTACTS = FIXTURES / "contacts_master.csv"

FINAL_TEMPLATE_HEADER = [
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


def _read_csv(path: Path) -> list[dict]:
    with path.open(encoding="utf-8-sig", newline="") as f:
        return list(csv.DictReader(f))


def _batch3_refs() -> set[str]:
    load_dotenv()
    url = (
        f"mysql+pymysql://{os.getenv('DB_USER')}:{os.getenv('DB_PASSWORD')}"
        f"@{os.getenv('DB_HOST')}:{os.getenv('DB_PORT', '3306')}/{os.getenv('DB_NAME')}?charset=utf8mb4"
    )
    engine = create_engine(url)
    with engine.connect() as conn:
        rows = conn.execute(
            text(
                "SELECT referencia_externa FROM membership_import_records "
                "WHERE batch_id = 3 AND status = 'imported'"
            )
        ).fetchall()
    return {r[0] for r in rows if r[0]}


def _review_to_final_row(row: dict, contacts: dict[str, str]) -> dict:
    phone = (row.get("telefono") or "").strip() or contacts.get((row.get("socio_nombre") or "").strip(), "")
    return {
        "socio_nombre": row["socio_nombre"],
        "telefono": phone,
        "plan": row["plan"],
        "fecha_pago": row["periodo_inicio"],
        "monto_pagado": row["monto_pagado"],
        "metodo_pago": row["metodo_pago"],
        "periodo_inicio": row["periodo_inicio"],
        "periodo_fin": row["periodo_fin"],
        "payment_action": row["payment_action"],
        "counts_as_income": "true",
        "applies_to_balance": "true",
        "saldo_pendiente": row.get("saldo_pendiente") or "0.0",
        "nota": row.get("nota") or "",
        "fuente_archivo": "OCCALISTHENICS.xlsx::NOVIEMBRE 2025",
        "referencia_externa": row["referencia_externa"],
    }


def main() -> int:
    review_rows = _read_csv(REVIEW)
    final_rows = _read_csv(FINAL)
    contacts_rows = _read_csv(CONTACTS) if CONTACTS.exists() else []
    contacts = {
        (r.get("socio_nombre") or "").strip(): (r.get("telefono") or "").strip()
        for r in contacts_rows
        if (r.get("socio_nombre") or "").strip()
    }

    included = [r for r in review_rows if str(r.get("include", "")).lower() == "true"]
    excluded = [r for r in review_rows if str(r.get("include", "")).lower() != "true"]
    exclusion_reasons = Counter()
    for r in excluded:
        for part in (r.get("reason_excluded") or "").split(";"):
            part = part.strip()
            if part:
                exclusion_reasons[part] += 1

    pilot_refs = set()
    for r in final_rows:
        ref = (r.get("referencia_externa") or "").strip()
        if ref:
            pilot_refs.add(ref)

    try:
        db_refs = _batch3_refs()
    except Exception as exc:
        db_refs = set()
        print(f"WARN: no se pudo leer batch #3 de BD: {exc}")

    already_imported = pilot_refs | db_refs
    pending = [r for r in included if (r.get("referencia_externa") or "").strip() not in already_imported]

    incremental_rows = [_review_to_final_row(r, contacts) for r in pending]

    with INCREMENTAL.open("w", encoding="utf-8-sig", newline="") as f:
        writer = csv.DictWriter(f, fieldnames=FINAL_TEMPLATE_HEADER)
        writer.writeheader()
        writer.writerows(incremental_rows)

    no_phone = sum(1 for r in incremental_rows if not (r.get("telefono") or "").strip())
    no_phone_all_included = sum(1 for r in included if not (r.get("telefono") or "").strip() and not contacts.get((r.get("socio_nombre") or "").strip()))

    report = {
        "review_total_rows": len(review_rows),
        "include_true": len(included),
        "include_false": len(excluded),
        "exclusion_reason_counts": dict(exclusion_reasons),
        "pilot_final_csv_rows": len(final_rows),
        "batch3_refs_in_db": sorted(db_refs),
        "already_imported_refs": sorted(already_imported),
        "pending_include_true": [
            {
                "socio_nombre": r["socio_nombre"],
                "referencia_externa": r["referencia_externa"],
                "plan": r["plan"],
                "monto_pagado": r["monto_pagado"],
                "warning_flags": r.get("warning_flags"),
            }
            for r in pending
        ],
        "incremental_rows_written": len(incremental_rows),
        "incremental_file": str(INCREMENTAL),
        "contacts_master_rows": len(contacts_rows),
        "contacts_with_phone": sum(1 for v in contacts.values() if v),
        "included_without_phone": no_phone_all_included,
        "incremental_without_phone": no_phone,
    }
    print(json.dumps(report, indent=2, ensure_ascii=False))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
