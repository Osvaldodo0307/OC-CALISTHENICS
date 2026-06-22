#!/usr/bin/env python3
"""
Validación Fase 2B.8 — diciembre 2025 (solo preview, sin commit).

- Preview local del paquete seguro con socios noviembre pre-sembrados.
- Diagnóstico de duplicados vs producción noviembre.
- Verifica que no haya filas de noviembre ni re-commit del lote #1.
"""
from __future__ import annotations

import csv
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
from app.models import Membership, MembershipCycle, MembershipImportBatch, User
from app.services.membership_import_service import create_import_preview, get_import_errors_report

FIXTURES = BACKEND_ROOT / "fixtures"
SAFE_PATH = FIXTURES / "OCCALISTHENICS_prod_safe_diciembre_2025.csv"
NOV_SAFE_PATH = FIXTURES / "OCCALISTHENICS_prod_safe_noviembre_2025.csv"
PENDING_PATH = FIXTURES / "OCCALISTHENICS_prod_pending_review_diciembre_2025.csv"

NOVIEMBRE_PROD_REFS = {
    "OCCALISTHENICS:NOVIEMBRE 2025:tonito_osnaya:2025-11-01",
    "OCCALISTHENICS:NOVIEMBRE 2025:liria_villegas:2025-11-01",
    "OCCALISTHENICS:NOVIEMBRE 2025:valeria_quintana:2025-11-01",
    "OCCALISTHENICS:NOVIEMBRE 2025:arlette_roman:2025-11-01",
    "OCCALISTHENICS:NOVIEMBRE 2025:pedro_flores:2025-11-01",
    "OCCALISTHENICS:NOVIEMBRE 2025:luis_alberto:2025-11-01",
    "OCCALISTHENICS:NOVIEMBRE 2025:rodrigo_alva:2025-11-01",
}


def _read_csv(path: Path) -> list[dict]:
    with path.open(encoding="utf-8-sig", newline="") as handle:
        return list(csv.DictReader(handle))


def _seed_noviembre_prod_socios(db) -> dict[str, int]:
    """Simula socios ya importados en producción (lote #1 noviembre)."""
    if not NOV_SAFE_PATH.exists():
        return {}
    ids: dict[str, int] = {}
    for index, row in enumerate(_read_csv(NOV_SAFE_PATH)):
        name = (row.get("socio_nombre") or "").strip()
        username = f"nov_prod_{index}"
        user = User(
            username=username,
            name=name,
            password_hash=hash_password("NovProd123!"),
            role="socio",
            phone=(row.get("telefono") or None) or None,
            is_active=True,
        )
        db.add(user)
        db.flush()
        membership = Membership(user_id=user.id, status="expired", plan=row.get("plan") or "PLAN OC")
        db.add(membership)
        db.flush()
        batch = db.query(MembershipImportBatch).filter(MembershipImportBatch.id == 1).first()
        if not batch:
            batch = MembershipImportBatch(id=1, created_by=user.id, status="committed", filename="nov_prod.csv")
            db.add(batch)
            db.flush()
        cycle = MembershipCycle(
            membership_id=membership.id,
            user_id=user.id,
            membership_type=row.get("plan") or "PLAN OC",
            cost=float(row.get("monto_pagado") or 945),
            start_date=__import__("datetime").date(2025, 11, 1),
            end_date=__import__("datetime").date(2025, 11, 30),
            status="vencida",
            is_active_cycle=False,
            is_historical_import=True,
            historical_source="OCCALISTHENICS",
            import_batch_id=1,
            created_by=user.id,
        )
        db.add(cycle)
        db.flush()
        ids[name] = user.id
    db.commit()
    return ids


