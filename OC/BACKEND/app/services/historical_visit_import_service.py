"""
Importación de visitas históricas agregadas (Fase 2C.1 / 2C.2).

No crea pagos, ciclos, membresías ni usuarios. Commit solo para filas matched.
"""
from __future__ import annotations

import hashlib
import io
from datetime import date, datetime
from typing import Any

import pandas as pd
from sqlalchemy.orm import Session

from app.models import (
    HistoricalVisitImportBatch,
    HistoricalVisitImportRecord,
    HistoricalVisitSummary,
    MembershipCycle,
    MembershipPayment,
    User,
)
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


class HistoricalVisitImportError(ValueError):
    pass


def _build_external_ref(summary: ParsedVisitSummary) -> str:
    return (
        f"VISIT:{summary.source_sheet}:{summary.normalized_member_name.replace(' ', '_')}:"
        f"{summary.period_month.isoformat()}"
    )


def _parse_period_month(value: str | date | None) -> date | None:
    if value is None:
        return None
    if isinstance(value, date):
        return value.replace(day=1) if value.day != 1 else value
    return date.fromisoformat(str(value)[:10]).replace(day=1)


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
        "matched_user_name": None,
        "candidate_user_ids": candidates,
        "warnings": summary.warnings,
        "status": "warning" if match_status == "ambiguous" else "ready",
    }


def _attach_matched_user_names(db: Session, rows: list[dict[str, Any]]) -> None:
    user_ids = {row["matched_user_id"] for row in rows if row.get("matched_user_id")}
    if not user_ids:
        return
    users = {user.id: user.name for user in db.query(User).filter(User.id.in_(user_ids)).all()}
    for row in rows:
        matched_id = row.get("matched_user_id")
        if matched_id:
            row["matched_user_name"] = users.get(matched_id)


def _build_preview_summary(
    *,
    sheet_type: str,
    preview_rows: list[dict[str, Any]],
    parse_result,
) -> dict[str, Any]:
    matched = sum(1 for row in preview_rows if row["match_status"] == "matched")
    new_candidates = sum(1 for row in preview_rows if row["match_status"] == "new_candidate")
    ambiguous = sum(1 for row in preview_rows if row["match_status"] == "ambiguous")
    unmatched = sum(1 for row in preview_rows if row["match_status"] == "unmatched")

    visits_by_period: dict[str, int] = {}
    for row in preview_rows:
        key = row["period_month"]
        visits_by_period[key] = visits_by_period.get(key, 0) + int(row["visits_count"])

    blocking_errors: list[str] = []
    if not parse_result.layout:
        blocking_errors.append("bloque_visitas_no_detectado")
    if parse_result.invalid_values > 0:
        blocking_errors.append("valores_invalidos_en_matriz")
    if not preview_rows:
        blocking_errors.append("sin_registros_de_visitas")
    if ambiguous > 0:
        blocking_errors.append("socios_ambiguos_sin_resolver")
    if new_candidates > 0:
        blocking_errors.append("socios_sin_match_en_bd")
    if unmatched > 0:
        blocking_errors.append("registros_sin_match")

    non_matched = new_candidates + ambiguous + unmatched
    can_commit = (
        not blocking_errors
        and len(preview_rows) > 0
        and matched == len(preview_rows)
        and non_matched == 0
    )

    return {
        "sheet_type": sheet_type,
        "distinct_members": len({row["normalized_member_name"] for row in preview_rows}),
        "total_summaries": len(preview_rows),
        "matched_members": matched,
        "new_candidates": new_candidates,
        "ambiguous_members": ambiguous,
        "unmatched_members": unmatched,
        "skipped_rows": parse_result.skipped_rows,
        "invalid_values": parse_result.invalid_values,
        "visits_by_period": visits_by_period,
        "total_visits": sum(visits_by_period.values()),
        "blocking_errors": blocking_errors,
        "blocking_ambiguous": ambiguous > 0,
        "can_commit": can_commit,
    }


def load_visit_file_to_dataframe(
    *,
    file_bytes: bytes,
    filename: str,
    sheet_name: str | None,
) -> tuple[pd.DataFrame, str]:
    lower_name = (filename or "").lower()
    if lower_name.endswith(".csv"):
        df = pd.read_csv(io.BytesIO(file_bytes), header=None)
        return df, sheet_name or "CSV"

    excel = pd.ExcelFile(io.BytesIO(file_bytes))
    sheets = excel.sheet_names
    selected = sheet_name or (sheets[0] if sheets else "Sheet1")
    if selected not in sheets:
        raise HistoricalVisitImportError(f"Hoja no encontrada: {selected}")
    df = pd.read_excel(excel, sheet_name=selected, header=None)
    return df, selected


