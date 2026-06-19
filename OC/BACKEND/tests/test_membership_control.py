from datetime import date, timedelta

from app.core.security import hash_password
from app.domain.membership_rules import MembershipStatusContext, resolve_membership_status
from app.models import MembershipCycleAudit, User


def _create_user(db, username: str, role: str, is_active: bool = True):
    user = User(
        username=username,
        name=username.title(),
        password_hash=hash_password("Pass123!"),
        role=role,
        phone="5511111111",
        is_active=is_active,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


def _login(client, username: str, password: str = "Pass123!"):
    response = client.post("/auth/login", data={"username": username, "password": password})
    return response


def _admin_headers(client):
    login = _login(client, "admin")
    assert login.status_code == 200
    token = login.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}


def test_status_precedence_rules():
    today = date.today()
    assert resolve_membership_status(MembershipStatusContext("suspendida", today + timedelta(days=20), 100, 100, today, 3)) == "suspendida"
    assert resolve_membership_status(MembershipStatusContext(None, today - timedelta(days=1), 100, 100, today, 3)) == "vencida"
    assert resolve_membership_status(MembershipStatusContext(None, today + timedelta(days=1), 100, 90, today, 3)) == "con_adeudo"
    assert resolve_membership_status(MembershipStatusContext(None, today, 100, 100, today, 3)) == "vence_hoy"
    assert resolve_membership_status(MembershipStatusContext(None, today, 100, 90, today, 3)) == "con_adeudo"
    assert resolve_membership_status(MembershipStatusContext(None, today + timedelta(days=2), 100, 100, today, 3)) == "proxima_a_vencer"
    assert resolve_membership_status(MembershipStatusContext(None, today + timedelta(days=30), 100, 100, today, 3)) == "activa"


def test_login_blocked_for_inactive_user(client, db_session):
    _create_user(db_session, "inactive_admin", "admin", is_active=False)
    response = _login(client, "inactive_admin")
    assert response.status_code == 401


