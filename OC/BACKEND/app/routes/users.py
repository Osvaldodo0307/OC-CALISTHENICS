from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime, timedelta
import re
from app.database import get_db
from app.auth import get_current_admin, get_current_user
from app.schemas import UserResponse, UserCreate, UserUpdate
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
GYM_CODE_REGEX = re.compile(r"^[a-zA-Z0-9]{2,}$")

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
    if user.gym_code and not GYM_CODE_REGEX.match(user.gym_code):
        raise HTTPException(status_code=400, detail="El código debe ser alfanumérico y mínimo de 2 caracteres")

    db_user = db.query(User).filter(User.username == user.username).first()
    if db_user:
        raise HTTPException(status_code=400, detail="Username already registered")

    if user.gym_code:
        existing_code = db.query(User).filter(User.gym_code == user.gym_code).first()
        if existing_code:
            raise HTTPException(status_code=409, detail="El código ya está registrado")

    hashed_password = get_password_hash(user.password)
    db_user = User(
        username=user.username,
        gym_code=user.gym_code,
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


@router.put("/{user_id}", response_model=UserResponse)
async def update_user(
    user_id: int,
    payload: UserUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin)
):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    if payload.role and payload.role not in {"admin", "coach", "socio"}:
        raise HTTPException(status_code=400, detail="Invalid role. Must be 'admin', 'coach', or 'socio'")

    if payload.username and payload.username != user.username:
        exists_username = db.query(User).filter(User.username == payload.username).first()
        if exists_username:
            raise HTTPException(status_code=409, detail="Username already registered")
        user.username = payload.username

    if payload.gym_code is not None:
        gym_code = payload.gym_code.strip() or None
        if gym_code and not GYM_CODE_REGEX.match(gym_code):
            raise HTTPException(status_code=400, detail="El código debe ser alfanumérico y mínimo de 2 caracteres")
        if gym_code:
            exists_code = db.query(User).filter(User.gym_code == gym_code, User.id != user_id).first()
            if exists_code:
                raise HTTPException(status_code=409, detail="El código ya está registrado")
        user.gym_code = gym_code

    if payload.name is not None:
        user.name = payload.name
    if payload.role is not None:
        user.role = payload.role
    if payload.phone is not None:
        user.phone = payload.phone

    db.commit()
    db.refresh(user)
    return user

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
