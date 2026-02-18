import requests

API = "https://oc-calisthenics.onrender.com"

STUDENTS = [
    {"name": "Liria Villegas",             "username": "liria.villegas"},
    {"name": "Arlette Román",              "username": "arlette.roman"},
    {"name": "Norma Edit",                 "username": "norma.edit"},
    {"name": "Cynthia Juárez Perez",       "username": "cynthia.juarez"},
    {"name": "Miguel Marroquín",           "username": "miguel.marroquin"},
    {"name": "Martín Juárez",              "username": "martin.juarez"},
    {"name": "Saúl Juárez",                "username": "saul.juarez"},
    {"name": "Laura",                      "username": "laura"},
    {"name": "Guadalupe",                  "username": "guadalupe"},
    {"name": "Osvaldo",                    "username": "osvaldo"},
    {"name": "Irma García",                "username": "irma.garcia"},
    {"name": "Fernanda Alva",              "username": "fernanda.alva"},
    {"name": "Uriel Cardiel",              "username": "uriel.cardiel"},
    {"name": "Angelina Hernández Garcia",  "username": "angelina.hernandez"},
    {"name": "Vero Juárez",                "username": "vero.juarez"},
    {"name": "Arya Cuellar",               "username": "arya.cuellar"},
    {"name": "Patricio Cuellar",           "username": "patricio.cuellar"},
    {"name": "Zuleika de Zenteno",         "username": "zuleika.zenteno"},
    {"name": "Daniel Albertano Zenteno",   "username": "daniel.zenteno"},
    {"name": "Nicole Zenteno",             "username": "nicole.zenteno"},
    {"name": "Carlos Ernesto",             "username": "carlos.ernesto"},
    {"name": "María Navarro Lara",         "username": "maria.navarro"},
    {"name": "Elena",                      "username": "elena"},
    {"name": "Rebeca Meléndez",            "username": "rebeca.melendez"},
]

def gen_password(username):
    first = username.split(".")[0]
    return first.capitalize() + "2026!"

# 1. Login as admin
print("Iniciando sesion como admin...")
r = requests.post(f"{API}/auth/login", data={"username": "octavio", "password": "OcAdmin2026!"})
if r.status_code != 200:
    print(f"ERROR login: {r.status_code} {r.text}")
    exit(1)

token = r.json()["access_token"]
headers = {"Authorization": f"Bearer {token}"}
print("Login exitoso.\n")

# 2. Create students
ok = 0
fail = 0
results = []

for s in STUDENTS:
    pwd = gen_password(s["username"])
    payload = {
        "username": s["username"],
        "name": s["name"],
        "password": pwd,
        "role": "socio",
    }
    r = requests.post(f"{API}/admin/users", json=payload, headers=headers)
    if r.status_code == 201:
        ok += 1
        results.append({"name": s["name"], "username": s["username"], "password": pwd, "status": "OK"})
        print(f"  OK  {s['name']} -> {s['username']}")
    else:
        fail += 1
        detail = r.json().get("detail", r.text) if r.headers.get("content-type", "").startswith("application/json") else r.text
        results.append({"name": s["name"], "username": s["username"], "password": pwd, "status": f"FAIL: {detail}"})
        print(f"  FAIL {s['name']} -> {detail}")

print(f"\n{'='*60}")
print(f"Creados: {ok} | Fallidos: {fail}")
print(f"{'='*60}\n")

print(f"{'Nombre':<35} {'Usuario':<25} {'Contraseña':<18} {'Estado'}")
print("-" * 100)
for r in results:
    print(f"{r['name']:<35} {r['username']:<25} {r['password']:<18} {r['status']}")
