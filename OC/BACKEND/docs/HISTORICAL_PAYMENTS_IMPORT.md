# Importación histórica de socios y pagos

Guía para cargar información histórica desde Excel/CSV al sistema de membresías de OC Club.

**Importante:** no cargues directamente en producción sin validar la vista previa. El flujo siempre es **preview → revisión → commit**.

---

## Formato esperado

Usa la plantilla CSV:

- Backend: `OC/BACKEND/templates/membership_historical_import_template.csv`
- Descarga desde admin: `GET /membership/admin/imports/template`

### Columnas

| Columna | Obligatoria | Descripción |
|---------|-------------|-------------|
| `socio_nombre` | Sí | Nombre del socio |
| `telefono` | No | Teléfono (10 dígitos recomendado). Prioridad para coincidencia |
| `plan` | No | Tipo de plan (`Mensual`, `Grupal`, etc.) |
| `fecha_pago` | Sí | Fecha del pago histórico |
| `monto_pagado` | Sí | Monto pagado (0 permitido solo en cortesía) |
| `metodo_pago` | Sí | Ver valores permitidos abajo |
| `periodo_inicio` | No | Inicio de vigencia del periodo |
| `periodo_fin` | No | Fin de vigencia del periodo |
| `payment_action` | No | Acción de negocio (ver abajo) |
| `counts_as_income` | No | `true`/`false` — override de ingreso |
| `applies_to_balance` | No | `true`/`false` — override de saldo |
| `saldo_pendiente` | No | Adeudo restante después del pago |
| `nota` | No | Nota interna |
| `fuente_archivo` | No | Origen del registro |
| `referencia_externa` | No | Folio/id único para trazabilidad y anti-duplicados |

También se detecta columna `mes` (ej. `2024-01`) para inferir periodo con advertencia.

### Valores permitidos — `metodo_pago`

- `efectivo`
- `transferencia`
- `tarjeta_terminal`
- `cortesia`
- `ajuste`

### Valores permitidos — `payment_action`

- `register_only` — registro histórico sin extender vigencia activa
- `renew_extend` — renovar/extender vigencia (requiere periodo o confirmación)
- `partial_debt` — abono parcial
- `courtesy_extend` — cortesía con posible extensión
- `admin_adjustment` — ajuste administrativo

---

## Preparar archivo desde Excel / Numbers

1. Organiza una hoja con encabezados claros (idealmente igual a la plantilla).
2. En **Numbers**: `Archivo → Exportar a → Excel…` o `CSV…`
3. **No subas `.numbers`** al sistema.
4. Revisa fechas en formato `YYYY-MM-DD` o `DD/MM/YYYY`.
5. Montos sin símbolos raros; usa punto decimal si aplica.
6. Usa `referencia_externa` única por fila cuando sea posible.

---

## Flujo de importación (staging)

### 1. Vista previa — `POST /membership/admin/imports/preview`

- Sube `.xlsx` o `.csv` (máx. 5 MB, 5000 filas).
- Opcional: `sheet_name`, `column_mapping_json`.
- **No escribe** en `membership_payments`, `membership_cycles` ni `users`.
- Guarda lote en `membership_import_batches` + filas en `membership_import_records` (staging).

Devuelve:

- Diagnóstico del archivo (columnas, duplicados, incompletos, fechas/montos inválidos).
- Mapeo sugerido de columnas.
- Resumen: socios nuevos/existentes, pagos, errores, advertencias, duplicados, ingresos estimados.
- Detalle fila por fila.

### 2. Revisión manual

Antes de confirmar, revisa:

- [ ] Errores bloqueantes en cero
- [ ] Socios ambiguos resueltos
- [ ] Duplicados confirmados solo si son legítimos
- [ ] Cortesías no cuentan como ingreso
- [ ] Filas sin periodo no alterarán vigencia sin confirmación
- [ ] Totales financieros razonables

Descarga reporte: `GET /membership/admin/imports/{batch_id}/errors`

### 3. Commit — `POST /membership/admin/imports/commit`

Body ejemplo:

