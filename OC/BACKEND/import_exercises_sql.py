"""
Script para importar ejercicios usando SQL directo (más rápido y menos bloqueos)
"""
import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

import pandas as pd
import sqlite3
from app.database import DATABASE_URL
from find_excel import find_excel_file

def import_exercises(excel_path: str):
    """Importa ejercicios usando SQL directo"""
    if not os.path.exists(excel_path):
        print(f"[ERROR] No se encontro el archivo: {excel_path}")
        return False
    
    # Obtener ruta del archivo de base de datos
    if DATABASE_URL.startswith("sqlite:///"):
        db_path = DATABASE_URL.replace("sqlite:///", "")
    else:
        print(f"[ERROR] Solo se soporta SQLite con este metodo")
        return False
    
    if not os.path.exists(db_path):
        print(f"[ERROR] Base de datos no encontrada: {db_path}")
        return False
    
    print(f"[INFO] Leyendo archivo Excel: {excel_path}")
    df = pd.read_excel(excel_path)
    df = df.dropna(subset=['Ejercicio', 'ID_GRUPO', 'ID_NIVEL'])
    print(f"[INFO] Filas encontradas: {len(df)}")
    
    # Conectar a SQLite
    print(f"[INFO] Conectando a base de datos: {db_path}")
    conn = sqlite3.connect(db_path, timeout=30.0)
    cursor = conn.cursor()
    
    # Crear tabla si no existe
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
    errors = []
    
    print(f"[INFO] Importando ejercicios...")
    for idx, row in df.iterrows():
        try:
            exercise_name = str(row['Ejercicio']).strip().replace("'", "''")
            category = str(row['ID_GRUPO']).strip()
            level = int(row['ID_NIVEL'])
            
            # Validar
            if category not in ['T.S.E', 'T.S.J', 'T.I', 'CORE']:
                skipped += 1
                continue
            
            if level < 1 or level > 5:
                skipped += 1
                continue
            
            # Insertar usando INSERT OR IGNORE para evitar duplicados
            cursor.execute("""
                INSERT OR IGNORE INTO exercises (name, category, level)
                SELECT ?, ?, ?
                WHERE NOT EXISTS (
                    SELECT 1 FROM exercises 
                    WHERE name = ? AND category = ? AND level = ?
                )
            """, (exercise_name, category, level, exercise_name, category, level))
            
            if cursor.rowcount > 0:
                imported += 1
            
            # Commit cada 20 ejercicios
            if (imported + skipped) % 20 == 0:
                conn.commit()
                print(f"[INFO] Procesados {imported + skipped}/{len(df)}... ({imported} importados)")
                
        except Exception as e:
            errors.append(f"Fila {idx}: {str(e)}")
            skipped += 1
            continue
    
    conn.commit()
    
    # Contar total
    cursor.execute("SELECT COUNT(*) FROM exercises")
    total = cursor.fetchone()[0]
    
    cursor.close()
    conn.close()
    
    print(f"[OK] Importacion completada:")
    print(f"   - Ejercicios importados: {imported}")
    print(f"   - Ejercicios omitidos: {skipped}")
    print(f"   - Total en base de datos: {total}")
    if errors:
        print(f"   - Errores: {len(errors)}")
    
    return True

if __name__ == "__main__":
    excel_path = find_excel_file()
    
    if not excel_path:
        print(f"[ERROR] No se encontro el archivo Ejercicios.xlsx")
        print(f"[INFO] Por favor, coloca el archivo Ejercicios.xlsx en una de estas ubicaciones:")
        print(f"  - {os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))}")
        print(f"  - {os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))}")
        print(f"  - C:\\Proyectos personales\\APP GIMNASIO\\")
        sys.exit(1)
    
    print(f"[INFO] Importacion directa con SQL (sin detener servidor)")
    print()
    
    if import_exercises(excel_path):
        print()
        print("[OK] Proceso completado!")
    else:
        print()
        print("[ERROR] Proceso fallo")
        sys.exit(1)
