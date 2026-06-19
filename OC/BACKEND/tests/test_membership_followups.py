from datetime import date, timedelta

from app.core.security import hash_password
from app.models import MembershipFollowUp, MembershipFollowUpAudit, User
from app.services.membership_followup_service import (
    _is_contacted_recently,
    build_followup_inbox,
    build_followup_summary,
)
from app.utils.timezone import operational_now


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
    login = _login(client, "admin_fu")
    assert login.status_code == 200
    return {"Authorization": f"Bearer {login.json()['access_token']}"}


def _create_expired_cycle(client, headers, user_id: int, days_overdue: int = 5):
    start = date.today() - timedelta(days=40)
    end = date.today() - timedelta(days=days_overdue)
    response = client.post(
        "/membership/admin/cycle",
        headers=headers,
        json={
            "user_id": user_id,
            "membership_type": "Mensual",
            "cost": 1000,
            "start_date": start.isoformat(),
            "end_date": end.isoformat(),
            "manual_status": "activa",
        },
    )
    assert response.status_code == 200
    return response.json()["cycle_id"]


def test_followup_security_requires_admin(client, db_session):
    _create_user(db_session, "admin_fu", "admin")
    _create_user(db_session, "coach_fu", "coach")
    coach_login = _login(client, "coach_fu")
    coach_headers = {"Authorization": f"Bearer {coach_login.json()['access_token']}"}

    denied = client.get("/membership/admin/followups", headers=coach_headers)
    assert denied.status_code == 403


def test_create_followup_and_change_status(client, db_session):
    _create_user(db_session, "admin_fu", "admin")
    socio = _create_user(db_session, "socio_fu", "socio")
    headers = _admin_headers(client)
    cycle_id = _create_expired_cycle(client, headers, socio.id)

    create = client.post(
        "/membership/admin/followups",
        headers=headers,
        json={
            "user_id": socio.id,
            "membership_cycle_id": cycle_id,
            "followup_type": "vencido",
            "channel": "whatsapp",
            "status": "pendiente",
            "note": "Primer contacto",
        },
    )
    assert create.status_code == 200
    followup_id = create.json()["followup"]["id"]

    patch = client.patch(
        f"/membership/admin/followups/{followup_id}",
        headers=headers,
        json={"status": "contactado", "note": "Llamo y no contesto"},
    )
    assert patch.status_code == 200
    assert patch.json()["followup"]["status"] == "contactado"
    assert patch.json()["followup"]["contact_at"] is not None

    audits = db_session.query(MembershipFollowUpAudit).filter(MembershipFollowUpAudit.followup_id == followup_id).all()
    assert len(audits) >= 2


def test_schedule_next_followup_date(client, db_session):
    _create_user(db_session, "admin_fu", "admin")
    socio = _create_user(db_session, "socio_fu2", "socio")
    headers = _admin_headers(client)
    _create_expired_cycle(client, headers, socio.id)

    next_date = (date.today() + timedelta(days=2)).isoformat()
    quick = client.post(
        f"/membership/admin/client/{socio.id}/followups/quick",
        headers=headers,
        params={"action": "contactado", "note": "Programar retorno", "next_followup_at": f"{next_date}T10:00:00"},
    )
    assert quick.status_code == 200
    assert quick.json()["followup"]["next_followup_at"] is not None


def test_inbox_lists_vencidos_and_overdue_followups(client, db_session):
    _create_user(db_session, "admin_fu", "admin")
    socio = _create_user(db_session, "socio_fu3", "socio")
    headers = _admin_headers(client)
    _create_expired_cycle(client, headers, socio.id)

    inbox = client.get("/membership/admin/followups?status=vencidos", headers=headers)
    assert inbox.status_code == 200
    rows = inbox.json()
    assert any(r["user_id"] == socio.id for r in rows)

    yesterday = (date.today() - timedelta(days=1)).isoformat()
    client.post(
        f"/membership/admin/client/{socio.id}/followups/quick",
        headers=headers,
        params={"action": "pendiente", "next_followup_at": f"{yesterday}T09:00:00"},
    )
    overdue = client.get("/membership/admin/followups?status=seguimientos_atrasados", headers=headers)
    assert overdue.status_code == 200
    assert any(r["user_id"] == socio.id for r in overdue.json())


