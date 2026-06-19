#!/usr/bin/env python3
"""Aplica columnas faltantes de membership_payments en MySQL staging."""
from __future__ import annotations

import os
import sys
from pathlib import Path

BACKEND_ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(BACKEND_ROOT))

from dotenv import load_dotenv
from sqlalchemy import create_engine, text

load_dotenv()

COLUMNS = [
    ("payment_action", "VARCHAR(40) NULL"),
    ("period_start_date", "DATE NULL"),
    ("period_end_date", "DATE NULL"),
    ("counts_as_income", "BOOLEAN NOT NULL DEFAULT TRUE"),
    ("applies_to_balance", "BOOLEAN NOT NULL DEFAULT TRUE"),
    ("previous_end_date", "DATE NULL"),
    ("extended_end_date", "DATE NULL"),
]


def main() -> int:
    url = (
        f"mysql+pymysql://{os.getenv('DB_USER')}:{os.getenv('DB_PASSWORD')}"
        f"@{os.getenv('DB_HOST')}:{os.getenv('DB_PORT', '3306')}/{os.getenv('DB_NAME')}?charset=utf8mb4"
    )
    engine = create_engine(url)
    db_name = os.getenv("DB_NAME")
    applied = []
    with engine.begin() as conn:
        for col, ddl in COLUMNS:
            exists = conn.execute(
                text(
                    "SELECT COUNT(*) FROM information_schema.COLUMNS "
                    "WHERE TABLE_SCHEMA = :db AND TABLE_NAME = 'membership_payments' AND COLUMN_NAME = :col"
                ),
                {"db": db_name, "col": col},
            ).scalar()
            if exists:
                continue
            conn.execute(text(f"ALTER TABLE membership_payments ADD COLUMN {col} {ddl}"))
            applied.append(col)
    print({"applied_columns": applied})
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
