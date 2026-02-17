"""
Script para verificar y corregir la estructura de las tablas en MySQL
"""
from app.database import engine, Base
from app.models import *
from sqlalchemy import inspect, text
from sqlalchemy.exc import OperationalError

def check_and_fix_tables():
    """Verifica y corrige la estructura de las tablas"""
    inspector = inspect(engine)
    
    # Verificar si la tabla users existe y tiene la estructura correcta
    if 'users' in inspector.get_table_names():
        columns = {col['name']: col for col in inspector.get_columns('users')}
        print("Columnas actuales en 'users':", list(columns.keys()))
        
        # Verificar si falta la columna 'name'
        if 'name' not in columns:
            print("\nLa columna 'name' no existe. Agregandola...")
            try:
                with engine.connect() as conn:
                    # Si existe full_name, copiar datos y luego agregar name
                    if 'full_name' in columns:
                        # Agregar columna name
                        conn.execute(text("ALTER TABLE users ADD COLUMN name VARCHAR(120) NULL AFTER username"))
                        conn.commit()
                        # Copiar datos de full_name a name
                        conn.execute(text("UPDATE users SET name = full_name WHERE name IS NULL"))
                        conn.commit()
                        # Hacer name NOT NULL
                        conn.execute(text("ALTER TABLE users MODIFY COLUMN name VARCHAR(120) NOT NULL"))
                        conn.commit()
                        # Hacer full_name nullable o con default para compatibilidad
                        try:
                            conn.execute(text("ALTER TABLE users MODIFY COLUMN full_name VARCHAR(120) NULL"))
                            conn.commit()
                        except:
                            pass  # Si ya es nullable, no importa
                        print("Columna 'name' agregada y datos migrados desde 'full_name'")
                    else:
                        # Agregar columna name sin datos previos
                        conn.execute(text("ALTER TABLE users ADD COLUMN name VARCHAR(120) NOT NULL DEFAULT '' AFTER username"))
                        conn.commit()
                        print("Columna 'name' agregada exitosamente")
            except Exception as e:
                print(f"Error al agregar columna 'name': {e}")
                return False
        else:
            print("La columna 'name' ya existe")
    else:
        print("Tabla 'users' no existe. Creandola...")
        Base.metadata.create_all(bind=engine)
        print("Tablas creadas")
    
    # Verificar y corregir tabla memberships
    if 'memberships' in inspector.get_table_names():
        columns = {col['name']: col for col in inspector.get_columns('memberships')}
        if 'plan' not in columns:
            print("\nAgregando columna 'plan' a 'memberships'...")
            try:
                with engine.connect() as conn:
                    conn.execute(text("ALTER TABLE memberships ADD COLUMN plan VARCHAR(20) NOT NULL DEFAULT 'grupal' AFTER status"))
                    conn.commit()
                print("Columna 'plan' agregada a 'memberships'")
            except Exception as e:
                print(f"Error al agregar columna 'plan': {e}")
    
    # Crear todas las tablas que falten
    print("\nVerificando todas las tablas...")
    Base.metadata.create_all(bind=engine)
    print("Todas las tablas estan actualizadas")
    
    return True

if __name__ == "__main__":
    try:
        if check_and_fix_tables():
            print("\nEstructura de tablas verificada y corregida")
            print("Ahora puedes ejecutar: python seed.py")
        else:
            print("\nHubo errores al corregir las tablas")
    except Exception as e:
        print(f"\nError: {e}")
        import traceback
        traceback.print_exc()
