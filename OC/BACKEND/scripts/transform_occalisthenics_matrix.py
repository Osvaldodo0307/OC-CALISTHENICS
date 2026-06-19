#!/usr/bin/env python3
"""
Transformador matriz OCCALISTHENICS.xlsx → CSV plantilla importador histórico.

Solo genera archivos en fixtures/; no escribe en BD ni hace commit.

Uso:
  python scripts/transform_occalisthenics_matrix.py --sheet "NOVIEMBRE 2025"
  python scripts/transform_occalisthenics_matrix.py --sheet "DICIEMBRE 2025" --default-method historico_sin_metodo
  python scripts/transform_occalisthenics_matrix.py --sheet "NOVIEMBRE 2025" --month 2025-11
  python scripts/transform_occalisthenics_matrix.py --sheet "NOVIEMBRE 2025" --contacts fixtures/contacts_master.csv
"""
from __future__ import annotations

import argparse
import calendar
import json
import re
import unicodedata
from dataclasses import dataclass, field
from datetime import date, datetime
from pathlib import Path
from typing import Any

import pandas as pd

BACKEND_ROOT = Path(__file__).resolve().parents[1]
DEFAULT_SOURCE = BACKEND_ROOT / "fixtures" / "OCCALISTHENICS.xlsx"
DEFAULT_PLAN_MAPPING = BACKEND_ROOT / "fixtures" / "occalisthenics_plan_mapping.json"
DEFAULT_CONTACTS = BACKEND_ROOT / "fixtures" / "contacts_master.csv"

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

NON_NUMERIC_TOKENS = {"X", "✅", "❌", "-", "N/A", "NA", "S/N", "SN"}
SKIP_SOCIO_NAMES = {"TOTAL", "SUBTOTAL", "SUMA", "NOMBRE", "MENSUAL"}
SKIP_SOCIO_PREFIXES = ("TOTAL ",)


@dataclass
class WarningRecord:
    sheet: str
    socio_nombre: str
    excel_row: int
    month_column: str
    code: str
    message: str
    raw_value: str | None = None


@dataclass
class TransformStats:
    socios_procesados: int = 0
    filas_pago_generadas: int = 0
    celdas_ignoradas_vacio: int = 0
    montos_cero_sin_pago: int = 0
    montos_parciales: int = 0
    montos_sobrepago: int = 0
    valores_no_numericos: int = 0
    metodos_ausentes: int = 0
    telefonos_ausentes: int = 0
    telefonos_desde_contactos: int = 0
    planes_no_mapeados: int = 0
    ingresos_estimados: float = 0.0
    adeudos_estimados: float = 0.0
    warnings: list[WarningRecord] = field(default_factory=list)


def _normalize_name(value: str) -> str:
    text = unicodedata.normalize("NFKD", value.strip().lower())
    text = "".join(ch for ch in text if not unicodedata.combining(ch))
    text = re.sub(r"[^a-z0-9\s]", " ", text)
    return re.sub(r"\s+", " ", text).strip()


def _slug_sheet(sheet_name: str) -> str:
    return re.sub(r"[^a-z0-9]+", "_", sheet_name.strip().lower()).strip("_")


def _parse_header_date(value: Any) -> date | None:
    if value is None or (isinstance(value, float) and pd.isna(value)):
        return None
    if isinstance(value, datetime):
        return value.date()
    if isinstance(value, date):
        return value
    try:
        parsed = pd.to_datetime(str(value).strip(), errors="coerce")
        if pd.isna(parsed):
            return None
        return parsed.date()
    except Exception:
        return None


def _month_end(d: date) -> date:
    last = calendar.monthrange(d.year, d.month)[1]
    return date(d.year, d.month, last)


def _parse_cell_value(value: Any) -> tuple[str, float | None]:
    """Retorna (kind, amount). kind: empty|zero|numeric|non_numeric"""
    if value is None or (isinstance(value, float) and pd.isna(value)):
        return "empty", None
    if isinstance(value, (int, float)):
        amount = float(value)
        if amount == 0:
            return "zero", 0.0
        return "numeric", amount
    text = str(value).strip()
    if not text:
        return "empty", None
    upper = text.upper()
    if upper in NON_NUMERIC_TOKENS:
        return "non_numeric", None
    if upper in {"0", "0.0"}:
        return "zero", 0.0
    try:
        amount = float(text.replace(",", "").replace("$", ""))
        if amount == 0:
            return "zero", 0.0
        return "numeric", amount
    except ValueError:
        return "non_numeric", None


def _parse_cost(value: Any) -> float | None:
    kind, amount = _parse_cell_value(value)
    if kind == "numeric" and amount is not None:
        return amount
    return None