def test_detect_recent_contact(client, db_session):
    _create_user(db_session, "admin_fu", "admin")
    socio = _create_user(db_session, "socio_fu4", "socio")
    headers = _admin_headers(client)
    _create_expired_cycle(client, headers, socio.id)

    client.post(
        f"/membership/admin/client/{socio.id}/followups/quick",
        headers=headers,
        params={"action": "contactado"},
    )

    inbox = client.get("/membership/admin/followups", headers=headers)
    row = next(r for r in inbox.json() if r["user_id"] == socio.id)
    assert row["contacted_recently"] is True

    followup = db_session.query(MembershipFollowUp).filter(MembershipFollowUp.user_id == socio.id).first()
    assert _is_contacted_recently(followup, operational_now()) is True

    followup.contact_at = operational_now() - timedelta(hours=30)
    db_session.commit()
    assert _is_contacted_recently(followup, operational_now()) is False


def test_daily_summary(client, db_session):
    _create_user(db_session, "admin_fu", "admin")
    socio = _create_user(db_session, "socio_fu5", "socio")
    headers = _admin_headers(client)
    _create_expired_cycle(client, headers, socio.id)

    summary = client.get("/membership/admin/followups/summary", headers=headers)
    assert summary.status_code == 200
    data = summary.json()
    assert "pendientes_hoy" in data
    assert "vencidos" in data
    assert "contactados_hoy" in data
    assert data["vencidos"] >= 1

    service_summary = build_followup_summary(db_session)
    assert service_summary["total_bandeja"] >= 1


def test_client_followup_history(client, db_session):
    _create_user(db_session, "admin_fu", "admin")
    socio = _create_user(db_session, "socio_fu6", "socio")
    headers = _admin_headers(client)
    _create_expired_cycle(client, headers, socio.id)

    client.post(
        f"/membership/admin/client/{socio.id}/followups/quick",
        headers=headers,
        params={"action": "sin_respuesta", "note": "Sin respuesta por WhatsApp"},
    )
    history = client.get(f"/membership/admin/client/{socio.id}/followups", headers=headers)
    assert history.status_code == 200
    assert len(history.json()) >= 1
    assert history.json()[0]["status"] == "sin_respuesta"


def test_inbox_priority_sort_vencidos_con_adeudo_first(db_session, client):
    _create_user(db_session, "admin_fu", "admin")
    socio_debt = _create_user(db_session, "socio_debt", "socio")
    socio_soon = _create_user(db_session, "socio_soon", "socio")
    headers = _admin_headers(client)

    debt_cycle = _create_expired_cycle(client, headers, socio_debt.id, days_overdue=3)
    client.post(
        f"/membership/admin/cycle/{debt_cycle}/payment",
        headers=headers,
        json={"amount": 200, "payment_method": "efectivo", "payment_action": "partial_debt", "idempotency_key": "fu-debt-1"},
    )

    start = date.today()
    end = date.today() + timedelta(days=2)
    soon_cycle = client.post(
        "/membership/admin/cycle",
        headers=headers,
        json={
            "user_id": socio_soon.id,
            "membership_type": "Mensual",
            "cost": 1000,
            "start_date": start.isoformat(),
            "end_date": end.isoformat(),
            "manual_status": "activa",
        },
    )
    soon_cycle_id = soon_cycle.json()["cycle_id"]
    paid_soon = client.post(
        f"/membership/admin/cycle/{soon_cycle_id}/payment",
        headers=headers,
        json={"amount": 1000, "payment_method": "efectivo", "payment_action": "register_only", "idempotency_key": "fu-soon-paid"},
    )
    assert paid_soon.status_code == 200

    inbox = build_followup_inbox(db_session, status_filter="todos")
    debt_row = next(row for row in inbox if row["user_id"] == socio_debt.id)
    soon_row = next(row for row in inbox if row["user_id"] == socio_soon.id)
    assert debt_row["priority_category"] == "vencidos_con_adeudo"
    assert soon_row["priority_category"] == "por_vencer"
    assert debt_row["priority_rank"] < soon_row["priority_rank"]
