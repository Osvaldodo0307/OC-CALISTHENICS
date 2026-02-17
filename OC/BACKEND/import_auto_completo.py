"""
Script completamente automático para importar ejercicios
Intenta múltiples estrategias hasta lograr la importación
"""
import sys
import os
import time
import subprocess

sys.path.append(os.path.dirname(os.path.abspath(__file__)))

import pandas as pd
import sqlite3
from app.database import DATABASE_URL

EXCEL_PATH = r"C:\Proyectos personales\APP GIMNASIO\Ejercicios.xlsx"

def import_with_retries(max_attempts=10, delay=2):
    """Importar con múltiples reintentos esperando que se libere la BD"""
    if DATABASE_URL.startswith("sqlite:///"):
        db_path = DATABASE_URL.replace("sqlite:///", "")
    else:
        print("[ERROR] Solo SQLite soportado")
        return False
    
    if not os.path.exists(db_path):
        print(f"[ERROR] BD no encontrada: {db_path}")
        return False
    
    # Leer Excel una vez
    print(f"[INFO] Leyendo Excel: {EXCEL_PATH}")
    df = pd.read_excel(EXCEL_PATH)
    df = df.dropna(subset=['Ejercicio', 'ID_GRUPO', 'ID_NIVEL'])
    print(f"[INFO] {len(df)} ejercicios a importar")
    
    for attempt in range(1, max_attempts + 1):
        print(f"\n[INTENTO {attempt}/{max_attempts}] Intentando importar...")
        
        try:
            # Conectar con timeout muy corto para detectar bloqueos rápido
            conn = sqlite3.connect(db_path, timeout=3.0)
            cursor = conn.cursor()
            
            # Crear tabla
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS exercises (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    name VARCHAR NOT NULL,
                    category VARCHAR NOT NULL,
                    level INTEGER NOT NULL,
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
                )
            """)
            conn.commit()
            
            imported = 0
            skipped = 0
            
            # Procesar en lotes muy pequeños para commits rápidos
            batch = []
            for idx, row in df.iterrows():
                try:
                    exercise_name = str(row['Ejercicio']).strip().replace("'", "''")
                    category = str(row['ID_GRUPO']).strip()
                    level = int(row['ID_NIVEL'])
                    
                    if category not in ['T.S.E', 'T.S.J', 'T.I', 'CORE'] or level < 1 or level > 5:
                        skipped += 1
                        continue
                    
                    batch.append((exercise_name, category, level))
                    
                    # Commit cada 5 ejercicios
                    if len(batch) >= 5:
                        for ex_name, cat, lev in batch:
                            cursor.execute("""
                                INSERT OR IGNORE INTO exercises (name, category, level)
                                SELECT ?, ?, ?
                                WHERE NOT EXISTS (
                                    SELECT 1 FROM exercises 
                                    WHERE name = ? AND category = ? AND level = ?
                                )
                            """, (ex_name, cat, lev, ex_name, cat, lev))
                            if cursor.rowcount > 0:
                                imported += 1
                            else:
                                skipped += 1
                        
                        conn.commit()
                        batch = []
                        print(f"   Procesados: {imported + skipped}/{len(df)} ({imported} nuevos)")
                        
                except sqlite3.OperationalError as e:
                    if "locked" in str(e).lower() or "I/O" in str(e):
                        raise  # Re-lanzar para reintentar
                    skipped += 1
                    continue
                except Exception as e:
                    skipped += 1
                    continue
            
            # Procesar batch final
            if batch:
                for ex_name, cat, lev in batch:
                    cursor.execute("""
                        INSERT OR IGNORE INTO exercises (name, category, level)
                        SELECT ?, ?, ?
                        WHERE NOT EXISTS (
                            SELECT 1 FROM exercises 
                            WHERE name = ? AND category = ? AND level = ?
                        )
                    """, (ex_name, cat, lev, ex_name, cat, lev))
                    if cursor.rowcount > 0:
                        imported += 1
                    else:
                        skipped += 1
                conn.commit()
            
            # Verificar total
            cursor.execute("SELECT COUNT(*) FROM exercises")
            total = cursor.fetchone()[0]
            
            cursor.close()
            conn.close()
            
            print(f"\n[OK] Importacion exitosa!")
            print(f"   - Importados: {imported}")
            print(f"   - Omitidos: {skipped}")
            print(f"   - Total en BD: {total}")
            return True
            
        except sqlite3.OperationalError as e:
            if "locked" in str(e).lower() or "I/O" in str(e):
                if attempt < max_attempts:
                    wait_time = delay * attempt  # Esperar más en cada intento
                    print(f"   [BLOQUEADO] Base de datos en uso, esperando {wait_time}s...")
                    time.sleep(wait_time)
                    continue
                else:
                    print(f"   [FALLO] Base de datos sigue bloqueada después de {max_attempts} intentos")
                    return False
            else:
                print(f"   [ERROR] {e}")
                return False
        except Exception as e:
            print(f"   [ERROR] {e}")
            if attempt < max_attempts:
                time.sleep(delay)
                continue
            return False
    
    return False

if __name__ == "__main__":
    print("=" * 60)
    print("IMPORTACION AUTOMATICA DE EJERCICIOS")
    print("=" * 60)
    print()
    print("[INFO] Este script intentara importar automaticamente")
    print("[INFO] Esperara a que la base de datos se libere si esta bloqueada")
    print()
    
    if not os.path.exists(EXCEL_PATH):
        print(f"[ERROR] Archivo no encontrado: {EXCEL_PATH}")
        sys.exit(1)
    
    if import_with_retries(max_attempts=15, delay=3):
        print()
        print("=" * 60)
        print("[OK] IMPORTACION COMPLETADA EXITOSAMENTE!")
        print("=" * 60)
        print()
        print("[INFO] Los ejercicios ya estan disponibles para generar rutinas")
        print("[INFO] Puedes usar el sistema de generacion de rutinas ahora")
    else:
        print()
        print("=" * 60)
        print("[ADVERTENCIA] No se pudo importar automaticamente")
        print("=" * 60)
        print()
        print("La base de datos esta muy ocupada.")
        print("Por favor, deten el servidor brevemente y ejecuta:")
        print("   python import_exercises_sql.py")
        print()
        sys.exit(1)