def _load_plan_mapping(path: Path) -> dict[str, str]:
    if not path.exists():
        return {}
    data = json.loads(path.read_text(encoding="utf-8"))
    mappings = data.get("mappings") or {}
    return {str(k).strip().upper(): str(v).strip() for k, v in mappings.items()}


def _load_contacts(path: Path | None) -> dict[str, str]:
    if not path or not path.exists():
        return {}
    df = pd.read_csv(path, encoding="utf-8-sig")
    if "socio_nombre" not in df.columns or "telefono" not in df.columns:
        return {}
    contacts: dict[str, str] = {}
    for _, row in df.iterrows():
        name = str(row.get("socio_nombre") or "").strip()
        phone = row.get("telefono")
        if not name or pd.isna(phone):
            continue
        digits = re.sub(r"\D", "", str(phone))
        if phone and isinstance(phone, float):
            digits = str(int(phone))
        if len(digits) > 10:
            digits = digits[-10:]
        if name:
            contacts[_normalize_name(name)] = digits
    return contacts


def _map_plan(raw_plan: str, mapping: dict[str, str], stats: TransformStats, socio: str, sheet: str) -> str:
    key = raw_plan.strip().upper()
    if key in mapping:
        return mapping[key]
    if raw_plan.strip():
        stats.planes_no_mapeados += 1
        stats.warnings.append(
            WarningRecord(
                sheet=sheet,
                socio_nombre=socio,
                excel_row=0,
                month_column="",
                code="plan_no_mapeado",
                message=f"Plan sin mapeo: {raw_plan}",
            )
        )
    return raw_plan.strip() or "PLAN OC"


def _build_referencia(sheet: str, socio: str, period_start: date) -> str:
    socio_slug = _normalize_name(socio).replace(" ", "_")[:40] or "socio"
    return f"OCCALISTHENICS:{sheet}:{socio_slug}:{period_start.isoformat()}"


def _detect_matrix_header(df: pd.DataFrame) -> int:
    for idx in range(min(10, len(df))):
        row = df.iloc[idx]
        texts = [str(v).strip().upper() for v in row if pd.notna(v)]
        if "NOMBRE" in texts:
            return idx
    return 1


