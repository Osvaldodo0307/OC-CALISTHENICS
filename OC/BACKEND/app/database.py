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

# Prioridad: DATABASE_URL (prod) -> Variables individuales MySQL -> SQLite (solo dev/fallback)
DATABASE_URL = (
    os.getenv("DATABASE_URL")
    or build_mysql_url()
    or "sqlite:///./oc_calisthenics.db"
)

# Configuración del engine
engine_kwargs = {}
if DATABASE_URL.startswith("sqlite"):
    # Solo para SQLite (fallback de desarrollo)
    engine_kwargs["connect_args"] = {"check_same_thread": False}
elif DATABASE_URL.startswith("mysql"):
    # Para MySQL: pool_pre_ping y pool_recycle ya están en create_engine
    pass

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