def main() -> int:
    if not SAFE_PATH.exists():
        print(json.dumps({"error": f"No existe {SAFE_PATH}"}, ensure_ascii=False))
        return 1

    safe_rows = _read_csv(SAFE_PATH)
    pending_rows = _read_csv(PENDING_PATH) if PENDING_PATH.exists() else []

    static_checks = {
        "safe_rows": len(safe_rows),
        "pending_rows": len(pending_rows),
        "safe_refs_unique": len({r["referencia_externa"] for r in safe_rows}) == len(safe_rows),
        "contains_noviembre_refs": any(
            "NOVIEMBRE" in (r.get("referencia_externa") or "").upper() for r in safe_rows
        ),
        "contains_batch1_refs": any(
            (r.get("referencia_externa") or "") in NOVIEMBRE_PROD_REFS for r in safe_rows
        ),
        "uriel_in_safe": any("URIEL" in (r.get("socio_nombre") or "").upper() for r in safe_rows),
        "zero_amount_in_safe": [r["socio_nombre"] for r in safe_rows if float(r.get("monto_pagado") or 0) <= 0],
        "missing_phones_safe": [r["socio_nombre"] for r in safe_rows if not (r.get("telefono") or "").strip()],
        "all_historico_sin_metodo": all((r.get("metodo_pago") or "") == "historico_sin_metodo" for r in safe_rows),
        "fuente_archivo_values": sorted({r.get("fuente_archivo") for r in safe_rows}),
    }

    db_file = tempfile.NamedTemporaryFile(suffix=".db", delete=False)
    db_file.close()
    engine = create_engine(f"sqlite:///{db_file.name}", connect_args={"check_same_thread": False})
    Session = sessionmaker(bind=engine)
    Base.metadata.create_all(bind=engine)
    db = Session()

    admin = User(
        username="admin_dic_val",
        name="Admin Validacion",
        password_hash=hash_password("Val123!"),
        role="admin",
        is_active=True,
    )
    db.add(admin)
    db.commit()
    db.refresh(admin)

    seeded = _seed_noviembre_prod_socios(db)

    preview = create_import_preview(
        db,
        file_bytes=SAFE_PATH.read_bytes(),
        filename=SAFE_PATH.name,
        admin_user=admin,
    )
    summary = preview["preview_summary"]
    errors_report = get_import_errors_report(db, preview["batch_id"])

    row_details = []
    overlap_noviembre = []
    new_members = []
    for row in preview["rows"]:
        name = (row.get("socio_nombre") or "").strip()
        detail = {
            "row_number": row.get("row_number"),
            "socio_nombre": name,
            "socio_match": row.get("socio_match"),
            "status": row.get("status"),
            "referencia_externa": row.get("referencia_externa"),
            "matched_user_id": row.get("matched_user_id"),
            "warnings": [w.get("code") for w in (row.get("warnings") or [])],
            "errors": [e.get("code") for e in (row.get("errors") or [])],
        }
        row_details.append(detail)
        if name in seeded:
            overlap_noviembre.append(name)
        if row.get("socio_match") == "new":
            new_members.append(name)

    recommendation = "Diciembre listo para preview productivo"
    if summary.get("error_rows", 0) > 0 or summary.get("blocking_errors"):
        recommendation = "Diciembre no debe importarse todavía"
    elif summary.get("ambiguous_members", 0) > 0:
        recommendation = "Diciembre requiere limpieza adicional"
    elif static_checks["uriel_in_safe"] or static_checks["contains_batch1_refs"]:
        recommendation = "Diciembre no debe importarse todavía"

    report = {
        "phase": "2B.8",
        "month": "2025-12",
        "static_checks": static_checks,
        "preview_summary": summary,
        "errors_report": errors_report,
        "row_details": row_details,
        "noviembre_prod_seeded": list(seeded.keys()),
        "overlap_noviembre_expected_existing": overlap_noviembre,
        "new_members_expected": new_members,
        "estimated_real_income_safe": round(sum(float(r["monto_pagado"]) for r in safe_rows), 2),
        "recommendation": recommendation,
        "commit_executed": False,
    }
    print(json.dumps(report, indent=2, ensure_ascii=False))
    db.close()
    return 0 if recommendation == "Diciembre listo para preview productivo" else 1


if __name__ == "__main__":
    raise SystemExit(main())
