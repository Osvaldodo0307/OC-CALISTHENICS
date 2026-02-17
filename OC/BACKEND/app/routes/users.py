from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime, timedelta
from app.database import get_db
from app.auth import get_current_admin, get_current_user
from app.schemas import UserResponse, UserCreate
from app.models import (
    User,
    Membership,
    CoachStudent,
    Booking,
    ProgressEntry,
    TrainingPlan,
    VirtualAssessment,
    ClassSession,
)
from app.auth import get_password_hash

router = APIRouter(prefix="/users", tags=["users"])

@router.get("/", response_model=List[UserResponse])
async def get_users(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin)
):
    users = db.query(User).all()
    return users

@router.post("/", response_model=UserResponse)
async def create_user(
    user: UserCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin)
):
    db_user = db.query(User).filter(User.username == user.username).first()
    if db_user:
        raise HTTPException(status_code=400, detail="Username already registered")
    hashed_password = get_password_hash(user.password)
    db_user = User(
        username=user.username,
        name=user.name,
        password_hash=hashed_password,
        role=user.role,
        phone=user.phone
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    
    # Si es socio, crear membresía por defecto (inactiva)
    if user.role == "socio":
        membership = Membership(
            user_id=db_user.id,
            status="expired",  # Por defecto inactiva, el admin debe activarla
            plan="grupal",
            expires_at=None
        )
        db.add(membership)
        db.commit()
    
    return db_user

@router.delete("/{user_id}")
async def delete_user(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin)
):
    if user_id == current_user.id:
        raise HTTPException(status_code=400, detail="Cannot delete your own user")

    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    if user.role == "coach":
        db.query(CoachStudent).filter(CoachStudent.coach_id == user.id).delete()
        db.query(ProgressEntry).filter(ProgressEntry.coach_id == user.id).delete()
        db.query(VirtualAssessment).filter(VirtualAssessment.coach_id == user.id).delete()

        plans = db.query(TrainingPlan).filter(TrainingPlan.coach_id == user.id).all()
        for plan in plans:
            db.delete(plan)

        db.query(ClassSession).filter(ClassSession.coach_id == user.id).update(
            {ClassSession.coach_id: None}
        )

    if user.role == "socio":
        db.query(Membership).filter(Membership.user_id == user.id).delete()
        db.query(CoachStudent).filter(CoachStudent.student_id == user.id).delete()
        db.query(ProgressEntry).filter(ProgressEntry.student_id == user.id).delete()
        db.query(VirtualAssessment).filter(VirtualAssessment.student_id == user.id).delete()
        db.query(Booking).filter(Booking.user_id == user.id).delete()

        plans = db.query(TrainingPlan).filter(TrainingPlan.student_id == user.id).all()
        for plan in plans:
            db.delete(plan)

    db.delete(user)
    db.commit()
    return {"message": "User deleted"}

@router.get("/coaches", response_model=List[UserResponse])
async def get_coaches(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    coaches = db.query(User).filter(User.role == "coach").all()
    return coaches
