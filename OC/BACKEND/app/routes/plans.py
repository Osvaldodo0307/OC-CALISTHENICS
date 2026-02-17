from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.auth import get_current_coach, get_current_user, get_current_socio
from app.schemas import (
    TrainingPlanResponse, TrainingPlanCreate, TrainingPlanWithItems,
    TrainingPlanItemCreate, TrainingPlanItemResponse
)
from app.models import TrainingPlan, TrainingPlanItem, CoachStudent, User

router = APIRouter(prefix="/plans", tags=["plans"])

@router.post("/", response_model=TrainingPlanResponse)
async def create_plan(
    plan: TrainingPlanCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_coach)
):
    # Verificar que el estudiante está asignado al coach
    assignment = db.query(CoachStudent).filter(
        CoachStudent.coach_id == current_user.id,
        CoachStudent.student_id == plan.student_id
    ).first()
    if not assignment:
        raise HTTPException(status_code=403, detail="Student not assigned to you")
    
    db_plan = TrainingPlan(
        student_id=plan.student_id,
        coach_id=current_user.id,
        title=plan.title,
        start_date=plan.start_date,
        end_date=plan.end_date,
        goal=plan.goal,
        source=plan.source
    )
    db.add(db_plan)
    db.commit()
    db.refresh(db_plan)
    return db_plan

@router.get("/student/{student_id}", response_model=List[TrainingPlanWithItems])
async def get_student_plans(
    student_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.role == "coach":
        # Coach solo ve planes de sus alumnos
        assignment = db.query(CoachStudent).filter(
            CoachStudent.coach_id == current_user.id,
            CoachStudent.student_id == student_id
        ).first()
        if not assignment:
            raise HTTPException(status_code=403, detail="Student not assigned to you")
    elif current_user.role == "socio":
        # Socio solo ve sus propios planes
        if current_user.id != student_id:
            raise HTTPException(status_code=403, detail="Can only view your own plans")
    
    plans = db.query(TrainingPlan).filter(TrainingPlan.student_id == student_id).all()
    result = []
    for plan in plans:
        items = db.query(TrainingPlanItem).filter(TrainingPlanItem.plan_id == plan.id).all()
        plan_dict = {
            "id": plan.id,
            "student_id": plan.student_id,
            "coach_id": plan.coach_id,
            "title": plan.title,
            "start_date": plan.start_date,
            "end_date": plan.end_date,
            "goal": plan.goal,
            "source": plan.source,
            "created_at": plan.created_at,
            "items": items
        }
        result.append(plan_dict)
    return result

@router.get("/my-plan", response_model=TrainingPlanWithItems)
async def get_my_plan(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_socio)
):
    plan = db.query(TrainingPlan).filter(
        TrainingPlan.student_id == current_user.id
    ).order_by(TrainingPlan.created_at.desc()).first()
    
    if not plan:
        raise HTTPException(status_code=404, detail="No plan assigned")
    
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
        "items": items
    }
