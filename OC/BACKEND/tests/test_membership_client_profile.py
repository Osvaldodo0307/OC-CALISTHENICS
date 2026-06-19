from datetime import date, timedelta

from app.core.security import hash_password
from app.models import User


def _create_user(db, username: str, role: str):
    user = User(
        username=username,
        name=username.title(),
        password_hash=hash_password("Pass123!"),
        role=role,
        phone="5512345678",
        is_active=True,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


def _login(client, username: str, password: str = "Pass123!"):
    return client.post("/auth/login", data={"username": username, "password": password})


def _admin_headers(client):
    login = _login(client, "admin_prof")
    assert login.status_code == 200
    return {"Authorization": f"Bearer {login.json()['access_token']}"}


def _create_cycle(client, headers, user_id: int, *, start: date, end: date, cost: float = 1000):
    response = client.post(
        "/membership/admin/cycle",
        headers=headers,
        json={
            "user_id": user_id,
            "membership_type": "Mensual",
            "cost": cost,
            "start_date": start.isoformat(),
            "end_date": end.isoformat(),
            "manual_status": "activa",
        },
    )
    assert response.status_code == 200
    return response.json()["cycle_id"]


def test_profile_requires_admin(client, db_session):
    _create_user(db_session, "admin_prof", "admin")
    _create_user(db_session, "coach_prof", "coach")
    coach_login = _login(client, "coach_prof")
    coach_headers = {"Authorization": f"Bearer {coach_login.json()['access_token']}"}
    socio = _create_user(db_session, "socio_prof", "socio")

    denied = client.get(f"/membership/admin/client/{socio.id}/profile", headers=coach_headers)
    assert denied.status_code == 403


def test_profile_includes_active_cycle_and_payments(client, db_session):
    _create_user(db_session, "admin_prof", "admin")
    socio = _create_user(db_session, "socio_prof", "socio")
    headers = _admin_headers(client)
    today = date.today()
    cycle_id = _create_cycle(client, headers, socio.id, start=today - timedelta(days=10), end=today + timedelta(days=20))

    pay = client.post(
        f"/membership/admin/cycle/{cycle_id}/payment",
        headers=headers,
        json={"amount": 500, "payment_method": "efectivo", "payment_action": "partial_debt", "idempotency_key": "prof-pay-1"},
    )
    assert pay.status_code == 200

    profile = client.get(f"/membership/admin/client/{socio.id}/profile", headers=headers)
    assert profile.status_code == 200
    data = profile.json()
    assert data["user_id"] == socio.id
    assert data["active_cycle"] is not None
    assert data["active_cycle"]["id"] == cycle_id
    assert len(data["payments"]) == 1
    assert data["payments"][0]["status_label"] == "ACTIVO"
    assert data["general"]["current_pending_balance"] == 500
    assert "flags" in data


def test_profile_includes_reversed_payment_and_lifo_flag(client, db_session):
    _create_user(db_session, "admin_prof", "admin")
    socio = _create_user(db_session, "socio_prof2", "socio")
    headers = _admin_headers(client)
    today = date.today()
    cycle_id = _create_cycle(client, headers, socio.id, start=today - timedelta(days=5), end=today + timedelta(days=25))

    p1 = client.post(
        f"/membership/admin/cycle/{cycle_id}/payment",
        headers=headers,
        json={"amount": 300, "payment_method": "efectivo", "idempotency_key": "prof-pay-a"},
    )
    p2 = client.post(
        f"/membership/admin/cycle/{cycle_id}/payment",
        headers=headers,
        json={"amount": 200, "payment_method": "transferencia", "idempotency_key": "prof-pay-b"},
    )
    assert p1.status_code == 200 and p2.status_code == 200
    first_id = p1.json()["payment_id"]
    second_id = p2.json()["payment_id"]

    profile = client.get(f"/membership/admin/client/{socio.id}/profile", headers=headers)
    payments = {p["id"]: p for p in profile.json()["payments"]}
    assert payments[first_id]["can_reverse"] is False
    assert payments[second_id]["can_reverse"] is True

    reverse = client.post(
        f"/membership/admin/payment/{second_id}/reverse",
        headers=headers,
        json={"reason": "Error de captura"},
    )
    assert reverse.status_code == 200

    profile_after = client.get(f"/membership/admin/client/{socio.id}/profile", headers=headers)
    reversed_payment = next(p for p in profile_after.json()["payments"] if p["id"] == second_id)
    assert reversed_payment["is_reversed"] is True
    assert reversed_payment["status_label"] == "REVERTIDO"


def test_profile_includes_followups_and_recent_contact(client, db_session):
    _create_user(db_session, "admin_prof", "admin")
    socio = _create_user(db_session, "socio_prof3", "socio")
    headers = _admin_headers(client)
    today = date.today()
    _create_cycle(client, headers, socio.id, start=today - timedelta(days=30), end=today - timedelta(days=1))

    client.post(
        f"/membership/admin/client/{socio.id}/followups/quick",
        headers=headers,
        params={"action": "contactado", "note": "Llamada realizada"},
    )

    profile = client.get(f"/membership/admin/client/{socio.id}/profile", headers=headers)
    data = profile.json()
    assert len(data["followups"]) >= 1
    assert data["general"]["is_recently_contacted"] is True
    assert "contactado_recientemente" in data["general"]["tags"]


def test_profile_handles_socio_without_payments(client, db_session):
    _create_user(db_session, "admin_prof", "admin")
    socio = _create_user(db_session, "socio_prof4", "socio")
    headers = _admin_headers(client)
    today = date.today()
    _create_cycle(client, headers, socio.id, start=today, end=today + timedelta(days=30))

    profile = client.get(f"/membership/admin/client/{socio.id}/profile", headers=headers)
    data = profile.json()
    assert data["flags"]["has_payments"] is False
    assert data["payments"] == []
    assert data["general"]["total_pending_balance"] == 1000


def test_profile_handles_suspended_socio(client, db_session):
    _create_user(db_session, "admin_prof", "admin")
    socio = _create_user(db_session, "socio_prof5", "socio")
    headers = _admin_headers(client)
    today = date.today()
    _create_cycle(client, headers, socio.id, start=today - timedelta(days=10), end=today + timedelta(days=20))

    suspend = client.put(f"/membership/{socio.id}/deactivate", headers=headers)
    assert suspend.status_code == 200

    profile = client.get(f"/membership/admin/client/{socio.id}/profile", headers=headers)
    data = profile.json()
    assert data["general"]["status"] == "suspendida"
    assert data["flags"]["can_suspend"] is False
    assert data["flags"]["can_unsuspend"] is True
    assert "suspendido" in data["general"]["tags"]


def test_profile_includes_debts_and_cycles_history(client, db_session):
    _create_user(db_session, "admin_prof", "admin")
    socio = _create_user(db_session, "socio_prof6", "socio")
    headers = _admin_headers(client)
    today = date.today()
    old_cycle = _create_cycle(client, headers, socio.id, start=today - timedelta(days=60), end=today - timedelta(days=30))
    client.post(
        f"/membership/admin/cycle/{old_cycle}/payment",
        headers=headers,
        json={"amount": 400, "payment_method": "efectivo", "payment_action": "partial_debt", "idempotency_key": "prof-old"},
    )
    _create_cycle(client, headers, socio.id, start=today - timedelta(days=29), end=today + timedelta(days=1))

    profile = client.get(f"/membership/admin/client/{socio.id}/profile", headers=headers)
    data = profile.json()
    assert len(data["cycles_history"]) >= 2
    assert len(data["debts"]) >= 1
    assert data["general"]["total_pending_balance"] > 0
