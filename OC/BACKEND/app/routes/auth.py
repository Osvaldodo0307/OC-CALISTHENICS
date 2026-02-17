from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from datetime import timedelta
from app.database import get_db
from app.auth import authenticate_user, create_access_token, get_current_user
from app.schemas import Token, UserResponse
from app.models import User
from typing import Dict, Any

router = APIRouter(prefix="/auth", tags=["auth"])

@router.post("/login")
async def login(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db)
) -> Dict[str, Any]:
    """
    Login endpoint
    
    Returns:
        {
            "access_token": "...",
            "token_type": "bearer",
            "user": {
                "id": 1,
                "username": "...",
                "name": "...",
                "role": "admin|coach|socio",
                "phone": "...",
                "created_at": "..."
            }
        }
    """
    user = authenticate_user(db, form_data.username, form_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    from app.core.security import create_access_token as create_token
    access_token = create_token(
        data={"sub": user.username, "role": user.role},
        expires_minutes=1440
    )
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": {
            "id": user.id,
            "username": user.username,
            "name": user.name,
            "role": user.role,
            "phone": user.phone,
            "created_at": user.created_at.isoformat() if user.created_at else None
        }
    }

@router.get("/me", response_model=UserResponse)
async def read_users_me(current_user: User = Depends(get_current_user)):
    """
    Get current authenticated user
    """
    return current_user
