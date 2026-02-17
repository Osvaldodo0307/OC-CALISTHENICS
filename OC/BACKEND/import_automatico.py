"""
Script automático para importar ejercicios
Intenta múltiples métodos hasta que funcione
"""
import sys
import os
import time
import subprocess
import requests
import signal

sys.path.append(os.path.dirname(os.path.abspath(__file__)))

import pandas as pd
import sqlite3
from app.database import DATABASE_URL

API_URL = "http://localhost:8000"
EXCEL_PATH = r"C:\Proyectos personales\APP GIMNASIO\Ejercicios.xlsx"
ADMIN_USERNAME = "admin"
ADMIN_PASSWORD = "admin123"

def check_server_running():
    """Verificar si el servidor está corriendo"""
    try:
        response = requests.get(f"{API_URL}/", timeout=2)
        return response.status_code == 200
    except:
        return False

def import_via_api():
    """Intentar importar usando el endpoint de la API"""
    print("[METODO 1] Intentando importar via API...")
    
    try:
        # Login
        response = requests.post(
            f"{API_URL}/auth/login",
            data={"username": ADMIN_USERNAME, "password": ADMIN_PASSWORD},
            timeout=5
        )
        if response.status_code != 200:
            print(f"   [FALLO] Login fallo: {response.status_code}")
            return False
        
        token = response.json()["access_token"]
        headers = {"Authorization": f"Bearer {token}"}
        
        # Intentar importar
        with open(EXCEL_PATH, "rb") as f:
            files = {"file": (os.path.basename(EXCEL_PATH), f, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")}
            response = requests.post(
                f"{API_URL}/admin/import-exercises",
                headers=headers,
                files=files,
                timeout=60
            )
        
        if response.status_code == 200:
            result = response.json()
            print(f"   [OK] Importacion via API exitosa!")
            print(f"   - Importados: {result['imported']}")
            print(f"   - Omitidos: {result['skipped']}")
            print(f"   - Total: {result['total_in_database']}")
            return True
        else:
            print(f"   [FALLO] Endpoint no disponible: {response.status_code}")
            return False
            
    except Exception as e:
        print(f"   [FALLO] Error: {e}")
        return False

def import_via_sql():
    """Importar directamente usando SQL"""
    print("[METODO 2] Intentando importar directamente con SQL...")
    
    try:
        if DATABASE_URL.startswith("sqlite:///"):
            db_path = DATABASE_URL.replace("sqlite:///", "")
        else:
            print("   [FALLO] Solo SQLite soportado")
            return False
        
        if not os.path.exists(db_path):
            print(f"   [FALLO] BD no encontrada: {db_path}")
            return False
        
        # Leer Excel
        df = pd.read_excel(EXCEL_PATH)
        df = df.dropna(subset=['Ejercicio', 'ID_GRUPO', 'ID_NIVEL'])
        print(f"   [INFO] {len(df)} filas encontradas")
        
        # Conectar con timeout corto
        conn = sqlite3.connect(db_path, timeout=5.0)
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
        
        # Importar en lotes pequeños
        batch_size = 10
        for i in range(0, len(df), batch_size):
            batch = df.iloc[i:i+batch_size]
            for _, row in batch.iterrows():
                try:
                    exercise_name = str(row['Ejercicio']).strip().replace("'", "''")
                    category = str(row['ID_GRUPO']).strip()
                    level = int(row['ID_NIVEL'])
                    
                    if category not in ['T.S.E', 'T.S.J', 'T.I', 'CORE'] or level < 1 or level > 5:
                        skipped += 1
                        continue
                    
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
                    else:
                        skipped += 1
                        
                except Exception as e:
                    skipped += 1
                    continue
            
            # Commit del lote
            try:
                conn.commit()
                print(f"   [INFO] Procesados {min(i+batch_size, len(df))}/{len(df)}... ({imported} importados)")
            except Exception as e:
                print(f"   [ADVERTENCIA] Error en commit, reintentando...")
                time.sleep(0.5)
                try:
                    conn.rollback()
                    conn = sqlite3.connect(db_path, timeout=5.0)
                    cursor = conn.cursor()
                except:
                    print(f"   [FALLO] No se pudo reconectar")
                    return False
        
        # Contar total
        cursor.execute("SELECT COUNT(*) FROM exercises")
        total = cursor.fetchone()[0]
        
        cursor.close()
        conn.close()
        
        print(f"   [OK] Importacion SQL exitosa!")
        print(f"   - Importados: {imported}")
        print(f"   - Omitidos: {skipped}")
        print(f"   - Total: {total}")
        return True
        
    except sqlite3.OperationalError as e:
        if "locked" in str(e).lower() or "I/O" in str(e):
            print(f"   [FALLO] Base de datos bloqueada por el servidor")
            return False
        else:
            print(f"   [FALLO] Error SQLite: {e}")
            return False
    except Exception as e:
        print(f"   [FALLO] Error: {e}")
        return False

def wait_for_server(max_wait=30):
    """Esperar a que el servidor esté disponible"""
    print(f"[INFO] Esperando a que el servidor esté disponible (max {max_wait}s)...")
    for i in range(max_wait):
        if check_server_running():
            print(f"[OK] Servidor disponible")
            return True
        time.sleep(1)
        if i % 5 == 0:
            print(f"   ... esperando ({i}/{max_wait}s)")
    return False

if __name__ == "__main__":
    print("=" * 60)
    print("IMPORTACION AUTOMATICA DE EJERCICIOS")
    print("=" * 60)
    print()
    
    if not os.path.exists(EXCEL_PATH):
        print(f"[ERROR] Archivo no encontrado: {EXCEL_PATH}")
        sys.exit(1)
    
    # Método 1: Intentar via API (sin detener servidor)
    if check_server_running():
        print("[INFO] Servidor detectado, intentando importar via API...")
        if import_via_api():
            print()
            print("[OK] Importacion completada exitosamente!")
            sys.exit(0)
        print()
    
    # Método 2: Intentar SQL directo (puede fallar si está bloqueado)
    print("[INFO] Intentando importacion directa con SQL...")
    if import_via_sql():
        print()
        print("[OK] Importacion completada exitosamente!")
        sys.exit(0)
    
    # Si ambos fallan, informar al usuario
    print()
    print("=" * 60)
    print("[ADVERTENCIA] No se pudo importar automaticamente")
    print("=" * 60)
    print()
    print("La base de datos esta bloqueada por el servidor.")
    print("Opciones:")
    print("1. Detener el servidor brevemente y ejecutar:")
    print("   python import_exercises_sql.py")
    print()
    print("2. Reiniciar el servidor y usar el endpoint:")
    print("   POST /admin/import-exercises en http://localhost:8000/docs")
    print()
    sys.exit(1)
