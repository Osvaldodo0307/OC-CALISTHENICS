"""Tests API importación visitas históricas agregadas (Fase 2C.2)."""
from __future__ import annotations

import io

import pandas as pd
import pytest

from app.core.security import hash_password
from app.models import (
    HistoricalVisitImportBatch,
    HistoricalVisitSummary,
    MembershipCycle,
    MembershipPayment,
    User,
)


def _create_user(db, username: str, role: str, name: str | None = None):
    user = User(
        username=username,
        name=name or username.title(),
        password_hash=hash_password("Pass123!"),
        role=role,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


def _admin_headers(client):
    login = client.post("/auth/login", data={"username": "admin", "password": "Pass123!"})
    assert login.status_code == 200
    return {"Authorization": f"Bearer {login.json()['access_token']}"}


def _build_visit_matrix_xlsx(*, include_unmatched: bool = True) -> bytes:
    rows: list[list[object]] = [
        [None, None, "X", "OCTUBRE", "NOVIEMBRE", "DICIEMBRE", "ENERO"],
        [None, None, "Socio Demo A", 12, 8, 5, 3],
    ]
    if include_unmatched:
        rows.append([None, None, "Socio Demo B", 0, 4, 10, 1])
    rows.extend(
        [
            [None, None, "TOTAL", 16, 12, 15, 4],
            [None] * 12,
            [None, None, "MEMBRESIA", None, None, "COSTO PLAN", "TIPO DE PLAN", "ENERO"],
        ]
    )
    df = pd.DataFrame(rows)
    buffer = io.BytesIO()
    with pd.ExcelWriter(buffer, engine="openpyxl") as writer:
        df.to_excel(writer, sheet_name="ENERO 2026", index=False, header=False)
    return buffer.getvalue()


def test_preview_creates_batch_and_records(client, db_session):
    _create_user(db_session, "admin", "admin")
    _create_user(db_session, "socio_a", "socio", name="Socio Demo A")
    headers = _admin_headers(client)

    files = {"file": ("visitas.xlsx", io.BytesIO(_build_visit_matrix_xlsx()), "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")}
    response = client.post(
        "/historical-visits/admin/imports/preview",
        headers=headers,
        files=files,
        data={"sheet_name": "ENERO 2026"},
    )
    assert response.status_code == 200
    data = response.json()
    assert data["batch_id"] > 0
    assert data["preview_summary"]["total_summaries"] >= 3
    assert data["preview_summary"]["can_commit"] is False

    records = client.get(f"/historical-visits/admin/imports/{data['batch_id']}/records", headers=headers)
    assert records.status_code == 200
    assert len(records.json()["records"]) >= 3


def test_preview_does_not_create_payments_cycles_or_users(client, db_session):
    _create_user(db_session, "admin", "admin")
    headers = _admin_headers(client)
    users_before = db_session.query(User).count()

    files = {"file": ("visitas.xlsx", io.BytesIO(_build_visit_matrix_xlsx()), "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")}
    response = client.post(
        "/historical-visits/admin/imports/preview",
        headers=headers,
        files=files,
        data={"sheet_name": "ENERO 2026"},
    )
    assert response.status_code == 200
    assert db_session.query(User).count() == users_before
    assert db_session.query(MembershipPayment).count() == 0
    assert db_session.query(MembershipCycle).count() == 0


def test_commit_blocks_when_unmatched_or_new_candidate(client, db_session):
    _create_user(db_session, "admin", "admin")
    _create_user(db_session, "socio_a", "socio", name="Socio Demo A")
    headers = _admin_headers(client)

    files = {"file": ("visitas.xlsx", io.BytesIO(_build_visit_matrix_xlsx(include_unmatched=True)), "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")}
    preview = client.post(
        "/historical-visits/admin/imports/preview",
        headers=headers,
        files=files,
        data={"sheet_name": "ENERO 2026"},
    ).json()

    commit = client.post(
        "/historical-visits/admin/imports/commit",
        headers=headers,
        json={"batch_id": preview["batch_id"]},
    )
    assert commit.status_code == 400
    assert "bloqueado" in commit.json()["detail"].lower()


def test_commit_imports_only_matched_rows(client, db_session):
    _create_user(db_session, "admin", "admin")
    _create_user(db_session, "socio_a", "socio", name="Socio Demo A")
    headers = _admin_headers(client)

    files = {"file": ("visitas.xlsx", io.BytesIO(_build_visit_matrix_xlsx(include_unmatched=False)), "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")}
    preview = client.post(
        "/historical-visits/admin/imports/preview",
        headers=headers,
        files=files,
        data={"sheet_name": "ENERO 2026"},
    ).json()
    assert preview["preview_summary"]["can_commit"] is True

    commit = client.post(
        "/historical-visits/admin/imports/commit",
        headers=headers,
        json={"batch_id": preview["batch_id"]},
    )
    assert commit.status_code == 200
    body = commit.json()
    assert body["status"] == "committed"
    assert body["committed_summary"]["imported_summaries"] >= 3
    assert body["committed_summary"]["payments_count_after"] == 0
    assert body["committed_summary"]["cycles_count_after"] == 0

    summaries = db_session.query(HistoricalVisitSummary).all()
    assert len(summaries) >= 3
    assert all(item.user_id is not None for item in summaries)
    assert all(item.match_status == "matched" for item in summaries)


def test_commit_is_idempotent_for_duplicates(client, db_session):
    _create_user(db_session, "admin", "admin")
    _create_user(db_session, "socio_a", "socio", name="Socio Demo A")
    headers = _admin_headers(client)
    xlsx = _build_visit_matrix_xlsx(include_unmatched=False)

    preview_1 = client.post(
        "/historical-visits/admin/imports/preview",
        headers=headers,
        files={"file": ("visitas.xlsx", io.BytesIO(xlsx), "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")},
        data={"sheet_name": "ENERO 2026"},
    ).json()
    client.post("/historical-visits/admin/imports/commit", headers=headers, json={"batch_id": preview_1["batch_id"]})

    count_after_first = db_session.query(HistoricalVisitSummary).count()

    preview_2 = client.post(
        "/historical-visits/admin/imports/preview",
        headers=headers,
        files={"file": ("visitas.xlsx", io.BytesIO(xlsx), "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")},
        data={"sheet_name": "ENERO 2026"},
    ).json()
    assert preview_2["preview_summary"]["can_commit"] is True
    commit_2 = client.post(
        "/historical-visits/admin/imports/commit",
        headers=headers,
        json={"batch_id": preview_2["batch_id"]},
    )
    assert commit_2.status_code == 200
    assert commit_2.json()["committed_summary"]["imported_summaries"] == 0
    assert commit_2.json()["committed_summary"]["skipped_duplicate"] >= 3
    assert db_session.query(HistoricalVisitSummary).count() == count_after_first


def test_commit_blocks_already_committed_batch(client, db_session):
    _create_user(db_session, "admin", "admin")
    _create_user(db_session, "socio_a", "socio", name="Socio Demo A")
    headers = _admin_headers(client)
    xlsx = _build_visit_matrix_xlsx(include_unmatched=False)

    preview = client.post(
        "/historical-visits/admin/imports/preview",
        headers=headers,
        files={"file": ("visitas.xlsx", io.BytesIO(xlsx), "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")},
        data={"sheet_name": "ENERO 2026"},
    ).json()
    client.post("/historical-visits/admin/imports/commit", headers=headers, json={"batch_id": preview["batch_id"]})

    again = client.post(
        "/historical-visits/admin/imports/commit",
        headers=headers,
        json={"batch_id": preview["batch_id"]},
    )
    assert again.status_code == 400
    assert "ya fue importado" in again.json()["detail"].lower()


def test_admin_security_for_visit_import_routes(client, db_session):
    _create_user(db_session, "admin", "admin")
    _create_user(db_session, "coach1", "coach")
    coach_login = client.post("/auth/login", data={"username": "coach1", "password": "Pass123!"})
    coach_headers = {"Authorization": f"Bearer {coach_login.json()['access_token']}"}

    files = {"file": ("visitas.xlsx", io.BytesIO(_build_visit_matrix_xlsx()), "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")}
    denied = client.post(
        "/historical-visits/admin/imports/preview",
        headers=coach_headers,
        files=files,
        data={"sheet_name": "ENERO 2026"},
    )
    assert denied.status_code == 403


def test_summaries_endpoint_returns_aggregates(client, db_session):
    _create_user(db_session, "admin", "admin")
    socio = _create_user(db_session, "socio_a", "socio", name="Socio Demo A")
    headers = _admin_headers(client)
    xlsx = _build_visit_matrix_xlsx(include_unmatched=False)

    preview = client.post(
        "/historical-visits/admin/imports/preview",
        headers=headers,
        files={"file": ("visitas.xlsx", io.BytesIO(xlsx), "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")},
        data={"sheet_name": "ENERO 2026"},
    ).json()
    client.post("/historical-visits/admin/imports/commit", headers=headers, json={"batch_id": preview["batch_id"]})

    all_summaries = client.get("/historical-visits/admin/summaries", headers=headers)
    assert all_summaries.status_code == 200
    payload = all_summaries.json()
    assert payload["total_visits"] > 0
    assert len(payload["totals_by_month"]) >= 1

    by_user = client.get(f"/historical-visits/admin/summaries?user_id={socio.id}", headers=headers)
    assert by_user.status_code == 200
    assert by_user.json()["count"] >= 1
