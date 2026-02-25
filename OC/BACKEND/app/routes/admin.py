from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Query, status
from sqlalchemy.orm import Session
from typing import List, Dict
from sqlalchemy import func
from datetime import date, datetime, timedelta
from calendar import monthrange
import pandas as pd
import io
from app.database import get_db
from app.auth import get_current_admin, get_password_hash
from app.schemas import UserResponse, UserCreate
from app.models import (
    User, CoachStudent, Membership, ProgressEntry, Booking, ClassSession,
    TrainingPlan, VirtualAssessment, Exercise
)
from app.utils.timezone import parse_yyyy_mm_dd

router = APIRouter(prefix="/admin", tags=["admin"], include_in_schema=True)


@router.get("/attendance")
async def get_attendance_history(
    from_date: str = Query(..., alias="from", description="Fecha inicio YYYY-MM-DD"),
    to_date: str = Query(..., alias="to", description="Fecha fin YYYY-MM-DD"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin)
):
    try:
        parsed_from = parse_yyyy_mm_dd(from_date)
        parsed_to = parse_yyyy_mm_dd(to_date)
    except ValueError:
        raise HTTPException(status_code=400, detail="Formato de fecha invalido. Usa YYYY-MM-DD")

    if parsed_to < parsed_from:
        raise HTTPException(status_code=400, detail="El rango de fechas es invalido")

    start_dt = datetime.combine(parsed_from, datetime.min.time())
    end_dt = datetime.combine(parsed_to, datetime.max.time())

    rows = db.query(Booking, ClassSession, User).join(
        ClassSession, Booking.class_id == ClassSession.id
    ).join(
        User, Booking.user_id == User.id
    ).filter(
        Booking.status == "booked",
        ClassSession.start_datetime >= start_dt,
        ClassSession.start_datetime <= end_dt
    ).order_by(
        ClassSession.start_datetime.asc(),
        User.name.asc()
    ).all()

    users_map: Dict[int, Dict] = {}
    day_totals: Dict[str, int] = {}

    for booking, cls, user in rows:
        day_key = cls.start_datetime.date().isoformat()
        hour_label = f"{booking.preferred_hour:02d}:00" if booking.preferred_hour is not None else cls.start_datetime.strftime("%H:%M")

        day_totals[day_key] = day_totals.get(day_key, 0) + 1

        if user.id not in users_map:
            users_map[user.id] = {
                "user_id": user.id,
                "name": user.name,
                "username": user.username,
                "total": 0,
                "by_day": {},
                "records": []
            }

        users_map[user.id]["total"] += 1
        users_map[user.id]["by_day"][day_key] = users_map[user.id]["by_day"].get(day_key, 0) + 1
        users_map[user.id]["records"].append({
            "booking_id": booking.id,
            "date": day_key,
            "class_id": cls.id,
            "class_title": cls.title,
            "discipline": cls.discipline,
            "attendance_hour": hour_label,
            "preferred_hour": booking.preferred_hour
        })

    return {
        "from": parsed_from.isoformat(),
        "to": parsed_to.isoformat(),
        "total_records": len(rows),
        "daily_totals": [
            {"date": day, "count": count}
            for day, count in sorted(day_totals.items())
        ],
        "students": sorted(users_map.values(), key=lambda row: (-row["total"], row["name"]))
    }


