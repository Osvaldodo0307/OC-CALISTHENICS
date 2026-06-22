#!/usr/bin/env python3
"""
Aplica migraciones PostgreSQL en Supabase STAGING (Fase 2C.3).

Usa STAGING_DATABASE_URL — nunca DATABASE_URL de producción sin confirmación.

Uso:
  set STAGING_DATABASE_URL=postgresql://...
  python scripts/apply_postgres_staging_migrations.py
  python scripts/apply_postgres_staging_migrations.py --dry-run
"""
from __future__ import annotations

import argparse
import os
import sys
from pathlib import Path

from dotenv import load_dotenv
from sqlalchemy import create_engine, text

BACKEND_ROOT = Path(__file__).resolve().parents[1]
MIGRATIONS_DIR = BACKEND_ROOT / "migrations" / "postgres"

MIGRATION_FILES = [
    "2026-06-17_membership_payment_renewal.postgres.sql",
    "2026-06-18_membership_followups.postgres.sql",
    "2026-06-19_membership_import_batches.postgres.sql",
    "2026-06-20_membership_cycles_historical_flags.postgres.sql",
    "2026-06-21_historical_visit_summaries.postgres.sql",
]


def _normalize_url(url: str) -> str:
    if url.startswith("postgres://"):
        return url.replace("postgres://", "postgresql://", 1)
    return url


def _assert_not_production(staging_url: str) -> None:
    prod_url = os.getenv("PRODUCTION_DATABASE_URL") or os.getenv("DATABASE_URL")
    if prod_url and _normalize_url(prod_url.strip()) == _normalize_url(staging_url.strip()):
        raise SystemExit(
            "ERROR: STAGING_DATABASE_URL coincide con DATABASE_URL/PRODUCTION_DATABASE_URL. "
            "Abortando para proteger produccion."
        )
    if "staging" not in staging_url.lower() and os.getenv("ALLOW_PRODUCTION_MIGRATE") != "1":
        print(
            "AVISO: STAGING_DATABASE_URL no contiene 'staging'. "
            "Define ALLOW_PRODUCTION_MIGRATE=1 solo si confirmas que es staging.",
            file=sys.stderr,
        )


def main() -> int:
    load_dotenv()
    parser = argparse.ArgumentParser(description="Aplica migraciones Postgres en staging")
    parser.add_argument("--dry-run", action="store_true", help="Solo lista archivos, no ejecuta")
    args = parser.parse_args()

    staging_url = os.getenv("STAGING_DATABASE_URL")
    if not staging_url:
        print("ERROR: Define STAGING_DATABASE_URL con la connection string de Supabase staging.", file=sys.stderr)
        return 1

    staging_url = _normalize_url(staging_url)
    _assert_not_production(staging_url)

    if args.dry_run:
        for name in MIGRATION_FILES:
            print(f"would apply: {name}")
        print("verify: verify_membership_schema.postgres.sql (manual)")
        return 0

    engine = create_engine(staging_url, pool_pre_ping=True)
    for name in MIGRATION_FILES:
        path = MIGRATIONS_DIR / name
        if not path.exists():
            print(f"ERROR: no existe {path}", file=sys.stderr)
            return 1
        sql = path.read_text(encoding="utf-8")
        print(f"Applying {name}...")
        with engine.begin() as conn:
            conn.execute(text(sql))
        print(f"OK: {name}")

    print("Migraciones staging aplicadas. Ejecuta verify_membership_schema.postgres.sql manualmente si aplica.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
