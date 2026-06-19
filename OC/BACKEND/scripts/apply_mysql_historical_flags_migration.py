#!/usr/bin/env python3
"""Aplica columnas historicas en membership_cycles (MySQL staging/local)."""
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
    ("is_historical_import", "BOOLEAN NOT NULL DEFAULT FALSE"),
    ("historical_source", "VARCHAR(60) NULL"),
    ("import_batch_id", "INT NULL"),
]

INDEXES = [
    ("ix_membership_cycles_is_historical_import", "is_historical_import"),
    ("ix_membership_cycles_import_batch_id", "import_batch_id"),
]


def main() -> int:
    url = (
        f"mysql+pymysql://{os.getenv('DB_USER')}:{os.getenv('DB_PASSWORD')}"
        f"@{os.getenv('DB_HOST')}:{os.getenv('DB_PORT', '3306')}/{os.getenv('DB_NAME')}?charset=utf8mb4"
    )
    engine = create_engine(url)
    db_name = os.getenv("DB_NAME")
    applied_cols: list[str] = []
    applied_idx: list[str] = []
    with engine.begin() as conn:
        for col, ddl in COLUMNS:
            exists = conn.execute(
                text(
                    "SELECT COUNT(*) FROM information_schema.COLUMNS "
                    "WHERE TABLE_SCHEMA = :db AND TABLE_NAME = 'membership_cycles' AND COLUMN_NAME = :col"
                ),
                {"db": db_name, "col": col},
            ).scalar()
            if exists:
                continue
            conn.execute(text(f"ALTER TABLE membership_cycles ADD COLUMN {col} {ddl}"))
            applied_cols.append(col)
        for idx_name, col in INDEXES:
            exists = conn.execute(
                text(
                    "SELECT COUNT(*) FROM information_schema.STATISTICS "
                    "WHERE TABLE_SCHEMA = :db AND TABLE_NAME = 'membership_cycles' AND INDEX_NAME = :idx"
                ),
                {"db": db_name, "idx": idx_name},
            ).scalar()
            if exists:
                continue
            conn.execute(text(f"CREATE INDEX {idx_name} ON membership_cycles ({col})"))
            applied_idx.append(idx_name)
    print({"applied_columns": applied_cols, "applied_indexes": applied_idx})
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
