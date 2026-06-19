#!/usr/bin/env python3
"""Validacion post-cierre noviembre 2025 en staging/local."""
from __future__ import annotations

import json
import sys
from pathlib import Path

BACKEND_ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(BACKEND_ROOT))

from dotenv import load_dotenv
from sqlalchemy import create_engine, text

from app.database import SessionLocal
from app.services.membership_followup_service import build_followup_inbox, build_followup_summary

load_dotenv()

PILOT_USER_IDS = list(range(13, 21))  # 13-19 piloto + 20 incremental


def main() -> int:
    url = (
        f"mysql+pymysql://{__import__('os').getenv('DB_USER')}:{__import__('os').getenv('DB_PASSWORD')}"
        f"@{__import__('os').getenv('DB_HOST')}:{__import__('os').getenv('DB_PORT', '3306')}"
        f"/{__import__('os').getenv('DB_NAME')}?charset=utf8mb4"
    )
    engine = create_engine(url)

    with engine.connect() as conn:
        batches = conn.execute(
            text(
                "SELECT id, status, filename, committed_at FROM membership_import_batches "
                "WHERE id IN (3, 6) ORDER BY id"
            )
        ).mappings().all()
        nov_cycles = conn.execute(
            text(
                "SELECT c.id, c.user_id, u.name, c.is_historical_import, c.historical_source, "
                "c.import_batch_id, c.is_active_cycle, c.membership_type, c.end_date "
                "FROM membership_cycles c JOIN users u ON u.id = c.user_id "
                "WHERE c.import_batch_id IN (3, 6) OR c.is_historical_import = 1 "
                "ORDER BY c.user_id"
            )
        ).mappings().all()
        payments = conn.execute(
            text(
                "SELECT p.id, p.user_id, u.name, p.amount, p.payment_method, p.concept, p.idempotency_key "
                "FROM membership_payments p JOIN users u ON u.id = p.user_id "
                "WHERE p.concept LIKE '%Importacion historica%' ORDER BY p.user_id"
            )
        ).mappings().all()
        operational_active = conn.execute(
            text(
                "SELECT user_id FROM membership_cycles "
                "WHERE user_id IN :uids AND is_historical_import = 0 AND is_active_cycle = 1"
            ),
            {"uids": tuple(PILOT_USER_IDS)},
        ).fetchall()

    db = SessionLocal()
    try:
        inbox_default = build_followup_inbox(db, status_filter="vencidos", include_historical=False)
        inbox_hist = build_followup_inbox(db, status_filter="vencidos", include_historical=True)
        summary = build_followup_summary(db, include_historical=False)
        pilot_in_default = [r["user_id"] for r in inbox_default if r["user_id"] in PILOT_USER_IDS]
        pilot_in_hist = [r["user_id"] for r in inbox_hist if r["user_id"] in PILOT_USER_IDS]
    finally:
        db.close()

    report = {
        "batches": [dict(b) for b in batches],
        "historical_cycles_count": len(nov_cycles),
        "historical_cycles_all_flagged": all(c["is_historical_import"] for c in nov_cycles),
        "historical_cycles": [dict(c) for c in nov_cycles],
        "payments_historical_count": len(payments),
        "payments": [dict(p) for p in payments],
        "operational_active_cycles_among_nov_users": [r[0] for r in operational_active],
        "followups_vencidos_pilot_users_default": pilot_in_default,
        "followups_vencidos_pilot_users_with_historical": pilot_in_hist,
        "followup_summary_default": summary,
    }
    print(json.dumps(report, indent=2, ensure_ascii=False, default=str))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
