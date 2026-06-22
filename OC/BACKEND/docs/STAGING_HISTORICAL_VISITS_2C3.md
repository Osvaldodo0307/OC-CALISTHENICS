# Staging — importación de visitas históricas (Fase 2C.3)

Guía para validar el flujo completo en un ambiente **separado de producción**.

**Rama:** `feature/historical-visits-2c1`  
**No hacer merge a `main` hasta Go/No-Go explícito.**

---

## 1. Estado actual del ambiente

| Componente | Producción (existe) | Staging hospedado |
|------------|---------------------|-------------------|
| Frontend | `https://oc-club.netlify.app` | **No configurado** |
| Backend | `https://oc-calisthenics.onrender.com` | **No configurado** |
| Supabase | Proyecto productivo | **No configurado** (`oc-calisthenics-staging` propuesto) |
| Branch deploy | Solo previews manuales Netlify | **Pendiente** |

**Confirmación producción:** OpenAPI en Render producción **no** expone rutas `/historical-visits/*` (rama `main`).

---

## 2. Configuración mínima propuesta

### 2.1 Supabase staging

1. Crear proyecto separado: `oc-calisthenics-staging`.
2. **No** reutilizar `DATABASE_URL` de producción.
3. Opciones de datos para matches (elegir una):
   - **A)** Restaurar respaldo prod → staging (dato sensible, solo en Supabase staging).
   - **B)** Fixture manual con socios necesarios para ENERO 2026.
   - **C)** Datos sintéticos (solo flujo técnico, no valida matches reales).

### 2.2 Migraciones PostgreSQL (solo staging)

Ejecutar en orden con `STAGING_DATABASE_URL` (ver script):

```text
migrations/postgres/2026-06-17_membership_payment_renewal.postgres.sql
migrations/postgres/2026-06-18_membership_followups.postgres.sql
migrations/postgres/2026-06-19_membership_import_batches.postgres.sql
migrations/postgres/2026-06-20_membership_cycles_historical_flags.postgres.sql
migrations/postgres/2026-06-21_historical_visit_summaries.postgres.sql
migrations/postgres/verify_membership_schema.postgres.sql  (solo lectura)
```

```powershell
cd OC/BACKEND
$env:STAGING_DATABASE_URL = "postgresql://..."   # Supabase staging ONLY
$env:PRODUCTION_DATABASE_URL = "postgresql://..." # opcional: bloqueo si coinciden
.\.venv\Scripts\python.exe scripts\apply_postgres_staging_migrations.py
```

**No aplicar** `2026-06-21_historical_visit_summaries.postgres.sql` en Supabase producción.

### 2.3 Render backend staging

Archivo plantilla: `OC/BACKEND/render-staging.yaml`

1. Crear servicio `oc-calisthenics-api-staging` en Render.
2. Rama: `feature/historical-visits-2c1`.
3. Root: `OC/BACKEND`.
4. Variables:
   - `DATABASE_URL` → connection string **staging** Supabase.
   - `ALLOWED_ORIGINS` → URL Netlify staging + previews.
   - `JWT_*` → propias de staging.

### 2.4 Netlify frontend staging

Opción A — **Branch deploy** del sitio existente:

- Rama: `feature/historical-visits-2c1`
- Variables de build:
  - `VITE_API_URL` = URL Render staging (HTTPS).
  - `VITE_ENABLE_HISTORICAL_VISITS_IMPORT` = `true`

Opción B — Sitio Netlify separado `oc-club-staging`.

Plantilla: `OC/Frontend/.env.staging.example`

**Producción Netlify:** `VITE_ENABLE_HISTORICAL_VISITS_IMPORT=false` (o omitir).

---

## 3. Feature flag

| Variable | Staging | Producción |
|----------|---------|------------|
| `VITE_ENABLE_HISTORICAL_VISITS_IMPORT` | `true` | `false` o ausente |

Comportamiento:

- `true`: menú «Importar visitas» + ruta activa.
- `false`: menú oculto; ruta muestra «función no disponible».

**Bloqueo antes de merge a `main`:** producción debe mantener la flag en `false` hasta autorización explícita.

---

## 4. Validación preview (ENERO 2026)

Desde UI staging o script local contra BD staging:

```powershell
.\.venv\Scripts\python.exe scripts\staging_historical_visits_preview_report.py `
  --source fixtures\OCCALISTHENICS.xlsx --sheet "ENERO 2026"
```

Salida **agregada** (sin nombres en repo). Validar:

- Solo bloque superior de visitas.
- Bloque inferior de pagos ignorado.
- Conteos por mes coherentes.
- No crea pagos, ciclos ni usuarios en preview.

### Resultado local (MySQL `oc_gym`, opción C parcial)

Ejecutado en esta fase contra fixture local + BD local (no staging Supabase):

| Métrica | Valor |
|---------|-------|
| Socios distintos | 32 |
| Celdas socio×mes | 68 |
| Total visitas | 329 |
| OCT 2025 | 18 |
| NOV 2025 | 94 |
| DIC 2025 | 81 |
| ENE 2026 | 136 |
| matched | 20 |
| new_candidate | 48 |
| ambiguous | 0 |
| unmatched | 0 |
| can_commit | **false** |
| blocking | `socios_sin_match_en_bd` |

**Commit staging:** **NO** — faltan matches (48 `new_candidate`). Requiere opción A o B de datos.

---

## 5. Política de commit staging

Solo confirmar si:

- `can_commit=true`
- `ambiguous=0`, `unmatched=0`, `new_candidate=0`
- Todos los registros `matched`

Post-commit validar:

- `GET /historical-visits/admin/summaries`
- `membership_payments` / `membership_cycles` / `users` sin filas nuevas indebidas
- Re-preview + commit idempotente → `skipped_duplicate`

---

## 6. Checklist Go/No-Go PR futuro

| Criterio | Requerido |
|----------|-----------|
| Staging hospedado desplegado desde feature branch | Sí |
| Migraciones staging aplicadas | Sí |
| Preview ENERO 2026 con matches reales resueltos | Sí |
| Commit staging exitoso con `can_commit=true` | Sí |
| Feature flag `false` en prod documentada | Sí |
| Sin datos reales en repo | Sí |
| Nov/dic lotes históricos intactos | Sí |

**Decisión actual: NO-GO para PR a `main`** hasta completar staging hospedado y resolver `new_candidate`.

---

## 7. URLs (rellenar tras deploy)

| Servicio | URL |
|----------|-----|
| Frontend staging | _pendiente_ |
| Backend staging | _pendiente_ |
| Supabase staging | _pendiente_ |
