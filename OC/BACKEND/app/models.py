from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey, Text, JSON, Date, Float
from sqlalchemy.orm import relationship, deferred
from sqlalchemy.sql import func
from app.database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)

    username = Column(String(60), unique=True, index=True, nullable=False)
    gym_code = deferred(Column(String(50), unique=True, index=True, nullable=True))
    name = Column(String(120), nullable=False)

    password_hash = Column(String(255), nullable=False)

    role = Column(String(20), nullable=False)  # admin, socio, coach
    phone = Column(String(20), nullable=True)
    is_active = deferred(Column(Boolean, nullable=False, default=True))
    deactivated_at = deferred(Column(DateTime(timezone=True), nullable=True))
    deactivated_by = deferred(Column(Integer, ForeignKey("users.id"), nullable=True))
    deactivation_reason = deferred(Column(Text, nullable=True))

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
    cycles = relationship("MembershipCycle", back_populates="membership", cascade="all, delete-orphan")
    notes = relationship("MembershipNote", back_populates="membership")


class MembershipCycle(Base):
    __tablename__ = "membership_cycles"

    id = Column(Integer, primary_key=True, index=True)
    membership_id = Column(Integer, ForeignKey("memberships.id"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    membership_type = Column(String(60), nullable=False)
    cost = Column(Float, nullable=False)
    start_date = Column(Date, nullable=False)
    end_date = Column(Date, nullable=False)
    status = Column(String(30), nullable=False, default="active")
    is_active_cycle = Column(Boolean, nullable=False, default=True)
    renewed_from_cycle_id = Column(Integer, ForeignKey("membership_cycles.id"), nullable=True)
    created_by = Column(Integer, ForeignKey("users.id"), nullable=True)
    updated_by = Column(Integer, ForeignKey("users.id"), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    membership = relationship("Membership", back_populates="cycles")
    user = relationship("User")
    payments = relationship("MembershipPayment", back_populates="membership_cycle", cascade="all, delete-orphan")
    notes = relationship("MembershipNote", back_populates="membership_cycle")
    created_by_user = relationship("User", foreign_keys=[created_by])
    updated_by_user = relationship("User", foreign_keys=[updated_by])


class MembershipPayment(Base):
    __tablename__ = "membership_payments"

    id = Column(Integer, primary_key=True, index=True)
    membership_cycle_id = Column(Integer, ForeignKey("membership_cycles.id"), nullable=False, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    payment_date = Column(DateTime(timezone=True), nullable=False, server_default=func.now())
    amount = Column(Float, nullable=False)
    payment_method = Column(String(30), nullable=False)
    concept = Column(String(120), nullable=True)
    observations = Column(Text, nullable=True)
    idempotency_key = Column(String(120), nullable=True)
    reversed_at = Column(DateTime(timezone=True), nullable=True)
    reversed_by = Column(Integer, ForeignKey("users.id"), nullable=True)
    reversal_reason = Column(Text, nullable=True)
    created_by = Column(Integer, ForeignKey("users.id"), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    membership_cycle = relationship("MembershipCycle", back_populates="payments")
    user = relationship("User", foreign_keys=[user_id])
    creator = relationship("User", foreign_keys=[created_by])
    reverser = relationship("User", foreign_keys=[reversed_by])


class MembershipNote(Base):
    __tablename__ = "membership_notes"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    membership_id = Column(Integer, ForeignKey("memberships.id"), nullable=True, index=True)
    membership_cycle_id = Column(Integer, ForeignKey("membership_cycles.id"), nullable=True, index=True)
    note = Column(Text, nullable=False)
    created_by = Column(Integer, ForeignKey("users.id"), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    user = relationship("User", foreign_keys=[user_id])
    creator = relationship("User", foreign_keys=[created_by])
    membership = relationship("Membership", back_populates="notes")
    membership_cycle = relationship("MembershipCycle", back_populates="notes")


class MembershipCycleAudit(Base):
    __tablename__ = "membership_cycle_audits"

    id = Column(Integer, primary_key=True, index=True)
    membership_cycle_id = Column(Integer, ForeignKey("membership_cycles.id"), nullable=False, index=True)
    changed_by = Column(Integer, ForeignKey("users.id"), nullable=False)
    reason = Column(Text, nullable=False)
    old_payload = Column(JSON, nullable=False)
    new_payload = Column(JSON, nullable=False)
    changed_at = Column(DateTime(timezone=True), server_default=func.now())

    cycle = relationship("MembershipCycle")
    changed_by_user = relationship("User")


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
    coach_attended = Column(Boolean, nullable=True)  # lista admin coach asignado

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
    attended = Column(Boolean, nullable=True)  # lista admin: None sin marcar, True/False presente/ausente
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
