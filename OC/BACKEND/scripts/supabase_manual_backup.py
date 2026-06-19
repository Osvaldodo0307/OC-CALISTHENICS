#!/usr/bin/env python3
"""
Respaldo manual de Supabase (roles, schema, data) via Supabase CLI.

Lee DATABASE_URL desde:
  1. Variable de entorno DATABASE_URL
  2. Archivo local no versionado .env.backup.local (en OC/BACKEND/)

No imprime la URL completa en consola.

Requisitos:
  - Supabase CLI instalado (supabase --version)
  - Docker Desktop en ejecucion (supabase db dump usa contenedor pg_dump)

Uso:
  cd OC\\BACKEND
  copy .env.backup.local.example .env.backup.local   # editar con tu URL
  .\\.venv\\Scripts\\python.exe scripts\\supabase_manual_backup.py
"""
from __future__ import annotations

import argparse
import os
import re
import shutil
import subprocess
import sys
from datetime import datetime
from pathlib import Path
from urllib.parse import urlparse

BACKEND_ROOT = Path(__file__).resolve().parents[1]
ENV_BACKUP_FILE = BACKEND_ROOT / ".env.backup.local"
BACKUPS_ROOT = BACKEND_ROOT / "backups" / "supabase"

DUMP_FILES = ("roles.sql", "schema.sql", "data.sql")


def _load_dotenv_file(path: Path) -> None:
    if not path.exists():
        return
    for raw_line in path.read_text(encoding="utf-8").splitlines():
        line = raw_line.strip()
        if not line or line.startswith("#"):
            continue
        if line.startswith("export "):
            line = line[7:].strip()
        if "=" not in line:
            continue
        key, _, value = line.partition("=")
        key = key.strip()
        value = value.strip().strip('"').strip("'")
        if key and key not in os.environ:
            os.environ[key] = value


def load_database_url() -> str:
    url = os.getenv("DATABASE_URL", "").strip()
    if url:
        return url
    _load_dotenv_file(ENV_BACKUP_FILE)
    return os.getenv("DATABASE_URL", "").strip()


def mask_database_target(url: str) -> str:
    """Muestra solo host:puerto/base, sin credenciales."""
    try:
        parsed = urlparse(url.replace("postgres://", "postgresql://", 1))
        host = parsed.hostname or "unknown-host"
        port = parsed.port or 5432
        db = (parsed.path or "/postgres").lstrip("/") or "postgres"
        return f"{host}:{port}/{db}"
    except Exception:
        return "[destino-redactado]"


def find_supabase_cli() -> str | None:
    return shutil.which("supabase")


def _run_dump(
    *,
    supabase_bin: str,
    database_url: str,
    output_path: Path,
    extra_args: list[str],
) -> None:
    cmd = [
        supabase_bin,
        "db",
        "dump",
        "--db-url",
        database_url,
        "-f",
        str(output_path),
        *extra_args,
    ]
    # No imprimir cmd (contiene URL). Capturar stderr para diagnostico sin URL.
    result = subprocess.run(
        cmd,
        cwd=str(BACKEND_ROOT),
        capture_output=True,
        text=True,
        encoding="utf-8",
        errors="replace",
    )
    if result.returncode != 0:
        err = (result.stderr or result.stdout or "error desconocido").strip()
        err = re.sub(r"postgresql?://[^\s\"']+", "[DATABASE_URL]", err, flags=re.I)
        raise RuntimeError(f"supabase db dump fallo ({output_path.name}): {err}")


def verify_dump_files(backup_dir: Path) -> dict[str, int]:
    sizes: dict[str, int] = {}
    for name in DUMP_FILES:
        path = backup_dir / name
        if not path.exists():
            raise FileNotFoundError(f"Falta archivo de respaldo: {path}")
        size = path.stat().st_size
        if size <= 0:
            raise ValueError(f"Archivo vacio: {path}")
        sizes[name] = size
    return sizes