```json
{
  "batch_id": 12,
  "confirm_duplicate_rows": [8, 15],
  "resolve_ambiguous": { "5": 42 },
  "confirm_extend_without_period_rows": []
}
```

Solo entonces se crean socios, ciclos, pagos y notas válidos.

### 4. Consulta de lote — `GET /membership/admin/imports/{id}`

Permite auditar qué se importó: `payment_id`, `membership_cycle_id`, `matched_user_id` por fila.

---

## Reglas de negocio

### Socio existente

1. Coincidencia por **teléfono** (normalizado a 10 dígitos).
2. Si no hay teléfono, coincidencia por **nombre normalizado**.
3. Si hay varios candidatos → **ambiguo** → requiere `resolve_ambiguous` en commit.
4. **No se sobrescribe** nombre/teléfono de socios existentes; solo se completa teléfono vacío.

### Socio nuevo

- Se crea solo con nombre suficiente (≥ 2 caracteres).
- Sin teléfono → advertencia, pero permitido.
- Username autogenerado; contraseña aleatoria (el socio deberá restablecer acceso si usará la app).

### Pago histórico

- Se asocia a ciclo por `periodo_inicio` + `periodo_fin`.
- Sin periodo → ciclo histórico de un día en `fecha_pago`, `register_only`, sin tocar vigencia activa salvo confirmación explícita.
- Con solo `mes` → periodo inferido con advertencia.

### Cortesía

- `counts_as_income = false`, `applies_to_balance = false` por defecto.
- Extensión de vigencia solo con `courtesy_extend` y periodo/confirmación.

### Ajuste

- Respeta `counts_as_income` y `applies_to_balance` del archivo.

### Duplicados

Detectados por:

- Misma fila repetida en archivo (socio + fecha + monto + método).
- Pago existente en BD con mismos datos.
- `referencia_externa` o `idempotency_key` `historical-import:…`.

No se importan duplicados sin `confirm_duplicate_rows`.

---

## Trazabilidad y reversibilidad

Cada importación genera:

- **Lote** (`membership_import_batches`) con estado `preview` → `committed`.
- **Registro por fila** (`membership_import_records`) con IDs creados.
- Pagos marcados con:
  - `concept`: `Importacion historica lote #N`
  - `idempotency_key`: `historical-import:{batch_id}:{referencia}`
  - `observations`: fuente y referencia externa

**No hay borrado masivo automático.** Para revertir:

1. Consulta el lote: `GET /membership/admin/imports/{id}`
2. Identifica `payment_id` / `cycle_id` creados
3. Usa reversa manual de pagos (`POST /membership/admin/payment/{id}/reverse`) o ajuste admin según política interna

Reversa por lote completa: fase posterior.

---

## Seguridad

- Endpoints solo **admin** (`get_current_admin`).
- Archivo no se guarda en disco; solo hash SHA-256 + datos normalizados en staging.
- Límite 5 MB / 5000 filas.
- No exponer plantillas ni lotes públicamente.

---

## Vista admin

Ruta: `/app/admin/importar-pagos`

Permite subir archivo, mapear columnas, ver preview, resolver ambiguos/duplicados, confirmar o cancelar.

---

## Cómo probar con archivo de ejemplo

1. Descarga la plantilla CSV.
2. Agrega 2–3 filas de prueba en entorno **local/staging**.
3. Login admin → Importar pagos históricos.
4. Sube el CSV → Generar vista previa.
5. Revisa resumen y tabla de filas.
6. Confirma importación.
7. Verifica en Membresías / Expediente del socio que pagos tengan concepto de importación.

Tests automatizados: `pytest tests/test_membership_import.py`

---

