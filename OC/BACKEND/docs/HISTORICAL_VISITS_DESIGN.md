# Diseño técnico — Visitas históricas agregadas (Fase 2C.1)

## Objetivo

Soportar **conteos mensuales de visitas por socio** importados desde matrices OCCALISTHENICS (bloque superior de hojas como `ENERO 2026`), separados del flujo de pagos.

**No son** check-ins diarios con fecha/hora exacta.

## Modelo de asistencia existente

| Tabla / modelo | Campos relevantes | Tipo de dato | ¿Sirve para histórico agregado? |
|----------------|-------------------|--------------|--------------------------------|
| `class_sessions` | `start_datetime`, `discipline`, `coach_id` | Evento de clase | No — es plantilla de sesión |
| `bookings` | `user_id`, `class_id`, `attended`, `status` | Evento diario por reserva | No — requiere `class_id` y marca asistencia puntual |
| `membership_import_*` | pagos, ciclos, notas | Importación de membresía | No — mezclaría visitas con pagos |

**Conclusión:** crear tablas dedicadas. No reutilizar `bookings`.

## Modelo propuesto (implementado en local/staging)

### `historical_visit_summaries`

Almacén canónico post-commit (futuro). Una fila = un socio + mes + conteo.

| Campo | Tipo | Notas |
|-------|------|-------|
| `id` | PK | |
| `user_id` | FK nullable | Solo si match confiable |
| `raw_member_name` | text | Nombre tal cual en Excel |
| `normalized_member_name` | text | Para deduplicación |
| `period_month` | date | Primer día del mes |
| `visits_count` | integer | Conteo agregado |
| `source_file` | text | |
| `source_sheet` | text | |
| `source_row` | integer | |
| `import_batch_id` | FK nullable | |
| `match_status` | text | `matched`, `new_candidate`, `ambiguous`, `unmatched` |
| `is_historical_import` | boolean | default `true` |
| `created_by` | FK nullable | |
| `created_at` | timestamp | |

Índice único: `(normalized_member_name, period_month, source_sheet)`.

### `historical_visit_import_batches`

Espejo del patrón `membership_import_batches` para preview/commit futuro.

Estados: `preview`, `committed`, `cancelled`.

### `historical_visit_import_records`

Filas de preview por celda socio×mes antes de confirmar.

## Reglas de negocio

1. Las visitas históricas **no modifican membresía**.
2. **No generan pagos** ni `membership_cycles`.
3. **No afectan adeudos** ni recordatorios.
4. Solo alimentan **historial / analítica**.
5. Sin match confiable → `user_id` null; **no crear usuario** sin confirmación explícita.
6. `can_commit` permanece `false` en Fase 2C.1; commit no implementado.
7. Si hay filas `ambiguous`, el botón de confirmar debe permanecer deshabilitado.

## ETL — bloque superior ENERO 2026

Implementación: `app/services/historical_visit_parser.py`

| Paso | Regla |
|------|-------|
| Detectar header | Fila con etiquetas de mes (`OCTUBRE`…`ENERO`) y columna `X` → nombre en col siguiente |
| Nombres | Columna C (índice 2) en layout estándar |
| Excluir | `TOTAL`, vacíos, filas agregadas (`SUBTOTAL`, `INVITADOS`, etc.) |
| Valores | Enteros 0–35; ignorar 0; rechazar decimales/negativos |
| Fin de bloque | Detección de header de pagos (`MEMBRESIA` + `COSTO PLAN` + `TIPO DE PLAN`) |
| Periodo | Año ancla desde nombre de hoja (`ENERO 2026`); meses posteriores al ancla → año anterior |

Script CLI read-only: `scripts/parse_occalisthenics_visit_block.py`

## Flujo de preview (sin commit)

```
Archivo XLSX → detect_visit_block → parse_visit_summaries
    → match socios (_match_users por nombre)
    → preview_summary (matched / new_candidate / ambiguous)
    → persist opcional en historical_visit_import_batches (status=preview)
```

Servicio: `app/services/historical_visit_import_service.py`

## UI futura (no implementada)

Ruta propuesta: `/app/admin/importar-visitas`

| Sección | Contenido |
|---------|-----------|
| Upload | Archivo + selector de hoja |
| Diagnóstico | Tipo de hoja (`mixta_visitas_y_pagos`, etc.) |
| Resumen | Visitas totales por `period_month` |
| Tabla | socio, mes, conteo, `match_status` |
| Acciones | Confirmar deshabilitado si `ambiguous > 0` o `can_commit=false` |

## Seguridad y privacidad (repo público)

- No versionar `OCCALISTHENICS.xlsx` con datos reales si contiene PII.
- No versionar exportaciones completas de preview.
- Solo scripts, migraciones, docs y `*.csv.example` anonimizados.
- Tests locales con datos sintéticos (`Socio Demo A`).

## Migraciones

| Archivo | Entorno |
|---------|---------|
| `migrations/postgres/2026-06-21_historical_visit_summaries.postgres.sql` | Staging / Supabase (cuando Go) |
| `migrations/2026-06-21_historical_visit_summaries.sql` | MySQL local |

**No aplicar en producción** hasta decisión Go/No-Go.

## Tests

`tests/test_historical_visit_parser.py`:

- Detección del bloque superior
- Exclusión de totales
- Validación de enteros
- Clasificación visitas vs pagos
- Preview no crea pagos ni ciclos

## Riesgos

| Riesgo | Mitigación |
|--------|------------|
| Mezclar visitas con pagos | Parser y servicio separados; clasificación de hoja |
| Nombres ambiguos | `match_status=ambiguous`; commit bloqueado |
| Interpretar conteos como MXN | Validación 0–35; sin campos de monto |
| Duplicados en reimport | Índice único socio+mes+hoja |
| `INVITADOS` u otras filas agregadas | Filtro por keywords |

## Decisión Go/No-Go (importación real)

| Criterio | Estado |
|----------|--------|
| Modelo separado de pagos/check-ins | ✅ |
| Parser probado con fixture local | ✅ |
| Preview sin auto-crear usuarios | ✅ |
| Endpoints admin preview/commit | ✅ Fase 2C.2 |
| UI `/app/admin/importar-visitas` | ✅ Fase 2C.2 |
| Migración lista para staging | ✅ |
| Commit de importación | ✅ solo `matched`, bloquea resto |
| Producción | ❌ **NO-GO** hasta staging |

## Política de commit (2C.2)

1. El batch debe estar en `preview` con `can_commit=true`.
2. Solo se importan filas con `match_status=matched`.
3. Si existe `ambiguous`, `new_candidate` o `unmatched`, el commit se bloquea.
4. No se crean usuarios automáticamente.
5. Idempotencia por `(normalized_member_name, period_month, source_sheet)` — duplicados se marcan `skipped_duplicate`.
6. No se crean pagos, ciclos, membresías ni recordatorios.

## Endpoints (staging/local)

| Método | Ruta |
|--------|------|
| POST | `/historical-visits/admin/imports/preview` |
| POST | `/historical-visits/admin/imports/commit` |
| GET | `/historical-visits/admin/imports/{batch_id}` |
| GET | `/historical-visits/admin/imports/{batch_id}/records` |
| GET | `/historical-visits/admin/summaries` |

**Recomendación: GO condicionado** para validar en staging con archivo real y resolver matches manualmente antes de producción.
