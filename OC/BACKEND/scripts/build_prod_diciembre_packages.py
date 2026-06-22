#!/usr/bin/env python3
"""Genera paquetes productivos diciembre 2025: seguro vs pendientes."""
from __future__ import annotations

import csv
import json
from pathlib import Path

BACKEND_ROOT = Path(__file__).resolve().parents[1]
FIXTURES = BACKEND_ROOT / "fixtures"

# Socios que nunca deben ir al paquete seguro productivo (validación humana obligatoria).
FORCE_PENDING_NAMES = {
    "URIEL CARDIEL",
    "URIEL. CARDIEL",
}

# Socios ya importados en producción (lote #1 noviembre) — solo referencia cruzada.
NOVIEMBRE_PROD_NAMES = {
    "TOÑITO OSNAYA",
    "LIRIA VILLEGAS",
    "VALERIA QUINTANA",
    "ARLETTE ROMÁN",
    "PEDRO FLORES",
    "LUIS ALBERTO",
    "RODRIGO ALVA",
}

TEMPLATE = [
    "socio_nombre",
    "telefono",
    "plan",
    "fecha_pago",
    "monto_pagado",
    "metodo_pago",
    "periodo_inicio",
    "periodo_fin",
    "payment_action",
    "counts_as_income",
    "applies_to_balance",
    "saldo_pendiente",
    "nota",
    "fuente_archivo",
    "referencia_externa",
]

PENDING_EXTRA = ["pending_reason", "warning_flags", "costo_plan", "review_include"]

FUENTE_ARCHIVO = "OCCALISTHENICS"


def _read(path: Path) -> list[dict]:
    with path.open(encoding="utf-8-sig", newline="") as handle:
        return list(csv.DictReader(handle))


def _write(path: Path, fieldnames: list[str], rows: list[dict]) -> None:
    with path.open("w", encoding="utf-8-sig", newline="") as handle:
        writer = csv.DictWriter(f=handle, fieldnames=fieldnames, extrasaction="ignore")
        writer.writeheader()
        writer.writerows(rows)


def _clean_row_to_template(row: dict) -> dict:
    monto = float(row.get("monto_pagado") or 0)
    return {
        "socio_nombre": row.get("socio_nombre") or "",
        "telefono": row.get("telefono") or "",
        "plan": row.get("plan") or "",
        "fecha_pago": row.get("fecha_pago") or row.get("periodo_inicio") or "2025-12-01",
        "monto_pagado": row.get("monto_pagado") or "0",
        "metodo_pago": "historico_sin_metodo",
        "periodo_inicio": row.get("periodo_inicio") or "2025-12-01",
        "periodo_fin": row.get("periodo_fin") or "2025-12-31",
        "payment_action": row.get("payment_action") or ("renew_extend" if monto > 0 else ""),
        "counts_as_income": row.get("counts_as_income") or ("true" if monto > 0 else "false"),
        "applies_to_balance": row.get("applies_to_balance") or ("true" if monto > 0 else "false"),
        "saldo_pendiente": row.get("saldo_pendiente") or "0.0",
        "nota": row.get("nota") or "",
        "fuente_archivo": FUENTE_ARCHIVO,
        "referencia_externa": row.get("referencia_externa") or "",
    }


def _review_to_pending_row(row: dict, *, extra_reason: str | None = None) -> dict:
    name = (row.get("socio_nombre") or "").strip()
    reason = extra_reason or (row.get("reason_excluded") or "").strip()
    if name == "URIEL CARDIEL" and not extra_reason:
        reason = (
            "validacion_humana_requerida; excluido_paquete_seguro; "
            "monto_pagado=1890.02 vs costo_plan=171.82; plan POR CHECK IN"
        )
    monto = row.get("monto_pagado") or "0"
    pending = _clean_row_to_template(
        {
            **row,
            "fecha_pago": row.get("periodo_inicio") or row.get("fecha_pago") or "2025-12-01",
            "metodo_pago": "historico_sin_metodo" if float(monto or 0) > 0 else "",
        }
    )
    pending.update(
        {
            "pending_reason": reason,
            "warning_flags": row.get("warning_flags") or "",
            "costo_plan": row.get("costo_plan") or "",
            "review_include": row.get("include") or "false",
        }
    )
    return pending