## Endpoints

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/membership/admin/imports/template` | Descarga plantilla CSV |
| GET | `/membership/admin/imports/columns` | Lista columnas esperadas |
| POST | `/membership/admin/imports/preview` | Diagnóstico + staging |
| POST | `/membership/admin/imports/commit` | Importación confirmada |
| GET | `/membership/admin/imports/{id}` | Detalle de lote |
| GET | `/membership/admin/imports/{id}/errors` | Reporte de errores/advertencias |

---

## Migración de base de datos (producción)

Ejecutar en Supabase **antes** de usar importación en producción:

`OC/BACKEND/migrations/postgres/2026-06-19_membership_import_batches.postgres.sql`

En SQLite/tests: `create_all` crea las tablas automáticamente.

---

## Riesgos restantes

- Importar en producción sin preview puede duplicar pagos si `referencia_externa` no es única.
- Filas sin periodo no deben usarse con `renew_extend` sin revisión.
- Socios nuevos reciben contraseña aleatoria no comunicada automáticamente.
- Ciclos históricos pueden afectar reportes de adeudo histórico si `saldo_pendiente` es incorrecto.

---

## Importación OCCALISTHENICS noviembre 2025

Procedimiento validado en **local/staging** (MySQL `oc_gym`). **No ejecutar en producción** sin respaldo y sin aplicar migraciones previas.

### Archivos del lote

| Archivo | Uso |
|---------|-----|
| `fixtures/OCCALISTHENICS_review_noviembre_2025.csv` | Revisión manual (`include=true/false`, motivos de exclusión) |
| `fixtures/OCCALISTHENICS_final_noviembre_2025.csv` | 7 registros PLAN OC aprobados (piloto) |
| `fixtures/OCCALISTHENICS_final_noviembre_2025_incremental.csv` | Registros aprobados no importados en piloto |
| `fixtures/OCCALISTHENICS_commit_pilot_noviembre_2025.csv` | Copia usada en commit piloto #3 |
| `fixtures/contacts_master.csv` | Teléfonos opcionales (`socio_nombre,telefono`); vacío = sin inventar teléfonos |

### Resumen del cierre (staging, jun 2026)

| Métrica | Valor |
|---------|-------|
| Filas en review | 26 |
| `include=true` | 8 |
| `include=false` | 18 |
| Importados en staging | **8** (lote #3: 7 + lote #6: 1) |
| Excluidos deliberadamente | 18 |
| Sin teléfono | 8/8 importados |
| Ciclos operativos activos creados | 0 |

**Lotes en BD:**

- **#3** — piloto PLAN OC (user_id 13–19), 7 pagos
- **#6** — incremental URIEL CARDIEL (user_id 20), 1 pago

Todos los ciclos quedan con `is_historical_import=true`, `historical_source=OCCALISTHENICS`, `is_active_cycle=false`.

### Migraciones requeridas antes de producción

Ejecutar en orden (idempotentes):

1. `migrations/postgres/2026-06-19_membership_import_batches.postgres.sql` — tablas de importación
2. `migrations/postgres/2026-06-20_membership_cycles_historical_flags.postgres.sql` — flags históricos
3. Verificar: `migrations/postgres/verify_membership_schema.postgres.sql`

En MySQL/staging local:

- `migrations/2026-06-20_membership_cycles_historical_flags.sql`
- O: `python scripts/apply_mysql_historical_flags_migration.py`

### Orden de ejecución (staging / producción)

#### 1. Preparar incremental (si piloto ya importado)

```powershell
cd OC\BACKEND
.\.venv\Scripts\python.exe scripts\prepare_noviembre_incremental.py
```

Genera `fixtures/OCCALISTHENICS_final_noviembre_2025_incremental.csv` excluyendo referencias ya en lote #3 y filas `include=false`.

#### 2. Preview (obligatorio)

```powershell
.\.venv\Scripts\python.exe scripts\pilot_historical_import.py `
  --file fixtures\OCCALISTHENICS_final_noviembre_2025_incremental.csv `
  --use-app-db
```

**No hacer commit** si hay:

- `error_rows > 0` o `blocking_errors`
- duplicados inesperados (`duplicate_rows > 0` sin confirmar)
- socios ambiguos (`ambiguous_members > 0`)
- método inválido (distinto de `historico_sin_metodo` u otros permitidos)
- monto 0 en filas no excluidas

Advertencia aceptable: `missing_phone` (sin teléfono en `contacts_master.csv`).

#### 3. Commit (solo staging/local)

```powershell
.\.venv\Scripts\python.exe scripts\pilot_historical_import.py `
  --file fixtures\OCCALISTHENICS_final_noviembre_2025_incremental.csv `
  --use-app-db `
  --commit
```

