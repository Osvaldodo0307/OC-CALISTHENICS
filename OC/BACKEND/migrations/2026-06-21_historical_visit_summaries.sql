-- Fase 2C.1: visitas historicas agregadas (MySQL / staging local)
-- Idempotente. NO aplicar en produccion hasta Go/No-Go.

CREATE TABLE IF NOT EXISTS historical_visit_import_batches (
  id INT AUTO_INCREMENT PRIMARY KEY,
  created_by INT NOT NULL,
  status VARCHAR(30) NOT NULL DEFAULT 'preview',
  filename VARCHAR(255),
  sheet_name VARCHAR(120),
  file_sha256 VARCHAR(64),
  diagnosis JSON,
  preview_summary JSON,
  committed_summary JSON,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  committed_at DATETIME NULL,
  INDEX ix_historical_visit_import_batches_created_by (created_by),
  INDEX ix_historical_visit_import_batches_status (status),
  CONSTRAINT historical_visit_import_batches_created_by_fkey
    FOREIGN KEY (created_by) REFERENCES users (id)
);

CREATE TABLE IF NOT EXISTS historical_visit_import_records (
  id INT AUTO_INCREMENT PRIMARY KEY,
  batch_id INT NOT NULL,
  row_number INT NOT NULL,
  status VARCHAR(30) NOT NULL,
  raw_data JSON NOT NULL,
  normalized_data JSON,
  warnings JSON,
  referencia_externa VARCHAR(120),
  matched_user_id INT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX ix_historical_visit_import_records_batch_id (batch_id),
  INDEX ix_historical_visit_import_records_status (status),
  INDEX ix_historical_visit_import_records_referencia_externa (referencia_externa),
  CONSTRAINT historical_visit_import_records_batch_id_fkey
    FOREIGN KEY (batch_id) REFERENCES historical_visit_import_batches (id) ON DELETE CASCADE,
  CONSTRAINT historical_visit_import_records_matched_user_id_fkey
    FOREIGN KEY (matched_user_id) REFERENCES users (id)
);

CREATE TABLE IF NOT EXISTS historical_visit_summaries (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NULL,
  raw_member_name VARCHAR(200) NOT NULL,
  normalized_member_name VARCHAR(200) NOT NULL,
  period_month DATE NOT NULL,
  visits_count INT NOT NULL,
  source_file VARCHAR(255),
  source_sheet VARCHAR(120),
  source_row INT,
  import_batch_id INT NULL,
  match_status VARCHAR(30) NOT NULL DEFAULT 'unmatched',
  is_historical_import TINYINT(1) NOT NULL DEFAULT 1,
  created_by INT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX ix_historical_visit_summaries_user_id (user_id),
  INDEX ix_historical_visit_summaries_normalized_member_name (normalized_member_name),
  INDEX ix_historical_visit_summaries_period_month (period_month),
  INDEX ix_historical_visit_summaries_import_batch_id (import_batch_id),
  INDEX ix_historical_visit_summaries_match_status (match_status),
  UNIQUE KEY uq_historical_visit_summaries_period_member_sheet (normalized_member_name, period_month, source_sheet),
  CONSTRAINT historical_visit_summaries_user_id_fkey
    FOREIGN KEY (user_id) REFERENCES users (id),
  CONSTRAINT historical_visit_summaries_import_batch_id_fkey
    FOREIGN KEY (import_batch_id) REFERENCES historical_visit_import_batches (id),
  CONSTRAINT historical_visit_summaries_created_by_fkey
    FOREIGN KEY (created_by) REFERENCES users (id)
);
