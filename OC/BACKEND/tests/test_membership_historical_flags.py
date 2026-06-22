"""Fase 2B.6: ciclos históricos importados vs operación actual."""
from __future__ import annotations

import io
from datetime import date, timedelta

from app.core.security import hash_password
from app.models import Membership, MembershipCycle, MembershipImportBatch, MembershipPayment, User
from app.services.membership_followup_service import build_followup_inbox, build_followup_summary


def _create_user(db, username: str, role: str, phone: str = "5512345678"):
    user = User(
        username=username,
        name=username.title(),
        password_hash=hash_password("Pass123!"),
        role=role,
        phone=phone,
        is_active=True,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


def _admin_headers(client):
    login = client.post("/auth/login", data={"username": "admin_hist", "password": "Pass123!"})
    assert login.status_code == 200
    return {"Authorization": f"Bearer {login.json()['access_token']}"}


def _csv_bytes(content: str) -> bytes:
    return content.encode("utf-8-sig")


def _create_historical_only_socio(db, admin: User, *, username: str = "socio_hist"):
    socio = _create_user(db, username, "socio", phone="5599887766")
    membership = Membership(user_id=socio.id, status="expired", plan="PLAN OC")
    db.add(membership)
    db.flush()
    batch = MembershipImportBatch(created_by=admin.id, status="committed", filename="piloto.csv")
    db.add(batch)
    db.flush()
    cycle = MembershipCycle(
        membership_id=membership.id,
        user_id=socio.id,
        membership_type="PLAN OC",
        cost=945.0,
        start_date=date(2025, 11, 1),
        end_date=date(2025, 11, 30),
        status="vencida",
        is_active_cycle=False,
        is_historical_import=True,
        historical_source="OCCALISTHENICS",
        import_batch_id=batch.id,
        created_by=admin.id,
    )
    db.add(cycle)
    db.commit()
    db.refresh(socio)
    db.refresh(cycle)
    return socio, cycle, batch


def test_import_commit_marks_cycle_as_historical(client, db_session):
    _create_user(db_session, "admin_hist", "admin", phone=None)
    headers = _admin_headers(client)
    csv_row = """socio_nombre,telefono,plan,fecha_pago,monto_pagado,metodo_pago,periodo_inicio,periodo_fin,payment_action,fuente_archivo,referencia_externa
Pilar Hist,5511223344,PLAN OC,2025-11-05,945,historico_sin_metodo,2025-11-01,2025-11-30,renew_extend,OCCALISTHENICS_noviembre,OC-HIST-FLAG-1
"""
    files = {"file": ("hist.csv", io.BytesIO(_csv_bytes(csv_row)), "text/csv")}
    preview = client.post("/membership/admin/imports/preview", headers=headers, files=files).json()
    commit = client.post(
        "/membership/admin/imports/commit",
        headers=headers,
        json={"batch_id": preview["batch_id"]},
    )
    assert commit.status_code == 200

    cycle = db_session.query(MembershipCycle).filter(MembershipCycle.is_historical_import.is_(True)).first()
    assert cycle is not None
    assert cycle.historical_source == "OCCALISTHENICS"
    assert cycle.import_batch_id == preview["batch_id"]
    assert cycle.is_active_cycle is False

    payment = db_session.query(MembershipPayment).first()
    assert payment is not None
    assert "Importacion historica" in (payment.concept or "")


def test_followups_exclude_historical_by_default(client, db_session):
    admin = _create_user(db_session, "admin_hist", "admin")
    socio_hist, _, _ = _create_historical_only_socio(db_session, admin, username="socio_hist_fu")
    socio_op = _create_user(db_session, "socio_op_fu", "socio", phone="5511002233")
    headers = _admin_headers(client)

    start = date.today() - timedelta(days=40)
    end = date.today() - timedelta(days=5)
    op_cycle = client.post(
        "/membership/admin/cycle",
        headers=headers,
        json={
            "user_id": socio_op.id,
            "membership_type": "Mensual",
            "cost": 1000,
            "start_date": start.isoformat(),
            "end_date": end.isoformat(),
            "manual_status": "activa",
        },
    )
    assert op_cycle.status_code == 200

    inbox_default = client.get("/membership/admin/followups?status=vencidos", headers=headers)
    assert inbox_default.status_code == 200
    user_ids = {row["user_id"] for row in inbox_default.json()}
    assert socio_op.id in user_ids
    assert socio_hist.id not in user_ids

    inbox_with_hist = client.get(
        "/membership/admin/followups?status=vencidos&include_historical=true",
        headers=headers,
    )
    assert inbox_with_hist.status_code == 200
    user_ids_hist = {row["user_id"] for row in inbox_with_hist.json()}
    assert socio_hist.id in user_ids_hist

    summary = build_followup_summary(db_session, include_historical=False)
    inbox_svc = build_followup_inbox(db_session, status_filter="vencidos", include_historical=False)
    assert not any(r["user_id"] == socio_hist.id for r in inbox_svc)
    assert summary["vencidos"] >= 1


def test_clients_exclude_historical_by_default(client, db_session):
    admin = _create_user(db_session, "admin_hist", "admin")
    socio_hist, _, _ = _create_historical_only_socio(db_session, admin, username="socio_hist_cl")
    socio_op = _create_user(db_session, "socio_op_cl", "socio", phone="5511003344")
    headers = _admin_headers(client)

    start = date.today() - timedelta(days=10)
    end = date.today() + timedelta(days=20)
    assert client.post(
        "/membership/admin/cycle",
        headers=headers,
        json={
            "user_id": socio_op.id,
            "membership_type": "Mensual",
            "cost": 1000,
            "start_date": start.isoformat(),
            "end_date": end.isoformat(),
            "manual_status": "activa",
        },
    ).status_code == 200

    clients_default = client.get("/membership/admin/clients?status=todos", headers=headers)
    assert clients_default.status_code == 200
    ids_default = {c["user_id"] for c in clients_default.json()}
    assert socio_op.id in ids_default
    assert socio_hist.id not in ids_default

    clients_hist = client.get(
        "/membership/admin/clients?status=todos&include_historical=true",
        headers=headers,
    )
    assert clients_hist.status_code == 200
    hist_row = next(c for c in clients_hist.json() if c["user_id"] == socio_hist.id)
    assert hist_row["is_historical_import"] is True
    assert hist_row["historical_source"] == "OCCALISTHENICS"
    assert hist_row["is_historical_only_member"] is True


def test_profile_shows_historical_cycles(client, db_session):
    admin = _create_user(db_session, "admin_hist", "admin")
    socio, cycle, batch = _create_historical_only_socio(db_session, admin, username="socio_hist_prof")
    headers = _admin_headers(client)

    profile = client.get(f"/membership/admin/client/{socio.id}/profile", headers=headers)
    assert profile.status_code == 200
    data = profile.json()
    assert data["general"]["is_historical_import"] is True
    assert data["general"]["historical_source"] == "OCCALISTHENICS"
    assert data["general"]["import_batch_id"] == batch.id
    assert data["general"]["is_historical_only_member"] is True
    assert len(data["cycles_history"]) == 1
    assert data["cycles_history"][0]["is_historical_import"] is True
    assert data["cycles_history"][0]["id"] == cycle.id
    assert data["active_cycle"]["is_historical_import"] is True


def test_historical_followups_security_unchanged(client, db_session):
    _create_user(db_session, "admin_hist", "admin")
    coach = _create_user(db_session, "coach_hist", "coach", phone="5511998877")
    coach_login = client.post("/auth/login", data={"username": "coach_hist", "password": "Pass123!"})
    coach_headers = {"Authorization": f"Bearer {coach_login.json()['access_token']}"}

    denied = client.get("/membership/admin/followups?include_historical=true", headers=coach_headers)
    assert denied.status_code == 403

    denied_clients = client.get("/membership/admin/clients?include_historical=true", headers=coach_headers)
    assert denied_clients.status_code == 403


def test_clients_search_uses_users_name_not_full_name(client, db_session):
    admin = _create_user(db_session, "admin_hist", "admin")
    socio = User(
        username="tonito_search",
        name="TOÑITO OSNAYA",
        password_hash=hash_password("Pass123!"),
        role="socio",
        phone=None,
        is_active=True,
    )
    db_session.add(socio)
    db_session.flush()
    membership = Membership(user_id=socio.id, status="expired", plan="PLAN OC")
    db_session.add(membership)
    db_session.commit()
    headers = _admin_headers(client)

    found = client.get(
        "/membership/admin/clients?status=todos&search=TOÑITO+OSNAYA&include_historical=true",
        headers=headers,
    )
    assert found.status_code == 200
    rows = found.json()
    assert len(rows) == 1
    assert rows[0]["user_id"] == socio.id
    assert rows[0]["name"] == "TOÑITO OSNAYA"


def test_clients_include_historical_with_search_is_fast_enough(client, db_session):
    admin = _create_user(db_session, "admin_hist", "admin")
    headers = _admin_headers(client)
    for index in range(30):
        _create_historical_only_socio(db_session, admin, username=f"bulk_hist_{index}")
    target, _, _ = _create_historical_only_socio(db_session, admin, username="target_hist")
    db_session.query(User).filter(User.id == target.id).update({"name": "TOÑITO OSNAYA"})
    db_session.commit()

    import time

    started = time.perf_counter()
    response = client.get(
        "/membership/admin/clients?status=todos&search=TOÑITO&include_historical=true",
        headers=headers,
    )
    elapsed = time.perf_counter() - started
    assert response.status_code == 200
    assert any(row["user_id"] == target.id for row in response.json())
    assert elapsed < 2.0


def test_followups_historical_marked_as_vencido_historico(client, db_session):
    admin = _create_user(db_session, "admin_hist", "admin")
    socio_hist, _, _ = _create_historical_only_socio(db_session, admin, username="socio_hist_cat")
    headers = _admin_headers(client)

    inbox = client.get(
        "/membership/admin/followups?status=vencidos&include_historical=true",
        headers=headers,
    )
    assert inbox.status_code == 200
    row = next(item for item in inbox.json() if item["user_id"] == socio_hist.id)
    assert row["is_historical_import"] is True
    assert row["priority_category"] == "vencido_historico"


def test_historical_socio_with_null_is_active_still_listed(client, db_session):
    admin = _create_user(db_session, "admin_hist", "admin")
    socio = User(
        username="null_active_hist",
        name="Socio Null Active",
        password_hash=hash_password("Pass123!"),
        role="socio",
        phone="5599001122",
        is_active=None,
    )
    db_session.add(socio)
    db_session.flush()
    batch = MembershipImportBatch(created_by=admin.id, status="committed", filename="piloto.csv")
    db_session.add(batch)
    db_session.flush()
    membership = Membership(user_id=socio.id, status="expired", plan="PLAN OC")
    db_session.add(membership)
    db_session.flush()
    db_session.add(
        MembershipCycle(
            membership_id=membership.id,
            user_id=socio.id,
            membership_type="PLAN OC",
            cost=945.0,
            start_date=date(2025, 11, 1),
            end_date=date(2025, 11, 30),
            status="vencida",
            is_active_cycle=False,
            is_historical_import=True,
            historical_source="OCCALISTHENICS",
            import_batch_id=batch.id,
            created_by=admin.id,
        )
    )
    db_session.commit()
    headers = _admin_headers(client)

    clients = client.get(
        "/membership/admin/clients?status=todos&include_historical=true&search=Socio+Null",
        headers=headers,
    )
    assert clients.status_code == 200
    assert any(row["user_id"] == socio.id for row in clients.json())

    followups = client.get(
        "/membership/admin/followups?status=vencidos&include_historical=true",
        headers=headers,
    )
    assert followups.status_code == 200
    assert any(row["user_id"] == socio.id for row in followups.json())
