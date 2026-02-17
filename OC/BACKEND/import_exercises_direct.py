"""
Script para importar ejercicios directamente a la base de datos
Usa la misma lógica que el endpoint pero sin pasar por HTTP
"""
import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

import pandas as pd
from sqlalchemy.orm import Session
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.database import DATABASE_URL
from app.models import Exercise, Base

# Crear engine y session con configuración para SQLite concurrente
if DATABASE_URL.startswith("sqlite"):
    # Habilitar WAL mode para permitir lecturas concurrentes
    engine = create_engine(
        DATABASE_URL, 
        connect_args={
            "check_same_thread": False, 
            "timeout": 30,
            "isolation_level": None  # Autocommit mode para SQLite
        },
        pool_pre_ping=True
    )
else:
    engine = create_engine(DATABASE_URL, connect_args={"connect_timeout": 30}, pool_pre_ping=True)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def import_exercises(excel_path: str):
    """Importa ejercicios desde el archivo Excel directamente a la base de datos"""
    import time
    
    # Intentar con múltiples sesiones si hay bloqueos
    max_retries = 3
    retry_delay = 2
    
    for attempt in range(max_retries):
        try:
            db = SessionLocal()
            print(f"[INFO] Intento {attempt + 1}/{max_retries} de conexion...")
            break
        except Exception as e:
            if attempt < max_retries - 1:
                print(f"[ADVERTENCIA] Error de conexion, reintentando en {retry_delay} segundos...")
                time.sleep(retry_delay)
            else:
                print(f"[ERROR] No se pudo conectar despues de {max_retries} intentos")
                return False
    try:
        print(f"[INFO] Conectando a la base de datos...")
        
        # Verificar que la tabla existe, si no, crearla
        try:
            Base.metadata.create_all(bind=engine, tables=[Exercise.__table__], checkfirst=True)
        except Exception as e:
            print(f"[ADVERTENCIA] No se pudo crear la tabla (puede que ya exista): {e}")
        
        print(f"[INFO] Leyendo archivo Excel: {excel_path}")
        # Leer el Excel
        df = pd.read_excel(excel_path)
        
        # Limpiar datos
        df = df.dropna(subset=['Ejercicio', 'ID_GRUPO', 'ID_NIVEL'])
        print(f"[INFO] Filas encontradas en Excel: {len(df)}")
        
        # Importar ejercicios
        imported = 0
        skipped = 0
        errors = []
        
        print(f"[INFO] Procesando ejercicios...")
        for idx, row in df.iterrows():
            try:
                exercise_name = str(row['Ejercicio']).strip()
                category = str(row['ID_GRUPO']).strip()
                level = int(row['ID_NIVEL'])
                
                # Validar categoría
                valid_categories = ['T.S.E', 'T.S.J', 'T.I', 'CORE']
                if category not in valid_categories:
                    errors.append(f"Categoría inválida '{category}' para ejercicio '{exercise_name}'")
                    skipped += 1
                    continue
                
                # Validar nivel
                if level < 1 or level > 5:
                    errors.append(f"Nivel inválido '{level}' para ejercicio '{exercise_name}'")
                    skipped += 1
                    continue
                
                # Verificar si ya existe
                existing = db.query(Exercise).filter(
                    Exercise.name == exercise_name,
                    Exercise.category == category,
                    Exercise.level == level
                ).first()
                
                if existing:
                    skipped += 1
                    continue
                
                # Crear nuevo ejercicio
                exercise = Exercise(
                    name=exercise_name,
                    category=category,
                    level=level
                )
                db.add(exercise)
                imported += 1
                
                # Commit cada 5 ejercicios para evitar bloqueos largos
                if imported % 5 == 0:
                    try:
                        db.commit()
                        print(f"[INFO] Procesados {imported + skipped}/{len(df)} ejercicios... ({imported} importados)")
                    except Exception as commit_error:
                        print(f"[ADVERTENCIA] Error en commit: {commit_error}")
                        print(f"[INFO] Esperando 1 segundo antes de continuar...")
                        time.sleep(1)
                        try:
                            db.rollback()
                        except:
                            pass
                        try:
                            db = SessionLocal()  # Nueva sesión
                        except:
                            print(f"[ERROR] No se pudo reconectar, abortando...")
                            return False
                    
            except Exception as e:
                errors.append(f"Error procesando fila {idx}: {str(e)}")
                skipped += 1
                continue
        
        # Commit final
        db.commit()
        total = db.query(Exercise).count()
        
        print(f"[OK] Importacion completada:")
        print(f"   - Ejercicios importados: {imported}")
        print(f"   - Ejercicios omitidos: {skipped}")
        print(f"   - Total en base de datos: {total}")
        if errors:
            print(f"   - Errores encontrados: {len(errors)}")
            for error in errors[:10]:
                print(f"     * {error}")
        
        return True
        
    except Exception as e:
        db.rollback()
        print(f"[ERROR] Error al importar ejercicios: {e}")
        import traceback
        traceback.print_exc()
        return False
    finally:
        db.close()

if __name__ == "__main__":
    from find_excel import find_excel_file
    
    excel_path = find_excel_file()
    
    if not excel_path:
        print(f"[ERROR] No se encontro el archivo Ejercicios.xlsx")
        sys.exit(1)
    
    print(f"[INFO] Iniciando importacion directa a la base de datos...")
    print(f"[INFO] Este metodo no requiere detener el servidor")
    print(f"[INFO] Archivo: {excel_path}")
    print()
    
    if import_exercises(excel_path):
        print()
        print("[OK] Proceso completado exitosamente!")
        print("[INFO] Los ejercicios ya estan disponibles para generar rutinas")
    else:
        print()
        print("[ERROR] El proceso fallo.")
        sys.exit(1)
