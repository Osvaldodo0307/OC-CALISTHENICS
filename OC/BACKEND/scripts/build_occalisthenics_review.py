#!/usr/bin/env python3
"""
Genera CSV de revisión manual y lote piloto desde salidas clean del transformador.

Uso:
  python scripts/build_occalisthenics_review.py --tag clean_noviembre_2025
  python scripts/build_occalisthenics_review.py --tag clean_noviembre_2025 --build-pilot
"""
from __future__ import annotations

import argparse
import calendar
import json
import re
import unicodedata
from datetime import date
from pathlib import Path
from typing import Any

import pandas as pd

BACKEND_ROOT = Path(__file__).resolve().parents[1]
FIXTURES = BACKEND_ROOT / "fixtures"
DEFAULT_PLAN_MAPPING = FIXTURES / "occalisthenics_plan_mapping.json"

REVIEW_COLUMNS = [
    "include",
    "reason_excluded",
    "socio_nombre",
    "telefono",
    "plan",
    "periodo_inicio",
    "periodo_fin",
    "monto_pagado",
    "costo_plan",
    "saldo_pendiente",
    "metodo_pago",
    "payment_action",
    "nota",
    "referencia_externa",
    "warning_flags",
]

TEMPLATE_COLUMNS = [
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

SKIP_SOCIO_NAMES = {"TOTAL", "SUBTOTAL", "SUMA", "NOMBRE", "MENSUAL"}
SKIP_SOCIO_PREFIXES = ("TOTAL ",)
AUXILIARY_NAME_PATTERNS = (
    re.compile(r"^prima\b"),
    re.compile(r"^hermana\b"),
    re.compile(r"^hermano\b"),
    re.compile(r"^primo\b"),
    re.compile(r"^amiga\b"),
    re.compile(r"^prima\s"),
    re.compile(r"^hermana\s"),
    re.compile(r"^amiga\s"),
    re.compile(r"^april$"),
)
PILOT_SAFE_PLANS = {"PLAN OC", "12 CLASES", "WELLHUB", "OPEN GYM", "5 VISITAS", "Grupal", "Mensual"}
JUSTIFIED_OVERPAY_PLANS = {"POR CHECK IN", "WELLHUB", "INVITADO"}
STRANGE_PLAN_SOURCES = {"1", "5620", "POR CLASE"}


def _has_phone(value: Any) -> bool:
    if value is None or (isinstance(value, float) and pd.isna(value)):
        return False
    text = str(value).strip()
    return bool(text and text.lower() not in {"nan", "none"})


def _normalize_name(value: str) -> str:
    text = unicodedata.normalize("NFKD", value.strip().lower())
    text = "".join(ch for ch in text if not unicodedata.combining(ch))
    text = re.sub(r"[^a-z0-9\s]", " ", text)
    return re.sub(r"\s+", " ", text).strip()


def _month_end_from_iso(value: str) -> str:
    try:
        parts = value.strip()[:10].split("-")
        y, m = int(parts[0]), int(parts[1])
        last = calendar.monthrange(y, m)[1]
        return date(y, m, last).isoformat()
    except (ValueError, IndexError):
        return value


def _extract_costo_plan(nota: str, monto: float, saldo: float, action: str, meta_costo: Any) -> float | None:
    if meta_costo is not None and not (isinstance(meta_costo, float) and pd.isna(meta_costo)):
        try:
            return float(meta_costo)
        except (TypeError, ValueError):
            pass
    match = re.search(r"costo_plan=([0-9.]+)", nota or "")
    if match:
        return float(match.group(1))
    if action == "partial_debt" and saldo:
        return round(monto + saldo, 2)
    if action == "renew_extend" and monto > 0:
        return monto
    return None


def _is_auxiliary_name(name: str) -> bool:
    upper = name.strip().upper()
    if upper in SKIP_SOCIO_NAMES:
        return True
    if any(upper.startswith(prefix) for prefix in SKIP_SOCIO_PREFIXES):
        return True
    norm = _normalize_name(name)
    return any(pat.search(norm) for pat in AUXILIARY_NAME_PATTERNS)


def _load_plan_keys(path: Path) -> set[str]:
    if not path.exists():
        return set()
    data = json.loads(path.read_text(encoding="utf-8"))
    return {str(k).strip().upper() for k in (data.get("mappings") or {}).keys()}


def _evaluate_row(
    row: dict[str, Any],
    meta: dict[str, Any],
    warn_codes: list[str],
    plan_keys: set[str],
) -> tuple[bool, str, list[str]]:
    flags: list[str] = list(warn_codes)
    reasons: list[str] = []

    socio = str(row.get("socio_nombre") or "").strip()
    monto = float(row.get("monto_pagado") or 0)
    saldo = float(row.get("saldo_pendiente") or 0)
    action = str(row.get("payment_action") or "")
    nota = str(row.get("nota") or "")
    plan = str(row.get("plan") or "")
    plan_source = str(meta.get("plan_source") or "").strip().upper()
    plan_mapped = bool(meta.get("plan_mapped"))

    costo = _extract_costo_plan(nota, monto, saldo, action, meta.get("costo_plan"))

    if _is_auxiliary_name(socio):
        reasons.append("fila_auxiliar_no_socio")
        flags.append("auxiliar")
    if monto == 0:
        reasons.append("monto_cero")
        flags.append("monto_cero")
    if "valor_no_numerico" in warn_codes:
        reasons.append("valor_no_numerico")
        flags.append("no_numerico")
    if "sin_pago_detectado" in warn_codes:
        reasons.append("sin_pago_detectado")
        flags.append("sin_pago")
    if costo and costo > 0 and monto > costo * 1.5 and plan.upper() not in JUSTIFIED_OVERPAY_PLANS:
        reasons.append("sobrepago_extremo")
        flags.append("sobrepago_extremo")
    elif "sobrepago" in warn_codes:
        flags.append("sobrepago")
    if not plan_mapped and plan_source and plan_source not in plan_keys:
        flags.append("plan_no_mapeado")
        if (
            plan_source in STRANGE_PLAN_SOURCES
            or plan_source.isdigit()
            or (costo and monto > 0 and abs(monto - costo) > costo * 0.5)
        ):
            reasons.append("plan_no_mapeado_monto_extrano")
    if not str(row.get("telefono") or "").strip():
        flags.append("sin_telefono")
    if action == "partial_debt":
        flags.append("pago_parcial")

    include = len(reasons) == 0
    reason_excluded = "; ".join(reasons)
    return include, reason_excluded, sorted(set(flags))


def _warnings_index(warnings_path: Path) -> dict[tuple[str, str], list[str]]:
    if not warnings_path.exists():
        return {}
    df = pd.read_csv(warnings_path, encoding="utf-8-sig")
    index: dict[tuple[str, str], list[str]] = {}
    for _, w in df.iterrows():
        socio = str(w.get("socio_nombre") or "").strip()
        month_col = str(w.get("month_column") or "").strip()
        code = str(w.get("code") or "").strip()
        key = (socio, month_col[:10] if month_col else "")
        index.setdefault(key, []).append(code)
        if code in {"sin_pago_detectado", "valor_no_numerico"}:
            period_key = (socio, _month_key_from_warning(month_col))
            index.setdefault(period_key, []).append(code)
    return index


def _month_key_from_warning(month_col: str) -> str:
    match = re.search(r"(\d{4}-\d{2}-\d{2})", month_col)
    if match:
        return match.group(1)[:7]
    try:
        parsed = pd.to_datetime(month_col, errors="coerce")
        if pd.notna(parsed):
            return parsed.strftime("%Y-%m")
    except Exception:
        pass
    return month_col[:7]


def build_review(tag: str, plan_mapping_path: Path) -> dict[str, Any]:
    clean_path = FIXTURES / f"OCCALISTHENICS_{tag}.csv"
    warn_path = FIXTURES / f"OCCALISTHENICS_transform_warnings_{tag}.csv"
    meta_path = FIXTURES / f"OCCALISTHENICS_transform_meta_{tag}.json"
    review_path = FIXTURES / f"OCCALISTHENICS_review_{tag.removeprefix('clean_')}.csv"

    if not clean_path.exists():
        raise FileNotFoundError(f"No existe {clean_path}")

    clean_df = pd.read_csv(clean_path, encoding="utf-8-sig")
    meta_list = json.loads(meta_path.read_text(encoding="utf-8")) if meta_path.exists() else []
    meta_by_ref = {m.get("referencia_externa"): m for m in meta_list}
    warn_index = _warnings_index(warn_path)
    plan_keys = _load_plan_keys(plan_mapping_path)

    review_rows: list[dict[str, Any]] = []
    included = excluded = 0

    for _, row in clean_df.iterrows():
        ref = str(row.get("referencia_externa") or "")
        meta = meta_by_ref.get(ref, {})
        periodo = str(row.get("periodo_inicio") or "")[:7]
        socio = str(row.get("socio_nombre") or "").strip()
        warn_codes = warn_index.get((socio, periodo), []) + warn_index.get((socio, str(row.get("periodo_inicio") or "")[:10]), [])

        include, reason, flags = _evaluate_row(row.to_dict(), meta, warn_codes, plan_keys)
        if include:
            included += 1
        else:
            excluded += 1

        costo = _extract_costo_plan(
            str(row.get("nota") or ""),
            float(row.get("monto_pagado") or 0),
            float(row.get("saldo_pendiente") or 0),
            str(row.get("payment_action") or ""),
            meta.get("costo_plan"),
        )

        review_rows.append({
            "include": "true" if include else "false",
            "reason_excluded": reason,
            "socio_nombre": socio,
            "telefono": row.get("telefono") or "",
            "plan": row.get("plan"),
            "periodo_inicio": row.get("periodo_inicio"),
            "periodo_fin": row.get("periodo_fin"),
            "monto_pagado": row.get("monto_pagado"),
            "costo_plan": costo if costo is not None else "",
            "saldo_pendiente": row.get("saldo_pendiente"),
            "metodo_pago": row.get("metodo_pago"),
            "payment_action": row.get("payment_action"),
            "nota": row.get("nota"),
            "referencia_externa": ref,
            "warning_flags": ";".join(flags),
        })

    if warn_path.exists():
        warn_df = pd.read_csv(warn_path, encoding="utf-8-sig")
        existing_refs = {r["referencia_externa"] for r in review_rows}
        for _, w in warn_df.iterrows():
            code = str(w.get("code") or "")
            if code not in {"sin_pago_detectado", "valor_no_numerico"}:
                continue
            socio = str(w.get("socio_nombre") or "").strip()
            month_col = str(w.get("month_column") or "")
            period_start = _parse_period_start(month_col)
            if not period_start:
                continue
            pseudo_ref = f"WARN:{socio}:{period_start}"
            if pseudo_ref in existing_refs:
                continue
            include = False
            reason = code
            if _is_auxiliary_name(socio):
                reason = f"fila_auxiliar_no_socio; {code}"
            excluded += 1
            review_rows.append({
                "include": "false",
                "reason_excluded": reason,
                "socio_nombre": socio,
                "telefono": "",
                "plan": "",
                "periodo_inicio": period_start,
                "periodo_fin": _month_end_from_iso(period_start),
                "monto_pagado": 0,
                "costo_plan": "",
                "saldo_pendiente": "",
                "metodo_pago": "",
                "payment_action": "",
                "nota": str(w.get("message") or ""),
                "referencia_externa": pseudo_ref,
                "warning_flags": code,
            })
            existing_refs.add(pseudo_ref)

    pd.DataFrame(review_rows, columns=REVIEW_COLUMNS).to_csv(review_path, index=False, encoding="utf-8-sig")

    sin_tel = sum(
        1
        for r in review_rows
        if r["include"] == "true" and not _has_phone(r.get("telefono"))
    )

    return {
        "review_path": str(review_path),
        "total_rows": len(review_rows),
        "included": included,
        "excluded": excluded,
        "sin_telefono_included": sin_tel,
    }


def _parse_period_start(month_col: str) -> str:
    match = re.search(r"(\d{4}-\d{2}-\d{2})", month_col)
    if match:
        return match.group(1)
    try:
        parsed = pd.to_datetime(month_col, errors="coerce")
        if pd.notna(parsed):
            return parsed.date().isoformat()
    except Exception:
        pass
    return ""


def build_commit_pilot(review_tag: str, output_name: str, max_rows: int = 10) -> dict[str, Any]:
    review_path = FIXTURES / f"OCCALISTHENICS_review_{review_tag.removeprefix('clean_')}.csv"
    pilot_path = FIXTURES / output_name
    clean_path = FIXTURES / f"OCCALISTHENICS_{review_tag}.csv"

    review_df = pd.read_csv(review_path, encoding="utf-8-sig")
    clean_df = pd.read_csv(clean_path, encoding="utf-8-sig")
    clean_by_ref = {str(r["referencia_externa"]): r for _, r in clean_df.iterrows()}

    candidates = review_df[review_df["include"].astype(str).str.lower() == "true"].copy()

    def _pilot_eligible(row: pd.Series) -> bool:
        flags = str(row.get("warning_flags") or "")
        plan = str(row.get("plan") or "").strip()
        if "auxiliar" in flags:
            return False
        if "sobrepago" in flags:
            return False
        if "plan_no_mapeado" in flags:
            return False
        if plan and plan not in PILOT_SAFE_PLANS:
            return False
        return True

    candidates = candidates[candidates.apply(_pilot_eligible, axis=1)]
    if candidates.empty:
        raise ValueError("No hay filas con include=true para el piloto")

    selected_refs: list[str] = []
    picked_categories: set[str] = set()

    def _try_pick(ref: str, category: str) -> bool:
        if ref in selected_refs or len(selected_refs) >= max_rows:
            return False
        if category in picked_categories and category not in {"sin_telefono", "historico_sin_metodo", "nota"}:
            return False
        selected_refs.append(ref)
        picked_categories.add(category)
        return True

    for _, row in candidates.iterrows():
        ref = str(row["referencia_externa"])
        flags = str(row.get("warning_flags") or "")
        action = str(row.get("payment_action") or "")
        plan = str(row.get("plan") or "")
        nota = str(row.get("nota") or "")
        socio = str(row.get("socio_nombre") or "")

        if action == "partial_debt":
            _try_pick(ref, "pago_parcial")
        elif plan == "PLAN OC" and "pago_normal" not in picked_categories:
            _try_pick(ref, "pago_normal")
        elif plan == "12 CLASES":
            _try_pick(ref, "plan_12_clases")
        elif plan == "WELLHUB":
            _try_pick(ref, "wellhub")
        elif not str(row.get("telefono") or "").strip():
            _try_pick(ref, "sin_telefono")
        elif "MEMBRESIA_col" in nota:
            _try_pick(ref, "nota")
        elif str(row.get("metodo_pago") or "") == "historico_sin_metodo":
            _try_pick(ref, "historico_sin_metodo")

    name_counts = candidates["socio_nombre"].value_counts()
    repeated_names = set(name_counts[name_counts > 1].index.tolist())
    for _, row in candidates.iterrows():
        if str(row["socio_nombre"]) in repeated_names:
            _try_pick(str(row["referencia_externa"]), "nombre_repetido_hoja")
            break

    for _, row in candidates.iterrows():
        ref = str(row["referencia_externa"])
        if ref not in selected_refs and len(selected_refs) < max_rows:
            if "sobrepago" not in str(row.get("warning_flags") or ""):
                selected_refs.append(ref)

    pilot_rows = []
    for ref in selected_refs:
        if ref not in clean_by_ref:
            continue
        row = dict(clean_by_ref[ref])
        row["counts_as_income"] = "true"
        row["applies_to_balance"] = "true"
        pilot_rows.append(row)
    pd.DataFrame(pilot_rows, columns=TEMPLATE_COLUMNS).to_csv(pilot_path, index=False, encoding="utf-8-sig")

    return {
        "pilot_path": str(pilot_path),
        "rows": len(pilot_rows),
        "socios": sorted({r["socio_nombre"] for r in pilot_rows}),
        "referencias": selected_refs,
    }


FINAL_EXCLUDE_FLAGS = {"auxiliar", "sobrepago", "sobrepago_extremo", "no_numerico", "sin_pago", "plan_no_mapeado"}
FINAL_ACCEPTABLE_PLANS = PILOT_SAFE_PLANS


def _final_eligible(row: pd.Series) -> bool:
    if str(row.get("include") or "").lower() != "true":
        return False
    flags = {f for f in str(row.get("warning_flags") or "").split(";") if f}
    if flags & FINAL_EXCLUDE_FLAGS:
        return False
    plan = str(row.get("plan") or "").strip()
    if plan not in FINAL_ACCEPTABLE_PLANS:
        return False
    if float(row.get("monto_pagado") or 0) <= 0:
        return False
    if str(row.get("metodo_pago") or "") != "historico_sin_metodo":
        return False
    ref = str(row.get("referencia_externa") or "")
    if ref.startswith("WARN:"):
        return False
    return True


def build_final_noviembre(
    review_tag: str = "clean_noviembre_2025",
    output_name: str = "OCCALISTHENICS_final_noviembre_2025.csv",
    contacts_path: Path | None = None,
) -> dict[str, Any]:
    review_path = FIXTURES / f"OCCALISTHENICS_review_{review_tag.removeprefix('clean_')}.csv"
    clean_path = FIXTURES / f"OCCALISTHENICS_{review_tag}.csv"
    final_path = FIXTURES / output_name

    review_df = pd.read_csv(review_path, encoding="utf-8-sig")
    clean_df = pd.read_csv(clean_path, encoding="utf-8-sig")
    clean_by_ref = {str(r["referencia_externa"]): r for _, r in clean_df.iterrows()}

    contacts: dict[str, str] = {}
    contacts_file = contacts_path or (FIXTURES / "contacts_master.csv")
    if contacts_file.exists():
        cdf = pd.read_csv(contacts_file, encoding="utf-8-sig")
        if "socio_nombre" in cdf.columns and "telefono" in cdf.columns:
            for _, c in cdf.iterrows():
                name = str(c.get("socio_nombre") or "").strip()
                phone = c.get("telefono")
                if name and _has_phone(phone):
                    contacts[_normalize_name(name)] = re.sub(r"\D", "", str(int(phone) if isinstance(phone, float) else phone))[-10:]

    selected = review_df[review_df.apply(_final_eligible, axis=1)]
    final_rows = []
    phones_applied = 0
    for _, rev in selected.iterrows():
        ref = str(rev["referencia_externa"])
        if ref not in clean_by_ref:
            continue
        row = dict(clean_by_ref[ref])
        row["counts_as_income"] = "true"
        row["applies_to_balance"] = "true"
        norm = _normalize_name(str(row.get("socio_nombre") or ""))
        if norm in contacts:
            row["telefono"] = contacts[norm]
            phones_applied += 1
        final_rows.append(row)

    pd.DataFrame(final_rows, columns=TEMPLATE_COLUMNS).to_csv(final_path, index=False, encoding="utf-8-sig")
    missing_phone = sum(1 for r in final_rows if not _has_phone(r.get("telefono")))

    return {
        "final_path": str(final_path),
        "rows": len(final_rows),
        "socios": sorted({r["socio_nombre"] for r in final_rows}),
        "referencias": [str(r["referencia_externa"]) for r in final_rows],
        "phones_applied": phones_applied,
        "missing_phone": missing_phone,
        "excluded_from_review_true": int((review_df["include"].astype(str).str.lower() == "true").sum()) - len(final_rows),
    }


def main() -> int:
    parser = argparse.ArgumentParser(description="Revisión manual OCCALISTHENICS + lote piloto")
    parser.add_argument("--tag", required=True, help="Tag clean, ej. clean_noviembre_2025")
    parser.add_argument("--config", type=Path, default=DEFAULT_PLAN_MAPPING)
    parser.add_argument("--build-pilot", action="store_true", help="Generar lote commit piloto noviembre")
    parser.add_argument(
        "--pilot-output",
        default="OCCALISTHENICS_commit_pilot_noviembre_2025.csv",
        help="Nombre archivo piloto en fixtures/",
    )
    parser.add_argument("--build-final", action="store_true", help="Generar CSV final aprobado noviembre")
    parser.add_argument(
        "--final-output",
        default="OCCALISTHENICS_final_noviembre_2025.csv",
        help="Nombre archivo final en fixtures/",
    )
    parser.add_argument("--contacts", type=Path, default=FIXTURES / "contacts_master.csv")
    args = parser.parse_args()

    summary = build_review(args.tag, args.config)
    print(json.dumps({"review": summary}, indent=2, ensure_ascii=False))

    if args.build_pilot:
        pilot = build_commit_pilot(args.tag, args.pilot_output)
        print(json.dumps({"pilot": pilot}, indent=2, ensure_ascii=False))

    if args.build_final:
        final = build_final_noviembre(args.tag, args.final_output, args.contacts)
        print(json.dumps({"final": final}, indent=2, ensure_ascii=False))

    return 0


if __name__ == "__main__":
    raise SystemExit(main())
