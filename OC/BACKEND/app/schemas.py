from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import datetime, date

# Auth
class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    username: Optional[str] = None

class UserLogin(BaseModel):
    username: str
    password: str

# User
class UserBase(BaseModel):
    username: str
    gym_code: Optional[str] = None
    name: str
    role: str
    phone: Optional[str] = None

class UserCreate(UserBase):
    password: str


class UserUpdate(BaseModel):
    username: Optional[str] = None
    gym_code: Optional[str] = None
    name: Optional[str] = None
    role: Optional[str] = None
    phone: Optional[str] = None

class StudentCreate(BaseModel):
    username: str
    name: str
    password: str
    phone: Optional[str] = None

class UserResponse(UserBase):
    id: int
    created_at: datetime
    is_active: bool = True
    deactivated_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True

# Membership
class MembershipBase(BaseModel):
    status: str
    plan: str
    expires_at: Optional[datetime] = None

class MembershipCreate(BaseModel):
    user_id: int
    status: str
    plan: str
    expires_at: Optional[datetime] = None

class MembershipResponse(MembershipBase):
    id: int
    user_id: int
    created_at: datetime
    
    class Config:
        from_attributes = True


class MembershipCycleCreate(BaseModel):
    user_id: int
    membership_type: str
    cost: float
    start_date: date
    end_date: date
    manual_status: Optional[str] = None


class MembershipCycleUpdate(BaseModel):
    membership_type: Optional[str] = None
    cost: Optional[float] = None
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    manual_status: Optional[str] = None
    force_update: bool = False
    change_reason: Optional[str] = None


class MembershipPaymentCreate(BaseModel):
    amount: float
    payment_method: str
    concept: Optional[str] = None
    observations: Optional[str] = None
    payment_date: Optional[datetime] = None
    allow_overpayment: bool = False
    idempotency_key: Optional[str] = None


class MembershipNoteCreate(BaseModel):
    note: str

class MembershipPaymentReverse(BaseModel):
    reason: str


class MembershipPaymentResponse(BaseModel):
    id: int
    membership_cycle_id: int
    user_id: int
    payment_date: datetime
    amount: float
    payment_method: str
    concept: Optional[str] = None
    observations: Optional[str] = None
    created_by: int
    created_at: datetime
    created_by_name: Optional[str] = None


class MembershipNoteResponse(BaseModel):
    id: int
    user_id: int
    membership_id: Optional[int] = None
    membership_cycle_id: Optional[int] = None
    note: str
    created_by: int
    created_at: datetime
    created_by_name: Optional[str] = None


class MembershipCycleResponse(BaseModel):
    id: int
    membership_id: int
    user_id: int
    membership_type: str
    cost: float
    start_date: date
    end_date: date
    status: str
    is_active_cycle: bool
    created_at: datetime
    updated_at: datetime
    total_paid: float = 0
    pending_balance: float = 0


class MembershipClientSummary(BaseModel):
    user_id: int
    membership_id: int
    cycle_id: Optional[int] = None
    name: str
    phone: Optional[str] = None
    created_at: datetime
    membership_type: Optional[str] = None
    cost: float = 0
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    status: str
    total_paid: float = 0
    pending_balance: float = 0


class MembershipClientDetail(BaseModel):
    user_id: int
    membership_id: int
    name: str
    phone: Optional[str] = None
    created_at: datetime
    active_cycle: Optional[MembershipCycleResponse] = None
    cycles_history: List[MembershipCycleResponse] = []
    payments: List[MembershipPaymentResponse] = []
    notes: List[MembershipNoteResponse] = []

# Class Session
class ClassSessionBase(BaseModel):
    title: str
    discipline: str
    description: Optional[str] = None
    intensity: str = "med"
    level: str = "all"
    duration_minutes: int = 60
    capacity: Optional[int] = 999
    start_datetime: datetime
    coach_id: Optional[int] = None

class ClassSessionCreate(ClassSessionBase):
    pass

class ClassSessionResponse(ClassSessionBase):
    id: int
    created_at: datetime
    
    class Config:
        from_attributes = True

