import io
from datetime import date

import pytest

from app.core.security import hash_password
from app.models import MembershipImportBatch, MembershipPayment, User


def _create_user(db, username: str, role: str, phone: str | None = "5511111111", name: str | None = None):
    user = User(
        username=username,
        name=name or username.title(),
        password_hash=hash_password("Pass123!"),
        role=role,
        phone=phone,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


def _admin_headers(client):
    login = client.post("/auth/login", data={"username": "admin", "password": "Pass123!"})
    assert login.status_code == 200
    return {"Authorization": f"Bearer {login.json()['access_token']}"}


def _csv_bytes(content: str) -> bytes:
    return content.encode("utf-8-sig")


VALID_CSV = """socio_nombre,telefono,plan,fecha_pago,monto_pagado,metodo_pago,periodo_inicio,periodo_fin,payment_action,counts_as_income,applies_to_balance,saldo_pendiente,nota,fuente_archivo,referencia_externa
Juan Perez,5512345678,Mensual,2024-01-15,800,efectivo,2024-01-01,2024-01-31,register_only,true,true,0,Pago enero,archivo_test,REF-001
"""


def test_preview_valid_file(client, db_session):
    _create_user(db_session, "admin", "admin", phone=None)
    headers = _admin_headers(client)

    files = {"file": ("historico.csv", io.BytesIO(_csv_bytes(VALID_CSV)), "text/csv")}
    response = client.post("/membership/admin/imports/preview", headers=headers, files=files)
    assert response.status_code == 200
    data = response.json()
    assert data["batch_id"] > 0
    assert data["preview_summary"]["total_rows"] == 1
    assert data["preview_summary"]["new_members"] == 1
    assert data["diagnosis"]["can_preview"] is True

    payments_before = db_session.query(MembershipPayment).count()
    assert payments_before == 0


def test_preview_missing_required_columns(client, db_session):
    _create_user(db_session, "admin", "admin", phone=None)
    headers = _admin_headers(client)
    bad_csv = "nombre,fecha\nJuan,2024-01-01\n"
    files = {"file": ("bad.csv", io.BytesIO(_csv_bytes(bad_csv)), "text/csv")}
    response = client.post("/membership/admin/imports/preview", headers=headers, files=files)
    assert response.status_code == 200
    data = response.json()
    assert data["diagnosis"]["can_preview"] is False
    assert data["diagnosis"]["blocking_errors"]


def test_preview_detects_duplicates_in_file(client, db_session):
    _create_user(db_session, "admin", "admin", phone=None)
    headers = _admin_headers(client)
    dup_csv = VALID_CSV + "Juan Perez,5512345678,Mensual,2024-01-15,800,efectivo,2024-01-01,2024-01-31,register_only,true,true,0,Duplicado,archivo_test,REF-002\n"
    files = {"file": ("dup.csv", io.BytesIO(_csv_bytes(dup_csv)), "text/csv")}
    response = client.post("/membership/admin/imports/preview", headers=headers, files=files)
    assert response.status_code == 200
    data = response.json()
    assert data["preview_summary"]["duplicate_rows"] >= 1


def test_existing_member_by_phone(client, db_session):
    _create_user(db_session, "admin", "admin", phone=None)
    _create_user(db_session, "socio1", "socio", phone="5512345678", name="Juan Perez")
    headers = _admin_headers(client)
    files = {"file": ("historico.csv", io.BytesIO(_csv_bytes(VALID_CSV)), "text/csv")}
    response = client.post("/membership/admin/imports/preview", headers=headers, files=files)
    data = response.json()
    assert data["preview_summary"]["existing_members"] == 1
    assert data["preview_summary"]["new_members"] == 0
    assert data["rows"][0]["socio_match"] == "existing"


def test_ambiguous_member_by_name(client, db_session):
    _create_user(db_session, "admin", "admin", phone=None)
    _create_user(db_session, "socio_a", "socio", phone="5511111111", name="Maria Lopez")
    _create_user(db_session, "socio_b", "socio", phone="5522222222", name="Maria Lopez Garcia")
    headers = _admin_headers(client)
    csv_row = """socio_nombre,telefono,plan,fecha_pago,monto_pagado,metodo_pago,periodo_inicio,periodo_fin,payment_action,counts_as_income,applies_to_balance,saldo_pendiente,nota,fuente_archivo,referencia_externa
Maria Lopez,,Mensual,2024-02-10,500,efectivo,2024-02-01,2024-02-29,register_only,true,true,0,Sin telefono,archivo_test,REF-AMB-1
"""
    files = {"file": ("ambig.csv", io.BytesIO(_csv_bytes(csv_row)), "text/csv")}
    response = client.post("/membership/admin/imports/preview", headers=headers, files=files)
    data = response.json()
    assert data["rows"][0]["socio_match"] == "ambiguous"


def test_payment_with_full_period(client, db_session):
    _create_user(db_session, "admin", "admin", phone=None)
    headers = _admin_headers(client)
    files = {"file": ("historico.csv", io.BytesIO(_csv_bytes(VALID_CSV)), "text/csv")}
    preview = client.post("/membership/admin/imports/preview", headers=headers, files=files).json()
    commit = client.post(
        "/membership/admin/imports/commit",
        headers=headers,
        json={"batch_id": preview["batch_id"]},
    )
    assert commit.status_code == 200
    assert commit.json()["summary"]["imported"] == 1
    payment = db_session.query(MembershipPayment).first()
    assert payment is not None
    assert payment.period_start_date == date(2024, 1, 1)
    assert payment.period_end_date == date(2024, 1, 31)
    assert payment.idempotency_key.startswith("historical-import:")


def test_payment_without_period_historical(client, db_session):
    _create_user(db_session, "admin", "admin", phone=None)
    headers = _admin_headers(client)
    csv_row = """socio_nombre,telefono,plan,fecha_pago,monto_pagado,metodo_pago,payment_action,referencia_externa
Ana Ruiz,5533333333,Mensual,2023-12-05,700,transferencia,register_only,REF-NO-PERIOD
"""
    files = {"file": ("noperiod.csv", io.BytesIO(_csv_bytes(csv_row)), "text/csv")}
    preview = client.post("/membership/admin/imports/preview", headers=headers, files=files).json()
    assert preview["rows"][0]["warnings"]
    commit = client.post(
        "/membership/admin/imports/commit",
        headers=headers,
        json={"batch_id": preview["batch_id"]},
    )
    assert commit.status_code == 200
    payment = db_session.query(MembershipPayment).first()
    assert payment.payment_action == "register_only"


def test_courtesy_does_not_count_income(client, db_session):
    _create_user(db_session, "admin", "admin", phone=None)
    headers = _admin_headers(client)
    csv_row = """socio_nombre,telefono,plan,fecha_pago,monto_pagado,metodo_pago,periodo_inicio,periodo_fin,payment_action,referencia_externa
Carlos Diaz,5544444444,Mensual,2024-03-01,0,cortesia,2024-03-01,2024-03-31,courtesy_extend,CORT-001
"""
    files = {"file": ("cortesia.csv", io.BytesIO(_csv_bytes(csv_row)), "text/csv")}
    preview = client.post("/membership/admin/imports/preview", headers=headers, files=files).json()
    assert preview["preview_summary"]["estimated_real_income"] == 0
    commit = client.post(
        "/membership/admin/imports/commit",
        headers=headers,
        json={"batch_id": preview["batch_id"]},
    )
    assert commit.status_code == 200
    payment = db_session.query(MembershipPayment).first()
    assert payment.counts_as_income is False
    assert payment.applies_to_balance is False


def test_adjustment_respects_flags(client, db_session):
    _create_user(db_session, "admin", "admin", phone=None)
    headers = _admin_headers(client)
    csv_row = """socio_nombre,telefono,plan,fecha_pago,monto_pagado,metodo_pago,payment_action,counts_as_income,applies_to_balance,periodo_inicio,periodo_fin,referencia_externa
Laura Meza,5555555555,Mensual,2024-04-01,100,ajuste,admin_adjustment,false,true,2024-04-01,2024-04-30,ADJ-001
"""
    files = {"file": ("ajuste.csv", io.BytesIO(_csv_bytes(csv_row)), "text/csv")}
    preview = client.post("/membership/admin/imports/preview", headers=headers, files=files).json()
    commit = client.post(
        "/membership/admin/imports/commit",
        headers=headers,
        json={"batch_id": preview["batch_id"]},
    )
    payment = db_session.query(MembershipPayment).first()
    assert payment.counts_as_income is False
    assert payment.applies_to_balance is True


def test_preview_does_not_write_membership_tables(client, db_session):
    _create_user(db_session, "admin", "admin", phone=None)
    headers = _admin_headers(client)
    files = {"file": ("historico.csv", io.BytesIO(_csv_bytes(VALID_CSV)), "text/csv")}
    client.post("/membership/admin/imports/preview", headers=headers, files=files)
    assert db_session.query(MembershipPayment).count() == 0
    assert db_session.query(MembershipImportBatch).count() == 1


def test_commit_writes_only_valid_rows(client, db_session):
    _create_user(db_session, "admin", "admin", phone=None)
    headers = _admin_headers(client)
    mixed_csv = """socio_nombre,telefono,plan,fecha_pago,monto_pagado,metodo_pago,periodo_inicio,periodo_fin,referencia_externa
Valido Uno,5566666666,Mensual,2024-05-01,500,efectivo,2024-05-01,2024-05-31,OK-001
,5577777777,Mensual,2024-05-02,500,efectivo,2024-05-01,2024-05-31,BAD-001
"""
    files = {"file": ("mixed.csv", io.BytesIO(_csv_bytes(mixed_csv)), "text/csv")}
    preview = client.post("/membership/admin/imports/preview", headers=headers, files=files).json()
    assert preview["preview_summary"]["error_rows"] == 1
    commit = client.post(
        "/membership/admin/imports/commit",
        headers=headers,
        json={"batch_id": preview["batch_id"]},
    )
    assert commit.json()["summary"]["imported"] == 1
    assert db_session.query(MembershipPayment).count() == 1


def test_admin_security(client, db_session):
    _create_user(db_session, "admin", "admin", phone=None)
    _create_user(db_session, "coach1", "coach", phone=None)
    coach_login = client.post("/auth/login", data={"username": "coach1", "password": "Pass123!"})
    coach_headers = {"Authorization": f"Bearer {coach_login.json()['access_token']}"}
    files = {"file": ("historico.csv", io.BytesIO(_csv_bytes(VALID_CSV)), "text/csv")}
    denied = client.post("/membership/admin/imports/preview", headers=coach_headers, files=files)
    assert denied.status_code == 403


def test_get_import_batch_and_errors(client, db_session):
    _create_user(db_session, "admin", "admin", phone=None)
    headers = _admin_headers(client)
    mixed_csv = """socio_nombre,telefono,plan,fecha_pago,monto_pagado,metodo_pago,referencia_externa
,5510101010,Mensual,2024-06-01,100,efectivo,ERR-001
"""
    files = {"file": ("errors.csv", io.BytesIO(_csv_bytes(mixed_csv)), "text/csv")}
    preview = client.post("/membership/admin/imports/preview", headers=headers, files=files).json()
    batch_id = preview["batch_id"]
    detail = client.get(f"/membership/admin/imports/{batch_id}", headers=headers)
    assert detail.status_code == 200
    errors = client.get(f"/membership/admin/imports/{batch_id}/errors", headers=headers)
    assert errors.status_code == 200
    assert len(errors.json()["errors"]) >= 1


def test_same_socio_two_rows_single_user_on_commit(client, db_session):
    _create_user(db_session, "admin", "admin", phone=None)
    headers = _admin_headers(client)
    csv_two_rows = """socio_nombre,telefono,plan,fecha_pago,monto_pagado,metodo_pago,periodo_inicio,periodo_fin,referencia_externa
Luis Mendez,5555556666,Mensual,2025-06-10,800,efectivo,2025-06-01,2025-06-30,PILOT-A
Luis Mendez,5555556666,Mensual,2025-07-08,800,transferencia,2025-07-01,2025-07-31,PILOT-B
"""
    files = {"file": ("two_rows.csv", io.BytesIO(_csv_bytes(csv_two_rows)), "text/csv")}
    preview = client.post("/membership/admin/imports/preview", headers=headers, files=files).json()
    commit = client.post(
        "/membership/admin/imports/commit",
        headers=headers,
        json={"batch_id": preview["batch_id"]},
    )
    assert commit.status_code == 200
    assert commit.json()["summary"]["imported"] == 2
    from app.models import User

    users = db_session.query(User).filter(User.role == "socio", User.phone == "5555556666").all()
    assert len(users) == 1


def test_historico_sin_metodo_accepted_in_preview(client, db_session):
    _create_user(db_session, "admin", "admin", phone=None)
    headers = _admin_headers(client)
    csv_row = """socio_nombre,telefono,plan,fecha_pago,monto_pagado,metodo_pago,periodo_inicio,periodo_fin,payment_action,referencia_externa
Socio Hist,5511998877,PLAN OC,2025-11-01,945,historico_sin_metodo,2025-11-01,2025-11-30,renew_extend,OC-HIST-001
"""
    files = {"file": ("hist.csv", io.BytesIO(_csv_bytes(csv_row)), "text/csv")}
    response = client.post("/membership/admin/imports/preview", headers=headers, files=files)
    assert response.status_code == 200
    data = response.json()
    assert data["preview_summary"]["error_rows"] == 0
    assert data["rows"][0]["metodo_pago"] == "historico_sin_metodo"


def test_phone_normalization_from_excel_float():
    from app.services.membership_import_service import _normalize_phone

    assert _normalize_phone(5512345678.0) == "5512345678"
    assert _normalize_phone(5566667777) == "5566667777"
    assert _normalize_phone("55 1234 5678") == "5512345678"


def test_cannot_commit_already_committed_batch(client, db_session):
    _create_user(db_session, "admin", "admin", phone=None)
    headers = _admin_headers(client)
    files = {"file": ("historico.csv", io.BytesIO(_csv_bytes(VALID_CSV)), "text/csv")}
    preview = client.post("/membership/admin/imports/preview", headers=headers, files=files).json()
    first = client.post(
        "/membership/admin/imports/commit",
        headers=headers,
        json={"batch_id": preview["batch_id"]},
    )
    assert first.status_code == 200

    second = client.post(
        "/membership/admin/imports/commit",
        headers=headers,
        json={"batch_id": preview["batch_id"]},
    )
    assert second.status_code == 400
    assert "ya fue importado" in second.json()["detail"].lower()


def test_template_download_requires_admin(client, db_session):
    _create_user(db_session, "admin", "admin", phone=None)
    headers = _admin_headers(client)
    response = client.get("/membership/admin/imports/template", headers=headers)
    assert response.status_code == 200
    assert "socio_nombre" in response.text
