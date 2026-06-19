#!/usr/bin/env python3
"""
Prueba controlada del importador histórico (lote piloto, solo local).

Uso:
  python scripts/pilot_historical_import.py
  python scripts/pilot_historical_import.py --commit
  python scripts/pilot_historical_import.py --file fixtures/mi_archivo.xlsx --sheet Hoja1
"""
from __future__ import annotations

import argparse
import json
import sys
import tempfile
from pathlib import Path

BACKEND_ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(BACKEND_ROOT))

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.core.security import hash_password
from app.database import Base
from app.models import MembershipPayment, User
from app.services.membership_import_service import (
    commit_import_batch,
    create_import_preview,
    get_import_batch,
    get_import_errors_report,
)


DEFAULT_PILOT = BACKEND_ROOT / "fixtures" / "pilot_lote_historico_numbers.csv"


def _seed_pilot_socios(db) -> dict[str, int]:
    """Socios preexistentes para probar match por teléfono y ambigüedad por nombre."""
    seeds = [
        ("socio_juan", "Juan Pérez García", "5512345678"),
        ("socio_maria_a", "Maria Lopez", "5566667777"),
        ("socio_maria_b", "María López García", "5577778888"),
    ]
    ids: dict[str, int] = {}
    for username, name, phone in seeds:
        user = User(
            username=username,
            name=name,
            password_hash=hash_password("Pilot123!"),
            role="socio",
            phone=phone,
        )
        db.add(user)
        db.flush()
        ids[username] = user.id
    db.commit()
    return ids


def _print_section(title: str) -> None:
    print(f"\n{'=' * 60}\n{title}\n{'=' * 60}")


def main() -> int:
    parser = argparse.ArgumentParser(description="Prueba piloto importación histórica")
    parser.add_argument("--file", type=Path, default=DEFAULT_PILOT, help="CSV o XLSX piloto")
    parser.add_argument("--sheet", default=None, help="Hoja Excel si aplica")
    parser.add_argument("--commit", action="store_true", help="Confirmar importación tras preview limpio")
    parser.add_argument(
        "--resolve-ambiguous",
        default="",
        help='JSON fila→user_id, ej. {"9": 3}',
    )
    parser.add_argument(
        "--use-app-db",
        action="store_true",
        help="Usar BD de la app (.env) en lugar de SQLite temporal; útil para validar idempotencia en staging",
    )
    args = parser.parse_args()

    if not args.file.exists():
        print(f"ERROR: No existe {args.file}")
        print("Coloca tu export de Numbers en fixtures/ o pasa --file")
        return 1

    if args.use_app_db:
        from app.database import SessionLocal

        db = SessionLocal()
        admin = db.query(User).filter(User.role == "admin").order_by(User.id).first()
        if not admin:
            print("ERROR: No hay usuario admin en la BD de la app")
            return 1
    else:
        db_file = tempfile.NamedTemporaryFile(suffix=".db", delete=False)
        db_file.close()
        engine = create_engine(f"sqlite:///{db_file.name}", connect_args={"check_same_thread": False})
        Session = sessionmaker(bind=engine)
        Base.metadata.create_all(bind=engine)
        db = Session()

        admin = User(
            username="admin_pilot",
            name="Admin Pilot",
            password_hash=hash_password("Pilot123!"),
            role="admin",
        )
        db.add(admin)
        db.commit()
        db.refresh(admin)

        seeded = _seed_pilot_socios(db)
        _print_section("Socios preexistentes (seed)")
        print(json.dumps(seeded, indent=2, ensure_ascii=False))

    file_bytes = args.file.read_bytes()
    filename = args.file.name

    _print_section("1. PREVIEW")
    preview = create_import_preview(
        db,
        file_bytes=file_bytes,
        filename=filename,
        admin_user=admin,
        sheet_name=args.sheet,
    )

    diagnosis = preview["diagnosis"]
    summary = preview["preview_summary"]
    mapping = preview["column_mapping"]

    print("\n--- Columnas detectadas ---")
    print(json.dumps(diagnosis.get("columns_detected"), indent=2, ensure_ascii=False))

    print("\n--- Mapeo sugerido ---")
    print(json.dumps(mapping, indent=2, ensure_ascii=False))

    print("\n--- Hojas ---")
    print(f"  sheets: {diagnosis.get('sheets')}")
    print(f"  selected: {diagnosis.get('selected_sheet')}")

    print("\n--- Resumen preview ---")
    for k, v in summary.items():
        print(f"  {k}: {v}")

    if diagnosis.get("blocking_errors"):
        print("\n--- ERRORES BLOQUEANTES ---")
        for err in diagnosis["blocking_errors"]:
            print(f"  ! {err}")

    print("\n--- Filas (detalle) ---")
    for row in preview["rows"]:
        issues = [e["message"] for e in (row.get("errors") or [])]
        warns = [w["message"] for w in (row.get("warnings") or [])]
        print(
            f"  Fila {row['row_number']}: status={row['status']} match={row.get('socio_match')} "
            f"{row.get('socio_nombre')} | ${row.get('monto_pagado')} {row.get('metodo_pago')}"
        )
        if issues:
            print(f"    ERRORES: {issues}")
        if warns:
            print(f"    ADVERTENCIAS: {warns}")

    errors_report = get_import_errors_report(db, preview["batch_id"])
    _print_section("2. REPORTE ERRORES/ADVERTENCIAS")
    print(json.dumps(errors_report, indent=2, ensure_ascii=False, default=str))

    blocking = summary.get("blocking_errors") or diagnosis.get("blocking_errors")
    ambiguous = summary.get("ambiguous_members", 0)
    error_rows = summary.get("error_rows", 0)

    if error_rows > 0 or blocking:
        print("\n*** COMMIT BLOQUEADO: hay errores graves ***")
        return 2

    if args.commit and args.use_app_db:
        print("\n*** COMMIT con --use-app-db: escribe en BD staging/local compartida ***")

    if not args.commit:
        print("\n--- Preview OK. Ejecuta con --commit para importar el lote piloto ---")
        return 0

    resolve_ambiguous: dict[int, int] = {}
    if args.resolve_ambiguous:
        raw = json.loads(args.resolve_ambiguous)
        resolve_ambiguous = {int(k): int(v) for k, v in raw.items()}

    _print_section("3. COMMIT PILOTO")
    result = commit_import_batch(
        db,
        batch_id=preview["batch_id"],
        admin_user=admin,
        confirm_duplicate_rows=[],
        resolve_ambiguous=resolve_ambiguous,
    )
    print(json.dumps(result, indent=2, ensure_ascii=False, default=str))

    _print_section("4. VERIFICACIÓN POST-COMMIT")
    batch_detail = get_import_batch(db, preview["batch_id"])
    payments = db.query(MembershipPayment).all()
    print(f"  Pagos en BD: {len(payments)}")
    for p in payments:
        print(f"    #{p.id} user={p.user_id} ${p.amount} {p.payment_method} | {p.concept}")
        print(f"      idempotency: {p.idempotency_key}")
        print(f"      income={p.counts_as_income} balance={p.applies_to_balance}")

    imported = [r for r in batch_detail["records"] if r["status"] == "imported"]
    skipped = [r for r in batch_detail["records"] if r["status"] != "imported"]
    print(f"\n  Importados: {len(imported)} | Omitidos/rechazados: {len(skipped)}")
    for r in skipped:
        print(f"    Fila {r['row_number']}: {r['status']}")

    db.close()
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