class ClassSessionWithBookings(ClassSessionBase):
    id: int
    created_at: datetime
    bookings_count: int = 0
    is_booked_by_me: bool = False
    my_booking_id: Optional[int] = None
    my_booking_preferred_hour: Optional[int] = None
    
    class Config:
        from_attributes = True

# Booking
class BookingBase(BaseModel):
    class_id: int
    status: str = "booked"

class BookingCreate(BookingBase):
    preferred_hour: Optional[int] = None

class BookingResponse(BookingBase):
    id: int
    user_id: int
    preferred_hour: Optional[int] = None
    created_at: datetime
    
    class Config:
        from_attributes = True

# Coach Student
class CoachStudentBase(BaseModel):
    student_id: int
    coach_id: Optional[int] = None  # Para admin asignar a cualquier coach

class CoachStudentResponse(BaseModel):
    id: int
    coach_id: int
    student_id: int
    assigned_at: datetime
    
    class Config:
        from_attributes = True

# Progress Entry
class ProgressEntryBase(BaseModel):
    date: date
    discipline: Optional[str] = None
    metric_type: str
    value: float
    notes: Optional[str] = None

class ProgressEntryCreate(ProgressEntryBase):
    student_id: int

class ProgressEntryResponse(ProgressEntryBase):
    id: int
    student_id: int
    coach_id: int
    created_at: datetime
    
    class Config:
        from_attributes = True

# Training Plan
class TrainingPlanBase(BaseModel):
    title: str
    start_date: date
    end_date: date
    goal: Optional[str] = None
    source: Optional[str] = None

class TrainingPlanCreate(TrainingPlanBase):
    student_id: int

class TrainingPlanResponse(TrainingPlanBase):
    id: int
    student_id: int
    coach_id: int
    created_at: datetime
    
    class Config:
        from_attributes = True

# Training Plan Item
class TrainingPlanItemBase(BaseModel):
    week_number: int
    day_label: str
    warmup: Optional[str] = None
    main: str
    accessories: Optional[str] = None
    cooldown: Optional[str] = None
    notes: Optional[str] = None

class TrainingPlanItemCreate(TrainingPlanItemBase):
    plan_id: int

class TrainingPlanItemResponse(TrainingPlanItemBase):
    id: int
    
    class Config:
        from_attributes = True

class TrainingPlanWithItems(TrainingPlanResponse):
    items: List[TrainingPlanItemResponse] = []

# Virtual Assessment
class VirtualAssessmentBase(BaseModel):
    goal: Optional[str] = None
    level: Optional[str] = None
    days_per_week: Optional[int] = None
    session_minutes: Optional[int] = None
    equipment_json: Optional[dict] = None
    restrictions: Optional[str] = None
    preference: Optional[str] = None

class VirtualAssessmentCreate(VirtualAssessmentBase):
    student_id: int

class VirtualAssessmentResponse(VirtualAssessmentBase):
    id: int
    student_id: int
    coach_id: int
    date: datetime
    
    class Config:
        from_attributes = True

# Dashboard
class DashboardStats(BaseModel):
    active_members: int
    expired_members: int
    bookings_today: int
    avg_occupancy: float
    cancellation_rate: float

class BookingChartData(BaseModel):
    labels: List[str]
    data: List[int]

class ClassPopularityData(BaseModel):
    labels: List[str]
    data: List[int]

# Exercise
class ExerciseBase(BaseModel):
    name: str
    category: str  # T.S.E, T.S.J, T.I, CORE
    level: int  # 1-5

class ExerciseCreate(ExerciseBase):
    pass

class ExerciseResponse(ExerciseBase):
    id: int
    created_at: datetime
    
    class Config:
        from_attributes = True

# Routine Generation
class RoutineGenerationRequest(BaseModel):
    student_id: int
    categories: List[str]  # Lista de categorías: ["T.S.E", "T.S.J", "T.I", "CORE"]
    level: int  # 1-5
    days_per_week: int = 3
    weeks: int = 4
