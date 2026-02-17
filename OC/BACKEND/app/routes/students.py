from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional
from app.database import get_db
from app.auth import get_current_coach, get_current_user, get_current_socio
from app.schemas import UserResponse, TrainingPlanWithItems
from app.models import User, CoachStudent, TrainingPlan, TrainingPlanItem

router = APIRouter(prefix="/students", tags=["students"])

@router.get("/{student_id}", response_model=UserResponse)
async def get_student(
    student_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_coach)
):
    # Verificar que el estudiante está asignado al coach
    assignment = db.query(CoachStudent).filter(
        CoachStudent.coach_id == current_user.id,
        CoachStudent.student_id == student_id
    ).first()
    if not assignment:
        raise HTTPException(status_code=404, detail="Student not found or not assigned to you")
    
    student = db.query(User).filter(User.id == student_id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")
    return student

@router.get("/me/plan", response_model=Optional[TrainingPlanWithItems])
async def get_my_plan(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_socio)
):
    """
    Get the current student's (socio) active training plan
    Returns the most recent plan with all its items
    """
    plan = db.query(TrainingPlan).filter(
        TrainingPlan.student_id == current_user.id
    ).order_by(TrainingPlan.created_at.desc()).first()
    
    if not plan:
        return None
    
    items = db.query(TrainingPlanItem).filter(TrainingPlanItem.plan_id == plan.id).all()
    
    return {
        "id": plan.id,
        "student_id": plan.student_id,
        "coach_id": plan.coach_id,
        "title": plan.title,
        "start_date": plan.start_date,
        "end_date": plan.end_date,
        "goal": plan.goal,
        "source": plan.source,
        "created_at": plan.created_at,
        "items": [
            {
                "id": item.id,
                "week_number": item.week_number,
                "day_label": item.day_label,
                "warmup": item.warmup,
                "main": item.main,
                "accessories": item.accessories,
                "cooldown": item.cooldown,
                "notes": item.notes
            }
            for item in items
        ]
    }
