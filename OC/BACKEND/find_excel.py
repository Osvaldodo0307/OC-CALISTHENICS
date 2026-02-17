"""
Helper para encontrar el archivo Excel de ejercicios de forma relativa
"""
import os

def find_excel_file():
    """
    Busca el archivo Ejercicios.xlsx en ubicaciones relativas y absolutas comunes.
    Retorna la ruta si se encuentra, None si no.
    """
    script_dir = os.path.dirname(os.path.abspath(__file__))
    project_root = os.path.dirname(os.path.dirname(script_dir))
    
    # Ubicaciones posibles (relativas primero, luego absolutas)
    possible_paths = [
        # Relativas al proyecto
        os.path.join(project_root, "Ejercicios.xlsx"),
        os.path.join(os.path.dirname(project_root), "Ejercicios.xlsx"),
        os.path.join(script_dir, "Ejercicios.xlsx"),
        # Absolutas comunes
        r"C:\Proyectos personales\APP GIMNASIO\Ejercicios.xlsx",
        os.path.expanduser(r"~\Documents\Ejercicios.xlsx"),
        os.path.expanduser(r"~\Desktop\Ejercicios.xlsx"),
    ]
    
    for path in possible_paths:
        if os.path.exists(path):
            return path
    
    return None
