"""
Crea el usuario administrador real de OC-Calisthenics.
Ejecutar: python create_admin.py
"""
import sys
import os
sys.path.insert(0, os.path.dirname(__file__))

from app.database import SessionLocal, engine, Base
from app.models import User
from app.core.security import hash_password

Base.metadata.create_all(bind=engine)

db = SessionLocal()

try:
    # Verificar si ya existe
    existing = db.query(User).filter(User.username == "octavio").first()
    if existing:
        print("El usuario 'octavio' ya existe. Actualizando...")
        existing.name = "Octavio Brambilla Piña"
        existing.password_hash = hash_password("OcAdmin2026!")
        existing.role = "admin"
        existing.phone = None
        db.commit()
        print(f"  Usuario actualizado: ID={existing.id}")
    else:
        # Crear usuario admin
        admin = User(
            username="octavio",
            name="Octavio Brambilla Piña",
            password_hash=hash_password("OcAdmin2026!"),
            role="admin",
            phone=None
        )
        db.add(admin)
        db.commit()
        db.refresh(admin)
        print(f"  Usuario creado: ID={admin.id}")

    print("\n--- Usuario Admin ---")
    print("  Nombre:   Octavio Brambilla Piña")
    print("  Username: octavio")
    print("  Password: OcAdmin2026!")
    print("  Rol:      admin")

except Exception as e:
    db.rollback()
    print(f"Error: {e}")
    import traceback
    traceback.print_exc()
finally:
    db.close()
