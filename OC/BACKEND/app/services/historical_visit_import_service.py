"""
Preview de importación de visitas históricas agregadas (Fase 2C.1).

No crea pagos, ciclos ni usuarios automáticamente. Commit no implementado en esta fase.
"""
from __future__ import annotations

import hashlib
import io
from datetime import date
from typing import Any

import pandas as pd
from sqlalchemy.orm import Session

from app.models import HistoricalVisitImportBatch, HistoricalVisitImportRecord, User
from app.services.historical_visit_parser import (
    ParsedVisitSummary,
    classify_sheet_content,
    parse_visit_summaries,
)
from app.services.membership_import_service import _match_users

MATCH_STATUS_MAP = {
    "existing": "matched",
    "new": "new_candidate",
    "ambiguous": "ambiguous",
}


def _build_external_ref(summary: ParsedVisitSummary) -> str:
    return (
        f"VISIT:{summary.source_sheet}:{summary.normalized_member_name.replace(' ', '_')}:"
        f"{summary.period_month.isoformat()}"
    )


def _summary_to_preview_row(
    db: Session,
    summary: ParsedVisitSummary,
) -> dict[str, Any]:
    match_type, matched_id, candidates = _match_users(db, phone=None, name=summary.raw_member_name)
    match_status = MATCH_STATUS_MAP.get(match_type, "unmatched")
    return {
        "raw_member_name": summary.raw_member_name,
        "normalized_member_name": summary.normalized_member_name,
        "period_month": summary.period_month.isoformat(),
        "month_label": summary.month_label,
        "visits_count": summary.visits_count,
        "source_sheet": summary.source_sheet,
        "source_row": summary.source_row,
        "source_column_index": summary.source_column_index,
        "referencia_externa": _build_external_ref(summary),
        "match_status": match_status,
        "matched_user_id": matched_id,
        "candidate_user_ids": candidates,
        "warnings": summary.warnings,
        "status": "warning" if match_status == "ambiguous" else "ready",
    }


def build_visit_preview_from_dataframe(
    db: Session,
    *,
    df: pd.DataFrame,
    sheet_name: str,
    filename: str,
    admin_user: User,
    persist: bool = True,
) -> dict[str, Any]:
    sheet_type = classify_sheet_content(df, sheet_name=sheet_name)
    parse_result = parse_visit_summaries(df, sheet_name=sheet_name)
    preview_rows = [_summary_to_preview_row(db, summary) for summary in parse_result.summaries]

    matched = sum(1 for row in preview_rows if row["match_status"] == "matched")
    new_candidates = sum(1 for row in preview_rows if row["match_status"] == "new_candidate")
    ambiguous = sum(1 for row in preview_rows if row["match_status"] == "ambiguous")

    visits_by_period: dict[str, int] = {}
    for row in preview_rows:
        key = row["period_month"]
        visits_by_period[key] = visits_by_period.get(key, 0) + int(row["visits_count"])

    preview_summary = {
        "sheet_type": sheet_type,
        "total_summaries": len(preview_rows),
        "matched_members": matched,
        "new_candidates": new_candidates,
        "ambiguous_members": ambiguous,
        "skipped_rows": parse_result.skipped_rows,
        "invalid_values": parse_result.invalid_values,
        "visits_by_period": visits_by_period,
        "total_visits": sum(visits_by_period.values()),
        "blocking_ambiguous": ambiguous > 0,
        "can_commit": False,
    }

    diagnosis = {
        **parse_result.diagnostics,
        "payment_block_detected": parse_result.payment_block_detected,
        "compatible_payment_import": False,
        "note": "Visitas agregadas; no usar importador de pagos.",
    }

    batch_id: int | None = None
    if persist:
        batch = HistoricalVisitImportBatch(
            created_by=admin_user.id,
            status="preview",
            filename=filename,
            sheet_name=sheet_name,
            file_sha256=hashlib.sha256(str(sheet_name).encode()).hexdigest()[:16],
            diagnosis=diagnosis,
            preview_summary=preview_summary,
        )
        db.add(batch)
        db.flush()
        batch_id = batch.id
        for index, row in enumerate(preview_rows, start=1):
            db.add(
                HistoricalVisitImportRecord(
                    batch_id=batch.id,
                    row_number=index,
                    status=row["status"],
                    raw_data=row,
                    normalized_data=row,
                    warnings=row.get("warnings"),
                    referencia_externa=row["referencia_externa"],
                    matched_user_id=row.get("matched_user_id"),
                )
            )
        db.commit()
        db.refresh(batch)

    return {
        "batch_id": batch_id,
        "sheet_name": sheet_name,
        "sheet_type": sheet_type,
        "diagnosis": diagnosis,
        "preview_summary": preview_summary,
        "rows": preview_rows,
    }


def build_visit_preview_from_xlsx(
    db: Session,
    *,
    file_bytes: bytes,
    filename: str,
    sheet_name: str,
    admin_user: User,
    persist: bool = True,
) -> dict[str, Any]:
    df = pd.read_excel(io.BytesIO(file_bytes), sheet_name=sheet_name, header=None)
    return build_visit_preview_from_dataframe(
        db,
        df=df,
        sheet_name=sheet_name,
        filename=filename,
        admin_user=admin_user,
        persist=persist,
    )
