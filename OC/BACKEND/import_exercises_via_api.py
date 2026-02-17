"""
Script para importar ejercicios usando el endpoint de la API
No requiere detener el servidor
"""
import requests
import os

import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
from find_excel import find_excel_file

# Configuración
API_URL = "http://localhost:8000"
EXCEL_PATH = find_excel_file()

# Credenciales de admin (ajusta según tus datos de seed)
ADMIN_USERNAME = "admin"
ADMIN_PASSWORD = "admin123"

def login():
    """Obtener token de autenticación"""
    response = requests.post(
        f"{API_URL}/auth/login",
        data={
            "username": ADMIN_USERNAME,
            "password": ADMIN_PASSWORD
        }
    )
    if response.status_code == 200:
        return response.json()["access_token"]
    else:
        print(f"Error al hacer login: {response.status_code} - {response.text}")
        return None

def import_exercises(token):
    """Importar ejercicios usando el endpoint de la API"""
    if not EXCEL_PATH or not os.path.exists(EXCEL_PATH):
        print(f"[ERROR] No se encontro el archivo Ejercicios.xlsx")
        return False
    
    headers = {"Authorization": f"Bearer {token}"}
    
    # Verificar que el endpoint existe
    print(f"[INFO] Verificando endpoint {API_URL}/admin/import-exercises...")
    check_response = requests.options(f"{API_URL}/admin/import-exercises", headers=headers)
    print(f"[DEBUG] OPTIONS response: {check_response.status_code}")
    
    with open(EXCEL_PATH, "rb") as f:
        files = {"file": (os.path.basename(EXCEL_PATH), f, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")}
        print(f"[INFO] Enviando archivo {EXCEL_PATH}...")
        response = requests.post(
            f"{API_URL}/admin/import-exercises",
            headers=headers,
            files=files
        )
    
    if response.status_code == 200:
        result = response.json()
        print(f"[OK] Importacion completada:")
        print(f"   - Ejercicios importados: {result['imported']}")
        print(f"   - Ejercicios omitidos: {result['skipped']}")
        print(f"   - Total en base de datos: {result['total_in_database']}")
        if result.get('errors'):
            print(f"   - Errores encontrados: {len(result['errors'])}")
            for error in result['errors'][:5]:
                print(f"     * {error}")
        return True
    else:
        print(f"[ERROR] Error al importar: {response.status_code}")
        print(f"   Respuesta: {response.text}")
        return False

if __name__ == "__main__":
    if not EXCEL_PATH:
        print(f"[ERROR] No se encontro el archivo Ejercicios.xlsx")
        print(f"[INFO] Por favor, coloca el archivo en una ubicacion accesible")
        sys.exit(1)
    print(f"[INFO] Conectando a {API_URL}...")
    
    # Login
    print("[INFO] Iniciando sesion como admin...")
    token = login()
    
    if not token:
        print("[ERROR] No se pudo obtener el token. Verifica las credenciales.")
        exit(1)
    
    print("[INFO] Token obtenido. Importando ejercicios...")
    
    # Importar ejercicios
    if import_exercises(token):
        print("[OK] Proceso completado exitosamente!")
    else:
        print("[ERROR] El proceso fallo.")
        exit(1)