def transform_sheet(
    *,
    df: pd.DataFrame,
    sheet_name: str,
    source_file: str,
    plan_mapping: dict[str, str],
    contacts: dict[str, str],
    default_method: str | None,
    target_months: set[str] | None,
    stats: TransformStats,
) -> list[dict[str, Any]]:
    header_idx = _detect_matrix_header(df)
    header = df.iloc[header_idx]

    month_columns: list[tuple[int, date, str]] = []
    for col_idx, val in enumerate(header):
        month_date = _parse_header_date(val)
        if month_date:
            month_key = month_date.strftime("%Y-%m")
            if target_months and month_key not in target_months:
                continue
            month_columns.append((col_idx, month_date, str(val)))

    if not month_columns:
        raise ValueError(f"No se detectaron columnas de mes en hoja '{sheet_name}'")

    payment_rows: list[dict[str, Any]] = []
    data_start = header_idx + 1

    for row_idx in range(data_start, len(df)):
        raw_name = df.iloc[row_idx, 0]
        if pd.isna(raw_name):
            continue
        socio = str(raw_name).strip()
        socio_upper = socio.upper()
        if (
            not socio
            or socio_upper in SKIP_SOCIO_NAMES
            or any(socio_upper.startswith(prefix) for prefix in SKIP_SOCIO_PREFIXES)
        ):
            continue

        stats.socios_procesados += 1
        tipo_plan_raw = str(df.iloc[row_idx, 4]).strip() if pd.notna(df.iloc[row_idx, 4]) else ""
        membresia_ref = df.iloc[row_idx, 2] if df.shape[1] > 2 else None
        costo_plan = _parse_cost(df.iloc[row_idx, 3]) if df.shape[1] > 3 else None

        plan_source = tipo_plan_raw or (str(membresia_ref).strip() if pd.notna(membresia_ref) else "")
        plan_source_key = (plan_source or "PLAN OC").strip().upper()
        plan = _map_plan(plan_source or "PLAN OC", plan_mapping, stats, socio, sheet_name)
        plan_mapped = plan_source_key in plan_mapping

        norm = _normalize_name(socio)
        telefono = contacts.get(norm, "")
        if telefono:
            stats.telefonos_desde_contactos += 1
        else:
            stats.telefonos_ausentes += 1

        for col_idx, month_date, col_label in month_columns:
            cell = df.iloc[row_idx, col_idx] if col_idx < df.shape[1] else None
            kind, amount = _parse_cell_value(cell)

            if kind == "empty":
                stats.celdas_ignoradas_vacio += 1
                continue

            if kind == "non_numeric":
                stats.valores_no_numericos += 1
                stats.warnings.append(
                    WarningRecord(
                        sheet=sheet_name,
                        socio_nombre=socio,
                        excel_row=row_idx + 1,
                        month_column=col_label,
                        code="valor_no_numerico",
                        message="Celda con texto/símbolo; no se crea pago",
                        raw_value=str(cell),
                    )
                )
                continue

            if kind == "zero":
                stats.montos_cero_sin_pago += 1
                msg = "sin_pago_detectado"
                if costo_plan and costo_plan > 0:
                    msg += f"; posible adeudo={costo_plan}"
                    stats.adeudos_estimados += costo_plan
                stats.warnings.append(
                    WarningRecord(
                        sheet=sheet_name,
                        socio_nombre=socio,
                        excel_row=row_idx + 1,
                        month_column=col_label,
                        code="sin_pago_detectado",
                        message=msg,
                        raw_value="0",
                    )
                )
                continue

            assert amount is not None and amount > 0
            period_start = month_date
            period_end = _month_end(month_date)
            saldo = 0.0
            payment_action = "renew_extend"
            nota_extra = []

            if costo_plan is not None and amount < costo_plan:
                payment_action = "partial_debt"
                saldo = round(costo_plan - amount, 2)
                stats.montos_parciales += 1
                stats.adeudos_estimados += saldo
                nota_extra.append(f"Pago parcial; costo_plan={costo_plan}")
                stats.warnings.append(
                    WarningRecord(
                        sheet=sheet_name,
                        socio_nombre=socio,
                        excel_row=row_idx + 1,
                        month_column=col_label,
                        code="pago_parcial",
                        message=f"Monto {amount} < costo plan {costo_plan}",
                        raw_value=str(cell),
                    )
                )
            elif costo_plan is not None and amount > costo_plan:
                stats.montos_sobrepago += 1
                nota_extra.append(f"Sobrepago vs costo_plan={costo_plan}; revisar")
                stats.warnings.append(
                    WarningRecord(
                        sheet=sheet_name,
                        socio_nombre=socio,
                        excel_row=row_idx + 1,
                        month_column=col_label,
                        code="sobrepago",
                        message=f"Monto {amount} > costo plan {costo_plan}",
                        raw_value=str(cell),
                    )
                )

            metodo = default_method or ""
            if not metodo:
                stats.metodos_ausentes += 1

            base_nota = (
                "Fecha de pago inferida desde columna mensual; método de pago no registrado en fuente."
            )
            if membresia_ref is not None and pd.notna(membresia_ref):
                nota_extra.append(f"MEMBRESIA_col={membresia_ref}")

            row_out = {
                "socio_nombre": socio,
                "telefono": telefono,
                "plan": plan,
                "fecha_pago": period_start.isoformat(),
                "monto_pagado": round(amount, 2),
                "metodo_pago": metodo,
                "periodo_inicio": period_start.isoformat(),
                "periodo_fin": period_end.isoformat(),
                "payment_action": payment_action,
                "counts_as_income": "true",
                "applies_to_balance": "true",
                "saldo_pendiente": saldo,
                "nota": "; ".join([base_nota, *nota_extra]),
                "fuente_archivo": f"OCCALISTHENICS.xlsx::{sheet_name}",
                "referencia_externa": _build_referencia(sheet_name, socio, period_start),
                "_costo_plan": costo_plan,
                "_plan_source": plan_source,
                "_plan_mapped": plan_mapped,
            }
            payment_rows.append(row_out)
            stats.filas_pago_generadas += 1
            stats.ingresos_estimados += amount

    return payment_rows