def build_visit_preview_from_dataframe(
    db: Session,
    *,
    df: pd.DataFrame,
    sheet_name: str,
    filename: str,
    admin_user: User,
    persist: bool = True,
    file_bytes: bytes | None = None,
) -> dict[str, Any]:
    sheet_type = classify_sheet_content(df, sheet_name=sheet_name)
    parse_result = parse_visit_summaries(df, sheet_name=sheet_name)
    preview_rows = [_summary_to_preview_row(db, summary) for summary in parse_result.summaries]
    _attach_matched_user_names(db, preview_rows)

    preview_summary = _build_preview_summary(
        sheet_type=sheet_type,
        preview_rows=preview_rows,
        parse_result=parse_result,
    )

    diagnosis = {
        **parse_result.diagnostics,
        "payment_block_detected": parse_result.payment_block_detected,
        "compatible_payment_import": False,
        "note": "Visitas agregadas; no usar importador de pagos.",
    }

    file_hash = hashlib.sha256(file_bytes).hexdigest() if file_bytes else None
    batch_id: int | None = None
    if persist:
        batch = HistoricalVisitImportBatch(
            created_by=admin_user.id,
            status="preview",
            filename=filename,
            sheet_name=sheet_name,
            file_sha256=file_hash,
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
        "status": "preview",
        "sheet_name": sheet_name,
        "sheet_type": sheet_type,
        "diagnosis": diagnosis,
        "preview_summary": preview_summary,
        "rows": preview_rows,
    }


def build_visit_preview_from_file(
    db: Session,
    *,
    file_bytes: bytes,
    filename: str,
    sheet_name: str | None,
    admin_user: User,
    persist: bool = True,
) -> dict[str, Any]:
    df, selected_sheet = load_visit_file_to_dataframe(
        file_bytes=file_bytes,
        filename=filename,
        sheet_name=sheet_name,
    )
    return build_visit_preview_from_dataframe(
        db,
        df=df,
        sheet_name=selected_sheet,
        filename=filename,
        admin_user=admin_user,
        persist=persist,
        file_bytes=file_bytes,
    )


def build_visit_preview_from_xlsx(
    db: Session,
    *,
    file_bytes: bytes,
    filename: str,
    sheet_name: str,
    admin_user: User,
    persist: bool = True,
) -> dict[str, Any]:
    return build_visit_preview_from_file(
        db,
        file_bytes=file_bytes,
        filename=filename,
        sheet_name=sheet_name,
        admin_user=admin_user,
        persist=persist,
    )


def _batch_to_payload(batch: HistoricalVisitImportBatch) -> dict[str, Any]:
    return {
        "batch_id": batch.id,
        "status": batch.status,
        "filename": batch.filename,
        "sheet_name": batch.sheet_name,
        "diagnosis": batch.diagnosis,
        "preview_summary": batch.preview_summary,
        "committed_summary": batch.committed_summary,
        "created_at": batch.created_at.isoformat() if batch.created_at else None,
        "committed_at": batch.committed_at.isoformat() if batch.committed_at else None,
    }


def get_visit_import_batch(db: Session, batch_id: int) -> dict[str, Any] | None:
    batch = db.query(HistoricalVisitImportBatch).filter(HistoricalVisitImportBatch.id == batch_id).first()
    if not batch:
        return None
    return _batch_to_payload(batch)


def list_visit_import_records(db: Session, batch_id: int) -> list[dict[str, Any]]:
    records = (
        db.query(HistoricalVisitImportRecord)
        .filter(HistoricalVisitImportRecord.batch_id == batch_id)
        .order_by(HistoricalVisitImportRecord.row_number.asc())
        .all()
    )
    return [
        {
            "id": record.id,
            "row_number": record.row_number,
            "status": record.status,
            "raw_data": record.raw_data,
            "normalized_data": record.normalized_data,
            "warnings": record.warnings,
            "matched_user_id": record.matched_user_id,
            "referencia_externa": record.referencia_externa,
        }
        for record in records
    ]


def _find_existing_summary(
    db: Session,
    *,
    normalized_member_name: str,
    period_month: date,
    source_sheet: str | None,
) -> HistoricalVisitSummary | None:
    return (
        db.query(HistoricalVisitSummary)
        .filter(
            HistoricalVisitSummary.normalized_member_name == normalized_member_name,
            HistoricalVisitSummary.period_month == period_month,
            HistoricalVisitSummary.source_sheet == source_sheet,
        )
        .first()
    )


