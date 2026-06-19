-- Fase 2A.1 / 2A.2: renovacion automatica y trazabilidad de pagos (PostgreSQL / Supabase)
-- Idempotente: ADD COLUMN IF NOT EXISTS. No elimina ni modifica datos existentes.
-- Ejecutar en Supabase SQL Editor o psql contra la base de produccion.
-- Alineado con app.models.MembershipPayment

BEGIN;

-- Columnas nullable
ALTER TABLE membership_payments
  ADD COLUMN IF NOT EXISTS payment_action VARCHAR(40);

ALTER TABLE membership_payments
  ADD COLUMN IF NOT EXISTS period_start_date DATE;

ALTER TABLE membership_payments
  ADD COLUMN IF NOT EXISTS period_end_date DATE;

ALTER TABLE membership_payments
  ADD COLUMN IF NOT EXISTS previous_end_date DATE;

ALTER TABLE membership_payments
  ADD COLUMN IF NOT EXISTS extended_end_date DATE;

-- Columnas boolean NOT NULL con default (filas existentes reciben TRUE)
ALTER TABLE membership_payments
  ADD COLUMN IF NOT EXISTS counts_as_income BOOLEAN NOT NULL DEFAULT TRUE;

ALTER TABLE membership_payments
  ADD COLUMN IF NOT EXISTS applies_to_balance BOOLEAN NOT NULL DEFAULT TRUE;

-- Si la columna ya existia como nullable sin default, normalizar filas NULL (seguro e idempotente)
UPDATE membership_payments SET counts_as_income = TRUE WHERE counts_as_income IS NULL;
UPDATE membership_payments SET applies_to_balance = TRUE WHERE applies_to_balance IS NULL;

COMMIT;

-- Verificacion rapida (debe devolver 7 filas)
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'membership_payments'
  AND column_name IN (
    'payment_action', 'period_start_date', 'period_end_date',
    'counts_as_income', 'applies_to_balance', 'previous_end_date', 'extended_end_date'
  )
ORDER BY column_name;
