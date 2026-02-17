"""
Script para recrear las tablas con la estructura correcta
ADVERTENCIA: Esto eliminará todos los datos existentes
"""
from app.database import engine, Base
from app.models import *
from sqlalchemy import inspect, text

def recreate_tables():
    """Recrea todas las tablas con la estructura correcta"""
    inspector = inspect(engine)
    
    print("ADVERTENCIA: Esto eliminara todas las tablas y datos existentes")
    print("Presiona Ctrl+C para cancelar...")
    import time
    time.sleep(3)
    
    # Obtener todas las tablas
    tables = inspector.get_table_names()
    
    print(f"\nEliminando {len(tables)} tablas existentes...")
    
    # Eliminar todas las tablas en orden inverso (respetando foreign keys)
    with engine.connect() as conn:
        # Desactivar checks de foreign keys temporalmente
        conn.execute(text("SET FOREIGN_KEY_CHECKS = 0"))
        
        for table in reversed(tables):
            try:
                conn.execute(text(f"DROP TABLE IF EXISTS {table}"))
                print(f"  - Tabla '{table}' eliminada")
            except Exception as e:
                print(f"  - Error al eliminar '{table}': {e}")
        
        conn.commit()
        conn.execute(text("SET FOREIGN_KEY_CHECKS = 1"))
        conn.commit()
    
    print("\nCreando tablas con estructura correcta...")
    Base.metadata.create_all(bind=engine)
    
    print("\nTablas recreadas exitosamente!")
    print("Ahora puedes ejecutar: python seed.py")
    
    return True

if __name__ == "__main__":
    try:
        recreate_tables()
    except KeyboardInterrupt:
        print("\nOperacion cancelada")
    except Exception as e:
        print(f"\nError: {e}")
        import traceback
        traceback.print_exc()
