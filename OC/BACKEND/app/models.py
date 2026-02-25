from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey, Text, JSON, Date, Float
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)

    username = Column(String(60), unique=True, index=True, nullable=False)
    gym_code = Column(String(50), unique=True, index=True, nullable=True)
    name = Column(String(120), nullable=False)

    password_hash = Column(String(255), nullable=False)

    role = Column(String(20), nullable=False)  # admin, socio, coach
    phone = Column(String(20), nullable=True)

    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    membership = relationship("Membership", back_populates="user", uselist=False)
    bookings = relationship("Booking", back_populates="user")

    coach_students = relationship(
        "CoachStudent",
        foreign_keys="CoachStudent.coach_id",
        back_populates="coach"
    )
    student_coaches = relationship(
        "CoachStudent",
        foreign_keys="CoachStudent.student_id",
        back_populates="student"
    )

    progress_entries = relationship(
        "ProgressEntry",
        foreign_keys="ProgressEntry.student_id",
        back_populates="student"
    )

    training_plans = relationship(
        "TrainingPlan",
        foreign_keys="TrainingPlan.student_id",
        back_populates="student"
    )

    virtual_assessments = relationship(
        "VirtualAssessment",
        foreign_keys="VirtualAssessment.student_id",
        back_populates="student"
    )

    classes_taught = relationship("ClassSession", back_populates="coach")


class Membership(Base):
    __tablename__ = "memberships"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True, nullable=False)

    status = Column(String(20), nullable=False)  # active, expired
    plan = Column(String(20), nullable=False)    # grupal, personalizado

    expires_at = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    user = relationship("User", back_populates="membership")


class ClassSession(Base):
    __tablename__ = "class_sessions"

    id = Column(Integer, primary_key=True, index=True)

    title = Column(String(120), nullable=False)
    discipline = Column(String(50), nullable=False)

    description = Column(Text, nullable=True)

    intensity = Column(String(20), nullable=False)  # low, med, high
    level = Column(String(20), nullable=False)      # all, inter, adv

    duration_minutes = Column(Integer, default=60)
    capacity = Column(Integer, nullable=True, default=999)

    start_datetime = Column(DateTime(timezone=True), nullable=False)
    coach_id = Column(Integer, ForeignKey("users.id"), nullable=True)

    created_at = Column(DateTime(timezone=True), server_default=func.now())

    coach = relationship("User", back_populates="classes_taught")
    bookings = relationship("Booking", back_populates="class_session")


class Booking(Base):
    __tablename__ = "bookings"

    id = Column(Integer, primary_key=True, index=True)

    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    class_id = Column(Integer, ForeignKey("class_sessions.id"), nullable=False)

    status = Column(String(20), nullable=False)  # booked, canceled
    preferred_hour = Column(Integer, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    user = relationship("User", back_populates="bookings")
    class_session = relationship("ClassSession", back_populates="bookings")


class CoachStudent(Base):
    __tablename__ = "coach_students"

    id = Column(Integer, primary_key=True, index=True)

    coach_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    student_id = Column(Integer, ForeignKey("users.id"), nullable=False)

    assigned_at = Column(DateTime(timezone=True), server_default=func.now())

    coach = relationship("User", foreign_keys=[coach_id], back_populates="coach_students")
    student = relationship("User", foreign_keys=[student_id], back_populates="student_coaches")


class ProgressEntry(Base):
    __tablename__ = "progress_entries"

    id = Column(Integer, primary_key=True, index=True)

    student_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    coach_id = Column(Integer, ForeignKey("users.id"), nullable=False)

    date = Column(Date, nullable=False)

    discipline = Column(String(50), nullable=True)
    metric_type = Column(String(50), nullable=False)

    value = Column(Float, nullable=False)
    notes = Column(Text, nullable=True)

    created_at = Column(DateTime(timezone=True), server_default=func.now())

    student = relationship("User", foreign_keys=[student_id], back_populates="progress_entries")


class TrainingPlan(Base):
    __tablename__ = "training_plans"

    id = Column(Integer, primary_key=True, index=True)

    student_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    coach_id = Column(Integer, ForeignKey("users.id"), nullable=False)

    title = Column(String(120), nullable=False)

    start_date = Column(Date, nullable=False)
    end_date = Column(Date, nullable=False)

    goal = Column(Text, nullable=True)

    created_at = Column(DateTime(timezone=True), server_default=func.now())

    source = Column(String(20), nullable=True)  # manual, ai, assessment

    student = relationship("User", foreign_keys=[student_id], back_populates="training_plans")
    items = relationship("TrainingPlanItem", back_populates="plan", cascade="all, delete-orphan")


class TrainingPlanItem(Base):
    __tablename__ = "training_plan_items"

    id = Column(Integer, primary_key=True, index=True)

    plan_id = Column(Integer, ForeignKey("training_plans.id"), nullable=False)

    week_number = Column(Integer, nullable=False)
    day_label = Column(String(20), nullable=False)  # Lunes, Martes, etc.

    warmup = Column(Text, nullable=True)
    main = Column(Text, nullable=False)
    accessories = Column(Text, nullable=True)
    cooldown = Column(Text, nullable=True)
    notes = Column(Text, nullable=True)

    plan = relationship("TrainingPlan", back_populates="items")


class VirtualAssessment(Base):
    __tablename__ = "virtual_assessments"

    id = Column(Integer, primary_key=True, index=True)

    student_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    coach_id = Column(Integer, ForeignKey("users.id"), nullable=False)

    date = Column(DateTime(timezone=True), server_default=func.now())

    goal = Column(String(30), nullable=True)       # fuerza, hipertrofia, resistencia, spartan
    level = Column(String(20), nullable=True)      # principiante, intermedio, avanzado

    days_per_week = Column(Integer, nullable=True)
    session_minutes = Column(Integer, nullable=True)

    equipment_json = Column(JSON, nullable=True)
    restrictions = Column(Text, nullable=True)

    preference = Column(String(30), nullable=True)  # calistenia, powerlifting, mixto

    student = relationship("User", foreign_keys=[student_id], back_populates="virtual_assessments")


class Exercise(Base):
    __tablename__ = "exercises"

    id = Column(Integer, primary_key=True, index=True)

    name = Column(String(120), nullable=False)
    category = Column(String(30), nullable=False)  # T.S.E, T.S.J, T.I, CORE
    level = Column(Integer, nullable=False)        # 1-5

    created_at = Column(DateTime(timezone=True), server_default=func.now())