def _is_safe_review_row(row: dict) -> bool:
    name = (row.get("socio_nombre") or "").strip()
    if name in FORCE_PENDING_NAMES:
        return False
    if str(row.get("include", "")).lower() != "true":
        return False
    monto = float(row.get("monto_pagado") or 0)
    if monto <= 0:
        return False
    ref = (row.get("referencia_externa") or "").upper()
    if "NOVIEMBRE" in ref:
        return False
    if not ref.startswith("OCCALISTHENICS:DICIEMBRE"):
        return False
    return True


def main() -> int:
    clean_path = FIXTURES / "OCCALISTHENICS_clean_diciembre_2025.csv"
    review_path = FIXTURES / "OCCALISTHENICS_review_diciembre_2025.csv"
    safe_path = FIXTURES / "OCCALISTHENICS_prod_safe_diciembre_2025.csv"
    pending_path = FIXTURES / "OCCALISTHENICS_prod_pending_review_diciembre_2025.csv"

    if not review_path.exists():
        raise SystemExit(f"No existe review: {review_path}. Ejecuta build_occalisthenics_review.py --tag clean_diciembre_2025")

    clean_by_ref = {r["referencia_externa"]: r for r in _read(clean_path)} if clean_path.exists() else {}
    review_rows = _read(review_path)

    safe_review_rows = [row for row in review_rows if _is_safe_review_row(row)]
    safe_refs = {(row.get("referencia_externa") or "").strip() for row in safe_review_rows}

    safe_rows: list[dict] = []
    for row in safe_review_rows:
        ref = (row.get("referencia_externa") or "").strip()
        source = clean_by_ref.get(ref, row)
        safe_rows.append(_clean_row_to_template(source))

    refs = [row["referencia_externa"] for row in safe_rows]
    if len(refs) != len(set(refs)):
        raise SystemExit("Referencias externas duplicadas en paquete seguro")

    _write(safe_path, TEMPLATE, safe_rows)

    pending_rows: list[dict] = []
    for row in review_rows:
        ref = (row.get("referencia_externa") or "").strip()
        name = (row.get("socio_nombre") or "").strip()
        if ref in safe_refs:
            continue
        if name in FORCE_PENDING_NAMES and str(row.get("include", "")).lower() == "true":
            pending_rows.append(_review_to_pending_row(row))
            continue
        if str(row.get("include", "")).lower() == "false" or name in FORCE_PENDING_NAMES:
            pending_rows.append(_review_to_pending_row(row))

    _write(pending_path, TEMPLATE + PENDING_EXTRA, pending_rows)

    overlap_nov = [
        row["socio_nombre"]
        for row in safe_rows
        if (row.get("socio_nombre") or "").strip() in NOVIEMBRE_PROD_NAMES
    ]

    income = sum(float(row["monto_pagado"]) for row in safe_rows)
    report = {
        "safe_path": str(safe_path),
        "safe_rows": len(safe_rows),
        "safe_socios": [row["socio_nombre"] for row in safe_rows],
        "safe_estimated_income": round(income, 2),
        "safe_overlap_noviembre_prod": overlap_nov,
        "pending_path": str(pending_path),
        "pending_rows": len(pending_rows),
        "pending_socios": sorted({row["socio_nombre"] for row in pending_rows}),
        "review_total": len(review_rows),
        "review_include_true": sum(1 for row in review_rows if str(row.get("include", "")).lower() == "true"),
        "review_include_false": sum(1 for row in review_rows if str(row.get("include", "")).lower() != "true"),
    }
    print(json.dumps(report, indent=2, ensure_ascii=False))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