def create_zip(backup_dir: Path, zip_path: Path) -> int:
    # make_archive anade .zip automaticamente si zip_path no lleva extension
    base = str(zip_path.with_suffix(""))
    archive = shutil.make_archive(base, "zip", root_dir=backup_dir)
    return Path(archive).stat().st_size


def main() -> int:
    parser = argparse.ArgumentParser(description="Respaldo manual Supabase (roles/schema/data)")
    parser.add_argument(
        "--output-dir",
        type=Path,
        default=None,
        help="Directorio de salida (default: backups/supabase/YYYY-MM-DD_HHMMSS)",
    )
    parser.add_argument(
        "--skip-zip",
        action="store_true",
        help="No crear archivo ZIP",
    )
    args = parser.parse_args()

    database_url = load_database_url()
    if not database_url:
        print("ERROR: DATABASE_URL no definida.")
        print(f"  Crea {ENV_BACKUP_FILE} (copia desde .env.backup.local.example)")
        print("  o exporta DATABASE_URL en el entorno.")
        return 1

    if not database_url.startswith(("postgresql://", "postgres://")):
        print("ERROR: DATABASE_URL debe ser una URL PostgreSQL (postgresql://...).")
        return 1

    supabase_bin = find_supabase_cli()
    if not supabase_bin:
        print("ERROR: Supabase CLI no encontrado en PATH.")
        print("  Instala: https://supabase.com/docs/guides/cli/getting-started")
        return 1

    stamp = datetime.now().strftime("%Y-%m-%d_%H%M%S")
    backup_dir = args.output_dir or (BACKUPS_ROOT / stamp)
    backup_dir.mkdir(parents=True, exist_ok=True)

    target = mask_database_target(database_url)
    print(f"[backup] Destino: {target}")
    print(f"[backup] Carpeta: {backup_dir}")

    try:
        print("[backup] Dump roles...")
        _run_dump(
            supabase_bin=supabase_bin,
            database_url=database_url,
            output_path=backup_dir / "roles.sql",
            extra_args=["--role-only"],
        )
        print("[backup] Dump schema...")
        _run_dump(
            supabase_bin=supabase_bin,
            database_url=database_url,
            output_path=backup_dir / "schema.sql",
            extra_args=[],
        )
        print("[backup] Dump data...")
        _run_dump(
            supabase_bin=supabase_bin,
            database_url=database_url,
            output_path=backup_dir / "data.sql",
            extra_args=["--use-copy", "--data-only"],
        )
    except RuntimeError as exc:
        print(f"ERROR: {exc}")
        print("  Verifica: Docker Desktop en ejecucion, URL correcta, red/firewall.")
        return 1

    try:
        sizes = verify_dump_files(backup_dir)
    except (FileNotFoundError, ValueError) as exc:
        print(f"ERROR: {exc}")
        return 1

    zip_path = backup_dir.parent / f"oc-calisthenics_backup_{stamp}.zip"
    zip_size = 0
    if not args.skip_zip:
        print(f"[backup] Comprimiendo -> {zip_path.name}")
        try:
            zip_size = create_zip(backup_dir, zip_path)
        except OSError as exc:
            print(f"ERROR al crear ZIP: {exc}")
            return 1
        if zip_size <= 0:
            print("ERROR: ZIP vacio o no creado.")
            return 1

    manifest = backup_dir / "BACKUP_MANIFEST.txt"
    manifest.write_text(
        "\n".join(
            [
                f"created_at={datetime.now().isoformat()}",
                f"target={target}",
                f"backup_dir={backup_dir}",
                *(f"{name}={sizes[name]} bytes" for name in DUMP_FILES),
                f"zip={zip_path.name if not args.skip_zip else 'skipped'}",
                f"zip_bytes={zip_size}",
            ]
        )
        + "\n",
        encoding="utf-8",
    )

    print("\n[backup] OK")
    for name in DUMP_FILES:
        print(f"  {name}: {sizes[name]:,} bytes")
    if not args.skip_zip:
        print(f"  ZIP: {zip_path} ({zip_size:,} bytes)")
    print(f"  Manifest: {manifest}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