Alternativa UI admin: `/app/admin/importar-pagos` (mismo flujo preview → commit).

**Producción:** repetir preview + commit con respaldo previo. Usar archivo incremental o final completo solo si no hay duplicados por `referencia_externa`.

#### 4. Marcar histórico (solo si importación previa a Fase 2B.6)

```powershell
.\.venv\Scripts\python.exe scripts\mark_historical_import_cycles.py --batch-id 3 --dry-run
.\.venv\Scripts\python.exe scripts\mark_historical_import_cycles.py --batch-id 3 --apply
```

Importaciones posteriores a 2B.6 marcan automáticamente `is_historical_import=true`.

### Validación UI

| Pantalla | Qué verificar |
|----------|----------------|
| `/app/admin/recordatorios` | Socios noviembre **no** aparecen por defecto |
| Recordatorios + “Incluir históricos” | Sí aparecen como vencidos históricos |
| `/app/admin/membresias` | Filtrados por defecto; visibles con checkbox |
| `/app/admin/socios/:id` | Badges: Histórico importado, Fuente OCCALISTHENICS, No operativo actual |
| `/app/admin/importar-pagos` | Advertencia sobre históricos vs operación diaria |

Validación automatizada staging:

```powershell
.\.venv\Scripts\python.exe scripts\validate_noviembre_closure.py
```

### Verificar que Recordatorios no se contamina

```powershell
.\.venv\Scripts\python.exe scripts\validate_historical_staging.py
```

Criterio: `followups_vencidos_pilot_users_default` vacío; `operational_active_cycles_among_nov_users` vacío.

### Identificar lotes importados

- Admin: `GET /membership/admin/imports/{batch_id}`
- BD: `membership_import_batches`, `membership_import_records`
- Pagos: `concept` = `Importacion historica lote #N`
- Idempotencia: `historical-import:{batch_id}:{referencia_externa}`
- Ciclos: `is_historical_import`, `import_batch_id`, `historical_source`

### Respaldo antes de producción

1. Exportar snapshot de `membership_cycles`, `membership_payments`, `users`, `membership_import_batches`, `membership_import_records`.
2. Ejecutar preview en copia o ventana de mantenimiento.
3. Commit solo con `error_rows=0` y duplicados revisados.
4. Validar Recordatorios inmediatamente después.

### Registros excluidos de noviembre (no importar)

Motivos en `OCCALISTHENICS_review_noviembre_2025.csv` (`include=false`):

- `sin_pago_detectado` (5): FERNANDA ALVA, URIEL. CARDIEL, BETTY, HÉCTOR NIETO, ESTHER
- `fila_auxiliar_no_socio` (4): APRIL, PRIMA CHARLIE, HERMANA LIRIA, AMIGA CYNTHIA
- `sobrepago_extremo` + `plan_no_mapeado_monto_extrano` (varios familiares / por clase)
- Planes críticos sin mapear: ZENTENO, CUELLAR, etc.

**Nota:** URIEL CARDIEL (`include=true`, POR CHECK IN, sobrepago moderado) sí se importó en lote #6. URIEL. CARDIEL (`include=false`, sin pago) es fila distinta y quedó excluida.

### Decisión recomendada

**Noviembre listo para producción (paquete seguro de 7 registros)** con las siguientes condiciones:

- Aplicar migraciones de importación + flags históricos antes del commit.
- Importar solo `fixtures/OCCALISTHENICS_prod_safe_noviembre_2025.csv` (7 PLAN OC, $6,665).
- **No importar** `fixtures/OCCALISTHENICS_prod_pending_review_noviembre_2025.csv` (URIEL + 18 dudosos).
- Aceptar **7 socios sin teléfono** hasta completar `contacts_master.csv`.
- Checklist productivo: `docs/OCCALISTHENICS_NOVIEMBRE_2025_PRODUCTION_IMPORT.md`

