"""
Importación automática optimizada - intenta en momentos de baja actividad
"""
import sys
import os
import time
import sqlite3
import pandas as pd
from app.database import DATABASE_URL

EXCEL_PATH = r"C:\Proyectos personales\APP GIMNASIO\Ejercicios.xlsx"

def quick_import():
    """Importación rápida con múltiples estrategias"""
    if not DATABASE_URL.startswith("sqlite:///"):
        print("[ERROR] Solo SQLite")
        return False
    
    db_path = DATABASE_URL.replace("sqlite:///", "")
    if not os.path.exists(db_path):
        print(f"[ERROR] BD no encontrada")
        return False
    
    print(f"[INFO] Leyendo Excel...")
    df = pd.read_excel(EXCEL_PATH)
    df = df.dropna(subset=['Ejercicio', 'ID_GRUPO', 'ID_NIVEL'])
    print(f"[INFO] {len(df)} ejercicios encontrados")
    
    # Preparar datos
    exercises = []
    for _, row in df.iterrows():
        cat = str(row['ID_GRUPO']).strip()
        if cat in ['T.S.E', 'T.S.J', 'T.I', 'CORE']:
            level = int(row['ID_NIVEL'])
            if 1 <= level <= 5:
                exercises.append((
                    str(row['Ejercicio']).strip().replace("'", "''"),
                    cat,
                    level
                ))
    
    print(f"[INFO] {len(exercises)} ejercicios validos")
    
    # Intentar importación con estrategia agresiva
    for attempt in range(20):
        try:
            conn = sqlite3.connect(db_path, timeout=1.0)  # Timeout muy corto
            cursor = conn.cursor()
            
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
            # Insertar todos de una vez usando executemany
            try:
                cursor.executemany("""
                    INSERT OR IGNORE INTO exercises (name, category, level)
                    VALUES (?, ?, ?)
                """, exercises)
                imported = cursor.rowcount
                conn.commit()
            except:
                # Si falla, intentar uno por uno
                for ex in exercises:
                    try:
                        cursor.execute("""
                            INSERT OR IGNORE INTO exercises (name, category, level)
                            SELECT ?, ?, ?
                            WHERE NOT EXISTS (
                                SELECT 1 FROM exercises 
                                WHERE name = ? AND category = ? AND level = ?
                            )
                        """, (ex[0], ex[1], ex[2], ex[0], ex[1], ex[2]))
                        if cursor.rowcount > 0:
                            imported += 1
                        conn.commit()
                    except:
                        conn.rollback()
                        continue
            
            total = cursor.execute("SELECT COUNT(*) FROM exercises").fetchone()[0]
            cursor.close()
            conn.close()
            
            print(f"[OK] Importados: {imported}, Total en BD: {total}")
            return True
            
        except sqlite3.OperationalError:
            if attempt < 19:
                wait = min(0.5 * (attempt + 1), 5)  # Max 5 segundos
                time.sleep(wait)
                continue
        except Exception as e:
            print(f"[ERROR] {e}")
            time.sleep(1)
            continue
    
    return False

if __name__ == "__main__":
    print("Importacion automatica iniciada...")
    if quick_import():
        print("¡Completado!")
    else:
        print("No se pudo completar. La BD esta muy ocupada.")
        print("Sugerencia: Deten el servidor 5 segundos y ejecuta:")
        print("  python import_exercises_sql.py")