def _write_outputs(
    *,
    sheet_name: str,
    rows: list[dict[str, Any]],
    stats: TransformStats,
    fixtures_dir: Path,
    output_tag: str | None = None,
) -> dict[str, str]:
    slug = output_tag or _slug_sheet(sheet_name)
    prefix = "OCCALISTHENICS"
    csv_path = fixtures_dir / f"{prefix}_{slug}.csv"
    json_path = fixtures_dir / f"{prefix}_transform_report_{slug}.json"
    warn_path = fixtures_dir / f"{prefix}_transform_warnings_{slug}.csv"

    export_rows = [{col: row.get(col, "") for col in TEMPLATE_COLUMNS} for row in rows]
    pd.DataFrame(export_rows, columns=TEMPLATE_COLUMNS).to_csv(csv_path, index=False, encoding="utf-8-sig")

    meta_path = fixtures_dir / f"{prefix}_transform_meta_{slug}.json"
    meta_rows = [
        {
            "referencia_externa": row.get("referencia_externa"),
            "costo_plan": row.get("_costo_plan"),
            "plan_source": row.get("_plan_source"),
            "plan_mapped": row.get("_plan_mapped"),
        }
        for row in rows
    ]
    meta_path.write_text(json.dumps(meta_rows, indent=2, ensure_ascii=False), encoding="utf-8")

    report = {
        "sheet": sheet_name,
        "socios_procesados": stats.socios_procesados,
        "filas_pago_generadas": stats.filas_pago_generadas,
        "celdas_ignoradas_vacio": stats.celdas_ignoradas_vacio,
        "montos_cero_sin_pago": stats.montos_cero_sin_pago,
        "montos_parciales": stats.montos_parciales,
        "montos_sobrepago": stats.montos_sobrepago,
        "metodos_ausentes_filas": stats.metodos_ausentes,
        "telefonos_ausentes_socios": stats.telefonos_ausentes,
        "telefonos_desde_contactos": stats.telefonos_desde_contactos,
        "planes_no_mapeados": stats.planes_no_mapeados,
        "valores_no_numericos": stats.valores_no_numericos,
        "ingresos_estimados": round(stats.ingresos_estimados, 2),
        "adeudos_estimados": round(stats.adeudos_estimados, 2),
        "warnings_count": len(stats.warnings),
    }
    json_path.write_text(json.dumps(report, indent=2, ensure_ascii=False), encoding="utf-8")

    warn_rows = [
        {
            "sheet": w.sheet,
            "socio_nombre": w.socio_nombre,
            "excel_row": w.excel_row,
            "month_column": w.month_column,
            "code": w.code,
            "message": w.message,
            "raw_value": w.raw_value,
        }
        for w in stats.warnings
    ]
    pd.DataFrame(warn_rows).to_csv(warn_path, index=False, encoding="utf-8-sig")

    return {
        "csv": str(csv_path),
        "report": str(json_path),
        "warnings": str(warn_path),
        "meta": str(meta_path),
    }


def main() -> int:
    parser = argparse.ArgumentParser(description="Transformar matriz OCCALISTHENICS a CSV plantilla")
    parser.add_argument("--file", type=Path, default=DEFAULT_SOURCE, help="Archivo .xlsx fuente")
    parser.add_argument("--sheet", required=True, help='Hoja, ej. "NOVIEMBRE 2025"')
    parser.add_argument("--config", type=Path, default=DEFAULT_PLAN_MAPPING, help="JSON mapeo planes")
    parser.add_argument("--contacts", type=Path, default=None, help="CSV opcional socio_nombre,telefono")
    parser.add_argument(
        "--default-method",
        default=None,
        help="Metodo para filas sin fuente (recomendado: historico_sin_metodo)",
    )
    parser.add_argument(
        "--month",
        action="append",
        default=None,
        help="Filtrar mes YYYY-MM (repetible). Sin esto, procesa todas las columnas fecha.",
    )
    parser.add_argument("--out-dir", type=Path, default=BACKEND_ROOT / "fixtures")
    parser.add_argument(
        "--output-tag",
        default=None,
        help="Sufijo de salida, ej. clean_noviembre_2025 → OCCALISTHENICS_clean_noviembre_2025.csv",
    )
    args = parser.parse_args()

    if not args.file.exists():
        print(f"ERROR: no existe {args.file}")
        return 1

    if args.default_method and args.default_method not in {"", "historico_sin_metodo"}:
        print("ERROR: --default-method solo soporta historico_sin_metodo o vacio")
        return 1

    target_months = set(args.month) if args.month else None
    plan_mapping = _load_plan_mapping(args.config)
    contacts_path = args.contacts
    if contacts_path is None and DEFAULT_CONTACTS.exists():
        contacts_path = DEFAULT_CONTACTS
    contacts = _load_contacts(contacts_path)

    xl = pd.ExcelFile(args.file)
    if args.sheet not in xl.sheet_names:
        print(f"ERROR: hoja '{args.sheet}' no encontrada. Hojas: {xl.sheet_names}")
        return 1

    df = xl.parse(args.sheet, header=None)
    stats = TransformStats()
    rows = transform_sheet(
        df=df,
        sheet_name=args.sheet,
        source_file=args.file.name,
        plan_mapping=plan_mapping,
        contacts=contacts,
        default_method=args.default_method,
        target_months=target_months,
        stats=stats,
    )

    outputs = _write_outputs(
        sheet_name=args.sheet,
        rows=rows,
        stats=stats,
        fixtures_dir=args.out_dir,
        output_tag=args.output_tag,
    )
    print(json.dumps({"outputs": outputs, "summary": {
        "filas_pago_generadas": stats.filas_pago_generadas,
        "warnings": len(stats.warnings),
        "ingresos_estimados": round(stats.ingresos_estimados, 2),
    }}, indent=2, ensure_ascii=False))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
