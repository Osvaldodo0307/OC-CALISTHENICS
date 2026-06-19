# Migración: pagos con renovación automática (Fase 2A.1 / 2A.2)

Esta migración agrega columnas de trazabilidad y renovación en `membership_payments`. **No elimina ni modifica datos existentes**; solo añade columnas con valores por defecto seguros.

## Campos nuevos

| Columna | Tipo | Default | Propósito |
|---------|------|---------|-----------|
| `payment_action` | VARCHAR(40) NULL | NULL | Acción operativa (`renew_extend`, `partial_debt`, etc.) |
| `period_start_date` | DATE NULL | NULL | Inicio del periodo cubierto |
| `period_end_date` | DATE NULL | NULL | Fin del periodo cubierto |
| `counts_as_income` | BOOLEAN NOT NULL | TRUE | Si suma al ingreso real del resumen |
| `applies_to_balance` | BOOLEAN NOT NULL | TRUE | Si reduce el saldo pendiente del ciclo |
| `previous_end_date` | DATE NULL | NULL | Vigencia antes de extender (reversa) |
| `extended_end_date` | DATE NULL | NULL | Vigencia después de extender (reversa) |

**Filas existentes:** reciben `counts_as_income=TRUE` y `applies_to_balance=TRUE` (comportamiento compatible con pagos históricos normales).

## Respaldo recomendado

Antes de migrar en producción:

```bash
# MySQL — ejemplo
mysqldump -h HOST -u USER -p NOMBRE_BD membership_payments > backup_membership_payments_$(date +%Y%m%d).sql
```

Guarda también un snapshot general de la BD si es posible.

## Procedimiento sugerido (MySQL)

1. Conéctate a la base de datos de producción (phpMyAdmin, DBeaver, CLI).
2. Ejecuta el script **una vez**:

```bash
mysql -h HOST -u USER -p NOMBRE_BD < migrations/2026-06-17_membership_payment_renewal.sql
```

El script es **idempotente**: si las columnas ya existen, no falla (usa `information_schema`).

3. Verifica que la consulta final del script devuelve **7 filas** (una por columna nueva).

## Verificación posterior

```sql
DESCRIBE membership_payments;

SELECT COUNT(*) AS total,
       SUM(counts_as_income) AS con_ingreso,
       SUM(applies_to_balance) AS aplican_saldo
FROM membership_payments;
```

En la app (como admin):

- `GET /membership/admin/summary` — debe responder sin error.
- `GET /membership/admin/clients` — listado con estados.
- Registrar un pago de prueba en un socio de prueba y confirmar `new_end_date` en la respuesta.

## Variables de entorno relacionadas

```env
APP_TIMEZONE=America/Mexico_City
MEMBERSHIP_EXPIRING_SOON_DAYS=3
```

`APP_TIMEZONE` controla `vence_hoy`, días restantes y el cálculo de “pagos de hoy” en el resumen.

## Si la migración falla

| Síntoma | Qué revisar |
|---------|-------------|
| `Duplicate column name` | Columna ya aplicada; ejecuta solo el `SELECT` de verificación del final del script |
| Permisos denegados | Usuario MySQL necesita `ALTER` en la tabla |
| Script no idempotente en versión antigua | Usa el archivo actualizado en `migrations/2026-06-17_membership_payment_renewal.sql` (2A.2) |
| App error `Unknown column` | Migración no aplicada en ese entorno; ejecutar script o redeploy tras migrar |

## Compatibilidad

- **SQLite (tests/dev):** SQLAlchemy `create_all` crea las columnas automáticamente; no requiere este script.
- **PostgreSQL (Supabase):** usar `migrations/postgres/2026-06-17_membership_payment_renewal.postgres.sql` — ver `docs/SUPABASE_MEMBERSHIP_MIGRATIONS.md`.
- **MySQL:** usar este script (`migrations/2026-06-17_membership_payment_renewal.sql`).
- **Re-ejecución:** segura gracias a comprobación por `information_schema`.

## Rollback

No hay rollback automático. Si debes revertir:

1. Restaura desde el respaldo de `membership_payments`, o
2. Elimina columnas manualmente solo si estás seguro de que no hay datos dependientes (no recomendado en producción con pagos nuevos).
