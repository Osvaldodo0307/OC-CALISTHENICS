from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import func, and_
from datetime import datetime, timedelta, date
from typing import List, Optional
from app.database import get_db
from app.auth import get_current_admin, get_current_coach, get_current_user
from app.schemas import DashboardStats, BookingChartData, ClassPopularityData
from app.models import Membership, Booking, ClassSession, User, CoachStudent, ProgressEntry
from app.utils.timezone import mx_now, mx_today, parse_yyyy_mm_dd

DAYS_ES = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"]

router = APIRouter(prefix="/dashboard", tags=["dashboard"])

@router.get("/admin", response_model=DashboardStats)
async def get_admin_dashboard(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin)
):
    # KPIs
    active_members = db.query(Membership).filter(Membership.status == "active").count()
    expired_members = db.query(Membership).filter(Membership.status == "expired").count()
    
    today = mx_today()
    bookings_today = db.query(Booking).filter(
        func.date(Booking.created_at) == today,
        Booking.status == "booked"
    ).count()
    
    # Ocupación promedio (últimos 7 días)
    week_ago = mx_now().replace(tzinfo=None) - timedelta(days=7)
    total_capacity = db.query(func.sum(ClassSession.capacity)).filter(
        ClassSession.start_datetime >= week_ago
    ).scalar() or 0
    total_bookings = db.query(Booking).filter(
        Booking.created_at >= week_ago,
        Booking.status == "booked"
    ).count()
    avg_occupancy = (total_bookings / total_capacity * 100) if total_capacity > 0 else 0
    
    # Tasa de cancelación
    total_bookings_all = db.query(Booking).count()
    canceled_bookings = db.query(Booking).filter(Booking.status == "canceled").count()
    cancellation_rate = (canceled_bookings / total_bookings_all * 100) if total_bookings_all > 0 else 0
    
    return DashboardStats(
        active_members=active_members,
        expired_members=expired_members,
        bookings_today=bookings_today,
        avg_occupancy=round(avg_occupancy, 2),
        cancellation_rate=round(cancellation_rate, 2)
    )

@router.get("/admin/bookings-chart", response_model=BookingChartData)
async def get_bookings_chart(
    period: str = "week",  # week, month
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin)
):
    if period == "week":
        days = 7
        now = mx_now().replace(tzinfo=None)
        start_date = now - timedelta(days=days)
        labels = [(now - timedelta(days=i)).strftime("%d/%m") for i in range(days-1, -1, -1)]
    else:
        days = 30
        now = mx_now().replace(tzinfo=None)
        start_date = now - timedelta(days=days)
        labels = [(now - timedelta(days=i)).strftime("%d/%m") for i in range(days-1, -1, -1)]
    
    data = []
    for i in range(days):
        now = mx_now().replace(tzinfo=None)
        day_start = (now - timedelta(days=days-i-1)).date()
        day_end = (now - timedelta(days=days-i-2)).date() if i < days-1 else now.date()
        count = db.query(Booking).filter(
            and_(
                func.date(Booking.created_at) >= day_start,
                func.date(Booking.created_at) < day_end,
                Booking.status == "booked"
            )
        ).count()
        data.append(count)
    
    return BookingChartData(labels=labels, data=data)

@router.get("/admin/class-popularity", response_model=ClassPopularityData)
async def get_class_popularity(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin)
):
    # Top 5 clases más reservadas
    class_bookings = db.query(
        ClassSession.discipline,
        func.count(Booking.id).label('count')
    ).join(
        Booking, ClassSession.id == Booking.class_id
    ).filter(
        Booking.status == "booked"
    ).group_by(
        ClassSession.discipline
    ).order_by(
        func.count(Booking.id).desc()
    ).limit(5).all()
    
    labels = [item[0] for item in class_bookings]
    data = [item[1] for item in class_bookings]
    
    return ClassPopularityData(labels=labels, data=data)

