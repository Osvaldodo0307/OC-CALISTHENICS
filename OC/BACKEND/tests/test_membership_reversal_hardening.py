from datetime import date, timedelta
from uuid import uuid4

from app.domain.membership_renewal import add_months
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


def _create_cycle(client, headers, user_id: int, start: date, end: date, cost: float = 1000.0) -> int:
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


def _pay(client, headers, cycle_id: int, **payload):
    body = {"idempotency_key": str(uuid4())}
    body.update(payload)
    return client.post(f"/membership/admin/cycle/{cycle_id}/payment", headers=headers, json=body)


def test_reverse_last_renewal_restores_vigencia(client, db_session):
    _create_user(db_session, "admin_r1", "admin")
    socio = _create_user(db_session, "socio_r1", "socio")
    headers = _admin_headers(client, "admin_r1")
    today = date.today()
    end = today + timedelta(days=4)
    cycle_id = _create_cycle(client, headers, socio.id, today - timedelta(days=26), end)

    pay = _pay(
        client,
        headers,
        cycle_id,
        amount=1000,
        payment_method="efectivo",
        payment_action="renew_extend",
        period_duration_months=1,
    )
    assert pay.status_code == 200
    payment_id = pay.json()["payment_id"]
    expected_extended = add_months(end, 1).isoformat()

    reverse = client.post(
        f"/membership/admin/payment/{payment_id}/reverse",
        headers=headers,
        json={"reason": "Prueba restauracion vigencia"},
    )
    assert reverse.status_code == 200
    assert reverse.json()["vigencia_reverted"] is True
    assert reverse.json()["new_end_date"] == end.isoformat()

    detail = client.get(f"/membership/admin/client/{socio.id}", headers=headers)
    assert detail.json()["active_cycle"]["end_date"] == end.isoformat()


def test_reverse_partial_does_not_change_vigencia(client, db_session):
    _create_user(db_session, "admin_r2", "admin")
    socio = _create_user(db_session, "socio_r2", "socio")
    headers = _admin_headers(client, "admin_r2")
    today = date.today()
    end = today + timedelta(days=20)
    cycle_id = _create_cycle(client, headers, socio.id, today - timedelta(days=10), end)

    pay = _pay(
        client,
        headers,
        cycle_id,
        amount=400,
        payment_method="efectivo",
        payment_action="partial_debt",
    )
    assert pay.status_code == 200
    payment_id = pay.json()["payment_id"]
    assert pay.json()["vigencia_extended"] is False

    reverse = client.post(
        f"/membership/admin/payment/{payment_id}/reverse",
        headers=headers,
        json={"reason": "Correccion abono parcial"},
    )
    assert reverse.status_code == 200
    assert reverse.json()["vigencia_reverted"] is False
    assert reverse.json()["new_end_date"] == end.isoformat()
    assert reverse.json()["pending_balance"] == 1000


def test_reverse_courtesy_restores_vigencia_not_income(client, db_session):
    _create_user(db_session, "admin_r3", "admin")
    socio = _create_user(db_session, "socio_r3", "socio")
    headers = _admin_headers(client, "admin_r3")
    today = date.today()
    end = today + timedelta(days=2)
    cycle_id = _create_cycle(client, headers, socio.id, today - timedelta(days=28), end)

    pay = _pay(
        client,
        headers,
        cycle_id,
        amount=0,
        payment_method="cortesia",
        payment_action="courtesy_extend",
        period_duration_months=1,
    )
    assert pay.status_code == 200
    payment_id = pay.json()["payment_id"]
    extended = pay.json()["new_end_date"]

    reverse = client.post(
        f"/membership/admin/payment/{payment_id}/reverse",
        headers=headers,
        json={"reason": "Cortesia cancelada"},
    )
    assert reverse.status_code == 200
    assert reverse.json()["vigencia_reverted"] is True
    assert reverse.json()["new_end_date"] == end.isoformat()

    summary_before = client.get("/membership/admin/summary", headers=headers).json()
    assert summary_before["month_income"] == 0


