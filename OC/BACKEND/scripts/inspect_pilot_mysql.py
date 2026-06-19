#!/usr/bin/env python3
"""Consulta piloto histórico vía SQL crudo (compatible con esquema MySQL parcial)."""
from __future__ import annotations

import json
import os
import sys
from pathlib import Path

BACKEND_ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(BACKEND_ROOT))

from dotenv import load_dotenv
from sqlalchemy import create_engine, text

load_dotenv()

PILOT_NAMES = [
    "TOÑITO OSNAYA",
    "LIRIA VILLEGAS",
    "VALERIA QUINTANA",
    "ARLETTE ROMÁN",
    "PEDRO FLORES",
    "LUIS ALBERTO",
    "RODRIGO ALVA",
]


def main() -> int:
    url = (
        f"mysql+pymysql://{os.getenv('DB_USER')}:{os.getenv('DB_PASSWORD')}"
        f"@{os.getenv('DB_HOST')}:{os.getenv('DB_PORT', '3306')}/{os.getenv('DB_NAME')}?charset=utf8mb4"
    )
    engine = create_engine(url)
    report: dict = {}

    with engine.connect() as conn:
        batches = conn.execute(
            text(
                "SELECT id, status, filename, committed_at FROM membership_import_batches ORDER BY id DESC LIMIT 5"
            )
        ).mappings().all()
        report["import_batches"] = [dict(b) for b in batches]

        cols = {
            r[0]
            for r in conn.execute(text("SHOW COLUMNS FROM membership_payments")).fetchall()
        }
        report["payment_columns_present"] = sorted(cols)
        report["schema_gap"] = "payment_action" not in cols

        pay_sql = (
            "SELECT id, user_id, amount, payment_method, concept, idempotency_key, observations "
            "FROM membership_payments WHERE concept LIKE '%historica%' OR idempotency_key LIKE '%OCCALISTHENICS%' "
            "ORDER BY id LIMIT 20"
        )
        historical_payments = conn.execute(text(pay_sql)).mappings().all()
        report["historical_payments"] = [dict(p) for p in historical_payments]

        members = []
        for name in PILOT_NAMES:
            user = conn.execute(
                text("SELECT id, name, phone FROM users WHERE name = :name ORDER BY id DESC LIMIT 1"),
                {"name": name},
            ).mappings().first()
            item = {"name": name, "user": dict(user) if user else None}
            if user:
                cycles = conn.execute(
                    text(
                        "SELECT id, start_date, end_date, status, is_active_cycle, membership_type "
                        "FROM membership_cycles WHERE user_id = :uid ORDER BY start_date"
                    ),
                    {"uid": user["id"]},
                ).mappings().all()
                pays = conn.execute(
                    text(
                        "SELECT id, amount, payment_method, concept, idempotency_key, observations "
                        "FROM membership_payments WHERE user_id = :uid ORDER BY id"
                    ),
                    {"uid": user["id"]},
                ).mappings().all()
                item["cycles"] = [dict(c) for c in cycles]
                item["payments"] = [dict(p) for p in pays]
            members.append(item)
        report["pilot_members"] = members

    print(json.dumps(report, indent=2, ensure_ascii=False, default=str))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
