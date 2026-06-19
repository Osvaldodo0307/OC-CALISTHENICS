from datetime import date, timedelta

from app.models import User


def _create_user(db, username: str, role: str):
    from app.core.security import hash_password

    user = User(
        username=username,
        name=username.title(),
        password_hash=hash_password("Pass123!"),
        role=role,
        phone="5511111111",
        is_active=True,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


def _admin_headers(client, username: str):
    login = client.post("/auth/login", data={"username": username, "password": "Pass123!"})
    assert login.status_code == 200
    return {"Authorization": f"Bearer {login.json()['access_token']}"}


def _create_cycle(client, headers, user_id: int) -> int:
    today = date.today()
    response = client.post(
        "/membership/admin/cycle",
        headers=headers,
        json={
            "user_id": user_id,
            "membership_type": "Mensual",
            "cost": 1000,
            "start_date": (today - timedelta(days=10)).isoformat(),
            "end_date": (today + timedelta(days=20)).isoformat(),
            "manual_status": "activa",
        },
    )
    assert response.status_code == 200
    return response.json()["cycle_id"]


def test_summary_excludes_courtesy_from_real_income(client, db_session):
    _create_user(db_session, "admin_s1", "admin")
    socio = _create_user(db_session, "socio_s1", "socio")
    headers = _admin_headers(client, "admin_s1")
    cycle_id = _create_cycle(client, headers, socio.id)

    client.post(
        f"/membership/admin/cycle/{cycle_id}/payment",
        headers=headers,
        json={
            "amount": 0,
            "payment_method": "cortesia",
            "payment_action": "courtesy_extend",
            "period_duration_months": 1,
            "idempotency_key": "sum-cortesia",
        },
    )
    client.post(
        f"/membership/admin/cycle/{cycle_id}/payment",
        headers=headers,
        json={
            "amount": 500,
            "payment_method": "efectivo",
            "payment_action": "partial_debt",
            "idempotency_key": "sum-cash",
        },
    )

    summary = client.get("/membership/admin/summary", headers=headers).json()
    assert summary["month_income"] == 500
    assert summary["month_courtesies"] == 0


def test_summary_adjustment_income_flag(client, db_session):
    _create_user(db_session, "admin_s2", "admin")
    socio = _create_user(db_session, "socio_s2", "socio")
    headers = _admin_headers(client, "admin_s2")
    cycle_id = _create_cycle(client, headers, socio.id)

    client.post(
        f"/membership/admin/cycle/{cycle_id}/payment",
        headers=headers,
        json={
            "amount": 100,
            "payment_method": "ajuste",
            "payment_action": "admin_adjustment",
            "counts_as_income": False,
            "idempotency_key": "adj-no",
        },
    )
    client.post(
        f"/membership/admin/cycle/{cycle_id}/payment",
        headers=headers,
        json={
            "amount": 250,
            "payment_method": "ajuste",
            "payment_action": "admin_adjustment",
            "counts_as_income": True,
            "applies_to_balance": True,
            "idempotency_key": "adj-yes",
        },
    )

    summary = client.get("/membership/admin/summary", headers=headers).json()
    assert summary["month_income"] == 250
    assert summary["month_adjustments"] == 350
    assert summary["month_adjustments_income"] == 250


def test_reversed_payments_excluded_from_income(client, db_session):
    _create_user(db_session, "admin_s3", "admin")
    socio = _create_user(db_session, "socio_s3", "socio")
    headers = _admin_headers(client, "admin_s3")
    cycle_id = _create_cycle(client, headers, socio.id)

    pay = client.post(
        f"/membership/admin/cycle/{cycle_id}/payment",
        headers=headers,
        json={
            "amount": 1000,
            "payment_method": "efectivo",
            "payment_action": "renew_extend",
            "period_duration_months": 1,
            "idempotency_key": "sum-rev",
        },
    )
    payment_id = pay.json()["payment_id"]
    summary1 = client.get("/membership/admin/summary", headers=headers).json()
    assert summary1["month_income"] == 1000

    client.post(
        f"/membership/admin/payment/{payment_id}/reverse",
        headers=headers,
        json={"reason": "Anular para prueba resumen"},
    )
    summary2 = client.get("/membership/admin/summary", headers=headers).json()
    assert summary2["month_income"] == 0


def test_pending_estimate_uses_balance_flags(client, db_session):
    _create_user(db_session, "admin_s4", "admin")
    socio = _create_user(db_session, "socio_s4", "socio")
    headers = _admin_headers(client, "admin_s4")
    cycle_id = _create_cycle(client, headers, socio.id)

    client.post(
        f"/membership/admin/cycle/{cycle_id}/payment",
        headers=headers,
        json={
            "amount": 200,
            "payment_method": "ajuste",
            "payment_action": "admin_adjustment",
            "counts_as_income": True,
            "applies_to_balance": True,
            "idempotency_key": "pend-adj",
        },
    )

    clients = client.get("/membership/admin/clients?status=todos", headers=headers).json()
    row = next(r for r in clients if r["user_id"] == socio.id)
    assert row["pending_balance"] == 800

    summary = client.get("/membership/admin/summary", headers=headers).json()
    assert summary["pending_estimate"] >= 800
