from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List, Optional
from datetime import datetime, date, timedelta
from app.database import get_db
from app.auth import get_current_admin, get_current_user
from app.schemas import ClassSessionResponse, ClassSessionCreate, ClassSessionWithBookings
from app.models import ClassSession, Booking, User

router = APIRouter(prefix="/classes", tags=["classes"])


@router.get("/", response_model=List[ClassSessionWithBookings])
async def get_classes(
    target_date: Optional[str] = Query(None, description="Fecha en formato YYYY-MM-DD"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Get classes filtered by date.
    If no date is provided, returns today's classes.
    Includes booking count and whether the current user has booked each class.
    """
    if target_date:
        try:
            filter_date = datetime.strptime(target_date, "%Y-%m-%d").date()
        except ValueError:
            raise HTTPException(status_code=400, detail="Invalid date format. Use YYYY-MM-DD")
    else:
        filter_date = date.today()

    day_start = datetime.combine(filter_date, datetime.min.time())
    day_end = datetime.combine(filter_date, datetime.max.time())

    classes = db.query(ClassSession).filter(
        ClassSession.start_datetime >= day_start,
        ClassSession.start_datetime <= day_end
    ).order_by(ClassSession.start_datetime).all()

    result = []
    for cls in classes:
        bookings_count = db.query(func.count(Booking.id)).filter(
            Booking.class_id == cls.id,
            Booking.status == "booked"
        ).scalar()

        my_booking = db.query(Booking).filter(
            Booking.class_id == cls.id,
            Booking.user_id == current_user.id,
            Booking.status == "booked"
        ).first()

        result.append(ClassSessionWithBookings(
            id=cls.id,
            title=cls.title,
            discipline=cls.discipline,
            description=cls.description,
            intensity=cls.intensity,
            level=cls.level,
            duration_minutes=cls.duration_minutes,
            capacity=cls.capacity,
            start_datetime=cls.start_datetime,
            coach_id=cls.coach_id,
            created_at=cls.created_at,
            bookings_count=bookings_count or 0,
            is_booked_by_me=my_booking is not None,
            my_booking_id=my_booking.id if my_booking else None
        ))

    return result


@router.get("/week", response_model=List[ClassSessionWithBookings])
async def get_week_classes(
    start_date: Optional[str] = Query(None, description="Fecha inicio YYYY-MM-DD"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get classes for a full week starting from start_date (or today)."""
    if start_date:
        try:
            filter_date = datetime.strptime(start_date, "%Y-%m-%d").date()
        except ValueError:
            raise HTTPException(status_code=400, detail="Invalid date format")
    else:
        filter_date = date.today()

    day_start = datetime.combine(filter_date, datetime.min.time())
    day_end = datetime.combine(filter_date + timedelta(days=7), datetime.max.time())

    classes = db.query(ClassSession).filter(
        ClassSession.start_datetime >= day_start,
        ClassSession.start_datetime <= day_end
    ).order_by(ClassSession.start_datetime).all()

    result = []
    for cls in classes:
        bookings_count = db.query(func.count(Booking.id)).filter(
            Booking.class_id == cls.id,
            Booking.status == "booked"
        ).scalar()

        my_booking = db.query(Booking).filter(
            Booking.class_id == cls.id,
            Booking.user_id == current_user.id,
            Booking.status == "booked"
        ).first()

        result.append(ClassSessionWithBookings(
            id=cls.id,
            title=cls.title,
            discipline=cls.discipline,
            description=cls.description,
            intensity=cls.intensity,
            level=cls.level,
            duration_minutes=cls.duration_minutes,
            capacity=cls.capacity,
            start_datetime=cls.start_datetime,
            coach_id=cls.coach_id,
            created_at=cls.created_at,
            bookings_count=bookings_count or 0,
            is_booked_by_me=my_booking is not None,
            my_booking_id=my_booking.id if my_booking else None
        ))

    return result


@router.get("/{class_id}", response_model=ClassSessionWithBookings)
async def get_class(
    class_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get a single class by ID with booking info."""
    cls = db.query(ClassSession).filter(ClassSession.id == class_id).first()
    if not cls:
        raise HTTPException(status_code=404, detail="Class not found")

    bookings_count = db.query(func.count(Booking.id)).filter(
        Booking.class_id == cls.id,
        Booking.status == "booked"
    ).scalar()

    my_booking = db.query(Booking).filter(
        Booking.class_id == cls.id,
        Booking.user_id == current_user.id,
        Booking.status == "booked"
    ).first()

    return ClassSessionWithBookings(
        id=cls.id,
        title=cls.title,
        discipline=cls.discipline,
        description=cls.description,
        intensity=cls.intensity,
        level=cls.level,
        duration_minutes=cls.duration_minutes,
        capacity=cls.capacity,
        start_datetime=cls.start_datetime,
        coach_id=cls.coach_id,
        created_at=cls.created_at,
        bookings_count=bookings_count or 0,
        is_booked_by_me=my_booking is not None,
        my_booking_id=my_booking.id if my_booking else None
    )


@router.post("/", response_model=ClassSessionResponse)
async def create_class(
    class_session: ClassSessionCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin)
):
    db_class = ClassSession(**class_session.dict())
    db.add(db_class)
    db.commit()
    db.refresh(db_class)
    return db_class


@router.post("/generate-schedule")
async def generate_daily_schedule(
    days: int = Query(7, description="Number of days to generate"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin)
):
    """
    Generate the daily class schedule for the next N days.
    Uses the standard OC-Calisthenics timetable.
    """
    weekday_template = [
        {"title": "OPEN GYM", "discipline": "Open Gym", "hour": 6, "minute": 0, "duration": 720},
        {"title": "POWERLIFTING", "discipline": "Powerlifting", "hour": 6, "minute": 0, "duration": 720},
        {"title": "7:00 - 8:00 Calistenia", "discipline": "Calistenia", "hour": 7, "minute": 0, "duration": 60},
        {"title": "8:00 - 9:00 Explosive", "discipline": "Explosive", "hour": 8, "minute": 0, "duration": 60},
        {"title": "9:00 - 10:00 HYROX", "discipline": "HYROX", "hour": 9, "minute": 0, "duration": 60},
        {"title": "10:00 - 11:00 GAP", "discipline": "GAP", "hour": 10, "minute": 0, "duration": 60},
        {"title": "17:00 - 18:00 Karate", "discipline": "Karate", "hour": 17, "minute": 0, "duration": 60},
        {"title": "18:00 - 19:00 Kickboxing", "discipline": "Kickboxing", "hour": 18, "minute": 0, "duration": 60},
        {"title": "19:00 - 20:00 Calistenia", "discipline": "Calistenia", "hour": 19, "minute": 0, "duration": 60},
        {"title": "20:00 - 21:00 Explosive", "discipline": "Explosive", "hour": 20, "minute": 0, "duration": 60},
        {"title": "21:00 - 22:00 Funcional", "discipline": "Funcional", "hour": 21, "minute": 0, "duration": 60},
        {"title": "22:00 - 23:00 HYROX", "discipline": "HYROX", "hour": 22, "minute": 0, "duration": 60},
    ]
    saturday_template = [
        {"title": "10:00 - 11:00 Calistenia", "discipline": "Calistenia", "hour": 10, "minute": 0, "duration": 60},
        {"title": "11:00 - 12:00 Calistenia", "discipline": "Calistenia", "hour": 11, "minute": 0, "duration": 60},
    ]

    created = 0
    skipped = 0
    today = date.today()

    for day_offset in range(days):
        current_date = today + timedelta(days=day_offset)
        weekday = current_date.weekday()
        if weekday == 6:  # domingo — sin clases
            continue
        schedule_template = saturday_template if weekday == 5 else weekday_template
        for template in schedule_template:
            start_dt = datetime.combine(
                current_date,
                datetime.min.time().replace(
                    hour=template["hour"],
                    minute=template["minute"]
                )
            )

            existing = db.query(ClassSession).filter(
                ClassSession.title == template["title"],
                ClassSession.start_datetime == start_dt
            ).first()

            if existing:
                skipped += 1
                continue

            new_class = ClassSession(
                title=template["title"],
                discipline=template["discipline"],
                description=None,
                intensity="med",
                level="all",
                duration_minutes=template["duration"],
                capacity=999,
                start_datetime=start_dt,
                coach_id=None
            )
            db.add(new_class)
            created += 1

    db.commit()

    return {
        "message": f"Schedule generated for {days} days",
        "created": created,
        "skipped": skipped,
        "total_classes": db.query(ClassSession).count()
    }


@router.put("/{class_id}", response_model=ClassSessionResponse)
async def update_class(
    class_id: int,
    class_session: ClassSessionCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin)
):
    db_class = db.query(ClassSession).filter(ClassSession.id == class_id).first()
    if not db_class:
        raise HTTPException(status_code=404, detail="Class not found")

    for key, value in class_session.dict().items():
        setattr(db_class, key, value)

    db.commit()
    db.refresh(db_class)
    return db_class


@router.delete("/{class_id}")
async def delete_class(
    class_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin)
):
    db_class = db.query(ClassSession).filter(ClassSession.id == class_id).first()
    if not db_class:
        raise HTTPException(status_code=404, detail="Class not found")

    db.delete(db_class)
    db.commit()
    return {"message": "Class deleted"}
