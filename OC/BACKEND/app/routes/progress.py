from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.auth import get_current_coach, get_current_user
from app.schemas import ProgressEntryResponse, ProgressEntryCreate
from app.models import ProgressEntry, CoachStudent, User

router = APIRouter(prefix="/progress", tags=["progress"])

@router.post("/", response_model=ProgressEntryResponse)
async def create_progress_entry(
    entry: ProgressEntryCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_coach)
):
    # Verificar que el estudiante está asignado al coach
    assignment = db.query(CoachStudent).filter(
        CoachStudent.coach_id == current_user.id,
        CoachStudent.student_id == entry.student_id
    ).first()
    if not assignment:
        raise HTTPException(status_code=403, detail="Student not assigned to you")
    
    db_entry = ProgressEntry(
        student_id=entry.student_id,
        coach_id=current_user.id,
        date=entry.date,
        discipline=entry.discipline,
        metric_type=entry.metric_type,
        value=entry.value,
        notes=entry.notes
    )
    db.add(db_entry)
    db.commit()
    db.refresh(db_entry)
    return db_entry

@router.get("/student/{student_id}", response_model=List[ProgressEntryResponse])
async def get_student_progress(
    student_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.role == "coach":
        # Coach solo ve progresos de sus alumnos
        assignment = db.query(CoachStudent).filter(
            CoachStudent.coach_id == current_user.id,
            CoachStudent.student_id == student_id
        ).first()
        if not assignment:
            raise HTTPException(status_code=403, detail="Student not assigned to you")
    elif current_user.role == "socio":
        # Socio solo ve sus propios progresos
        if current_user.id != student_id:
            raise HTTPException(status_code=403, detail="Can only view your own progress")
    else:
        # Admin puede ver todo
        pass
    
    entries = db.query(ProgressEntry).filter(ProgressEntry.student_id == student_id).order_by(ProgressEntry.date.desc()).all()
    return entries
