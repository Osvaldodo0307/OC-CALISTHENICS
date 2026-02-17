import os
from typing import Dict, List, Optional
from datetime import date, timedelta
import json

def generate_routine_mock(assessment_data: Dict) -> Dict:
    """
    Generador MOCK de rutinas basado en datos de evaluación.
    Genera un plan mensual (4 semanas) determinístico.
    """
    goal = assessment_data.get("goal", "fuerza")
    level = assessment_data.get("level", "intermedio")
    days_per_week = assessment_data.get("days_per_week", 3)
    session_minutes = assessment_data.get("session_minutes", 60)
    equipment = assessment_data.get("equipment_json", {})
    preference = assessment_data.get("preference", "calistenia")
    
    # Rutinas base según objetivo
    routines = {
        "fuerza": {
            "principiante": {
                "warmup": "Movilidad articular 5 min, activación 5 min",
                "main": "Dominadas asistidas 3x5, Flexiones 3x8, Sentadillas 3x10",
                "accessories": "Plancha 3x30s, Hollow body 3x15s",
                "cooldown": "Estiramiento 5 min"
            },
            "intermedio": {
                "warmup": "Movilidad articular 5 min, activación 5 min",
                "main": "Dominadas 4x6, Flexiones diamante 4x10, Pistol squat 3x5 cada pierna",
                "accessories": "Plancha avanzada 3x45s, L-sit 3x20s",
                "cooldown": "Estiramiento 10 min"
            },
            "avanzado": {
                "warmup": "Movilidad articular 10 min, activación 10 min",
                "main": "Muscle-up 4x3, Handstand push-ups 4x5, Pistol squat 4x8",
                "accessories": "Front lever progression 3x30s, Planche progression 3x20s",
                "cooldown": "Estiramiento 15 min"
            }
        },
        "hipertrofia": {
            "principiante": {
                "warmup": "Movilidad articular 5 min, activación 5 min",
                "main": "Dominadas 3x8, Flexiones 4x12, Sentadillas 4x15",
                "accessories": "Dips 3x10, Abdominales 3x20",
                "cooldown": "Estiramiento 5 min"
            },
            "intermedio": {
                "warmup": "Movilidad articular 5 min, activación 5 min",
                "main": "Dominadas 4x10, Flexiones inclinadas 4x15, Sentadillas búlgaras 4x12",
                "accessories": "Dips 4x12, Abdominales 4x25, Pull-ups 3x8",
                "cooldown": "Estiramiento 10 min"
            },
            "avanzado": {
                "warmup": "Movilidad articular 10 min, activación 10 min",
                "main": "Muscle-up 4x6, Handstand push-ups 4x8, Sentadillas pistola 4x10",
                "accessories": "Front lever rows 4x8, Planche push-ups 3x5, Dips 4x15",
                "cooldown": "Estiramiento 15 min"
            }
        },
        "resistencia": {
            "principiante": {
                "warmup": "Movilidad articular 5 min",
                "main": "Circuito: 10 flexiones, 10 sentadillas, 10 burpees x 3 rondas",
                "accessories": "Caminata 10 min, Estiramiento ligero",
                "cooldown": "Estiramiento 5 min"
            },
            "intermedio": {
                "warmup": "Movilidad articular 5 min",
                "main": "Circuito: 15 flexiones, 15 sentadillas, 15 burpees, 10 dominadas x 4 rondas",
                "accessories": "Trote 15 min, Estiramiento",
                "cooldown": "Estiramiento 10 min"
            },
            "avanzado": {
                "warmup": "Movilidad articular 10 min",
                "main": "Circuito: 20 flexiones, 20 sentadillas, 20 burpees, 15 dominadas x 5 rondas",
                "accessories": "Running 20 min, Estiramiento intenso",
                "cooldown": "Estiramiento 15 min"
            }
        },
        "spartan": {
            "principiante": {
                "warmup": "Movilidad articular 10 min",
                "main": "Obstáculos: Cargar peso 3x50m, Trepar 3x5, Arrastre 3x20m",
                "accessories": "Resistencia: 5k caminata, Fuerza funcional",
                "cooldown": "Estiramiento 10 min"
            },
            "intermedio": {
                "warmup": "Movilidad articular 10 min",
                "main": "Obstáculos: Cargar peso 4x100m, Trepar 4x8, Arrastre 4x30m, Rope climb 3x3",
                "accessories": "Resistencia: 5k trote, Fuerza funcional avanzada",
                "cooldown": "Estiramiento 15 min"
            },
            "avanzado": {
                "warmup": "Movilidad articular 15 min",
                "main": "Obstáculos: Cargar peso 5x150m, Trepar 5x10, Arrastre 5x50m, Rope climb 4x5",
                "accessories": "Resistencia: 10k, Fuerza funcional elite",
                "cooldown": "Estiramiento 20 min"
            }
        }
    }
    
    # Seleccionar rutina base
    routine_template = routines.get(goal, routines["fuerza"]).get(level, routines["fuerza"]["intermedio"])
    
    # Días de la semana
    days = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"]
    
    # Generar plan de 4 semanas
    plan_items = []
    week_variations = {
        1: "Semana de adaptación - intensidad moderada",
        2: "Semana de progresión - aumentar volumen 10%",
        3: "Semana de intensidad - máxima carga",
        4: "Semana de deload - recuperación activa"
    }
    
    for week in range(1, 5):
        week_notes = week_variations.get(week, "")
        for day_idx in range(days_per_week):
            day_label = days[day_idx]
            
            # Variar ejercicios según semana
            if week == 2:
                main = routine_template["main"].replace("3x", "4x").replace("4x", "5x")
            elif week == 3:
                main = routine_template["main"] + " + 1 serie extra"
            elif week == 4:
                main = routine_template["main"].replace("4x", "3x").replace("5x", "3x")
            else:
                main = routine_template["main"]
            
            plan_items.append({
                "week_number": week,
                "day_label": day_label,
                "warmup": routine_template["warmup"],
                "main": main,
                "accessories": routine_template["accessories"],
                "cooldown": routine_template["cooldown"],
                "notes": week_notes if day_idx == 0 else ""
            })
    
    return {
        "title": f"Plan {goal.capitalize()} - {level.capitalize()} - 4 Semanas",
        "goal": f"Desarrollar {goal} mediante entrenamiento {preference}",
        "items": plan_items
    }

def generate_routine_ai(assessment_data: Dict) -> Dict:
    """
    Generador real con IA (OpenAI). 
    Si no hay API key, usa el mock.
    """
    api_key = os.getenv("OPENAI_API_KEY")
    
    if not api_key:
        return generate_routine_mock(assessment_data)
    
    # TODO: Implementar llamada real a OpenAI
    # Por ahora, usar mock
    return generate_routine_mock(assessment_data)
