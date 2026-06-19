#!/usr/bin/env python3
"""
Importacion productiva del paquete seguro noviembre 2025.

Requiere:
  - DATABASE_URL apuntando a Supabase produccion
  - --confirm-backup antes de --commit (tras ejecutar scripts/supabase_manual_backup.py)

Uso:
  $env:DATABASE_URL = "postgresql://..."
  .\.venv\Scripts\python.exe scripts\prod_safe_noviembre_import.py --preview
  .\.venv\Scripts\python.exe scripts\prod_safe_noviembre_import.py --commit --confirm-backup
"""
from __future__ import annotations

import argparse
import os
import subprocess
import sys
from pathlib import Path

BACKEND_ROOT = Path(__file__).resolve().parents[1]
SAFE_FILE = BACKEND_ROOT / "fixtures" / "OCCALISTHENICS_prod_safe_noviembre_2025.csv"
PILOT_SCRIPT = BACKEND_ROOT / "scripts" / "pilot_historical_import.py"


def main() -> int:
    parser = argparse.ArgumentParser(description="Importacion productiva paquete seguro noviembre 2025")
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

    db_url = os.getenv("DATABASE_URL", "").strip()
    if not db_url:
        print("ERROR: define DATABASE_URL (Supabase produccion) en el entorno.")
        print("Ejemplo: $env:DATABASE_URL = 'postgresql://postgres.[ref]:[password]@...pooler.supabase.com:6543/postgres'")
        return 1

    if not SAFE_FILE.exists():
        print(f"ERROR: no existe {SAFE_FILE}")
        return 1

    if args.commit and not args.confirm_backup:
        print("ERROR: --commit requiere --confirm-backup (respaldo Supabase verificado).")
        return 1

    cmd = [
        sys.executable,
        str(PILOT_SCRIPT),
        "--file",
        str(SAFE_FILE),
        "--use-app-db",
    ]
    if args.commit:
        cmd.append("--commit")

    print({"action": "commit" if args.commit else "preview", "file": str(SAFE_FILE)})
    result = subprocess.run(cmd, cwd=str(BACKEND_ROOT))
    return result.returncode


if __name__ == "__main__":
    raise SystemExit(main())
