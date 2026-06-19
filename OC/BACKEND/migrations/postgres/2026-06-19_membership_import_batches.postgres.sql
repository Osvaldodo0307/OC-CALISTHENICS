-- Fase importacion historica: lotes y trazabilidad (PostgreSQL / Supabase)
-- Idempotente. No modifica tablas de membresia existentes.

BEGIN;

CREATE TABLE IF NOT EXISTS membership_import_batches (
  id SERIAL PRIMARY KEY,
  created_by INTEGER NOT NULL,
  status VARCHAR(30) NOT NULL DEFAULT 'preview',
  filename VARCHAR(255),
  sheet_name VARCHAR(120),
  file_sha256 VARCHAR(64),
  column_mapping JSONB,
  diagnosis JSONB,
  preview_summary JSONB,
  committed_summary JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  committed_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS ix_membership_import_batches_created_by
  ON membership_import_batches (created_by);
CREATE INDEX IF NOT EXISTS ix_membership_import_batches_status
  ON membership_import_batches (status);

CREATE TABLE IF NOT EXISTS membership_import_records (
  id SERIAL PRIMARY KEY,
  batch_id INTEGER NOT NULL,
  row_number INTEGER NOT NULL,
  status VARCHAR(30) NOT NULL,
  raw_data JSONB NOT NULL,
  normalized_data JSONB,
  errors JSONB,
  warnings JSONB,
  referencia_externa VARCHAR(120),
  matched_user_id INTEGER,
  membership_cycle_id INTEGER,
  payment_id INTEGER,
  note_id INTEGER,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS ix_membership_import_records_batch_id
  ON membership_import_records (batch_id);
CREATE INDEX IF NOT EXISTS ix_membership_import_records_status
  ON membership_import_records (status);
CREATE INDEX IF NOT EXISTS ix_membership_import_records_referencia_externa
  ON membership_import_records (referencia_externa);

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'membership_import_batches_created_by_fkey') THEN
    ALTER TABLE membership_import_batches
      ADD CONSTRAINT membership_import_batches_created_by_fkey
      FOREIGN KEY (created_by) REFERENCES users (id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'membership_import_records_batch_id_fkey') THEN
    ALTER TABLE membership_import_records
      ADD CONSTRAINT membership_import_records_batch_id_fkey
      FOREIGN KEY (batch_id) REFERENCES membership_import_batches (id) ON DELETE CASCADE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'membership_import_records_matched_user_id_fkey') THEN
    ALTER TABLE membership_import_records
      ADD CONSTRAINT membership_import_records_matched_user_id_fkey
      FOREIGN KEY (matched_user_id) REFERENCES users (id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'membership_import_records_membership_cycle_id_fkey') THEN
    ALTER TABLE membership_import_records
      ADD CONSTRAINT membership_import_records_membership_cycle_id_fkey
      FOREIGN KEY (membership_cycle_id) REFERENCES membership_cycles (id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'membership_import_records_payment_id_fkey') THEN
    ALTER TABLE membership_import_records
      ADD CONSTRAINT membership_import_records_payment_id_fkey
      FOREIGN KEY (payment_id) REFERENCES membership_payments (id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'membership_import_records_note_id_fkey') THEN
    ALTER TABLE membership_import_records
      ADD CONSTRAINT membership_import_records_note_id_fkey
      FOREIGN KEY (note_id) REFERENCES membership_notes (id);
  END IF;
END $$;

COMMIT;
