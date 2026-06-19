# Prueba piloto — importación histórica (Numbers → CSV/XLSX)

Resultado de la prueba controlada con lote de 10 filas y encabezados típicos de exportación desde Numbers/Excel.

**Entorno:** SQLite local (script `scripts/pilot_historical_import.py`). **No producción.**

---

## Archivo piloto

`OC/BACKEND/fixtures/pilot_lote_historico_numbers.csv`

Para usar **tu archivo real**:

1. Exporta desde Numbers a `.csv` o `.xlsx`
2. Copia 5–10 filas representativas a un archivo en `fixtures/`
3. Ejecuta:

```bash
cd OC/BACKEND
python scripts/pilot_historical_import.py --file fixtures/TU_ARCHIVO.csv
python scripts/pilot_historical_import.py --file fixtures/TU_ARCHIVO.csv --commit
```

En la UI: `/app/admin/importar-pagos` con backend local levantado.

---

## Columnas reales detectadas (export Numbers-style)

| Columna en archivo | Campo mapeado |
|--------------------|---------------|
| Nombre del socio | `socio_nombre` |
| Celular | `telefono` |
| Tipo membresía | `plan` |
| Fecha de pago | `fecha_pago` |
| Monto | `monto_pagado` |
| Forma de pago | `metodo_pago` |
| Desde | `periodo_inicio` |
| Hasta | `periodo_fin` |
| Mes | `mes` |
| Adeudo | `saldo_pendiente` |
| Comentarios | `nota` |
| Folio | `referencia_externa` |

**Mapeo automático:** 12/12 columnas del piloto sin ajuste manual.

---

## Casos cubiertos en el lote

| Fila | Caso | Resultado preview |
|------|------|-------------------|
| 2 | Al corriente + efectivo + socio existente (teléfono) | `existing` |
| 3 | Vencido + transferencia + nombre ambiguo | `ambiguous` |
| 4 | Adeudo ($400 de $800 implícito) | `new` |
| 5 | Pago parcial ($500 + adeudo) | `new` |
| 6–7 | Varios meses mismo socio (jun/jul) | `new` → mismo user en commit |
| 8 | Sin teléfono | advertencia `missing_phone` |
| 9 | Variante nombre + teléfono existente | `existing` (tras fix teléfono) |
| 10 | Nombre similar + teléfono único | `existing` |
| 11 | Cortesía $0 | `new`, ingreso=0 |

---

## Errores y advertencias

### Errores bloqueantes

**0** en el piloto.

### Advertencias (aceptables)

| Código | Filas | Acción |
|--------|-------|--------|
| `ambiguous_socio` | 3 | Resolver en UI antes de commit (`resolve_ambiguous`) |
| `missing_phone` | 8 | Aceptable; crea socio nuevo |

### Duplicados

**0** detectados en archivo y BD.

---

## Bugs corregidos durante la prueba

1. **Teléfonos desde Excel/CSV numérico** — `5512345678.0` se corrompía a `5123456780`. Corregido en `_normalize_phone`.
2. **Valores de forma de pago** — `Efectivo`, `Transferencia`, `Cortesía` ahora normalizan a códigos internos.
3. **Mismo socio en varias filas del lote** — el commit re-evalúa match para no crear duplicados (ej. Luis Méndez jun+jul).

---

## Resultado del commit piloto

| Métrica | Valor |
|---------|-------|
| Importados | 10 |
| Omitidos | 0 |
| Fallidos | 0 |
| Socios nuevos creados | 6 |
| Socios existentes enlazados | 4 (incl. Juan, Maria Lopez, María López García) |
| Ingresos reales importados | $6,450 |
| Cortesías | 1 ($0, no ingreso) |
| Adeudos en ciclo (filas 4–5) | costo ciclo = monto + adeudo |

### Trazabilidad verificada

Todos los pagos tienen:

- `concept`: `Importacion historica lote #1`
- `idempotency_key`: `historical-import:1:PILOT-XXX`
- Cortesía: `counts_as_income=false`, `applies_to_balance=false`

---

## Validación UI (checklist manual)

Con backend + frontend local:

- [ ] `/app/admin/importar-pagos` — preview del archivo real
- [ ] `/app/admin/membresias` — socios importados visibles, adeudos coherentes
- [ ] `/app/admin/socios/:id` — pagos históricos en expediente
- [ ] Confirmar que pagos operativos manuales se distinguen por concepto
- [ ] Recordatorios — sin cambios esperados (import no crea followups)

---

## Ajustes antes del histórico completo

1. **Siempre usar `Folio` / `referencia_externa` única** por fila.
2. **Revisar socios ambiguos** en preview; no commit sin resolver.
3. **Exportar teléfono como texto** en Excel/Numbers si es posible (evita notación científica en números largos).
4. **Columnas opcionales** `payment_action`, `counts_as_income` — mapear manualmente si el archivo las trae con otro nombre.
5. **No importar en producción** hasta repetir piloto en staging con archivo real del gimnasio.
6. Ejecutar migración `2026-06-19_membership_import_batches.postgres.sql` en Supabase.

---

## Aliases añadidos (Numbers/Excel México)

- `nombre_del_socio`, `fecha_de_pago`, `forma_de_pago`, `tipo_membresia`, `comentarios`, `folio`
- Valores: `Efectivo`, `Transferencia`, `Cortesía`, `Terminal`, `SPEI`

Ver `app/services/membership_import_service.py` → `COLUMN_ALIASES`, `PAYMENT_METHOD_VALUE_ALIASES`.
