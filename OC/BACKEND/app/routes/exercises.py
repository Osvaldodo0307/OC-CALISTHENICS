from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from app.database import get_db
from app.auth import get_current_user
from app.schemas import ExerciseResponse
from app.models import Exercise, User

router = APIRouter(prefix="/exercises", tags=["exercises"])

@router.get("/", response_model=List[ExerciseResponse])
async def get_exercises(
    category: Optional[str] = Query(None, description="Filtrar por categoría: T.S.E, T.S.J, T.I, CORE"),
    level: Optional[int] = Query(None, ge=1, le=5, description="Filtrar por nivel: 1-5"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Obtener ejercicios, opcionalmente filtrados por categoría y/o nivel"""
    query = db.query(Exercise)
    
    if category:
        valid_categories = ['T.S.E', 'T.S.J', 'T.I', 'CORE']
        if category not in valid_categories:
            raise HTTPException(status_code=400, detail=f"Categoría inválida. Debe ser una de: {valid_categories}")
        query = query.filter(Exercise.category == category)
    
    if level is not None:
        query = query.filter(Exercise.level == level)
    
    exercises = query.order_by(Exercise.category, Exercise.level, Exercise.name).all()
    return exercises

@router.get("/categories", response_model=List[str])
async def get_categories(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Obtener lista de categorías disponibles"""
    categories = db.query(Exercise.category).distinct().all()
    return [cat[0] for cat in categories]

@router.get("/levels", response_model=List[int])
async def get_levels(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Obtener lista de niveles disponibles"""
    levels = db.query(Exercise.level).distinct().order_by(Exercise.level).all()
    return [level[0] for level in levels]
