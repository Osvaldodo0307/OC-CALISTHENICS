# Importación productiva OCCALISTHENICS — noviembre 2025

Checklist y procedimiento para importar en **producción (Supabase)** solo los registros históricos validados de noviembre 2025, sin contaminar la operación diaria.

**Estado:** migraciones aplicadas en Supabase (2026-06-18). Paquete seguro listo. **Commit pendiente** hasta respaldo + preview limpio.

### Estado producción Supabase (OC-CALISTHENICS)

| Paso | Estado | Detalle |
|------|--------|---------|
| Respaldo Supabase | **Pendiente** | Confirmar antes del commit |
| Migraciones PostgreSQL | **Aplicadas** | 4 migraciones vía Supabase (2026-06-18) |
| Verificación esquema (§14) | **OK** | Los 4 flags en `true` |
| Importaciones históricas previas | **0** | Sin duplicados por `referencia_externa` |
| Commit paquete seguro | **Pendiente** | Ejecutar vía UI o script tras respaldo |

Migraciones registradas en Supabase:

1. `membership_payment_renewal`
2. `membership_followups`
3. `membership_import_batches`
4. `membership_cycles_historical_flags`

---

## Resumen del paquete

| Archivo | Filas | Uso en producción |
|---------|-------|-------------------|
| `fixtures/OCCALISTHENICS_prod_safe_noviembre_2025.csv` | **7** | **SÍ** — importar tras validación |
| `fixtures/OCCALISTHENICS_prod_pending_review_noviembre_2025.csv` | **19** | **NO** — solo revisión humana |

### Paquete seguro (7 socios PLAN OC)

| Socio | Monto | Plan | Referencia externa |
|-------|-------|------|-------------------|
| TOÑITO OSNAYA | $945.00 | PLAN OC | `OCCALISTHENICS:NOVIEMBRE 2025:tonito_osnaya:2025-11-01` |
| LIRIA VILLEGAS | $945.00 | PLAN OC | `OCCALISTHENICS:NOVIEMBRE 2025:liria_villegas:2025-11-01` |
| VALERIA QUINTANA | $945.00 | PLAN OC | `OCCALISTHENICS:NOVIEMBRE 2025:valeria_quintana:2025-11-01` |
| ARLETTE ROMÁN | $945.00 | PLAN OC | `OCCALISTHENICS:NOVIEMBRE 2025:arlette_roman:2025-11-01` |
| PEDRO FLORES | $945.00 | PLAN OC | `OCCALISTHENICS:NOVIEMBRE 2025:pedro_flores:2025-11-01` |
| LUIS ALBERTO | $945.00 | PLAN OC | `OCCALISTHENICS:NOVIEMBRE 2025:luis_alberto:2025-11-01` |
| RODRIGO ALVA | $995.00 | PLAN OC | `OCCALISTHENICS:NOVIEMBRE 2025:rodrigo_alva:2025-11-01` |

**Ingresos estimados:** $6,665.00  
**Método de pago:** `historico_sin_metodo` (todas las filas)  
**Teléfonos:** vacíos (no inventados; `contacts_master.csv` vacío)

---

## Archivo pendiente — NO importar

`fixtures/OCCALISTHENICS_prod_pending_review_noviembre_2025.csv`

Incluye **19 registros** que requieren validación humana antes de cualquier importación productiva:

- **1** registro aprobado en review pero excluido del paquete seguro: **URIEL CARDIEL**
- **18** registros con `include=false` en `OCCALISTHENICS_review_noviembre_2025.csv`

### Exclusión temporal de URIEL CARDIEL

URIEL CARDIEL permanece en pendientes (no se elimina) porque:

| Campo | Valor |
|-------|-------|
| `monto_pagado` | **$1,890.02** |
| `costo_plan` en matriz | **$171.82** |
| Diferencia | **~$1,718.20** no explicada |
| Plan en matriz | `POR CHECK IN` |
| `warning_flags` | `sobrepago` |

**Hipótesis a validar con el administrador:**

- Pago acumulado de varios check-ins en noviembre
- Plan especial distinto a PLAN OC
- Error de lectura en la matriz OCCALISTHENICS (columna MEMBRESIA / totales)
- Duplicidad conceptual con la fila `URIEL. CARDIEL` (sin pago detectado, excluida)

**Acción:** resolver monto y plan con evidencia (recibo, nota de matriz, confirmación del coach) antes de generar un CSV de importación para este socio.

**Nota:** En staging/local, URIEL CARDIEL ya fue importado en lote #6 (Fase 2B.7). Eso **no** autoriza importarlo en producción sin la misma validación humana.

---

## Pre-requisitos obligatorios

### 1. Respaldo Supabase

**Procedimiento recomendado:** `docs/SUPABASE_MANUAL_BACKUP.md` → `scripts/supabase_manual_backup.py`

1. Copiar `.env.backup.local.example` → `.env.backup.local` (no versionado).
2. Ejecutar el script; verificar `roles.sql`, `schema.sql`, `data.sql` y ZIP.
3. Guardar fecha/hora y responsable del respaldo.
4. Confirmar que el respaldo es restaurable (prueba en staging si es posible).

