from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.auth import get_current_coach, get_current_user
from app.schemas import VirtualAssessmentResponse, VirtualAssessmentCreate
from app.models import VirtualAssessment, CoachStudent, User

router = APIRouter(prefix="/assessments", tags=["assessments"])

@router.post("/", response_model=VirtualAssessmentResponse)
async def create_assessment(
    assessment: VirtualAssessmentCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_coach)
):
    # Verificar que el estudiante está asignado al coach
    assignment = db.query(CoachStudent).filter(
        CoachStudent.coach_id == current_user.id,
        CoachStudent.student_id == assessment.student_id
    ).first()
    if not assignment:
        raise HTTPException(status_code=403, detail="Student not assigned to you")
    
    db_assessment = VirtualAssessment(
        student_id=assessment.student_id,
        coach_id=current_user.id,
        goal=assessment.goal,
        level=assessment.level,
        days_per_week=assessment.days_per_week,
        session_minutes=assessment.session_minutes,
        equipment_json=assessment.equipment_json,
        restrictions=assessment.restrictions,
        preference=assessment.preference
    )
    db.add(db_assessment)
    db.commit()
    db.refresh(db_assessment)
    return db_assessment

@router.get("/student/{student_id}", response_model=List[VirtualAssessmentResponse])
async def get_student_assessments(
    student_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.role == "coach":
        assignment = db.query(CoachStudent).filter(
            CoachStudent.coach_id == current_user.id,
            CoachStudent.student_id == student_id
        ).first()
        if not assignment:
            raise HTTPException(status_code=403, detail="Student not assigned to you")
    
    assessments = db.query(VirtualAssessment).filter(
        VirtualAssessment.student_id == student_id
    ).order_by(VirtualAssessment.date.desc()).all()
    return assessments