def test_reverse_adjustment_respects_income_flag(client, db_session):
    _create_user(db_session, "admin_r4", "admin")
    socio = _create_user(db_session, "socio_r4", "socio")
    headers = _admin_headers(client, "admin_r4")
    today = date.today()
    cycle_id = _create_cycle(client, headers, socio.id, today - timedelta(days=5), today + timedelta(days=25))

    pay_no_income = _pay(
        client,
        headers,
        cycle_id,
        amount=200,
        payment_method="ajuste",
        payment_action="admin_adjustment",
        counts_as_income=False,
        applies_to_balance=False,
    )
    assert pay_no_income.status_code == 200
    summary = client.get("/membership/admin/summary", headers=headers).json()
    assert summary["month_income"] == 0
    assert summary["month_adjustments"] == 200

    pay_income = _pay(
        client,
        headers,
        cycle_id,
        amount=300,
        payment_method="ajuste",
        payment_action="admin_adjustment",
        counts_as_income=True,
        applies_to_balance=True,
    )
    assert pay_income.status_code == 200
    payment_id = pay_income.json()["payment_id"]
    summary2 = client.get("/membership/admin/summary", headers=headers).json()
    assert summary2["month_income"] == 300
    assert summary2["month_adjustments_income"] == 300

    reverse = client.post(
        f"/membership/admin/payment/{payment_id}/reverse",
        headers=headers,
        json={"reason": "Ajuste incorrecto"},
    )
    assert reverse.status_code == 200
    summary3 = client.get("/membership/admin/summary", headers=headers).json()
    assert summary3["month_income"] == 0


def test_reverse_out_of_order_is_blocked(client, db_session):
    _create_user(db_session, "admin_r5", "admin")
    socio = _create_user(db_session, "socio_r5", "socio")
    headers = _admin_headers(client, "admin_r5")
    today = date.today()
    end = today + timedelta(days=5)
    cycle_id = _create_cycle(client, headers, socio.id, today - timedelta(days=25), end)

    pay1 = _pay(
        client,
        headers,
        cycle_id,
        amount=1000,
        payment_method="efectivo",
        payment_action="renew_extend",
        period_duration_months=1,
    )
    assert pay1.status_code == 200
    pay1_id = pay1.json()["payment_id"]
    end_after_first = pay1.json()["new_end_date"]

    pay2 = _pay(
        client,
        headers,
        cycle_id,
        amount=1000,
        payment_method="efectivo",
        payment_action="renew_extend",
        period_duration_months=1,
    )
    assert pay2.status_code == 200
    end_after_second = pay2.json()["new_end_date"]
    assert end_after_second != end_after_first

    blocked = client.post(
        f"/membership/admin/payment/{pay1_id}/reverse",
        headers=headers,
        json={"reason": "Intento fuera de orden"},
    )
    assert blocked.status_code == 409
    assert "posterior" in blocked.json()["detail"].lower() or "reciente" in blocked.json()["detail"].lower()

    detail = client.get(f"/membership/admin/client/{socio.id}", headers=headers)
    assert detail.json()["active_cycle"]["end_date"] == end_after_second

    pay2_id = pay2.json()["payment_id"]
    ok_reverse = client.post(
        f"/membership/admin/payment/{pay2_id}/reverse",
        headers=headers,
        json={"reason": "Revertir el mas reciente primero"},
    )
    assert ok_reverse.status_code == 200
    assert ok_reverse.json()["new_end_date"] == end_after_first


def test_partial_accumulation_does_not_auto_extend(client, db_session):
    _create_user(db_session, "admin_r6", "admin")
    socio = _create_user(db_session, "socio_r6", "socio")
    headers = _admin_headers(client, "admin_r6")
    today = date.today()
    end = today + timedelta(days=15)
    cycle_id = _create_cycle(client, headers, socio.id, today - timedelta(days=15), end)

    p1 = _pay(client, headers, cycle_id, amount=400, payment_method="efectivo", payment_action="partial_debt")
    p2 = _pay(client, headers, cycle_id, amount=400, payment_method="efectivo", payment_action="partial_debt")
    p3 = _pay(client, headers, cycle_id, amount=200, payment_method="efectivo", payment_action="partial_debt")
    assert p1.status_code == p2.status_code == p3.status_code == 200

    detail = client.get(f"/membership/admin/client/{socio.id}", headers=headers)
    active = detail.json()["active_cycle"]
    assert active["end_date"] == end.isoformat()
    assert active["pending_balance"] == 0
    assert active["status"] in {"activa", "proxima_a_vencer", "vence_hoy"}