Alternativa: Supabase Dashboard → Database → Backups (plan Pro) o export manual de tablas críticas:

- `users`, `memberships`, `membership_cycles`, `membership_payments`
- `membership_import_batches`, `membership_import_records`

### 2. Migraciones PostgreSQL requeridas

Ejecutar en Supabase SQL Editor **en este orden** (idempotentes):

| Orden | Archivo |
|-------|---------|
| 1 | `migrations/postgres/2026-06-17_membership_payment_renewal.postgres.sql` |
| 2 | `migrations/postgres/2026-06-18_membership_followups.postgres.sql` |
| 3 | `migrations/postgres/2026-06-19_membership_import_batches.postgres.sql` |
| 4 | `migrations/postgres/2026-06-20_membership_cycles_historical_flags.postgres.sql` |

### 3. Verificación de esquema

Ejecutar:

`migrations/postgres/verify_membership_schema.postgres.sql`

**Sección 14 — todos los flags deben ser `true`:**

| Flag | Esperado |
|------|----------|
| `payments_columns_ok` | `true` (7 columnas renewal en `membership_payments`) |
| `followup_tables_ok` | `true` (2 tablas followups) |
| `import_tables_ok` | `true` (2 tablas import batches) |
| `historical_columns_ok` | `true` (3 columnas históricas en `membership_cycles`) |

Si algún flag es `false`, **no continuar** con el commit.

---

## Comandos de importación (producción)

Ejecutar desde `OC/BACKEND` con `.env` apuntando a producción (o variables de entorno de Supabase).

### Preview (obligatorio)

```powershell
.\.venv\Scripts\python.exe scripts\pilot_historical_import.py `
  --file fixtures\OCCALISTHENICS_prod_safe_noviembre_2025.csv `
  --use-app-db
```

**Criterios de preview limpio:**

| Criterio | Esperado |
|----------|----------|
| `total_rows` | 7 |
| `error_rows` | 0 |
| `blocking_errors` | false |
| `duplicate_rows` | 0 (en BD limpia de estas referencias) |
| `ambiguous_members` | 0 |
| `estimated_real_income` | 6665.0 |
| `metodo_pago` | `historico_sin_metodo` en todas las filas |
| Advertencias | `missing_phone` aceptable (7 filas) |

**No hacer commit** si hay errores bloqueantes, duplicados inesperados, ambiguos sin resolver o métodos inválidos.

**Alternativa UI (recomendada):** `/app/admin/importar-pagos`

1. Login admin en producción (`octavio`).
2. Subir **solo** `OCCALISTHENICS_prod_safe_noviembre_2025.csv`.
3. Generar vista previa → validar criterios de la tabla anterior.
4. Confirmar importación solo si preview limpio **y** respaldo hecho.
5. Anotar `batch_id` del lote.

**No subir** el archivo de pendientes ni el incremental de staging.

**Script con guardas:** `scripts/prod_safe_noviembre_import.py` (requiere `DATABASE_URL` y `--confirm-backup` para commit).

### Commit (solo tras respaldo + preview limpio)

```powershell
.\.venv\Scripts\python.exe scripts\pilot_historical_import.py `
  --file fixtures\OCCALISTHENICS_prod_safe_noviembre_2025.csv `
  --use-app-db --commit
```

**Aclaraciones importantes:**

- Ejecutar commit **solo** después de respaldo verificado y preview sin errores.
- **No usar** `OCCALISTHENICS_final_noviembre_2025_incremental.csv` en producción (es para staging con piloto previo).
- **No usar** `OCCALISTHENICS_prod_pending_review_noviembre_2025.csv` hasta validación humana.
- **No usar** el archivo con URIEL CARDIEL hasta resolver el sobrepago.

Registrar el `batch_id` devuelto tras el commit (aparece en salida del script o en `GET /membership/admin/imports/{id}`).

---

## Validación post-commit en producción

### Checklist técnico (BD / API)

- [ ] 7 filas importadas (`summary.imported = 7`)
- [ ] 7 socios creados o vinculados (sin duplicar si ya existían por teléfono/nombre)
- [ ] 7 ciclos nov 2025 con `is_historical_import = true`
- [ ] `historical_source = 'OCCALISTHENICS'` en todos los ciclos
- [ ] `is_active_cycle = false` (noviembre ya venció; no vigencia operativa)
- [ ] 7 pagos con `concept` = `Importacion historica lote #N`
- [ ] `payment_method = historico_sin_metodo` en todos
- [ ] `idempotency_key` = `historical-import:{batch_id}:{referencia_externa}`

Consulta de referencia:

```sql
SELECT c.user_id, u.name, c.is_historical_import, c.historical_source,
       c.import_batch_id, c.is_active_cycle, c.start_date, c.end_date
FROM membership_cycles c
JOIN users u ON u.id = c.user_id
WHERE c.import_batch_id = :batch_id
ORDER BY u.name;
```

