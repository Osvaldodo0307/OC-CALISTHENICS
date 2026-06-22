from datetime import date

from fastapi import APIRouter, Depends, File, Form, HTTPException, Query, UploadFile
from sqlalchemy.orm import Session

from app.auth import get_current_admin
from app.database import get_db
from app.models import User
from app.schemas import HistoricalVisitImportCommitRequest
from app.services.historical_visit_import_service import (
    HistoricalVisitImportError,
    build_visit_preview_from_file,
    commit_visit_import_batch,
    get_visit_import_batch,
    list_historical_visit_summaries,
    list_visit_import_records,
)

router = APIRouter(prefix="/historical-visits", tags=["historical-visits"])


@router.post("/admin/imports/preview")
async def preview_historical_visit_import(
    file: UploadFile = File(...),
    sheet_name: str | None = Form(default=None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin),
):
    filename = file.filename or "import.xlsx"
    contents = await file.read()
    try:
        return build_visit_preview_from_file(
            db,
            file_bytes=contents,
            filename=filename,
            sheet_name=sheet_name,
            admin_user=current_user,
            persist=True,
        )
    except HistoricalVisitImportError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc


@router.post("/admin/imports/commit")
async def commit_historical_visit_import(
    payload: HistoricalVisitImportCommitRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin),
):
    try:
        return commit_visit_import_batch(
            db,
            batch_id=payload.batch_id,
            admin_user=current_user,
        )
    except HistoricalVisitImportError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc


@router.get("/admin/imports/{batch_id}")
async def get_historical_visit_import_batch(
    batch_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin),
):
    batch = get_visit_import_batch(db, batch_id)
    if not batch:
        raise HTTPException(status_code=404, detail="Lote de importacion no encontrado")
    return batch


@router.get("/admin/imports/{batch_id}/records")
async def get_historical_visit_import_records(
    batch_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin),
):
    batch = get_visit_import_batch(db, batch_id)
    if not batch:
        raise HTTPException(status_code=404, detail="Lote de importacion no encontrado")
    return {
        "batch_id": batch_id,
        "records": list_visit_import_records(db, batch_id),
    }


@router.get("/admin/summaries")
async def get_historical_visit_summaries(
    user_id: int | None = Query(default=None),
    period_month: date | None = Query(default=None),
    limit: int = Query(default=200, ge=1, le=500),
    offset: int = Query(default=0, ge=0),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin),
):
    return list_historical_visit_summaries(
        db,
        user_id=user_id,
        period_month=period_month,
        limit=limit,
        offset=offset,
    )
