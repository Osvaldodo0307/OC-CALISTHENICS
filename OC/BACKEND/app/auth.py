from datetime import timedelta
from typing import Optional
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import User
from app.core.security import hash_password as _hash_password, verify_password as _verify_password, create_access_token as _create_access_token

# Keep oauth2_scheme for backward compatibility
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/login")

# Re-export for backward compatibility
get_password_hash = _hash_password
verify_password = _verify_password

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    """Wrapper for backward compatibility"""
    if expires_delta:
        expires_minutes = int(expires_delta.total_seconds() / 60)
    else:
        expires_minutes = None
    return _create_access_token(data, expires_minutes)

def get_user_by_username(db: Session, username: str) -> Optional[User]:
    return db.query(User).filter(User.username == username).first()

def authenticate_user(db: Session, username: str, password: str) -> Optional[User]:
    user = get_user_by_username(db, username)
    if not user:
        return None
    if not user.is_active:
        return None
    if not verify_password(password, user.password_hash):
        return None
    return user

async def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)) -> User:
    """
    Get current user from JWT token
    """
    from app.core.security import decode_access_token
    from jose import JWTError
    
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    payload = decode_access_token(token)
    if payload is None:
        raise credentials_exception
    
    username: str = payload.get("sub")
    if username is None:
        raise credentials_exception
    
    user = get_user_by_username(db, username=username)
    if user is None:
        raise credentials_exception
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Usuario inactivo",
        )
    
    return user

async def get_current_admin(current_user: User = Depends(get_current_user)) -> User:
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Not enough permissions")
    return current_user

async def get_current_coach(current_user: User = Depends(get_current_user)) -> User:
    if current_user.role != "coach":
        raise HTTPException(status_code=403, detail="Not enough permissions")
    return current_user

async def get_current_socio(current_user: User = Depends(get_current_user)) -> User:
    if current_user.role != "socio":
        raise HTTPException(status_code=403, detail="Not enough permissions")
    return current_user
