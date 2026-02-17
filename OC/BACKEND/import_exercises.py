"""
Script para importar ejercicios desde el archivo Excel
"""
import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

import pandas as pd
from sqlalchemy.orm import Session
from app.database import SessionLocal
from app.models import Exercise

# La tabla se creará automáticamente cuando el servidor inicie
# No intentamos crearla aquí para evitar conflictos si el servidor está corriendo

def import_exercises(excel_path: str):
    """Importa ejercicios desde el archivo Excel"""
    db = SessionLocal()
    try:
        # Leer el Excel
        df = pd.read_excel(excel_path)
        
        # Limpiar datos
        df = df.dropna(subset=['Ejercicio', 'ID_GRUPO', 'ID_NIVEL'])
        
        # NO eliminamos ejercicios existentes para evitar conflictos si el servidor está corriendo
        # Si necesitas limpiar, detén el servidor primero y descomenta las siguientes líneas:
        # db.query(Exercise).delete()
        # db.commit()
        
        # Importar ejercicios
        imported = 0
        skipped = 0
        
        for _, row in df.iterrows():
            exercise_name = str(row['Ejercicio']).strip()
            category = str(row['ID_GRUPO']).strip()
            level = int(row['ID_NIVEL'])
            
            # Validar categoría
            valid_categories = ['T.S.E', 'T.S.J', 'T.I', 'CORE']
            if category not in valid_categories:
                print(f"[ADVERTENCIA] Categoria invalida '{category}' para ejercicio '{exercise_name}'. Saltando...")
                skipped += 1
                continue
            
            # Validar nivel
            if level < 1 or level > 5:
                print(f"[ADVERTENCIA] Nivel invalido '{level}' para ejercicio '{exercise_name}'. Saltando...")
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
        
        db.commit()
        print(f"[OK] Importacion completada:")
        print(f"   - Ejercicios importados: {imported}")
        print(f"   - Ejercicios omitidos: {skipped}")
        print(f"   - Total en base de datos: {db.query(Exercise).count()}")
        
    except Exception as e:
        db.rollback()
        print(f"[ERROR] Error al importar ejercicios: {e}")
        raise
    finally:
        db.close()

if __name__ == "__main__":
    from find_excel import find_excel_file
    
    excel_path = find_excel_file()
    
    if not excel_path:
        print(f"[ERROR] No se encontro el archivo Ejercicios.xlsx")
        sys.exit(1)
    
    print(f"[INFO] Importando ejercicios desde: {excel_path}")
    import_exercises(excel_path)
