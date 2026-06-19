-- Fase 2B.6: marcar ciclos de importacion historica (PostgreSQL / Supabase)
-- Idempotente. No borra datos.

BEGIN;

ALTER TABLE membership_cycles
  ADD COLUMN IF NOT EXISTS is_historical_import BOOLEAN NOT NULL DEFAULT FALSE;

ALTER TABLE membership_cycles
  ADD COLUMN IF NOT EXISTS historical_source VARCHAR(60);

ALTER TABLE membership_cycles
  ADD COLUMN IF NOT EXISTS import_batch_id INTEGER;

CREATE INDEX IF NOT EXISTS ix_membership_cycles_is_historical_import
  ON membership_cycles (is_historical_import);

CREATE INDEX IF NOT EXISTS ix_membership_cycles_import_batch_id
  ON membership_cycles (import_batch_id);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'membership_cycles_import_batch_id_fkey'
  ) THEN
    ALTER TABLE membership_cycles
      ADD CONSTRAINT membership_cycles_import_batch_id_fkey
      FOREIGN KEY (import_batch_id) REFERENCES membership_import_batches (id) ON DELETE SET NULL;
  END IF;
END $$;

COMMIT;

-- Verificacion:
-- SELECT column_name, data_type, is_nullable, column_default
-- FROM information_schema.columns
-- WHERE table_name = 'membership_cycles'
--   AND column_name IN ('is_historical_import', 'historical_source', 'import_batch_id')
-- ORDER BY column_name;
