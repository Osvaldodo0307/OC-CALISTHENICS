import os
from dotenv import load_dotenv
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.ext.declarative import declarative_base

load_dotenv()

def build_mysql_url():
    host = os.getenv("DB_HOST")
    user = os.getenv("DB_USER")
    pwd  = os.getenv("DB_PASSWORD")
    name = os.getenv("DB_NAME")
    port = os.getenv("DB_PORT", "3306")
    if host and user and pwd and name:
        return f"mysql+pymysql://{user}:{pwd}@{host}:{port}/{name}?charset=utf8mb4"
    return None

# Prioridad: DATABASE_URL (prod/Supabase) -> Variables individuales MySQL -> SQLite (dev/fallback)
DATABASE_URL = (
    os.getenv("DATABASE_URL")
    or build_mysql_url()
    or "sqlite:///./oc_calisthenics.db"
)

# Algunos proveedores usan "postgres://" pero SQLAlchemy requiere "postgresql://"
if DATABASE_URL.startswith("postgres://"):
    DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql://", 1)

# Configuracion del engine segun el tipo de base de datos
engine_kwargs = {}
if DATABASE_URL.startswith("sqlite"):
    engine_kwargs["connect_args"] = {"check_same_thread": False}
elif DATABASE_URL.startswith("postgresql"):
    engine_kwargs["pool_size"] = 5
    engine_kwargs["max_overflow"] = 10

print(f"[DB] Conectando a: {DATABASE_URL.split('@')[1] if '@' in DATABASE_URL else DATABASE_URL[:30]}...")

engine = create_engine(
    DATABASE_URL,
    pool_pre_ping=True,
    pool_recycle=3600,
    **engine_kwargs
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
