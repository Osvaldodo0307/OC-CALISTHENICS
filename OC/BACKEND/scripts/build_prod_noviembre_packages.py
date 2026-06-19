#!/usr/bin/env python3
"""Genera paquetes productivos noviembre 2025: seguro vs pendientes."""
from __future__ import annotations

import csv
import json
import shutil
from pathlib import Path

BACKEND_ROOT = Path(__file__).resolve().parents[1]
FIXTURES = BACKEND_ROOT / "fixtures"

SAFE_NAMES = {
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


def _read(path: Path) -> list[dict]:
    with path.open(encoding="utf-8-sig", newline="") as f:
        return list(csv.DictReader(f))


def _write(path: Path, fieldnames: list[str], rows: list[dict]) -> None:
    with path.open("w", encoding="utf-8-sig", newline="") as f:
        writer = csv.DictWriter(f, fieldnames=fieldnames, extrasaction="ignore")
        writer.writeheader()
        writer.writerows(rows)


def _review_to_pending_row(row: dict, *, extra_reason: str | None = None) -> dict:
    reason = extra_reason or (row.get("reason_excluded") or "").strip()
    if row.get("socio_nombre") == "URIEL CARDIEL" and not extra_reason:
        reason = (
            "validacion_humana_requerida; sobrepago_no_explicado; "
            "monto_pagado=1890.02 vs costo_plan=171.82; plan POR CHECK IN"
        )
    monto = row.get("monto_pagado") or "0"
    return {
        "socio_nombre": row.get("socio_nombre") or "",
        "telefono": row.get("telefono") or "",
        "plan": row.get("plan") or "",
        "fecha_pago": row.get("periodo_inicio") or row.get("fecha_pago") or "2025-11-01",
        "monto_pagado": monto,
        "metodo_pago": row.get("metodo_pago") or ("historico_sin_metodo" if float(monto or 0) > 0 else ""),
        "periodo_inicio": row.get("periodo_inicio") or "2025-11-01",
        "periodo_fin": row.get("periodo_fin") or "2025-11-30",
        "payment_action": row.get("payment_action") or ("renew_extend" if float(monto or 0) > 0 else ""),
        "counts_as_income": "true" if float(monto or 0) > 0 else "false",
        "applies_to_balance": "true" if float(monto or 0) > 0 else "false",
        "saldo_pendiente": row.get("saldo_pendiente") or "0.0",
        "nota": row.get("nota") or "",
        "fuente_archivo": "OCCALISTHENICS.xlsx::NOVIEMBRE 2025",
        "referencia_externa": row.get("referencia_externa") or "",
        "pending_reason": reason,
        "warning_flags": row.get("warning_flags") or "",
        "costo_plan": row.get("costo_plan") or "",
        "review_include": row.get("include") or "false",
    }


def main() -> int:
    final_path = FIXTURES / "OCCALISTHENICS_final_noviembre_2025.csv"
    review_path = FIXTURES / "OCCALISTHENICS_review_noviembre_2025.csv"
    safe_path = FIXTURES / "OCCALISTHENICS_prod_safe_noviembre_2025.csv"
    pending_path = FIXTURES / "OCCALISTHENICS_prod_pending_review_noviembre_2025.csv"

    final_rows = _read(final_path)
    review_rows = _read(review_path)

    safe_rows = [r for r in final_rows if (r.get("socio_nombre") or "").strip() in SAFE_NAMES]
    if len(safe_rows) != 7:
        names = {(r.get("socio_nombre") or "").strip() for r in safe_rows}
        missing = SAFE_NAMES - names
        extra = names - SAFE_NAMES
        raise SystemExit(f"Paquete seguro invalido: {len(safe_rows)} filas; falta {missing}; extra {extra}")

    _write(safe_path, TEMPLATE, safe_rows)

    pending_rows: list[dict] = []
    for row in review_rows:
        name = (row.get("socio_nombre") or "").strip()
        include = str(row.get("include", "")).lower() == "true"
        if name in SAFE_NAMES:
            continue
        if name == "URIEL CARDIEL":
            pending_rows.append(_review_to_pending_row(row))
            continue
        if not include:
            pending_rows.append(_review_to_pending_row(row))

    # URIEL puede venir con include=true en review; ya lo agregamos arriba
    uriel_refs = {r["referencia_externa"] for r in pending_rows if r["socio_nombre"] == "URIEL CARDIEL"}
    if "OCCALISTHENICS:NOVIEMBRE 2025:uriel_cardiel:2025-11-01" not in uriel_refs:
        for row in review_rows:
            if (row.get("socio_nombre") or "").strip() == "URIEL CARDIEL":
                pending_rows.insert(0, _review_to_pending_row(row))
                break

    _write(pending_path, TEMPLATE + PENDING_EXTRA, pending_rows)

    income = sum(float(r["monto_pagado"]) for r in safe_rows)
    report = {
        "safe_path": str(safe_path),
        "safe_rows": len(safe_rows),
        "safe_socios": [r["socio_nombre"] for r in safe_rows],
        "safe_estimated_income": income,
        "pending_path": str(pending_path),
        "pending_rows": len(pending_rows),
        "pending_socios": [r["socio_nombre"] for r in pending_rows],
    }
    print(json.dumps(report, indent=2, ensure_ascii=False))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