### Checklist UI

| Pantalla | Verificación |
|----------|--------------|
| `/app/admin/recordatorios` | Los 7 socios **no** aparecen por defecto |
| Recordatorios + “Incluir históricos” | Sí aparecen como vencidos históricos |
| `/app/admin/membresias` | No listados por defecto; visibles con checkbox “Incluir históricos” |
| `/app/admin/membresias` (con históricos) | Badge “Histórico importado” |
| `/app/admin/socios/:id` | Ciclo nov 2025 visible con badges: Histórico importado, Fuente OCCALISTHENICS, No operativo actual |
| `/app/admin/importar-pagos` | Lote visible en historial de importaciones |

### Confirmar que Recordatorios no se contamina

Los socios importados solo deben aparecer en la bandeja operativa si el admin activa **“Incluir históricos”**.

Si alguno aparece por defecto:

1. Verificar `membership_cycles.is_historical_import = true`
2. Si el ciclo es anterior a Fase 2B.6, ejecutar corrección:
   ```powershell
   .\.venv\Scripts\python.exe scripts\mark_historical_import_cycles.py --batch-id N --dry-run
   .\.venv\Scripts\python.exe scripts\mark_historical_import_cycles.py --batch-id N --apply
   ```

---

## Identificar el lote importado

| Señal | Dónde |
|-------|-------|
| `batch_id` | Salida del commit / admin Importar pagos |
| Estado | `membership_import_batches.status = 'committed'` |
| Archivo | `filename` en el lote |
| Pagos | `concept` = `Importacion historica lote #N` |
| Trazabilidad | `membership_import_records.referencia_externa` |
| API | `GET /membership/admin/imports/{batch_id}` |

---

## Reversión manual si algo sale mal

No hay rollback automático por lote. Procedimiento:

1. Obtener detalle del lote: `GET /membership/admin/imports/{batch_id}`
2. Por cada `payment_id` creado:
   - `POST /membership/admin/payment/{payment_id}/reverse` con motivo documentado
3. Si se crearon socios nuevos por error:
   - Evaluar desactivación (`PUT /membership/{user_id}/deactivate`) según política interna
   - No borrar usuarios sin revisar dependencias (reservas, asistencia, etc.)
4. Documentar incidente y conservar el CSV seguro sin re-commit hasta corregir

---

## Regenerar paquetes

Si cambia el review o los contactos:

```powershell
.\.venv\Scripts\python.exe scripts\build_prod_noviembre_packages.py
```

Genera de nuevo:

- `fixtures/OCCALISTHENICS_prod_safe_noviembre_2025.csv`
- `fixtures/OCCALISTHENICS_prod_pending_review_noviembre_2025.csv`

---

## Preview validado (entorno limpio, jun 2026)

Ejecutado sobre SQLite temporal (sin datos previos):

```
total_rows: 7
error_rows: 0
duplicate_rows: 0
ambiguous_members: 0
estimated_real_income: 6665.0
blocking_errors: False
warning_rows: 7 (missing_phone — esperado)
```

---

## Riesgos restantes

| Riesgo | Mitigación |
|--------|------------|
| Socios sin teléfono | Match solo por nombre; posible ambigüedad futura si hay homónimos |
| Duplicados si re-importar | `referencia_externa` única; preview detecta duplicados en BD |
| Socios ya existentes en producción | Preview mostrará `existing_members`; no sobrescribe teléfono |
| URIEL y 18 pendientes sin resolver | Mantener fuera del commit productivo |
| Ingresos históricos en reportes futuros | Fase reportes no incluida; pagos marcados `historico_sin_metodo` |
| Sin respaldo | **Bloqueante** — no hacer commit |

---

## Decisión Go / No-Go

### Go — importación productiva del paquete seguro

**Recomendado** cuando se cumplan **todas** estas condiciones:

- [x] Paquete seguro generado y preview limpio (7 filas, $6,665)
- [x] URIEL y registros dudosos separados en archivo pendiente
- [x] Migraciones documentadas y verificación SQL lista
- [ ] Respaldo Supabase realizado
- [ ] Migraciones aplicadas en producción (`verify` sección 14 = todo true)
- [ ] Preview en producción con `--use-app-db` sin errores ni duplicados
- [ ] Ventana acordada con el administrador del gimnasio

### No-Go — hasta resolver

- Importar `OCCALISTHENICS_prod_pending_review_noviembre_2025.csv`
- Importar URIEL CARDIEL sin validar el sobrepago $1,890.02 vs $171.82
- Commit sin respaldo o sin migraciones de flags históricos
- Preview con `duplicate_rows > 0` sin explicación (re-importación parcial previa)

---

## Referencias

- Guía general: `docs/HISTORICAL_PAYMENTS_IMPORT.md`
- Review manual: `fixtures/OCCALISTHENICS_review_noviembre_2025.csv`
- Script paquetes: `scripts/build_prod_noviembre_packages.py`
- Script preview/commit: `scripts/pilot_historical_import.py`
