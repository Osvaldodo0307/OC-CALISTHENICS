#!/usr/bin/env python3
"""
Marca ciclos existentes como importacion historica (staging/local).

Uso:
  python scripts/mark_historical_import_cycles.py --batch-id 3 --dry-run
  python scripts/mark_historical_import_cycles.py --batch-id 3 --apply
  python scripts/mark_historical_import_cycles.py --source OCCALISTHENICS --apply
"""
from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path

BACKEND_ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(BACKEND_ROOT))

from sqlalchemy import or_

from app.database import SessionLocal
from app.models import MembershipCycle, MembershipImportRecord, MembershipPayment

DEFAULT_SOURCE = "OCCALISTHENICS"


def _collect_cycle_ids(
    db,
    *,
    batch_id: int | None,
    source: str | None,
    concept_like: str | None,
    date_start: str | None,
    date_end: str | None,
) -> set[int]:
    ids: set[int] = set()

    if batch_id:
        records = (
            db.query(MembershipImportRecord)
            .filter(
                MembershipImportRecord.batch_id == batch_id,
                MembershipImportRecord.membership_cycle_id.isnot(None),
            )
            .all()
        )
        ids.update(r.membership_cycle_id for r in records if r.membership_cycle_id)

    payment_q = db.query(MembershipPayment.membership_cycle_id).filter(
        MembershipPayment.membership_cycle_id.isnot(None)
    )
    if batch_id:
        payment_q = payment_q.filter(MembershipPayment.concept.like(f"%lote #{batch_id}%"))
    if concept_like:
        payment_q = payment_q.filter(MembershipPayment.concept.like(f"%{concept_like}%"))
    if source:
        payment_q = payment_q.filter(
            or_(
                MembershipPayment.observations.ilike(f"%{source}%"),
                MembershipPayment.idempotency_key.ilike(f"%{source}%"),
            )
        )
    ids.update(row[0] for row in payment_q.distinct().all() if row[0])

    cycle_q = db.query(MembershipCycle)
    if date_start:
        cycle_q = cycle_q.filter(MembershipCycle.start_date >= date_start)
    if date_end:
        cycle_q = cycle_q.filter(MembershipCycle.end_date <= date_end)
    if source:
        cycle_q = cycle_q.filter(
            or_(
                MembershipCycle.historical_source.ilike(f"%{source}%"),
                MembershipCycle.id.in_(ids) if ids else False,
            )
        )
    if ids:
        cycle_q = cycle_q.filter(MembershipCycle.id.in_(ids))
    elif source or batch_id or concept_like:
        pass
    else:
        return set()

    for cycle in cycle_q.all():
        ids.add(cycle.id)
    return ids


def main() -> int:
    parser = argparse.ArgumentParser(description="Marcar ciclos como importacion historica")
    parser.add_argument("--batch-id", type=int, default=None)
    parser.add_argument("--source", default=DEFAULT_SOURCE)
    parser.add_argument("--concept-like", default="Importacion historica lote")
    parser.add_argument("--date-start", default=None, help="YYYY-MM-DD")
    parser.add_argument("--date-end", default=None, help="YYYY-MM-DD")
    parser.add_argument("--dry-run", action="store_true", help="Solo preview (default)")
    parser.add_argument("--apply", action="store_true", help="Aplicar cambios")
    args = parser.parse_args()

    if args.apply and args.dry_run:
        print("ERROR: usa solo --dry-run o --apply")
        return 1
    dry_run = not args.apply

    db = SessionLocal()
    try:
        cycle_ids = _collect_cycle_ids(
            db,
            batch_id=args.batch_id,
            source=args.source,
            concept_like=args.concept_like,
            date_start=args.date_start,
            date_end=args.date_end,
        )
        cycles = (
            db.query(MembershipCycle)
            .filter(MembershipCycle.id.in_(cycle_ids))
            .order_by(MembershipCycle.id)
            .all()
            if cycle_ids
            else []
        )

        preview = []
        for c in cycles:
            preview.append({
                "cycle_id": c.id,
                "user_id": c.user_id,
                "period": f"{c.start_date} -> {c.end_date}",
                "plan": c.membership_type,
                "current_is_historical_import": bool(c.is_historical_import),
                "will_set": {
                    "is_historical_import": True,
                    "historical_source": args.source or c.historical_source,
                    "import_batch_id": args.batch_id or c.import_batch_id,
                    "is_active_cycle": False if c.end_date < __import__("datetime").date.today() else c.is_active_cycle,
                },
            })

        report = {"dry_run": dry_run, "matched_cycles": len(preview), "cycles": preview}
        print(json.dumps(report, indent=2, ensure_ascii=False, default=str))

        if dry_run:
            print("\nPreview listo. Ejecuta con --apply para persistir.")
            return 0

        updated = 0
        today = __import__("datetime").date.today()
        for c in cycles:
            c.is_historical_import = True
            if args.source:
                c.historical_source = args.source
            if args.batch_id:
                c.import_batch_id = args.batch_id
            if c.end_date < today:
                c.is_active_cycle = False
            updated += 1
        db.commit()
        print(f"\nActualizados: {updated}")
        return 0
    finally:
        db.close()


if __name__ == "__main__":
    raise SystemExit(main())
