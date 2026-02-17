from app.database import SessionLocal, engine, Base
from app.models import User, Membership, ClassSession, Booking, CoachStudent, ProgressEntry, VirtualAssessment, TrainingPlan, TrainingPlanItem
from app.auth import get_password_hash
from datetime import datetime, timedelta, date

# Crear tablas
Base.metadata.create_all(bind=engine)

db = SessionLocal()

try:
    # Limpiar datos existentes
    db.query(TrainingPlanItem).delete()
    db.query(TrainingPlan).delete()
    db.query(VirtualAssessment).delete()
    db.query(ProgressEntry).delete()
    db.query(Booking).delete()
    db.query(CoachStudent).delete()
    db.query(ClassSession).delete()
    db.query(Membership).delete()
    db.query(User).delete()
    db.commit()
    
    # Usuarios según especificaciones
    # Admin
    admin = User(
        username="admin",
        name="Administrador",
        password_hash=get_password_hash("Admin2026!"),
        role="admin",
        phone="5512345678"
    )
    # Si la tabla tiene full_name, también establecerlo
    if hasattr(admin, 'full_name'):
        admin.full_name = "Administrador"
    db.add(admin)
    db.flush()  # Para obtener el ID
    
    # Coach
    coach_youri = User(
        username="coach_youri",
        name="Coach Youri",
        password_hash=get_password_hash("Coach2026!"),
        role="coach",
        phone="5598765432"
    )
    db.add(coach_youri)
    db.flush()
    
    # Socios (socio1 a socio8)
    socios = []
    for i in range(1, 9):
        socio = User(
            username=f"socio{i}",
            name=f"Socio {i}",
            password_hash=get_password_hash("Socio2026!"),
            role="socio",
            phone=f"551234567{i}"
        )
        db.add(socio)
        socios.append(socio)
    
    db.commit()
    db.refresh(admin)
    db.refresh(coach_youri)
    for socio in socios:
        db.refresh(socio)
    
    # Membresías para todos los socios
    for socio in socios:
        membership = Membership(
            user_id=socio.id,
            status="active" if socio.username == "socio1" else "expired",
            plan="grupal",
            expires_at=datetime.now() + timedelta(days=30) if socio.username == "socio1" else datetime.now() - timedelta(days=5)
        )
        db.add(membership)
    
    db.commit()
    
    # Asignar alumnos a coach (todos los socios asignados a coach_youri)
    for socio in socios:
        assignment = CoachStudent(
            coach_id=coach_youri.id,
            student_id=socio.id
        )
        db.add(assignment)
    
    db.commit()
    
    # Clases
    disciplines = [
        ("Calistenia Nivel Todos", "Calistenia", "high", "all", 20),
        ("Funcional Intermedio", "Funcional", "med", "inter", 15),
        ("GAP Principiantes", "GAP", "low", "all", 25),
        ("Spartan Training", "Spartan", "high", "adv", 10),
        ("Powerlifting", "Powerlifting", "high", "inter", 12),
        ("Fitness General", "Fitness general", "med", "all", 30)
    ]
    
    classes_list = []
    base_time = datetime.now().replace(hour=17, minute=0, second=0, microsecond=0)
    
    for i, (title, discipline, intensity, level, capacity) in enumerate(disciplines):
        class_time = base_time + timedelta(days=i, hours=i*2)
        class_session = ClassSession(
            title=title,
            discipline=discipline,
            description=f"Clase de {discipline} para nivel {level}",
            intensity=intensity,
            level=level,
            duration_minutes=60,
            capacity=capacity,
            start_datetime=class_time,
            coach_id=coach_youri.id if i % 2 == 0 else None
        )
        db.add(class_session)
        classes_list.append(class_session)
    
    db.commit()
    for cls in classes_list:
        db.refresh(cls)
    
    # Reservas para socio1
    socio1 = next(s for s in socios if s.username == "socio1")
    booking1 = Booking(
        user_id=socio1.id,
        class_id=classes_list[0].id,
        status="booked"
    )
    db.add(booking1)
    
    booking2 = Booking(
        user_id=socio1.id,
        class_id=classes_list[1].id,
        status="booked"
    )
    db.add(booking2)
    
    db.commit()
    
    # Progresos para socio1
    progress_entries = [
        (date.today() - timedelta(days=30), "peso_corporal", 75.5),
        (date.today() - timedelta(days=25), "dominadas_max", 8),
        (date.today() - timedelta(days=20), "peso_corporal", 74.8),
        (date.today() - timedelta(days=15), "dominadas_max", 10),
        (date.today() - timedelta(days=10), "peso_corporal", 74.2),
        (date.today() - timedelta(days=5), "dominadas_max", 12)
    ]
    
    for prog_date, metric, value in progress_entries:
        progress = ProgressEntry(
            student_id=socio1.id,
            coach_id=coach_youri.id,
            date=prog_date,
            discipline="Calistenia",
            metric_type=metric,
            value=value,
            notes=f"Progreso en {metric}"
        )
        db.add(progress)
    
    db.commit()
    
    # Virtual Assessment para socio1
    assessment = VirtualAssessment(
        student_id=socio1.id,
        coach_id=coach_youri.id,
        goal="fuerza",
        level="intermedio",
        days_per_week=4,
        session_minutes=60,
        equipment_json={"barra": True, "anillas": True, "paralelas": True},
        restrictions="Ninguna",
        preference="calistenia"
    )
    db.add(assessment)
    db.commit()
    db.refresh(assessment)
    
    # Training Plan para socio1 (requerido)
    plan = TrainingPlan(
        student_id=socio1.id,
        coach_id=coach_youri.id,
        title="Plan Fuerza - Intermedio - 4 Semanas",
        start_date=date.today(),
        end_date=date.today() + timedelta(days=28),
        goal="Desarrollar fuerza mediante entrenamiento calistenia",
        source="manual"
    )
    db.add(plan)
    db.commit()
    db.refresh(plan)
    
    # Items del plan (ejemplo para semana 1)
    plan_items = [
        TrainingPlanItem(
            plan_id=plan.id,
            week_number=1,
            day_label="Lunes",
            warmup="Movilidad articular 5 min",
            main="Dominadas 4x6, Flexiones diamante 4x10",
            accessories="Plancha avanzada 3x45s",
            cooldown="Estiramiento 10 min",
            notes="Semana de adaptación"
        ),
        TrainingPlanItem(
            plan_id=plan.id,
            week_number=1,
            day_label="Miércoles",
            warmup="Movilidad articular 5 min",
            main="Pistol squat 3x5 cada pierna, Dips 4x8",
            accessories="L-sit 3x20s",
            cooldown="Estiramiento 10 min"
        ),
        TrainingPlanItem(
            plan_id=plan.id,
            week_number=1,
            day_label="Viernes",
            warmup="Movilidad articular 5 min",
            main="Dominadas 4x6, Flexiones diamante 4x10",
            accessories="Plancha avanzada 3x45s",
            cooldown="Estiramiento 10 min"
        )
    ]
    
    for item in plan_items:
        db.add(item)
    
    db.commit()
    
    print("Seed data creado exitosamente!")
    print("\nUsuarios demo:")
    print("  - admin / Admin2026! (admin)")
    print("  - coach_youri / Coach2026! (coach)")
    print("  - socio1 a socio8 / Socio2026! (socios)")
    print("\nAsignaciones:")
    print("  - Todos los socios asignados a coach_youri")
    print("  - Plan de entrenamiento creado para socio1")
    
except Exception as e:
    print(f"Error: {e}")
    db.rollback()
finally:
    db.close()
