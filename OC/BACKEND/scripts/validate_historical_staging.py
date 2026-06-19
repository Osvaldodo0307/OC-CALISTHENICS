#!/usr/bin/env python3
"""Valida exclusion de historicos en staging/local."""
from __future__ import annotations

import os
import sys
from pathlib import Path

BACKEND_ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(BACKEND_ROOT))

from dotenv import load_dotenv
from sqlalchemy import create_engine, text

load_dotenv()


def main() -> int:
    url = (
        f"mysql+pymysql://{os.getenv('DB_USER')}:{os.getenv('DB_PASSWORD')}"
        f"@{os.getenv('DB_HOST')}:{os.getenv('DB_PORT', '3306')}/{os.getenv('DB_NAME')}?charset=utf8mb4"
    )
    engine = create_engine(url)
    with engine.connect() as conn:
        marked = conn.execute(
            text(
                "SELECT id, user_id, is_historical_import, historical_source, import_batch_id, is_active_cycle "
                "FROM membership_cycles WHERE import_batch_id = 3 ORDER BY user_id"
            )
        ).mappings().all()
        print("Ciclos lote #3:", len(marked))
        for row in marked:
            print(dict(row))

        hist_users = [r["user_id"] for r in marked]
        if hist_users:
            placeholders = ",".join(str(u) for u in hist_users)
            inbox_sim = conn.execute(
                text(
                    f"SELECT user_id FROM membership_cycles "
                    f"WHERE user_id IN ({placeholders}) AND is_historical_import = 0 AND is_active_cycle = 1"
                )
            ).fetchall()
            print("Socios piloto con ciclo operativo activo:", len(inbox_sim))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
