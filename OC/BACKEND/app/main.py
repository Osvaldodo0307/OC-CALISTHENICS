from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from sqlalchemy import text
import os

from app.database import engine, Base, get_db
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
# Crear tablas (solo si no existen)
# =========================
Base.metadata.create_all(bind=engine)

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