def test_admin_membership_core_flows(client, db_session):
    _create_user(db_session, "admin", "admin")
    student = _create_user(db_session, "socio1", "socio")
    coach = _create_user(db_session, "coach1", "coach")
    headers = _admin_headers(client)

    # bloquea no admin
    non_admin_login = _login(client, "coach1")
    coach_headers = {"Authorization": f"Bearer {non_admin_login.json()['access_token']}"}
    denied = client.get("/membership/admin/clients", headers=coach_headers)
    assert denied.status_code == 403

    # crear ciclo valido
    start = date.today()
    end = start + timedelta(days=30)
    create_cycle = client.post(
        "/membership/admin/cycle",
        headers=headers,
        json={
            "user_id": student.id,
            "membership_type": "Mensual",
            "cost": 1000,
            "start_date": start.isoformat(),
            "end_date": end.isoformat(),
            "manual_status": "activa",
        },
    )
    assert create_cycle.status_code == 200
    cycle_id = create_cycle.json()["cycle_id"]

    # rechazar ciclo invalido
    invalid_cycle = client.post(
        "/membership/admin/cycle",
        headers=headers,
        json={
            "user_id": student.id,
            "membership_type": "Mensual",
            "cost": 0,
            "start_date": start.isoformat(),
            "end_date": end.isoformat(),
        },
    )
    assert invalid_cycle.status_code == 400

    # registrar abono parcial
    partial = client.post(
        f"/membership/admin/cycle/{cycle_id}/payment",
        headers=headers,
        json={
            "amount": 400,
            "payment_method": "efectivo",
            "idempotency_key": "pay-1",
        },
    )
    assert partial.status_code == 200
    payment_partial_id = partial.json()["payment_id"]

    # rechazar pago duplicado
    duplicate = client.post(
        f"/membership/admin/cycle/{cycle_id}/payment",
        headers=headers,
        json={
            "amount": 400,
            "payment_method": "efectivo",
            "idempotency_key": "pay-1",
        },
    )
    assert duplicate.status_code == 409

    # rechazar sobrepago sin bandera
    reject_overpay = client.post(
        f"/membership/admin/cycle/{cycle_id}/payment",
        headers=headers,
        json={"amount": 700, "payment_method": "tarjeta", "payment_action": "partial_debt"},
    )
    assert reject_overpay.status_code == 409

    # registrar liquidacion
    liquidation = client.post(
        f"/membership/admin/cycle/{cycle_id}/payment",
        headers=headers,
        json={"amount": 600, "payment_method": "tarjeta", "idempotency_key": "pay-2"},
    )
    assert liquidation.status_code == 200

    # permitir sobrepago controlado
    allow_overpay = client.post(
        f"/membership/admin/cycle/{cycle_id}/payment",
        headers=headers,
        json={"amount": 10, "payment_method": "tarjeta", "allow_overpayment": True, "idempotency_key": "pay-3"},
    )
    assert allow_overpay.status_code == 200
    overpay_id = allow_overpay.json()["payment_id"]

    # revertir pago
    reverse = client.post(
        f"/membership/admin/payment/{overpay_id}/reverse",
        headers=headers,
        json={"reason": "captura incorrecta"},
    )
    assert reverse.status_code == 200

    # agregar nota
    note = client.post(
        f"/membership/admin/client/{student.id}/note",
        headers=headers,
        json={"note": "Pagara en partes"},
    )
    assert note.status_code == 200

    # edicion forzada con auditoria
    force_update = client.put(
        f"/membership/admin/cycle/{cycle_id}",
        headers=headers,
        json={
            "cost": 1200,
            "force_update": True,
            "change_reason": "Ajuste de plan autorizado",
        },
    )
    assert force_update.status_code == 200
    audits = db_session.query(MembershipCycleAudit).filter(MembershipCycleAudit.membership_cycle_id == cycle_id).all()
    assert len(audits) >= 1

    # renovar con deuda historica separada:
    # se crea deuda en ciclo nuevo y mantiene historico sin mezclar
    renew = client.post(
        "/membership/admin/cycle",
        headers=headers,
        json={
            "user_id": student.id,
            "membership_type": "Mensual",
            "cost": 1000,
            "start_date": (end + timedelta(days=1)).isoformat(),
            "end_date": (end + timedelta(days=31)).isoformat(),
            "manual_status": "activa",
        },
    )
    assert renew.status_code == 200
    new_cycle_id = renew.json()["cycle_id"]
    unpaid_new_cycle = client.post(
        f"/membership/admin/cycle/{new_cycle_id}/payment",
        headers=headers,
        json={"amount": 300, "payment_method": "transferencia", "idempotency_key": "pay-4"},
    )
    assert unpaid_new_cycle.status_code == 200

    detail = client.get(f"/membership/admin/client/{student.id}", headers=headers)
    assert detail.status_code == 200
    data = detail.json()
    assert data["current_pending_balance"] > 0
    assert data["historical_pending_balance"] >= 0
    assert data["total_pending_balance"] >= data["current_pending_balance"]

    # suspender membresia
    suspend = client.put(f"/membership/{student.id}/deactivate", headers=headers)
    assert suspend.status_code == 200

    # reactivar solo membresia (no usuario)
    reactivate_membership = client.put(f"/membership/{student.id}/reactivate", headers=headers)
    assert reactivate_membership.status_code == 200

    # marcar vencimiento + filtrar por estatus
    student2 = _create_user(db_session, "socio2", "socio")
    expired_cycle = client.post(
        "/membership/admin/cycle",
        headers=headers,
        json={
            "user_id": student2.id,
            "membership_type": "Mensual",
            "cost": 800,
            "start_date": (date.today() - timedelta(days=40)).isoformat(),
            "end_date": (date.today() - timedelta(days=10)).isoformat(),
            "manual_status": "activa",
        },
    )
    assert expired_cycle.status_code == 200
    expired_filter = client.get("/membership/admin/clients?status=vencida", headers=headers)
    assert expired_filter.status_code == 200
    assert any(row["user_id"] == student2.id for row in expired_filter.json())

    summary = client.get("/membership/admin/summary", headers=headers)
    assert summary.status_code == 200
    summary_data = summary.json()
    assert "month_income" in summary_data
    assert "counts" in summary_data
    assert summary_data["counts"]["total_socios"] >= 2

    alerts = client.get("/membership/admin/alerts", headers=headers)
    assert alerts.status_code == 200
    alerts_data = alerts.json()
    assert "vence_hoy" in alerts_data
    assert "vencidos" in alerts_data

    clients_enriched = client.get("/membership/admin/clients?status=todos", headers=headers)
    assert clients_enriched.status_code == 200
    first_row = next(row for row in clients_enriched.json() if row["user_id"] == student.id)
    assert "last_payment" in first_row
    assert first_row["last_payment"] is not None

    cortesia = client.post(
        f"/membership/admin/cycle/{new_cycle_id}/payment",
        headers=headers,
        json={"amount": 50, "payment_method": "cortesia", "idempotency_key": "pay-cortesia"},
    )
    assert cortesia.status_code == 200

