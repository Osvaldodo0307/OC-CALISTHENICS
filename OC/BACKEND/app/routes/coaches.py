from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.auth import get_current_coach, get_current_user, get_password_hash
from app.schemas import UserResponse, CoachStudentResponse, CoachStudentBase, StudentCreate
from app.models import User, CoachStudent, Membership

router = APIRouter(prefix="/coaches", tags=["coaches"])

@router.get("/students", response_model=List[UserResponse])
async def get_my_students(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_coach)
):
    """
    Get all students assigned to the current coach
    Only returns students assigned to this coach via coach_students table
    """
    assignments = db.query(CoachStudent).filter(CoachStudent.coach_id == current_user.id).all()
    student_ids = [a.student_id for a in assignments]
    
    if not student_ids:
        return []
    
    students = db.query(User).filter(User.id.in_(student_ids)).all()
    return students

@router.get("/me/students", response_model=List[UserResponse])
async def get_my_students_me(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_coach)
):
    """
    Alias for /coaches/students - Get all students assigned to the current coach
    """
    return await get_my_students(db, current_user)

@router.post("/assign", response_model=CoachStudentResponse)
async def assign_student(
    assignment: CoachStudentBase,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.role not in ["admin", "coach"]:
        raise HTTPException(status_code=403, detail="Not enough permissions")
    
    # Determinar coach_id
    if current_user.role == "admin":
        # Admin debe especificar coach_id
        if not assignment.coach_id:
            raise HTTPException(status_code=400, detail="coach_id required for admin assignment")
        coach_id = assignment.coach_id
        # Verificar que el coach existe y es coach
        coach = db.query(User).filter(User.id == coach_id, User.role == "coach").first()
        if not coach:
            raise HTTPException(status_code=404, detail="Coach not found")
    else:
        # Coach asigna a sí mismo
        coach_id = current_user.id
    
    # Verificar que el estudiante existe y es socio
    student = db.query(User).filter(User.id == assignment.student_id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")
    if student.role != "socio":
        raise HTTPException(status_code=400, detail="User is not a student")
    
    # Verificar si ya existe asignación
    existing = db.query(CoachStudent).filter(
        CoachStudent.student_id == assignment.student_id
    ).first()
    if existing:
        raise HTTPException(status_code=400, detail="Student already assigned to a coach")
    
    db_assignment = CoachStudent(
        coach_id=coach_id,
        student_id=assignment.student_id
    )
    db.add(db_assignment)
    db.commit()
    db.refresh(db_assignment)
    return db_assignment

@router.post("/students", response_model=UserResponse)
async def create_student_for_coach(
    student: StudentCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_coach)
):
    existing = db.query(User).filter(User.username == student.username).first()
    if existing:
        raise HTTPException(status_code=400, detail="Username already registered")

    db_student = User(
        username=student.username,
        name=student.name,
        password_hash=get_password_hash(student.password),
        role="socio",
        phone=student.phone
    )
    db.add(db_student)
    db.commit()
    db.refresh(db_student)

    membership = Membership(
        user_id=db_student.id,
        status="expired",
        plan="grupal",
        expires_at=None
    )
    db.add(membership)

    assignment = CoachStudent(
        coach_id=current_user.id,
        student_id=db_student.id
    )
    db.add(assignment)
    db.commit()

    return db_student
