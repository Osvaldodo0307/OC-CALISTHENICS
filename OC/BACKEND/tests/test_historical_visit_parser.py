"""Tests parser y preview de visitas históricas agregadas (Fase 2C.1)."""
from __future__ import annotations

from datetime import date
from pathlib import Path

import pandas as pd
import pytest

from app.core.security import hash_password
from app.models import MembershipCycle, MembershipPayment, User
from app.services.historical_visit_import_service import build_visit_preview_from_dataframe
from app.services.historical_visit_parser import (
    classify_sheet_content,
    detect_visit_block,
    is_aggregate_row_name,
    parse_visit_summaries,
    period_month_from_label,
)

BACKEND_ROOT = Path(__file__).resolve().parents[1]
ENERO_FIXTURE = BACKEND_ROOT / "fixtures" / "OCCALISTHENICS.xlsx"


def _build_synthetic_visit_sheet() -> pd.DataFrame:
    rows: list[list[object]] = [
        [None, None, "X", "OCTUBRE", "NOVIEMBRE", "DICIEMBRE", "ENERO"],
        [None, None, "Socio Demo A", 12, 8, 5, 3],
        [None, None, "Socio Demo B", 0, 4, 10, 1],
        [None, None, "TOTAL", 16, 12, 15, 4],
        [None] * 12,
        [None, None, "MEMBRESIA", None, None, "COSTO PLAN", "TIPO DE PLAN", "ENERO"],
        [None, None, None, None, None, None, None, None, None, None, None, "Socio Pago X", 500],
    ]
    return pd.DataFrame(rows)


def test_detect_visit_block_upper_section():
    df = _build_synthetic_visit_sheet()
    layout = detect_visit_block(df, sheet_name="ENERO 2026")
    assert layout is not None
    assert layout.name_column_index == 2
    assert layout.header_row_index == 0
    assert set(layout.month_columns.values()) == {"OCTUBRE", "NOVIEMBRE", "DICIEMBRE", "ENERO"}
    assert layout.data_start_row_index == 1


def test_excludes_total_rows():
    df = _build_synthetic_visit_sheet()
    result = parse_visit_summaries(df, sheet_name="ENERO 2026")
    names = {item.raw_member_name for item in result.summaries}
    assert "TOTAL" not in names
    assert "Socio Demo A" in names
    assert "Socio Demo B" in names
    assert result.skipped_rows >= 1


def test_visit_counts_are_integers_only():
    df = _build_synthetic_visit_sheet()
    df.iloc[2, 3] = 3.5
    result = parse_visit_summaries(df, sheet_name="ENERO 2026")
    assert result.invalid_values >= 1
    for item in result.summaries:
        assert isinstance(item.visits_count, int)
        assert 0 < item.visits_count <= 35


def test_period_month_inference_from_sheet_name():
    assert period_month_from_label("ENERO", sheet_name="ENERO 2026") == date(2026, 1, 1)
    assert period_month_from_label("DICIEMBRE", sheet_name="ENERO 2026") == date(2025, 12, 1)
    assert period_month_from_label("OCTUBRE", sheet_name="ENERO 2026") == date(2025, 10, 1)


def test_classify_sheet_as_mixed_visits_and_payments():
    df = _build_synthetic_visit_sheet()
    assert classify_sheet_content(df, sheet_name="ENERO 2026") == "mixta_visitas_y_pagos"


def test_aggregate_name_detection():
    assert is_aggregate_row_name("TOTAL")
    assert is_aggregate_row_name("SUBTOTAL MENSUAL")
    assert not is_aggregate_row_name("Socio Demo A")


@pytest.mark.skipif(not ENERO_FIXTURE.exists(), reason="fixture OCCALISTHENICS.xlsx no disponible localmente")
def test_parse_real_enero_fixture_without_versioning_names():
    df = pd.read_excel(ENERO_FIXTURE, sheet_name="ENERO 2026", header=None)
    result = parse_visit_summaries(df, sheet_name="ENERO 2026")
    assert result.layout is not None
    assert result.payment_block_detected is True
    assert result.diagnostics["distinct_members"] >= 30
    assert result.diagnostics["max_visits_cell"] <= 35


def test_preview_does_not_create_payments_or_cycles(db_session):
    admin = User(
        username="admin_visits",
        name="Admin",
        password_hash=hash_password("Pass123!"),
        role="admin",
    )
    socio = User(
        username="socio_demo_a",
        name="Socio Demo A",
        password_hash=hash_password("Pass123!"),
        role="socio",
    )
    db_session.add_all([admin, socio])
    db_session.commit()

    df = _build_synthetic_visit_sheet()
    preview = build_visit_preview_from_dataframe(
        db_session,
        df=df,
        sheet_name="ENERO 2026",
        filename="demo.xlsx",
        admin_user=admin,
        persist=True,
    )

    assert preview["preview_summary"]["can_commit"] is False
    assert preview["preview_summary"]["total_visits"] > 0
    assert db_session.query(MembershipPayment).count() == 0
    assert db_session.query(MembershipCycle).count() == 0

    matched_rows = [row for row in preview["rows"] if row["match_status"] == "matched"]
    assert any(row["matched_user_id"] == socio.id for row in matched_rows)
