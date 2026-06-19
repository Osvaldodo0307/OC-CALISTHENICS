-- Fase 2B.6: marcar ciclos de importacion historica (MySQL / staging local)
-- Idempotente.

SET @db := DATABASE();

SET @sql := (
  SELECT IF(
    EXISTS(
      SELECT 1 FROM information_schema.COLUMNS
      WHERE TABLE_SCHEMA = @db AND TABLE_NAME = 'membership_cycles' AND COLUMN_NAME = 'is_historical_import'
    ),
    'SELECT ''is_historical_import ya existe''',
    'ALTER TABLE membership_cycles ADD COLUMN is_historical_import BOOLEAN NOT NULL DEFAULT FALSE'
  )
);
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @sql := (
  SELECT IF(
    EXISTS(
      SELECT 1 FROM information_schema.COLUMNS
      WHERE TABLE_SCHEMA = @db AND TABLE_NAME = 'membership_cycles' AND COLUMN_NAME = 'historical_source'
    ),
    'SELECT ''historical_source ya existe''',
    'ALTER TABLE membership_cycles ADD COLUMN historical_source VARCHAR(60) NULL'
  )
);
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @sql := (
  SELECT IF(
    EXISTS(
      SELECT 1 FROM information_schema.COLUMNS
      WHERE TABLE_SCHEMA = @db AND TABLE_NAME = 'membership_cycles' AND COLUMN_NAME = 'import_batch_id'
    ),
    'SELECT ''import_batch_id ya existe''',
    'ALTER TABLE membership_cycles ADD COLUMN import_batch_id INT NULL'
  )
);
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @sql := (
  SELECT IF(
    EXISTS(
      SELECT 1 FROM information_schema.STATISTICS
      WHERE TABLE_SCHEMA = @db AND TABLE_NAME = 'membership_cycles' AND INDEX_NAME = 'ix_membership_cycles_is_historical_import'
    ),
    'SELECT ''ix_membership_cycles_is_historical_import ya existe''',
    'CREATE INDEX ix_membership_cycles_is_historical_import ON membership_cycles (is_historical_import)'
  )
);
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @sql := (
  SELECT IF(
    EXISTS(
      SELECT 1 FROM information_schema.STATISTICS
      WHERE TABLE_SCHEMA = @db AND TABLE_NAME = 'membership_cycles' AND INDEX_NAME = 'ix_membership_cycles_import_batch_id'
    ),
    'SELECT ''ix_membership_cycles_import_batch_id ya existe''',
    'CREATE INDEX ix_membership_cycles_import_batch_id ON membership_cycles (import_batch_id)'
  )
);
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;
