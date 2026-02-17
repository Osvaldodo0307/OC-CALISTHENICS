from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session, joinedload
from typing import List
from datetime import datetime
from app.database import get_db
from app.auth import get_current_user, get_current_socio
from app.schemas import BookingResponse, BookingCreate
from app.models import Booking, ClassSession, Membership, User

router = APIRouter(prefix="/bookings", tags=["bookings"])


@router.post("/", response_model=BookingResponse)
async def create_booking(
    booking: BookingCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Book a class. Any authenticated user with role socio, coach, or admin can book.
    """
    class_session = db.query(ClassSession).filter(ClassSession.id == booking.class_id).first()
    if not class_session:
        raise HTTPException(status_code=404, detail="Clase no encontrada")

    if class_session.capacity and class_session.capacity < 999:
        current_bookings = db.query(Booking).filter(
            Booking.class_id == booking.class_id,
            Booking.status == "booked"
        ).count()
        if current_bookings >= class_session.capacity:
            raise HTTPException(status_code=400, detail="Clase llena")

    existing = db.query(Booking).filter(
        Booking.user_id == current_user.id,
        Booking.class_id == booking.class_id,
        Booking.status == "booked"
    ).first()
    if existing:
        raise HTTPException(status_code=400, detail="Ya tienes reserva en esta clase")

    db_booking = Booking(
        user_id=current_user.id,
        class_id=booking.class_id,
        status="booked"
    )
    db.add(db_booking)
    db.commit()
    db.refresh(db_booking)
    return db_booking


@router.get("/my", response_model=List[BookingResponse])
async def get_my_bookings(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get all bookings for the current user."""
    bookings = db.query(Booking).filter(
        Booking.user_id == current_user.id
    ).order_by(Booking.created_at.desc()).all()
    return bookings


@router.delete("/{booking_id}")
async def cancel_booking(
    booking_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Cancel a booking. Socios can only cancel their own bookings."""
    booking = db.query(Booking).filter(Booking.id == booking_id).first()
    if not booking:
        raise HTTPException(status_code=404, detail="Reserva no encontrada")

    if current_user.role == "socio" and booking.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Solo puedes cancelar tus propias reservas")

    booking.status = "canceled"
    db.commit()
    return {"message": "Reserva cancelada"}
