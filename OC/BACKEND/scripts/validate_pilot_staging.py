#!/usr/bin/env python3
"""Valida piloto histórico OCCALISTHENICS en la BD compartida (staging/local)."""
from __future__ import annotations

import json
import sys
from pathlib import Path

BACKEND_ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(BACKEND_ROOT))

from app.database import SessionLocal
from app.models import MembershipCycle, MembershipImportBatch, MembershipPayment, User
from app.services.membership_followup_service import build_followup_inbox, build_followup_summary
from app.services.membership_admin import list_client_entries

PILOT_REFERENCES = [
    "OCCALISTHENICS:NOVIEMBRE 2025:tonito_osnaya:2025-11-01",
    "OCCALISTHENICS:NOVIEMBRE 2025:liria_villegas:2025-11-01",
    "OCCALISTHENICS:NOVIEMBRE 2025:valeria_quintana:2025-11-01",
    "OCCALISTHENICS:NOVIEMBRE 2025:arlette_roman:2025-11-01",
    "OCCALISTHENICS:NOVIEMBRE 2025:pedro_flores:2025-11-01",
    "OCCALISTHENICS:NOVIEMBRE 2025:luis_alberto:2025-11-01",
    "OCCALISTHENICS:NOVIEMBRE 2025:rodrigo_alva:2025-11-01",
]

PILOT_NAMES = [
    "TOÑITO OSNAYA",
    "LIRIA VILLEGAS",
    "VALERIA QUINTANA",
    "ARLETTE ROMÁN",
    "PEDRO FLORES",
    "LUIS ALBERTO",
    "RODRIGO ALVA",
]


def main() -> int:
    db = SessionLocal()
    report: dict = {"pilot_members": [], "issues": [], "followups": {}}

    try:
        batches = (
            db.query(MembershipImportBatch)
            .order_by(MembershipImportBatch.id.desc())
            .limit(5)
            .all()
        )
        report["import_batches"] = [
            {
                "id": b.id,
                "status": b.status,
                "filename": b.filename,
                "committed_at": b.committed_at.isoformat() if b.committed_at else None,
            }
            for b in batches
        ]

        payments_by_ref: dict[str, MembershipPayment] = {}
        for ref in PILOT_REFERENCES:
            idem = f"historical-import:{ref}"
            payment = (
                db.query(MembershipPayment)
                .filter(MembershipPayment.idempotency_key.like(f"%{ref}%"))
                .first()
            )
            if payment:
                payments_by_ref[ref] = payment

        for name in PILOT_NAMES:
            user = db.query(User).filter(User.name == name).order_by(User.id.desc()).first()
            entry = None
            cycles = []
            member_payments = []
            if user:
                entries = list_client_entries(db, status_filter="todos", search=name, active_only=False)
                entry = next((e for e in entries if e["user_id"] == user.id), None)
                cycles = (
                    db.query(MembershipCycle)
                    .filter(MembershipCycle.user_id == user.id)
                    .order_by(MembershipCycle.start_date)
                    .all()
                )
                member_payments = (
                    db.query(MembershipPayment)
                    .filter(MembershipPayment.user_id == user.id)
                    .order_by(MembershipPayment.id)
                    .all()
                )

            ref = next(
                (r for r in PILOT_REFERENCES if name.lower().replace("á", "a").split()[0][:4] in r.lower()),
                None,
            )
            pilot_payment = None
            for p in member_payments:
                if "OCCALISTHENICS:NOVIEMBRE 2025" in (p.idempotency_key or ""):
                    pilot_payment = p
                    break

            issues = []
            if not user:
                issues.append("socio_no_encontrado_en_bd")
            if not pilot_payment:
                issues.append("pago_piloto_no_encontrado")
            elif pilot_payment.payment_method != "historico_sin_metodo":
                issues.append(f"metodo_incorrecto:{pilot_payment.payment_method}")
            elif "Importacion historica" not in (pilot_payment.concept or ""):
                issues.append(f"concepto_inesperado:{pilot_payment.concept}")

            nov_cycles = [
                c
                for c in cycles
                if str(c.start_date) == "2025-11-01" and str(c.end_date) == "2025-11-30"
            ]
            if not nov_cycles:
                issues.append("ciclo_nov_2025_no_encontrado")
            elif any(c.status != "vencida" for c in nov_cycles):
                issues.append("ciclo_no_marcado_vencida")

            active_cycles = [c for c in cycles if c.is_active_cycle]
            if len(active_cycles) > 1:
                issues.append("multiples_ciclos_activos")
            if active_cycles and str(active_cycles[0].end_date) == "2025-11-30":
                issues.append("ciclo_historico_marcado_como_activo")

            report["pilot_members"].append({
                "name": name,
                "user_id": user.id if user else None,
                "phone": user.phone if user else None,
                "membership_status": entry.get("status") if entry else None,
                "pending_balance": entry.get("pending_balance") if entry else None,
                "cycles_count": len(cycles),
                "nov_2025_cycle": {
                    "id": nov_cycles[0].id,
                    "status": nov_cycles[0].status,
                    "is_active_cycle": nov_cycles[0].is_active_cycle,
                }
                if nov_cycles
                else None,
                "payment": {
                    "id": pilot_payment.id,
                    "amount": float(pilot_payment.amount),
                    "method": pilot_payment.payment_method,
                    "concept": pilot_payment.concept,
                    "idempotency_key": pilot_payment.idempotency_key,
                    "notes": pilot_payment.observations,
                }
                if pilot_payment
                else None,
                "issues": issues,
            })
            report["issues"].extend([f"{name}: {i}" for i in issues])

        inbox = build_followup_inbox(db, status_filter="todos")
        pilot_ids = {m["user_id"] for m in report["pilot_members"] if m["user_id"]}
        pilot_inbox = [i for i in inbox if i["user_id"] in pilot_ids]
        summary = build_followup_summary(db)
        report["followups"] = {
            "summary_vencidos": summary.get("vencidos"),
            "pilot_in_inbox": len(pilot_inbox),
            "pilot_inbox_items": [
                {
                    "user_id": i["user_id"],
                    "name": i["name"],
                    "status": i.get("status"),
                    "priority_category": i.get("priority_category"),
                    "end_date": i.get("end_date"),
                }
                for i in pilot_inbox
            ],
        }

        report["payments_in_db_by_reference"] = len(payments_by_ref)
        print(json.dumps(report, indent=2, ensure_ascii=False, default=str))
        return 0 if not report["issues"] else 1
    finally:
        db.close()


if __name__ == "__main__":
    raise SystemExit(main())
