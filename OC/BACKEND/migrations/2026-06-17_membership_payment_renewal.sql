-- Fase 2A.1 / 2A.2: renovacion automatica y trazabilidad de pagos
-- Idempotente: puede ejecutarse mas de una vez sin error si las columnas ya existen.
-- Compatible con bases ya pobladas (solo ADD COLUMN, sin DROP ni DELETE).

SET @db := DATABASE();

-- payment_action
SET @sql := (
  SELECT IF(
    EXISTS(
      SELECT 1 FROM information_schema.COLUMNS
      WHERE TABLE_SCHEMA = @db AND TABLE_NAME = 'membership_payments' AND COLUMN_NAME = 'payment_action'
    ),
    'SELECT ''payment_action ya existe''',
    'ALTER TABLE membership_payments ADD COLUMN payment_action VARCHAR(40) NULL'
  )
);
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- period_start_date
SET @sql := (
  SELECT IF(
    EXISTS(
      SELECT 1 FROM information_schema.COLUMNS
      WHERE TABLE_SCHEMA = @db AND TABLE_NAME = 'membership_payments' AND COLUMN_NAME = 'period_start_date'
    ),
    'SELECT ''period_start_date ya existe''',
    'ALTER TABLE membership_payments ADD COLUMN period_start_date DATE NULL'
  )
);
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- period_end_date
SET @sql := (
  SELECT IF(
    EXISTS(
      SELECT 1 FROM information_schema.COLUMNS
      WHERE TABLE_SCHEMA = @db AND TABLE_NAME = 'membership_payments' AND COLUMN_NAME = 'period_end_date'
    ),
    'SELECT ''period_end_date ya existe''',
    'ALTER TABLE membership_payments ADD COLUMN period_end_date DATE NULL'
  )
);
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- counts_as_income (default TRUE para filas existentes y nuevas)
SET @sql := (
  SELECT IF(
    EXISTS(
      SELECT 1 FROM information_schema.COLUMNS
      WHERE TABLE_SCHEMA = @db AND TABLE_NAME = 'membership_payments' AND COLUMN_NAME = 'counts_as_income'
    ),
    'SELECT ''counts_as_income ya existe''',
    'ALTER TABLE membership_payments ADD COLUMN counts_as_income BOOLEAN NOT NULL DEFAULT TRUE'
  )
);
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- applies_to_balance (default TRUE)
SET @sql := (
  SELECT IF(
    EXISTS(
      SELECT 1 FROM information_schema.COLUMNS
      WHERE TABLE_SCHEMA = @db AND TABLE_NAME = 'membership_payments' AND COLUMN_NAME = 'applies_to_balance'
    ),
    'SELECT ''applies_to_balance ya existe''',
    'ALTER TABLE membership_payments ADD COLUMN applies_to_balance BOOLEAN NOT NULL DEFAULT TRUE'
  )
);
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- previous_end_date
SET @sql := (
  SELECT IF(
    EXISTS(
      SELECT 1 FROM information_schema.COLUMNS
      WHERE TABLE_SCHEMA = @db AND TABLE_NAME = 'membership_payments' AND COLUMN_NAME = 'previous_end_date'
    ),
    'SELECT ''previous_end_date ya existe''',
    'ALTER TABLE membership_payments ADD COLUMN previous_end_date DATE NULL'
  )
);
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- extended_end_date
SET @sql := (
  SELECT IF(
    EXISTS(
      SELECT 1 FROM information_schema.COLUMNS
      WHERE TABLE_SCHEMA = @db AND TABLE_NAME = 'membership_payments' AND COLUMN_NAME = 'extended_end_date'
    ),
    'SELECT ''extended_end_date ya existe''',
    'ALTER TABLE membership_payments ADD COLUMN extended_end_date DATE NULL'
  )
);
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- Verificacion rapida (debe devolver 7 filas)
SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE, COLUMN_DEFAULT
FROM information_schema.COLUMNS
WHERE TABLE_SCHEMA = @db
  AND TABLE_NAME = 'membership_payments'
  AND COLUMN_NAME IN (
    'payment_action', 'period_start_date', 'period_end_date',
    'counts_as_income', 'applies_to_balance', 'previous_end_date', 'extended_end_date'
  )
ORDER BY COLUMN_NAME;
