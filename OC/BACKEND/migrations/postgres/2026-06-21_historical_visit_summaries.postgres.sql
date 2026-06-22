-- Fase 2C.1: visitas historicas agregadas (PostgreSQL / staging local)
-- Idempotente. NO aplicar en produccion hasta Go/No-Go.

BEGIN;

CREATE TABLE IF NOT EXISTS historical_visit_import_batches (
  id SERIAL PRIMARY KEY,
  created_by INTEGER NOT NULL,
  status VARCHAR(30) NOT NULL DEFAULT 'preview',
  filename VARCHAR(255),
  sheet_name VARCHAR(120),
  file_sha256 VARCHAR(64),
  diagnosis JSONB,
  preview_summary JSONB,
  committed_summary JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  committed_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS ix_historical_visit_import_batches_created_by
  ON historical_visit_import_batches (created_by);
CREATE INDEX IF NOT EXISTS ix_historical_visit_import_batches_status
  ON historical_visit_import_batches (status);

CREATE TABLE IF NOT EXISTS historical_visit_import_records (
  id SERIAL PRIMARY KEY,
  batch_id INTEGER NOT NULL,
  row_number INTEGER NOT NULL,
  status VARCHAR(30) NOT NULL,
  raw_data JSONB NOT NULL,
  normalized_data JSONB,
  warnings JSONB,
  referencia_externa VARCHAR(120),
  matched_user_id INTEGER,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS ix_historical_visit_import_records_batch_id
  ON historical_visit_import_records (batch_id);
CREATE INDEX IF NOT EXISTS ix_historical_visit_import_records_status
  ON historical_visit_import_records (status);
CREATE INDEX IF NOT EXISTS ix_historical_visit_import_records_referencia_externa
  ON historical_visit_import_records (referencia_externa);

CREATE TABLE IF NOT EXISTS historical_visit_summaries (
  id SERIAL PRIMARY KEY,
  user_id INTEGER,
  raw_member_name VARCHAR(200) NOT NULL,
  normalized_member_name VARCHAR(200) NOT NULL,
  period_month DATE NOT NULL,
  visits_count INTEGER NOT NULL,
  source_file VARCHAR(255),
  source_sheet VARCHAR(120),
  source_row INTEGER,
  import_batch_id INTEGER,
  match_status VARCHAR(30) NOT NULL DEFAULT 'unmatched',
  is_historical_import BOOLEAN NOT NULL DEFAULT TRUE,
  created_by INTEGER,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS ix_historical_visit_summaries_user_id
  ON historical_visit_summaries (user_id);
CREATE INDEX IF NOT EXISTS ix_historical_visit_summaries_normalized_member_name
  ON historical_visit_summaries (normalized_member_name);
CREATE INDEX IF NOT EXISTS ix_historical_visit_summaries_period_month
  ON historical_visit_summaries (period_month);
CREATE INDEX IF NOT EXISTS ix_historical_visit_summaries_import_batch_id
  ON historical_visit_summaries (import_batch_id);
CREATE INDEX IF NOT EXISTS ix_historical_visit_summaries_match_status
  ON historical_visit_summaries (match_status);

CREATE UNIQUE INDEX IF NOT EXISTS uq_historical_visit_summaries_period_member_sheet
  ON historical_visit_summaries (normalized_member_name, period_month, source_sheet);

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'historical_visit_import_batches_created_by_fkey') THEN
    ALTER TABLE historical_visit_import_batches
      ADD CONSTRAINT historical_visit_import_batches_created_by_fkey
      FOREIGN KEY (created_by) REFERENCES users (id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'historical_visit_import_records_batch_id_fkey') THEN
    ALTER TABLE historical_visit_import_records
      ADD CONSTRAINT historical_visit_import_records_batch_id_fkey
      FOREIGN KEY (batch_id) REFERENCES historical_visit_import_batches (id) ON DELETE CASCADE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'historical_visit_import_records_matched_user_id_fkey') THEN
    ALTER TABLE historical_visit_import_records
      ADD CONSTRAINT historical_visit_import_records_matched_user_id_fkey
      FOREIGN KEY (matched_user_id) REFERENCES users (id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'historical_visit_summaries_user_id_fkey') THEN
    ALTER TABLE historical_visit_summaries
      ADD CONSTRAINT historical_visit_summaries_user_id_fkey
      FOREIGN KEY (user_id) REFERENCES users (id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'historical_visit_summaries_import_batch_id_fkey') THEN
    ALTER TABLE historical_visit_summaries
      ADD CONSTRAINT historical_visit_summaries_import_batch_id_fkey
      FOREIGN KEY (import_batch_id) REFERENCES historical_visit_import_batches (id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'historical_visit_summaries_created_by_fkey') THEN
    ALTER TABLE historical_visit_summaries
      ADD CONSTRAINT historical_visit_summaries_created_by_fkey
      FOREIGN KEY (created_by) REFERENCES users (id);
  END IF;
END $$;

COMMIT;
