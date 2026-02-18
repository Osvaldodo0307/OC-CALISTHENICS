import requests

API = "https://oc-calisthenics.onrender.com"

# Login as a student
r = requests.post(f"{API}/auth/login", data={"username": "liria.villegas", "password": "Liria2026!"})
print("Login status:", r.status_code)
token = r.json()["access_token"]
headers = {"Authorization": f"Bearer {token}"}

# Check classes for today and next days
for date in ["2026-02-17", "2026-02-18", "2026-02-19", "2026-02-20"]:
    r = requests.get(f"{API}/classes/?target_date={date}", headers=headers)
    data = r.json()
    print(f"\n{date}: {len(data)} clases")
    for c in data[:3]:
        print(f"  {c['id']}: {c['title']} | {c['start_datetime']} | booked_by_me: {c.get('is_booked_by_me')}")

# Try booking
if data:
    class_id = data[0]["id"]
    print(f"\nIntentando reservar clase {class_id}...")
    r = requests.post(f"{API}/bookings/", json={"class_id": class_id, "status": "booked"}, headers=headers)
    print(f"  Status: {r.status_code}")
    print(f"  Response: {r.text[:300]}")
