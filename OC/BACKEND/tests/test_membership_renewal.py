from datetime import date, timedelta

from app.domain.membership_renewal import add_months, infer_payment_action
from app.domain.membership_rules import MembershipStatusContext, resolve_membership_status
from app.models import MembershipCycleAudit, User


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


def _admin_headers(client, username: str = "admin"):
    login = client.post("/auth/login", data={"username": username, "password": "Pass123!"})
    assert login.status_code == 200, login.text
    token = login.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}


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


def test_renewal_before_due_extends_from_end_date(client, db_session):
    _create_user(db_session, "admin", "admin")
    socio = _create_user(db_session, "socio_early", "socio")
    headers = _admin_headers(client)
    today = date.today()
    end = today + timedelta(days=5)
    start = end - timedelta(days=30)
    cycle_id = _create_cycle(client, headers, socio.id, start, end)

    pay = client.post(
        f"/membership/admin/cycle/{cycle_id}/payment",
        headers=headers,
        json={
            "amount": 1000,
            "payment_method": "efectivo",
            "payment_action": "renew_extend",
            "period_duration_months": 1,
            "idempotency_key": "renew-early",
        },
    )
    assert pay.status_code == 200
    expected_end = add_months(end, 1)
    assert pay.json()["new_end_date"] == expected_end.isoformat()
    assert pay.json()["vigencia_extended"] is True


def test_renewal_after_expired_extends_from_payment_date(client, db_session):
    _create_user(db_session, "admin2", "admin")
    socio = _create_user(db_session, "socio_late", "socio")
    headers = _admin_headers(client, "admin2")
    today = date.today()
    end = today - timedelta(days=10)
    start = end - timedelta(days=30)
    cycle_id = _create_cycle(client, headers, socio.id, start, end)

    pay = client.post(
        f"/membership/admin/cycle/{cycle_id}/payment",
        headers=headers,
        json={
            "amount": 1000,
            "payment_method": "transferencia",
            "payment_action": "renew_extend",
            "period_duration_months": 1,
            "payment_date": f"{today.isoformat()}T12:00:00",
            "idempotency_key": "renew-late",
        },
    )
    assert pay.status_code == 200
    expected_end = add_months(today, 1)
    assert pay.json()["new_end_date"] == expected_end.isoformat()


def test_partial_payment_keeps_debt(client, db_session):
    _create_user(db_session, "admin3", "admin")
    socio = _create_user(db_session, "socio_partial", "socio")
    headers = _admin_headers(client, "admin3")
    today = date.today()
    cycle_id = _create_cycle(client, headers, socio.id, today - timedelta(days=5), today + timedelta(days=25))

    pay = client.post(
        f"/membership/admin/cycle/{cycle_id}/payment",
        headers=headers,
        json={
            "amount": 400,
            "payment_method": "efectivo",
            "payment_action": "partial_debt",
            "idempotency_key": "partial-1",
        },
    )
    assert pay.status_code == 200
    body = pay.json()
    assert body["vigencia_extended"] is False
    assert body["pending_balance"] == 600
    assert body["status"] == "con_adeudo"


def test_courtesy_extends_without_real_income(client, db_session):
    _create_user(db_session, "admin4", "admin")
    socio = _create_user(db_session, "socio_cortesia", "socio")
    headers = _admin_headers(client, "admin4")
    today = date.today()
    end = today + timedelta(days=2)
    cycle_id = _create_cycle(client, headers, socio.id, today - timedelta(days=28), end)

    pay = client.post(
        f"/membership/admin/cycle/{cycle_id}/payment",
        headers=headers,
        json={
            "amount": 0,
            "payment_method": "cortesia",
            "payment_action": "courtesy_extend",
            "period_duration_months": 1,
            "idempotency_key": "cortesia-1",
        },
    )
    assert pay.status_code == 200
    assert pay.json()["counts_as_income"] is False
    assert pay.json()["vigencia_extended"] is True

    summary = client.get("/membership/admin/summary", headers=headers)
    assert summary.status_code == 200
    assert summary.json()["month_courtesies"] == 0


def test_reverse_payment_recalculates_balance_and_vigencia(client, db_session):
    _create_user(db_session, "admin5", "admin")
    socio = _create_user(db_session, "socio_reverse", "socio")
    headers = _admin_headers(client, "admin5")
    today = date.today()
    end = today + timedelta(days=3)
    cycle_id = _create_cycle(client, headers, socio.id, today - timedelta(days=27), end)

    pay = client.post(
        f"/membership/admin/cycle/{cycle_id}/payment",
        headers=headers,
        json={
            "amount": 1000,
            "payment_method": "efectivo",
            "payment_action": "renew_extend",
            "period_duration_months": 1,
            "idempotency_key": "reverse-pay",
        },
    )
    payment_id = pay.json()["payment_id"]
    previous_end = end.isoformat()

    reverse = client.post(
        f"/membership/admin/payment/{payment_id}/reverse",
        headers=headers,
        json={"reason": "Error de captura"},
    )
    assert reverse.status_code == 200
    assert reverse.json()["vigencia_reverted"] is True
    assert reverse.json()["new_end_date"] == previous_end
    assert reverse.json()["pending_balance"] == 1000

    audits = db_session.query(MembershipCycleAudit).filter(MembershipCycleAudit.membership_cycle_id == cycle_id).all()
    events = {a.new_payload.get("event") for a in audits}
    assert "payment_registered" in events
    assert "payment_reversed" in events


def test_status_precedence_after_operations():
    today = date.today()
    assert resolve_membership_status(MembershipStatusContext("suspendida", today + timedelta(days=2), 100, 100, today, 3)) == "suspendida"
    assert resolve_membership_status(MembershipStatusContext(None, today - timedelta(days=1), 100, 100, today, 3)) == "vencida"
    assert resolve_membership_status(MembershipStatusContext(None, today, 100, 100, today, 3)) == "vence_hoy"
    assert resolve_membership_status(MembershipStatusContext(None, today + timedelta(days=2), 100, 100, today, 3)) == "proxima_a_vencer"
    assert resolve_membership_status(MembershipStatusContext(None, today + timedelta(days=2), 100, 90, today, 3)) == "con_adeudo"


def test_infer_payment_action_defaults():
    assert infer_payment_action(explicit_action=None, payment_method="efectivo", amount=1000, pending_balance=1000) == "renew_extend"
    assert infer_payment_action(explicit_action=None, payment_method="efectivo", amount=400, pending_balance=1000) == "partial_debt"
    assert infer_payment_action(explicit_action=None, payment_method="cortesia", amount=0, pending_balance=0) == "courtesy_extend"