@router.get("/attendance/summary")
async def get_attendance_summary_by_month(
    month: str = Query(..., description="Mes en formato YYYY-MM"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin)
):
    try:
        year, month_number = month.split("-")
        parsed_year = int(year)
        parsed_month = int(month_number)
        if parsed_month < 1 or parsed_month > 12:
            raise ValueError
    except ValueError:
        raise HTTPException(status_code=400, detail="Formato inválido. Usa YYYY-MM")

    first_day = date(parsed_year, parsed_month, 1)
    last_day = date(parsed_year, parsed_month, monthrange(parsed_year, parsed_month)[1])

    start_dt = datetime.combine(first_day, datetime.min.time())
    end_dt = datetime.combine(last_day, datetime.max.time())

    rows = db.query(Booking, ClassSession, User).join(
        ClassSession, Booking.class_id == ClassSession.id
    ).join(
        User, Booking.user_id == User.id
    ).filter(
        Booking.status == "booked",
        ClassSession.start_datetime >= start_dt,
        ClassSession.start_datetime <= end_dt
    ).order_by(
        ClassSession.start_datetime.asc(),
        User.name.asc()
    ).all()

    users_map: Dict[int, Dict] = {}
    day_totals: Dict[str, int] = {}
    discipline_totals: Dict[str, int] = {}

    for booking, cls, user in rows:
        day_key = cls.start_datetime.date().isoformat()
        hour_label = f"{booking.preferred_hour:02d}:00" if booking.preferred_hour is not None else cls.start_datetime.strftime("%H:%M")

        day_totals[day_key] = day_totals.get(day_key, 0) + 1
        discipline_totals[cls.discipline] = discipline_totals.get(cls.discipline, 0) + 1

        if user.id not in users_map:
            users_map[user.id] = {
                "user_id": user.id,
                "name": user.name,
                "username": user.username,
                "total": 0,
                "by_day": {},
                "records": []
            }

        users_map[user.id]["total"] += 1
        users_map[user.id]["by_day"][day_key] = users_map[user.id]["by_day"].get(day_key, 0) + 1
        users_map[user.id]["records"].append({
            "booking_id": booking.id,
            "date": day_key,
            "class_id": cls.id,
            "class_title": cls.title,
            "discipline": cls.discipline,
            "attendance_hour": hour_label,
            "preferred_hour": booking.preferred_hour
        })

    return {
        "month": month,
        "from": first_day.isoformat(),
        "to": last_day.isoformat(),
        "total_records": len(rows),
        "daily_totals": [
            {"date": day, "count": count}
            for day, count in sorted(day_totals.items())
        ],
        "discipline_totals": [
            {"discipline": discipline, "count": count}
            for discipline, count in sorted(discipline_totals.items(), key=lambda row: row[1], reverse=True)
        ],
        "students": sorted(users_map.values(), key=lambda row: (-row["total"], row["name"]))
    }

@router.get("/coaches-info")
async def get_coaches_info(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin)
):
    """Obtener información detallada de todos los coaches"""
    coaches = db.query(User).filter(User.role == "coach").all()
    
    coaches_info = []
    for coach in coaches:
        # Alumnos asignados
        assignments = db.query(CoachStudent).filter(CoachStudent.coach_id == coach.id).all()
        student_ids = [a.student_id for a in assignments]
        students_count = len(student_ids)
        
        # Progresos registrados por este coach
        progress_count = db.query(ProgressEntry).filter(
            ProgressEntry.coach_id == coach.id
        ).count()
        
        # Obtener nombres de alumnos
        students = db.query(User).filter(User.id.in_(student_ids)).all() if student_ids else []
        
        coaches_info.append({
            "id": coach.id,
            "name": coach.name,
            "username": coach.username,
            "phone": coach.phone,
            "created_at": coach.created_at.isoformat() if coach.created_at else None,
            "students_count": students_count,
            "progress_entries_count": progress_count,
            "students": [
                {
                    "id": s.id,
                    "name": s.name,
                    "username": s.username
                }
                for s in students
            ]
        })
    
    return coaches_info

@router.get("/students-info")
async def get_students_info(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin)
):
    """Obtener información detallada de todos los alumnos"""
    students = db.query(User).filter(User.role == "socio").all()
    
    students_info = []
    for student in students:
        # Membresía
        membership = db.query(Membership).filter(Membership.user_id == student.id).first()
        
        # Coach asignado
        assignment = db.query(CoachStudent).filter(
            CoachStudent.student_id == student.id
        ).first()
        coach = None
        if assignment:
            coach = db.query(User).filter(User.id == assignment.coach_id).first()
        
        # Progresos
        progress_count = db.query(ProgressEntry).filter(
            ProgressEntry.student_id == student.id
        ).count()
        
        # Reservas activas
        active_bookings = db.query(Booking).filter(
            Booking.user_id == student.id,
            Booking.status == "booked"
        ).count()
        
        # Último progreso
        last_progress = db.query(ProgressEntry).filter(
            ProgressEntry.student_id == student.id
        ).order_by(ProgressEntry.date.desc()).first()
        
        students_info.append({
            "id": student.id,
            "name": student.name,
            "username": student.username,
            "phone": student.phone,
            "created_at": student.created_at.isoformat() if student.created_at else None,
            "membership": {
                "status": membership.status,
                "plan": membership.plan,
                "expires_at": membership.expires_at.isoformat() if membership.expires_at else None
            } if membership else None,
            "coach": {
                "id": coach.id,
                "name": coach.name,
                "username": coach.username
            } if coach else None,
            "progress_count": progress_count,
            "active_bookings": active_bookings,
            "last_progress": {
                "date": last_progress.date.isoformat(),
                "metric_type": last_progress.metric_type,
                "value": last_progress.value
            } if last_progress else None
        })
    
    return students_info

