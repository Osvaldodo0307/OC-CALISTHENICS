from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from datetime import date, timedelta
import random
from typing import List
from app.database import get_db
from app.auth import get_current_coach, get_current_user
from app.models import VirtualAssessment, TrainingPlan, TrainingPlanItem, CoachStudent, User, Exercise
from app.schemas import RoutineGenerationRequest
from app.ai_routine_generator import generate_routine_ai

router = APIRouter(prefix="/routines", tags=["routines"])

@router.post("/generate")
async def generate_routine_direct(
    student_id: int,
    goal: str,
    level: str,
    days_per_week: int,
    session_minutes: int,
    preference: str = "calistenia",
    equipment_json: dict = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Verificar que el estudiante está asignado
    assignment = db.query(CoachStudent).filter(
        CoachStudent.coach_id == current_user.id,
        CoachStudent.student_id == student_id
    ).first()
    if not assignment:
        raise HTTPException(status_code=403, detail="Student not assigned to you")
    
    assessment_data = {
        "goal": goal,
        "level": level,
        "days_per_week": days_per_week,
        "session_minutes": session_minutes,
        "equipment_json": equipment_json or {},
        "preference": preference
    }
    
    routine_data = generate_routine_ai(assessment_data)
    
    start_date = date.today()
    end_date = start_date + timedelta(days=28)
    
    plan = TrainingPlan(
        student_id=student_id,
        coach_id=current_user.id,
        title=routine_data["title"],
        start_date=start_date,
        end_date=end_date,
        goal=routine_data["goal"],
        source="ai"
    )
    db.add(plan)
    db.commit()
    db.refresh(plan)
    
    for item_data in routine_data["items"]:
        plan_item = TrainingPlanItem(
            plan_id=plan.id,
            week_number=item_data["week_number"],
            day_label=item_data["day_label"],
            warmup=item_data["warmup"],
            main=item_data["main"],
            accessories=item_data["accessories"],
            cooldown=item_data["cooldown"],
            notes=item_data.get("notes")
        )
        db.add(plan_item)
    
    db.commit()
    
    return {
        "message": "Plan generated successfully",
        "plan_id": plan.id,
        "title": plan.title
    }

def generate_routine_from_exercises(
    categories: List[str],
    level: int,
    days_per_week: int,
    weeks: int,
    db: Session
) -> dict:
    """Genera una rutina basada en ejercicios de la base de datos"""
    # Obtener ejercicios para cada categoría y nivel
    exercises_by_category = {}
    for category in categories:
        exercises = db.query(Exercise).filter(
            Exercise.category == category,
            Exercise.level == level
        ).all()
        if not exercises:
            # Retornar None para indicar error, el endpoint lo manejará
            return None
        exercises_by_category[category] = [ex.name for ex in exercises]
    
    # Nombres de días
    days = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"]
    
    # Generar rutina
    items = []
    day_index = 0
    
    for week in range(1, weeks + 1):
        # Seleccionar días de entrenamiento para esta semana
        training_days = random.sample(range(7), min(days_per_week, 7))
        
        for day_num in training_days:
            day_label = days[day_num]
            
            # Seleccionar ejercicios aleatorios de cada categoría
            main_exercises = []
            for category in categories:
                category_exercises = exercises_by_category[category]
                # Seleccionar 2-3 ejercicios por categoría
                num_exercises = random.randint(2, min(3, len(category_exercises)))
                selected = random.sample(category_exercises, num_exercises)
                main_exercises.extend(selected)
            
            # Formatear ejercicios principales
            main_text = "\n".join([f"• {ex}" for ex in main_exercises])
            
            # Warmup básico
            warmup = "• Movilidad articular (5 min)\n• Activación general (5 min)"
            
            # Accessories (ejercicios complementarios)
            accessories = "• Estiramientos activos\n• Movilidad específica"
            
            # Cooldown
            cooldown = "• Estiramientos estáticos (10 min)\n• Respiración y relajación"
            
            items.append({
                "week_number": week,
                "day_label": day_label,
                "warmup": warmup,
                "main": main_text,
                "accessories": accessories,
                "cooldown": cooldown,
                "notes": f"Rutina {category} - Nivel {level}"
            })
    
    # Crear título
    category_names = {
        "T.S.E": "Tren Superior Empuje",
        "T.S.J": "Tren Superior Jalón",
        "T.I": "Tren Inferior",
        "CORE": "Core"
    }
    level_names = {
        1: "Principiante",
        2: "Intermedio",
        3: "Avanzado",
        4: "Elite",
        5: "OC"
    }
    
    category_display = " + ".join([category_names.get(cat, cat) for cat in categories])
    title = f"Rutina {category_display} - {level_names.get(level, f'Nivel {level}')}"
    
    return {
        "title": title,
        "goal": f"Entrenamiento enfocado en {category_display} para nivel {level_names.get(level, level)}",
        "items": items
    }

@router.post("/generate-from-exercises")
async def generate_routine_from_exercises_endpoint(
    request: RoutineGenerationRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Genera una rutina basada en ejercicios de la base de datos según categorías y nivel"""
    # Verificar que el usuario es coach
    if current_user.role != "coach":
        raise HTTPException(status_code=403, detail="Solo los coaches pueden generar rutinas")
    
    # Verificar que el estudiante está asignado
    assignment = db.query(CoachStudent).filter(
        CoachStudent.coach_id == current_user.id,
        CoachStudent.student_id == request.student_id
    ).first()
    if not assignment:
        raise HTTPException(status_code=403, detail="Estudiante no asignado a ti")
    
    # Validar categorías
    valid_categories = ['T.S.E', 'T.S.J', 'T.I', 'CORE']
    for cat in request.categories:
        if cat not in valid_categories:
            raise HTTPException(
                status_code=400,
                detail=f"Categoría inválida: {cat}. Debe ser una de: {valid_categories}"
            )
    
    # Validar nivel
    if request.level < 1 or request.level > 5:
        raise HTTPException(status_code=400, detail="El nivel debe estar entre 1 y 5")
    
    # Generar rutina
    routine_data = generate_routine_from_exercises(
        request.categories,
        request.level,
        request.days_per_week,
        request.weeks,
        db
    )
    
    if routine_data is None:
        raise HTTPException(
            status_code=404,
            detail=f"No se encontraron ejercicios para las categorías seleccionadas y nivel {request.level}"
        )
    
    # Crear plan de entrenamiento
    start_date = date.today()
    end_date = start_date + timedelta(days=request.weeks * 7)
    
    plan = TrainingPlan(
        student_id=request.student_id,
        coach_id=current_user.id,
        title=routine_data["title"],
        start_date=start_date,
        end_date=end_date,
        goal=routine_data["goal"],
        source="exercise_based"
    )
    db.add(plan)
    db.commit()
    db.refresh(plan)
    
    # Agregar items del plan
    for item_data in routine_data["items"]:
        plan_item = TrainingPlanItem(
            plan_id=plan.id,
            week_number=item_data["week_number"],
            day_label=item_data["day_label"],
            warmup=item_data["warmup"],
            main=item_data["main"],
            accessories=item_data["accessories"],
            cooldown=item_data["cooldown"],
            notes=item_data.get("notes")
        )
        db.add(plan_item)
    
    db.commit()
    
    return {
        "message": "Rutina generada exitosamente",
        "plan_id": plan.id,
        "title": plan.title
    }