def commit_visit_import_batch(
    db: Session,
    *,
    batch_id: int,
    admin_user: User,
) -> dict[str, Any]:
    batch = db.query(HistoricalVisitImportBatch).filter(HistoricalVisitImportBatch.id == batch_id).first()
    if not batch:
        raise HistoricalVisitImportError("Lote de importacion no encontrado")
    if batch.status == "committed":
        raise HistoricalVisitImportError("Este lote ya fue importado")
    if batch.status != "preview":
        raise HistoricalVisitImportError("El lote no esta en estado preview")

    preview_summary = batch.preview_summary or {}
    if not preview_summary.get("can_commit"):
        blocking = preview_summary.get("blocking_errors") or []
        detail = ", ".join(blocking) if blocking else "preview_no_confirmable"
        raise HistoricalVisitImportError(f"Commit bloqueado: {detail}")

    records = (
        db.query(HistoricalVisitImportRecord)
        .filter(HistoricalVisitImportRecord.batch_id == batch_id)
        .order_by(HistoricalVisitImportRecord.row_number.asc())
        .all()
    )

    for record in records:
        normalized = record.normalized_data or {}
        if normalized.get("match_status") != "matched":
            raise HistoricalVisitImportError(
                "Commit bloqueado: existen registros sin match resuelto (ambiguous, new_candidate o unmatched)"
            )
        match_type, matched_id, _ = _match_users(
            db,
            phone=None,
            name=normalized.get("raw_member_name"),
        )
        if match_type != "existing" or not matched_id:
            raise HistoricalVisitImportError(
                "Commit bloqueado: existen registros sin match resuelto (ambiguous, new_candidate o unmatched)"
            )

    imported = 0
    skipped_duplicate = 0
    results: list[dict[str, Any]] = []

    for record in records:
        normalized = record.normalized_data or {}
        match_type, matched_id, _ = _match_users(
            db,
            phone=None,
            name=normalized.get("raw_member_name"),
        )
        assert match_type == "existing" and matched_id

        period_month = _parse_period_month(normalized.get("period_month"))
        if not period_month:
            record.status = "failed"
            results.append({"row_number": record.row_number, "status": "failed", "reason": "periodo_invalido"})
            continue

        normalized_name = normalized.get("normalized_member_name") or ""
        source_sheet = normalized.get("source_sheet")
        existing = _find_existing_summary(
            db,
            normalized_member_name=normalized_name,
            period_month=period_month,
            source_sheet=source_sheet,
        )
        if existing:
            skipped_duplicate += 1
            record.status = "skipped_duplicate"
            results.append(
                {
                    "row_number": record.row_number,
                    "status": "skipped_duplicate",
                    "summary_id": existing.id,
                }
            )
            continue

        summary = HistoricalVisitSummary(
            user_id=matched_id,
            raw_member_name=normalized.get("raw_member_name") or "",
            normalized_member_name=normalized_name,
            period_month=period_month,
            visits_count=int(normalized.get("visits_count") or 0),
            source_file=batch.filename,
            source_sheet=source_sheet,
            source_row=normalized.get("source_row"),
            import_batch_id=batch.id,
            match_status="matched",
            is_historical_import=True,
            created_by=admin_user.id,
        )
        db.add(summary)
        db.flush()
        imported += 1
        record.status = "committed"
        record.matched_user_id = matched_id
        results.append({"row_number": record.row_number, "status": "committed", "summary_id": summary.id})

    payments_count = db.query(MembershipPayment).count()
    cycles_count = db.query(MembershipCycle).count()

    committed_summary = {
        "imported_summaries": imported,
        "skipped_duplicate": skipped_duplicate,
        "payments_count_after": payments_count,
        "cycles_count_after": cycles_count,
        "note": "Visitas historicas agregadas; no se crearon pagos ni ciclos.",
    }

    batch.status = "committed"
    batch.committed_at = datetime.utcnow()
    batch.committed_summary = committed_summary
    db.commit()
    db.refresh(batch)

    return {
        "batch_id": batch.id,
        "status": batch.status,
        "committed_summary": committed_summary,
        "results": results,
    }


def list_historical_visit_summaries(
    db: Session,
    *,
    user_id: int | None = None,
    period_month: date | None = None,
    limit: int = 200,
    offset: int = 0,
) -> dict[str, Any]:
    query = db.query(HistoricalVisitSummary)
    if user_id is not None:
        query = query.filter(HistoricalVisitSummary.user_id == user_id)
    if period_month is not None:
        query = query.filter(HistoricalVisitSummary.period_month == period_month.replace(day=1))

    rows = (
        query.order_by(HistoricalVisitSummary.period_month.desc(), HistoricalVisitSummary.id.asc())
        .offset(offset)
        .limit(limit)
        .all()
    )

    user_ids = {row.user_id for row in rows if row.user_id}
    user_names = {}
    if user_ids:
        user_names = {
            user.id: user.name
            for user in db.query(User).filter(User.id.in_(user_ids)).all()
        }

    items = [
        {
            "id": row.id,
            "user_id": row.user_id,
            "user_name": user_names.get(row.user_id),
            "raw_member_name": row.raw_member_name,
            "normalized_member_name": row.normalized_member_name,
            "period_month": row.period_month.isoformat(),
            "visits_count": row.visits_count,
            "source_sheet": row.source_sheet,
            "import_batch_id": row.import_batch_id,
            "match_status": row.match_status,
            "created_at": row.created_at.isoformat() if row.created_at else None,
        }
        for row in rows
    ]

    totals_query = db.query(HistoricalVisitSummary)
    if user_id is not None:
        totals_query = totals_query.filter(HistoricalVisitSummary.user_id == user_id)
    if period_month is not None:
        totals_query = totals_query.filter(HistoricalVisitSummary.period_month == period_month.replace(day=1))

    totals_by_month: dict[str, int] = {}
    for row in totals_query.all():
        key = row.period_month.isoformat()
        totals_by_month[key] = totals_by_month.get(key, 0) + int(row.visits_count)

    return {
        "items": items,
        "count": len(items),
        "totals_by_month": totals_by_month,
        "total_visits": sum(totals_by_month.values()),
    }
