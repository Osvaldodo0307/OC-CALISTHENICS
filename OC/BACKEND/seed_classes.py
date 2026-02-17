"""
Genera el horario diario de clases de OC-Calisthenics para los proximos N dias.
Ejecutar: python seed_classes.py
"""
import sys
import os
sys.path.insert(0, os.path.dirname(__file__))

from datetime import datetime, date, timedelta
from app.database import SessionLocal, engine, Base
from app.models import ClassSession

SCHEDULE_TEMPLATE = [
    {"title": "OPEN GYM",                "discipline": "Open Gym",     "hour": 6,  "minute": 0, "duration": 720},
    {"title": "POWERLIFTING",             "discipline": "Powerlifting", "hour": 6,  "minute": 0, "duration": 720},
    {"title": "7:00 - 8:00 Calistenia",  "discipline": "Calistenia",  "hour": 7,  "minute": 0, "duration": 60},
    {"title": "8:00 - 9:00 Explosive",   "discipline": "Explosive",   "hour": 8,  "minute": 0, "duration": 60},
    {"title": "9:00 - 10:00 HYROX",      "discipline": "HYROX",       "hour": 9,  "minute": 0, "duration": 60},
    {"title": "10:00 - 11:00 GAP",       "discipline": "GAP",         "hour": 10, "minute": 0, "duration": 60},
    {"title": "17:00 - 18:00 Karate",    "discipline": "Karate",      "hour": 17, "minute": 0, "duration": 60},
    {"title": "18:00 - 19:00 Kickboxing","discipline": "Kickboxing",  "hour": 18, "minute": 0, "duration": 60},
    {"title": "19:00 - 20:00 Calistenia","discipline": "Calistenia",  "hour": 19, "minute": 0, "duration": 60},
    {"title": "20:00 - 21:00 Explosive", "discipline": "Explosive",   "hour": 20, "minute": 0, "duration": 60},
    {"title": "21:00 - 22:00 Funcional", "discipline": "Funcional",   "hour": 21, "minute": 0, "duration": 60},
    {"title": "22:00 - 23:00 HYROX",     "discipline": "HYROX",       "hour": 22, "minute": 0, "duration": 60},
]


def generate_schedule(days: int = 7):
    db = SessionLocal()
    try:
        today = date.today()
        created = 0
        skipped = 0

        for day_offset in range(days):
            current_date = today + timedelta(days=day_offset)
            for template in SCHEDULE_TEMPLATE:
                start_dt = datetime.combine(
                    current_date,
                    datetime.min.time().replace(
                        hour=template["hour"],
                        minute=template["minute"]
                    )
                )

                existing = db.query(ClassSession).filter(
                    ClassSession.title == template["title"],
                    ClassSession.start_datetime == start_dt
                ).first()

                if existing:
                    skipped += 1
                    continue

                new_class = ClassSession(
                    title=template["title"],
                    discipline=template["discipline"],
                    description=None,
                    intensity="med",
                    level="all",
                    duration_minutes=template["duration"],
                    capacity=999,
                    start_datetime=start_dt,
                    coach_id=None
                )
                db.add(new_class)
                created += 1

            print(f"  Dia {current_date.strftime('%Y-%m-%d')} ({current_date.strftime('%A')}): {len(SCHEDULE_TEMPLATE)} clases")

        db.commit()

        total = db.query(ClassSession).count()
        print(f"\nResumen:")
        print(f"  Clases creadas: {created}")
        print(f"  Clases ya existentes (omitidas): {skipped}")
        print(f"  Total en base de datos: {total}")

    except Exception as e:
        db.rollback()
        print(f"Error: {e}")
        import traceback
        traceback.print_exc()
    finally:
        db.close()


if __name__ == "__main__":
    days = int(sys.argv[1]) if len(sys.argv) > 1 else 7
    print(f"Generando horario de clases para los proximos {days} dias...\n")
    generate_schedule(days)
    print("\nListo!")
