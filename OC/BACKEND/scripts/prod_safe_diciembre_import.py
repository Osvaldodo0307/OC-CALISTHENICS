#!/usr/bin/env python3
"""
Preview productivo del paquete seguro diciembre 2025 (sin commit en Fase 2B.8).

Uso:
  .\.venv\Scripts\python.exe scripts\prod_safe_diciembre_import.py --preview
  # Commit productivo (fase posterior, tras respaldo):
  $env:DATABASE_URL = "postgresql://..."
  .\.venv\Scripts\python.exe scripts\prod_safe_diciembre_import.py --commit --confirm-backup
"""
from __future__ import annotations

import argparse
import os
import subprocess
import sys
from pathlib import Path

BACKEND_ROOT = Path(__file__).resolve().parents[1]
SAFE_FILE = BACKEND_ROOT / "fixtures" / "OCCALISTHENICS_prod_safe_diciembre_2025.csv"
PILOT_SCRIPT = BACKEND_ROOT / "scripts" / "pilot_historical_import.py"


def main() -> int:
    parser = argparse.ArgumentParser(description="Importacion productiva paquete seguro diciembre 2025")
    parser.add_argument("--preview", action="store_true", help="Solo preview")
    parser.add_argument("--commit", action="store_true", help="Preview + commit")
    parser.add_argument(
        "--confirm-backup",
        action="store_true",
        help="Obligatorio para --commit: confirma respaldo Supabase realizado",
    )
    args = parser.parse_args()

    if not args.preview and not args.commit:
        parser.error("Indica --preview o --commit")
    if args.preview and args.commit:
        parser.error("Usa solo --preview o --commit")

    if not SAFE_FILE.exists():
        print(f"ERROR: no existe {SAFE_FILE}")
        return 1

    if args.commit:
        db_url = os.getenv("DATABASE_URL", "").strip()
        if not db_url:
            print("ERROR: define DATABASE_URL para commit productivo.")
            return 1
        if not args.confirm_backup:
            print("ERROR: --commit requiere --confirm-backup.")
            return 1

    cmd = [
        sys.executable,
        str(PILOT_SCRIPT),
        "--file",
        str(SAFE_FILE),
    ]
    if args.commit:
        cmd.extend(["--use-app-db", "--commit"])
    if args.preview:
        pass  # SQLite local por defecto en pilot_historical_import

    print({"action": "commit" if args.commit else "preview", "file": str(SAFE_FILE)})
    result = subprocess.run(cmd, cwd=str(BACKEND_ROOT))
    return result.returncode


if __name__ == "__main__":
    raise SystemExit(main())