@router.get("/coach/{coach_id}/details")
async def get_coach_details(
    coach_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin)
):
    """Obtener detalles completos de un coach específico"""
    coach = db.query(User).filter(User.id == coach_id, User.role == "coach").first()
    if not coach:
        raise HTTPException(status_code=404, detail="Coach not found")
    
    # Alumnos asignados
    assignments = db.query(CoachStudent).filter(CoachStudent.coach_id == coach_id).all()
    student_ids = [a.student_id for a in assignments]
    students = db.query(User).filter(User.id.in_(student_ids)).all() if student_ids else []
    
    # Progresos
    progress_entries = db.query(ProgressEntry).filter(
        ProgressEntry.coach_id == coach_id
    ).count()
    
    # Información de alumnos con membresía
    students_info = []
    for student in students:
        membership = db.query(Membership).filter(Membership.user_id == student.id).first()
        progress_count = db.query(ProgressEntry).filter(
            ProgressEntry.student_id == student.id
        ).count()
        last_progress = db.query(ProgressEntry).filter(
            ProgressEntry.student_id == student.id
        ).order_by(ProgressEntry.date.desc()).first()
        
        students_info.append({
            "id": student.id,
            "name": student.name,
            "username": student.username,
            "membership_status": membership.status if membership else None,
            "progress_count": progress_count,
            "last_progress_date": last_progress.date.isoformat() if last_progress else None
        })
    
    return {
        "coach": {
            "id": coach.id,
            "name": coach.name,
            "username": coach.username,
            "phone": coach.phone
        },
        "statistics": {
            "total_students": len(students),
            "total_progress_entries": progress_entries
        },
        "students": students_info
    }

@router.get("/student/{student_id}/details")
async def get_student_details(
    student_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin)
):
    """Obtener detalles completos de un alumno específico"""
    student = db.query(User).filter(User.id == student_id, User.role == "socio").first()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")
    
    # Membresía
    membership = db.query(Membership).filter(Membership.user_id == student_id).first()
    
    # Coach asignado
    assignment = db.query(CoachStudent).filter(
        CoachStudent.student_id == student_id
    ).first()
    coach = None
    if assignment:
        coach = db.query(User).filter(User.id == assignment.coach_id).first()
    
    # Progresos
    progress_entries = db.query(ProgressEntry).filter(
        ProgressEntry.student_id == student_id
    ).order_by(ProgressEntry.date.desc()).limit(10).all()
    
    # Reservas
    bookings = db.query(Booking).filter(
        Booking.user_id == student_id
    ).order_by(Booking.created_at.desc()).limit(10).all()
    
    # Clases reservadas
    class_ids = [b.class_id for b in bookings]
    classes = db.query(ClassSession).filter(ClassSession.id.in_(class_ids)).all() if class_ids else []
    classes_map = {c.id: c for c in classes}
    
    return {
        "student": {
            "id": student.id,
            "name": student.name,
            "username": student.username,
            "phone": student.phone,
            "created_at": student.created_at.isoformat() if student.created_at else None
        },
        "membership": {
            "status": membership.status,
            "plan": membership.plan,
            "expires_at": membership.expires_at.isoformat() if membership.expires_at else None,
            "created_at": membership.created_at.isoformat() if membership.created_at else None
        } if membership else None,
        "coach": {
            "id": coach.id,
            "name": coach.name,
            "username": coach.username
        } if coach else None,
        "recent_progress": [
            {
                "id": p.id,
                "date": p.date.isoformat(),
                "metric_type": p.metric_type,
                "value": p.value,
                "notes": p.notes
            }
            for p in progress_entries
        ],
        "recent_bookings": [
            {
                "id": b.id,
                "class_title": classes_map[b.class_id].title if b.class_id in classes_map else "N/A",
                "class_datetime": classes_map[b.class_id].start_datetime.isoformat() if b.class_id in classes_map and classes_map[b.class_id].start_datetime else None,
                "attendance_hour": (
                    f"{b.preferred_hour:02d}:00"
                    if b.preferred_hour is not None
                    else (
                        classes_map[b.class_id].start_datetime.strftime("%H:%M")
                        if b.class_id in classes_map and classes_map[b.class_id].start_datetime
                        else None
                    )
                ),
                "preferred_hour": b.preferred_hour,
                "status": b.status,
                "created_at": b.created_at.isoformat() if b.created_at else None
            }
            for b in bookings
        ],
        "statistics": {
            "total_progress_entries": db.query(ProgressEntry).filter(
                ProgressEntry.student_id == student_id
            ).count(),
            "total_bookings": db.query(Booking).filter(
                Booking.user_id == student_id
            ).count(),
            "active_bookings": db.query(Booking).filter(
                Booking.user_id == student_id,
                Booking.status == "booked"
            ).count()
        }
    }

