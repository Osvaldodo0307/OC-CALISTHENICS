# Migraciones de membresías en Supabase / PostgreSQL

Guía para aplicar cambios de esquema del panel administrativo (pagos con renovación y seguimientos) en **producción PostgreSQL/Supabase**.

**No usar** los scripts MySQL de `OC/BACKEND/migrations/*.sql` en Supabase.  
**No depender** de `Base.metadata.create_all()` como estrategia productiva para columnas nuevas en tablas existentes.

---

## Qué migran estos scripts

### 1. Pagos — `migrations/postgres/2026-06-17_membership_payment_renewal.postgres.sql`

Columnas en `membership_payments` (modelo `MembershipPayment`):

| Columna | Tipo PostgreSQL | Nullable | Default |
|---------|-----------------|----------|---------|
| `payment_action` | `VARCHAR(40)` | Sí | — |
| `period_start_date` | `DATE` | Sí | — |
| `period_end_date` | `DATE` | Sí | — |
| `counts_as_income` | `BOOLEAN` | No | `TRUE` |
| `applies_to_balance` | `BOOLEAN` | No | `TRUE` |
| `previous_end_date` | `DATE` | Sí | — |
| `extended_end_date` | `DATE` | Sí | — |

Filas existentes en `counts_as_income` / `applies_to_balance` reciben `TRUE` si quedaran en NULL.

### 2. Followups — `migrations/postgres/2026-06-18_membership_followups.postgres.sql`

Tablas nuevas:

- `membership_followups` (`MembershipFollowUp`)
- `membership_followup_audits` (`MembershipFollowUpAudit`)

**Índices en `membership_followups`:**

- `ix_membership_followups_user_id`
- `ix_membership_followups_membership_id`
- `ix_membership_followups_membership_cycle_id`
- `ix_membership_followups_status`
- `ix_membership_followups_followup_type`
- `ix_membership_followups_next_followup_at`
- `ix_membership_followups_created_at`

**Índices en `membership_followup_audits`:**

- `ix_membership_followup_audits_followup_id`
- `ix_membership_followup_audits_changed_at`

**Foreign keys:** hacia `users`, `memberships`, `membership_cycles` y entre followups/audits (creadas solo si no existen).

### 3. Verificación — `migrations/postgres/verify_membership_schema.postgres.sql`

Consultas de solo lectura; la sección 8 debe devolver `payments_columns_ok = true` y `followup_tables_ok = true`.

---

## Respaldo recomendado (antes de migrar)

1. **Supabase Dashboard** → Project → Database → Backups (plan Pro) o export manual.
2. Alternativa con `pg_dump` (connection string de Supabase):

```bash
pg_dump "postgresql://postgres.[ref]:[password]@...pooler.supabase.com:6543/postgres" \
  --schema=public \
  --table=membership_payments \
  --table=membership_cycles \
  -f backup_membership_pre_migrate_$(date +%Y%m%d).sql
```

3. Anotar hora de inicio y responsable.

**No registrar pagos reales ni operar el panel admin hasta validar el esquema.**

---

## Orden exacto de ejecución

| Paso | Archivo | Dónde |
|------|---------|-------|
| 1 | `2026-06-17_membership_payment_renewal.postgres.sql` | Supabase SQL Editor |
| 2 | `2026-06-18_membership_followups.postgres.sql` | Supabase SQL Editor |
| 3 | `verify_membership_schema.postgres.sql` | Supabase SQL Editor |

Ruta base: `OC/BACKEND/migrations/postgres/`

---

## Dónde ejecutar en Supabase

1. Abrir [Supabase Dashboard](https://supabase.com/dashboard) → tu proyecto OC Club.
2. **SQL Editor** → **New query**.
3. Copiar y pegar el contenido completo del archivo del paso 1.
4. **Run** → confirmar sin errores.
5. Repetir con paso 2 y paso 3.

También puedes usar `psql` local con la connection string de Supabase (modo Session o Transaction pooler según tu configuración).

---

## Cómo verificar que se aplicó correctamente

### Verificación automática (recomendada)

Ejecutar `verify_membership_schema.postgres.sql`. En la **sección 8**:

```sql
payments_columns_ok  → true
followup_tables_ok → true
```

### Verificación manual rápida

```sql
-- 7 columnas de pagos
SELECT COUNT(*) FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'membership_payments'
  AND column_name IN (
    'payment_action','period_start_date','period_end_date',
    'counts_as_income','applies_to_balance','previous_end_date','extended_end_date'
  );

-- 2 tablas followups
SELECT table_name FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_name IN ('membership_followups', 'membership_followup_audits');
```

### Smoke test de aplicación (después del esquema)

Con backend desplegado y admin logueado:

```http
GET /membership/admin/clients
GET /membership/admin/summary
GET /membership/admin/followups
GET /membership/admin/followups/summary
```

Todas deben responder **200** (no 500 por columna/tabla faltante).

---

## Si una migración falla

| Error | Acción |
|-------|--------|
| `column "..." already exists` | Columna ya aplicada; continuar con verificación |
| `relation "..." already exists` | Tabla ya existe; verificar índices/FK con script de verificación |
| `permission denied` | Usar rol con permisos DDL (service role / postgres) |
| `foreign key ... violates` | Revisar integridad referencial; no forzar en producción sin análisis |
| `current transaction is aborted` | `ROLLBACK;` y reejecutar el script desde el inicio |

**Si hay duda o corrupción de datos:**

1. Detener uso del panel admin (no pagos, no reversas).
2. Restaurar respaldo.
3. No reintentar sin revisar el mensaje completo en logs de Supabase.

---

## MySQL vs PostgreSQL

| Entorno | Scripts a usar |
|---------|----------------|
| Supabase / Render con `DATABASE_URL` PostgreSQL | `migrations/postgres/*.postgres.sql` |
| MySQL local / hosting MySQL | `migrations/2026-06-17_*.sql` y `2026-06-18_*.sql` |
| SQLite / tests | `create_all` en tests; no requiere estos scripts |

---

## Documentación relacionada

- `OC/BACKEND/docs/MEMBERSHIP_PAYMENT_MIGRATION.md` — contexto funcional pagos (MySQL)
- `OC/Frontend/docs/PRODUCTION_DEPLOY_CHECKLIST.md` — deploy completo
- `OC/BACKEND/deploy/.env.production.example` — variables Render + Supabase

---

## Registro de ejecución

| Fecha | Responsable | Paso 1 pagos | Paso 2 followups | Verificación OK | Smoke test API |
|-------|-------------|--------------|------------------|---------------|----------------|
| | | | | | |
