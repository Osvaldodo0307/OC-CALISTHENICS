from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from datetime import datetime, timedelta
from app.database import get_db
from app.auth import get_current_admin, get_current_user
from app.schemas import MembershipResponse, MembershipBase, MembershipCreate
from app.models import Membership, User

router = APIRouter(prefix="/membership", tags=["membership"])

@router.post("/", response_model=MembershipResponse)
async def create_membership(
    membership_data: MembershipCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin)
):
    # Verificar que el usuario existe y es socio
    user = db.query(User).filter(User.id == membership_data.user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    if user.role != "socio":
        raise HTTPException(status_code=400, detail="User must be a socio to have membership")
    
    # Verificar si ya tiene membresía
    existing = db.query(Membership).filter(Membership.user_id == membership_data.user_id).first()
    if existing:
        raise HTTPException(status_code=400, detail="User already has a membership")
    
    # Crear membresía
    expires_at = membership_data.expires_at
    if not expires_at:
        expires_at = datetime.now() + timedelta(days=30)
    
    membership = Membership(
        user_id=membership_data.user_id,
        status=membership_data.status,
        plan=membership_data.plan,
        expires_at=expires_at
    )
    db.add(membership)
    db.commit()
    db.refresh(membership)
    return membership

@router.get("/me", response_model=MembershipResponse)
async def get_my_membership(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    membership = db.query(Membership).filter(Membership.user_id == current_user.id).first()
    if not membership:
        raise HTTPException(status_code=404, detail="No membership found")
    return membership

@router.put("/{user_id}/renew", response_model=MembershipResponse)
async def renew_membership(
    user_id: int,
    membership_data: MembershipBase,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin)
):
    membership = db.query(Membership).filter(Membership.user_id == user_id).first()
    if not membership:
        raise HTTPException(status_code=404, detail="Membership not found")

    membership.status = membership_data.status
    membership.plan = membership_data.plan
    membership.expires_at = membership_data.expires_at
    db.commit()
    db.refresh(membership)
    return membership

@router.put("/{user_id}/deactivate", response_model=MembershipResponse)
async def deactivate_membership(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin)
):
    membership = db.query(Membership).filter(Membership.user_id == user_id).first()
    if not membership:
        raise HTTPException(status_code=404, detail="Membership not found")

    membership.status = "expired"
    db.commit()
    db.refresh(membership)
    return membership
