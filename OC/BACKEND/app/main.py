from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from sqlalchemy import text
from datetime import datetime, date, timedelta
import os

from app.database import engine, Base, get_db, SessionLocal
from app.models import User, ClassSession
from app.core.security import hash_password
from app.routes import (
    auth,
    users,
    coaches,
    students,
    progress,
    plans,
    assessments,
    classes,
    bookings,
    membership,
    dashboard,
    routines,
    admin,
    exercises,
)

# =========================
# Crear tablas y seeds al iniciar
# =========================
def init_database():
    try:
        Base.metadata.create_all(bind=engine)
        print("[DB] Tablas creadas/verificadas.")
    except Exception as e:
        print(f"[DB] Error creando tablas (reintentara en requests): {e}")
        return

    db = SessionLocal()
    try:
        existing_admin = db.query(User).filter(User.username == "octavio").first()
        if not existing_admin:
            admin_user = User(
                username="octavio",
                name="Octavio Brambilla Piña",
                password_hash=hash_password("OcAdmin2026!"),
                role="admin",
                phone=None
            )
            db.add(admin_user)
            db.commit()
            print("[SEED] Admin 'octavio' creado.")

        existing_classes = db.query(ClassSession).count()
        if existing_classes == 0:
            SCHEDULE = [
                {"title": "OPEN GYM",                "discipline": "Open Gym",     "hour": 6,  "minute": 0, "duration": 720},
                {"title": "POWERLIFTING",             "discipline": "Powerlifting", "hour": 6,  "minute": 0, "duration": 720},
                {"title": "7:00 - 8:00 Calistenia",  "discipline": "Calistenia",  "hour": 7,  "minute": 0, "duration": 60},
                {"title": "8:00 - 9:00 Explosive",   "discipline": "Explosive",   "hour": 8,  "minute": 0, "duration": 60},
                {"title": "9:00 - 10:00 HYROX",      "discipline": "HYROX",       "hour": 9,  "minute": 0, "duration": 60},
                {"title": "10:00 - 11:00 GAP",       "discipline": "GAP",         "hour": 10, "minute": 0, "duration": 60},
                {"title": "17:00 - 18:00 Karate",    "discipline": "Karate",      "hour": 17, "minute": 0, "duration": 60},
                {"title": "18:00 - 19:00 Kickboxing","discipline": "Kickboxing",  "hour": 18, "minute": 0, "duration": 60},
                {"title": "19:00 - 20:00 Calistenia","discipline": "Calistenia",  "hour": 19, "minute": 0, "duration": 60},
                {"title": "20:00 - 21:00 Explosive", "discipline": "Explosive",   "hour": 20, "minute": 0, "duration": 60},
                {"title": "21:00 - 22:00 Funcional", "discipline": "Funcional",   "hour": 21, "minute": 0, "duration": 60},
                {"title": "22:00 - 23:00 HYROX",     "discipline": "HYROX",       "hour": 22, "minute": 0, "duration": 60},
            ]
            today = date.today()
            for day_offset in range(7):
                current_date = today + timedelta(days=day_offset)
                for t in SCHEDULE:
                    start_dt = datetime.combine(
                        current_date,
                        datetime.min.time().replace(hour=t["hour"], minute=t["minute"])
                    )
                    db.add(ClassSession(
                        title=t["title"], discipline=t["discipline"],
                        intensity="med", level="all",
                        duration_minutes=t["duration"], capacity=999,
                        start_datetime=start_dt, coach_id=None
                    ))
            db.commit()
            print(f"[SEED] {7 * len(SCHEDULE)} clases creadas para 7 dias.")
        else:
            print(f"[SEED] BD ya tiene {existing_classes} clases, omitiendo seed.")
    except Exception as e:
        db.rollback()
        print(f"[SEED] Error (no critico): {e}")
    finally:
        db.close()


init_database()

# =========================
# App principal
# =========================
app = FastAPI(
    title="OC-CALISTHENICS API",
    version="1.0.0"
)

# =========================
# CORS
# =========================
allowed_origins = os.getenv("ALLOWED_ORIGINS", "*")

if allowed_origins != "*":
    allowed_origins = [origin.strip() for origin in allowed_origins.split(",")]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins if isinstance(allowed_origins, list) else ["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# =========================
# ROUTERS
# =========================
app.include_router(auth.router)
app.include_router(users.router)
app.include_router(coaches.router)
app.include_router(students.router)
app.include_router(progress.router)
app.include_router(plans.router)
app.include_router(assessments.router)
app.include_router(classes.router)
app.include_router(bookings.router)
app.include_router(membership.router)
app.include_router(dashboard.router)
app.include_router(routines.router)
app.include_router(admin.router)
app.include_router(exercises.router)

# =========================
# ENDPOINTS BASE
# =========================
@app.get("/")
async def root():
    return {"message": "OC-CALISTHENICS API"}

# =========================
# HEALTH CHECK BD (ESTO ES LO QUE FALTABA)
# =========================
@app.get("/health/db")
def health_db(db: Session = Depends(get_db)):
    db.execute(text("SELECT 1"))
    return {
        "ok": True,
        "database": "connected"
    }