@router.get("/admin/weekly-schedule")
async def get_weekly_schedule(
    start_date: Optional[str] = Query(None, description="Fecha inicio YYYY-MM-DD (lunes de la semana)"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin)
):
    """
    Returns the full weekly class schedule with bookings and student names.
    If no start_date, uses the current week's Monday.
    """
    if start_date:
        try:
            week_start = parse_yyyy_mm_dd(start_date)
        except ValueError:
            raise HTTPException(status_code=400, detail="Formato de fecha invalido. Usa YYYY-MM-DD")
    else:
        today = mx_today()
        week_start = today - timedelta(days=today.weekday())

    days = []
    total_bookings_week = 0

    for day_offset in range(7):
        current_date = week_start + timedelta(days=day_offset)
        day_start = datetime.combine(current_date, datetime.min.time())
        day_end = datetime.combine(current_date, datetime.max.time())

        classes = db.query(ClassSession).filter(
            ClassSession.start_datetime >= day_start,
            ClassSession.start_datetime <= day_end
        ).order_by(ClassSession.start_datetime).all()

        classes_data = []
        day_bookings_count = 0

        for cls in classes:
            bookings = db.query(Booking).filter(
                Booking.class_id == cls.id,
                Booking.status == "booked"
            ).all()

            student_ids = [b.user_id for b in bookings]
            students = db.query(User).filter(User.id.in_(student_ids)).all() if student_ids else []
            students_map = {student.id: student for student in students}
            booking_students = []
            for booking in bookings:
                student = students_map.get(booking.user_id)
                if not student:
                    continue
                hour_label = f"{booking.preferred_hour:02d}:00" if booking.preferred_hour is not None else cls.start_datetime.strftime("%H:%M")
                booking_students.append({
                    "id": student.id,
                    "name": student.name,
                    "username": student.username,
                    "phone": student.phone,
                    "preferred_hour": booking.preferred_hour,
                    "attendance_hour": hour_label
                })

            day_bookings_count += len(bookings)

            classes_data.append({
                "id": cls.id,
                "title": cls.title,
                "discipline": cls.discipline,
                "start_datetime": cls.start_datetime.isoformat(),
                "duration_minutes": cls.duration_minutes,
                "bookings_count": len(bookings),
                "students": booking_students
            })

        total_bookings_week += day_bookings_count

        days.append({
            "date": current_date.isoformat(),
            "day_name": DAYS_ES[current_date.weekday()],
            "is_today": current_date == mx_today(),
            "bookings_count": day_bookings_count,
            "classes": classes_data
        })

    return {
        "week_start": week_start.isoformat(),
        "week_end": (week_start + timedelta(days=6)).isoformat(),
        "total_bookings": total_bookings_week,
        "total_unique_students": db.query(func.count(func.distinct(Booking.user_id))).filter(
            Booking.status == "booked",
            Booking.class_id.in_(
                db.query(ClassSession.id).filter(
                    ClassSession.start_datetime >= datetime.combine(week_start, datetime.min.time()),
                    ClassSession.start_datetime <= datetime.combine(week_start + timedelta(days=6), datetime.max.time())
                )
            )
        ).scalar() or 0,
        "days": days
    }


@router.get("/admin/today-detail")
async def get_today_detail(
    target_date: Optional[str] = Query(None, description="Fecha YYYY-MM-DD"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin)
):
    """
    Detailed view of a single day's bookings for admin.
    """
    if target_date:
        try:
            filter_date = parse_yyyy_mm_dd(target_date)
        except ValueError:
            raise HTTPException(status_code=400, detail="Formato invalido")
    else:
        filter_date = mx_today()

    day_start = datetime.combine(filter_date, datetime.min.time())
    day_end = datetime.combine(filter_date, datetime.max.time())

    classes = db.query(ClassSession).filter(
        ClassSession.start_datetime >= day_start,
        ClassSession.start_datetime <= day_end
    ).order_by(ClassSession.start_datetime).all()

    result = []
    total = 0

    for cls in classes:
        bookings = db.query(Booking).filter(
            Booking.class_id == cls.id,
            Booking.status == "booked"
        ).all()

        student_ids = [b.user_id for b in bookings]
        students = db.query(User).filter(User.id.in_(student_ids)).all() if student_ids else []
        total += len(bookings)

        result.append({
            "id": cls.id,
            "title": cls.title,
            "discipline": cls.discipline,
            "start_datetime": cls.start_datetime.isoformat(),
            "bookings_count": len(bookings),
            "students": [
                {"id": s.id, "name": s.name, "username": s.username, "phone": s.phone}
                for s in students
            ]
        })

    return {
        "date": filter_date.isoformat(),
        "day_name": DAYS_ES[filter_date.weekday()],
        "total_bookings": total,
        "classes": result
    }


@router.get("/coach")
async def get_coach_dashboard(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_coach)
):
    # Alumnos asignados
    assignments = db.query(CoachStudent).filter(CoachStudent.coach_id == current_user.id).all()
    student_ids = [a.student_id for a in assignments]
    
    students_data = []
    for student_id in student_ids:
        student = db.query(User).filter(User.id == student_id).first()
        if not student:
            continue
        
        # Último progreso
        last_progress = db.query(ProgressEntry).filter(
            ProgressEntry.student_id == student_id
        ).order_by(ProgressEntry.date.desc()).first()
        
        # Progresos en los últimos 30 días
        month_ago = date.today() - timedelta(days=30)
        recent_progress = db.query(ProgressEntry).filter(
            and_(
                ProgressEntry.student_id == student_id,
                ProgressEntry.date >= month_ago
            )
        ).count()
        
        students_data.append({
            "id": student.id,
            "name": student.name,
            "last_progress": {
                "date": last_progress.date if last_progress else None,
                "metric": last_progress.metric_type if last_progress else None,
                "value": last_progress.value if last_progress else None
            },
            "consistency": recent_progress
        })
    
    return {
        "students": students_data,
        "total_students": len(students_data)
    }

@router.get("/coach/student/{student_id}/progress-chart")
async def get_student_progress_chart(
    student_id: int,
    metric_type: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_coach)
):
    # Verificar que el estudiante está asignado
    assignment = db.query(CoachStudent).filter(
        CoachStudent.coach_id == current_user.id,
        CoachStudent.student_id == student_id
    ).first()
    if not assignment:
        raise HTTPException(status_code=403, detail="Student not assigned to you")
    
    # Obtener progresos de la métrica específica
    entries = db.query(ProgressEntry).filter(
        and_(
            ProgressEntry.student_id == student_id,
            ProgressEntry.metric_type == metric_type
        )
    ).order_by(ProgressEntry.date).all()
    
    labels = [entry.date.strftime("%d/%m/%Y") for entry in entries]
    data = [entry.value for entry in entries]
    
    return {
        "labels": labels,
        "data": data,
        "metric_type": metric_type
    }