@router.post("/import-exercises")
async def import_exercises_from_excel(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin)
):
    """Importa ejercicios desde un archivo Excel"""
    try:
        # Leer el archivo Excel
        contents = await file.read()
        df = pd.read_excel(io.BytesIO(contents))
        
        # Limpiar datos
        df = df.dropna(subset=['Ejercicio', 'ID_GRUPO', 'ID_NIVEL'])
        
        imported = 0
        skipped = 0
        errors = []
        
        for _, row in df.iterrows():
            try:
                exercise_name = str(row['Ejercicio']).strip()
                category = str(row['ID_GRUPO']).strip()
                level = int(row['ID_NIVEL'])
                
                # Validar categoría
                valid_categories = ['T.S.E', 'T.S.J', 'T.I', 'CORE']
                if category not in valid_categories:
                    errors.append(f"Categoría inválida '{category}' para ejercicio '{exercise_name}'")
                    skipped += 1
                    continue
                
                # Validar nivel
                if level < 1 or level > 5:
                    errors.append(f"Nivel inválido '{level}' para ejercicio '{exercise_name}'")
                    skipped += 1
                    continue
                
                # Verificar si ya existe
                existing = db.query(Exercise).filter(
                    Exercise.name == exercise_name,
                    Exercise.category == category,
                    Exercise.level == level
                ).first()
                
                if existing:
                    skipped += 1
                    continue
                
                # Crear nuevo ejercicio
                exercise = Exercise(
                    name=exercise_name,
                    category=category,
                    level=level
                )
                db.add(exercise)
                imported += 1
            except Exception as e:
                errors.append(f"Error procesando fila: {str(e)}")
                skipped += 1
                continue
        
        db.commit()
        total = db.query(Exercise).count()
        
        return {
            "message": "Importación completada",
            "imported": imported,
            "skipped": skipped,
            "total_in_database": total,
            "errors": errors[:10]  # Solo los primeros 10 errores
        }
        
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=400, detail=f"Error al importar ejercicios: {str(e)}")


@router.post("/users", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def create_user(
    user_data: UserCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin)
):
    """
    Create a new user (admin, coach, or socio)
    Only admins can create users.
    
    Body example:
    {
        "username": "coach_1",
        "name": "Coach 1",
        "password": "Coach2026!",
        "role": "coach",
        "phone": "5512345678"
    }
    """
    # Validate role
    if user_data.role not in ["admin", "coach", "socio"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid role. Must be 'admin', 'coach', or 'socio'"
        )
    
    # Check if username already exists
    existing_user = db.query(User).filter(User.username == user_data.username).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Username already registered"
        )
    
    # Create user
    db_user = User(
        username=user_data.username,
        name=user_data.name,
        password_hash=get_password_hash(user_data.password),
        role=user_data.role,
        phone=user_data.phone
    )
    
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    
    return db_user


@router.post("/assign-coach", status_code=status.HTTP_201_CREATED)
async def assign_coach_to_student(
    assignment_data: Dict[str, int],
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin)
):
    """
    Assign a coach to a student (socio)
    Only admins can assign coaches.
    
    Body:
    {
        "coach_id": 2,
        "student_id": 5
    }
    """
    coach_id = assignment_data.get("coach_id")
    student_id = assignment_data.get("student_id")
    
    if not coach_id or not student_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="coach_id and student_id are required"
        )
    
    # Verify coach exists and is a coach
    coach = db.query(User).filter(User.id == coach_id, User.role == "coach").first()
    if not coach:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Coach not found"
        )
    
    # Verify student exists and is a socio
    student = db.query(User).filter(User.id == student_id, User.role == "socio").first()
    if not student:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Student not found"
        )
    
    # Check if assignment already exists
    existing = db.query(CoachStudent).filter(
        CoachStudent.coach_id == coach_id,
        CoachStudent.student_id == student_id
    ).first()
    
    if existing:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Coach already assigned to this student"
        )
    
    # Create assignment
    assignment = CoachStudent(
        coach_id=coach_id,
        student_id=student_id
    )
    
    db.add(assignment)
    db.commit()
    db.refresh(assignment)
    
    return {
        "id": assignment.id,
        "coach_id": assignment.coach_id,
        "student_id": assignment.student_id,
        "assigned_at": assignment.assigned_at.isoformat() if assignment.assigned_at else None,
        "message": "Coach assigned successfully"
    }
