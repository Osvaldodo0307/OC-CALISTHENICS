"""
Security utilities for password hashing and JWT token management
"""
from datetime import datetime, timedelta
from typing import Optional
from jose import JWTError, jwt
from passlib.context import CryptContext
import os
from dotenv import load_dotenv

load_dotenv()

# JWT Configuration
JWT_SECRET = os.getenv("JWT_SECRET", os.getenv("SECRET_KEY", "your-secret-key-change-in-production"))
JWT_ALGORITHM = os.getenv("JWT_ALGORITHM", os.getenv("ALGORITHM", "HS256"))
JWT_EXPIRES_MINUTES = int(os.getenv("JWT_EXPIRES_MINUTES", os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "1440")))

# Password hashing context - using bcrypt with fallback to pbkdf2_sha256
# Try bcrypt first, fallback to pbkdf2_sha256 if bcrypt has issues
try:
    pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
    # Test bcrypt to see if it works
    test_hash = pwd_context.hash("test")
    pwd_context.verify("test", test_hash)
except Exception:
    # Fallback to pbkdf2_sha256 if bcrypt fails
    pwd_context = CryptContext(schemes=["pbkdf2_sha256"], deprecated="auto")


def hash_password(password: str) -> str:
    """
    Hash a password using bcrypt
    
    Args:
        password: Plain text password
        
    Returns:
        Hashed password string
    """
    return pwd_context.hash(password)


def verify_password(plain: str, hashed: str) -> bool:
    """
    Verify a plain password against a hashed password
    
    Args:
        plain: Plain text password
        hashed: Hashed password string
        
    Returns:
        True if password matches, False otherwise
    """
    return pwd_context.verify(plain, hashed)


def create_access_token(data: dict, expires_minutes: int = None) -> str:
    """
    Create a JWT access token
    
    Args:
        data: Dictionary containing token payload (typically includes 'sub' for username and 'role')
        expires_minutes: Optional expiration time in minutes. Defaults to JWT_EXPIRES_MINUTES
        
    Returns:
        Encoded JWT token string
    """
    to_encode = data.copy()
    if expires_minutes is None:
        expires_minutes = JWT_EXPIRES_MINUTES
    
    expire = datetime.utcnow() + timedelta(minutes=expires_minutes)
    to_encode.update({"exp": expire})
    
    encoded_jwt = jwt.encode(to_encode, JWT_SECRET, algorithm=JWT_ALGORITHM)
    return encoded_jwt


def decode_access_token(token: str) -> Optional[dict]:
    """
    Decode and verify a JWT token
    
    Args:
        token: JWT token string
        
    Returns:
        Decoded token payload or None if invalid
    """
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        return payload
    except JWTError:
        return None
