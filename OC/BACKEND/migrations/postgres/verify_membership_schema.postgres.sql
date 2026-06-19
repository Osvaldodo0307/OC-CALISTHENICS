-- Verificacion de esquema membresias / pagos / followups (PostgreSQL / Supabase)
-- Ejecutar despues de las migraciones postgres/*.postgres.sql
-- Todas las consultas son de solo lectura.
-- En Supabase SQL Editor: puedes ejecutar todo el archivo o por secciones.

-- === 1. Columnas nuevas en membership_payments (esperado: 7 filas) ===
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'membership_payments'
  AND column_name IN (
    'payment_action',
    'period_start_date',
    'period_end_date',
    'counts_as_income',
    'applies_to_balance',
    'previous_end_date',
    'extended_end_date'
  )
ORDER BY column_name;

-- === 2. Conteo columnas payment renewal (debe ser 7) ===
SELECT COUNT(*) AS payment_renewal_columns_found
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'membership_payments'
  AND column_name IN (
    'payment_action',
    'period_start_date',
    'period_end_date',
    'counts_as_income',
    'applies_to_balance',
    'previous_end_date',
    'extended_end_date'
  );

-- === 3. Tablas followups (esperado: 2 filas) ===
SELECT table_name, table_type
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_name IN ('membership_followups', 'membership_followup_audits')
ORDER BY table_name;

-- === 4. Columnas membership_followups ===
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'membership_followups'
ORDER BY ordinal_position;

-- === 5. Columnas membership_followup_audits ===
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'membership_followup_audits'
ORDER BY ordinal_position;

-- === 6. Indices followups ===
SELECT tablename, indexname, indexdef
FROM pg_indexes
WHERE schemaname = 'public'
  AND tablename IN ('membership_followups', 'membership_followup_audits')
ORDER BY tablename, indexname;

-- === 7. Foreign keys followups ===
SELECT
  tc.table_name,
  tc.constraint_name,
  kcu.column_name,
  ccu.table_name AS foreign_table_name,
  ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
  AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
  AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY'
  AND tc.table_schema = 'public'
  AND tc.table_name IN ('membership_followups', 'membership_followup_audits')
ORDER BY tc.table_name, tc.constraint_name;

-- === 8. Resumen PASS/FAIL (payments_columns_ok y followup_tables_ok deben ser true) ===
SELECT
  (SELECT COUNT(*) FROM information_schema.columns
   WHERE table_schema = 'public' AND table_name = 'membership_payments'
     AND column_name IN (
       'payment_action','period_start_date','period_end_date',
       'counts_as_income','applies_to_balance','previous_end_date','extended_end_date'
     )) = 7 AS payments_columns_ok,
  (SELECT COUNT(*) FROM information_schema.tables
   WHERE table_schema = 'public'
     AND table_name IN ('membership_followups', 'membership_followup_audits')) = 2 AS followup_tables_ok;

-- === 9. Columnas historicas en membership_cycles (Fase 2B.6, esperado: 3 filas) ===
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'membership_cycles'
  AND column_name IN ('is_historical_import', 'historical_source', 'import_batch_id')
ORDER BY column_name;

-- === 10. Conteo columnas historicas (debe ser 3) ===
SELECT COUNT(*) AS historical_cycle_columns_found
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'membership_cycles'
  AND column_name IN ('is_historical_import', 'historical_source', 'import_batch_id');

-- === 11. Resumen historico (historical_columns_ok debe ser true) ===
SELECT
  (SELECT COUNT(*) FROM information_schema.columns
   WHERE table_schema = 'public' AND table_name = 'membership_cycles'
     AND column_name IN ('is_historical_import', 'historical_source', 'import_batch_id')) = 3
  AS historical_columns_ok;

-- === 12. Tablas import batches (esperado: 2 filas) ===
SELECT table_name, table_type
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_name IN ('membership_import_batches', 'membership_import_records')
ORDER BY table_name;

-- === 13. Columnas membership_import_batches (referencia) ===
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'membership_import_batches'
ORDER BY ordinal_position;

-- === 14. Resumen pre-importacion noviembre 2025 (todo debe ser true) ===
SELECT
  (SELECT COUNT(*) FROM information_schema.columns
   WHERE table_schema = 'public' AND table_name = 'membership_payments'
     AND column_name IN (
       'payment_action','period_start_date','period_end_date',
       'counts_as_income','applies_to_balance','previous_end_date','extended_end_date'
     )) = 7 AS payments_columns_ok,
  (SELECT COUNT(*) FROM information_schema.tables
   WHERE table_schema = 'public'
     AND table_name IN ('membership_followups', 'membership_followup_audits')) = 2 AS followup_tables_ok,
  (SELECT COUNT(*) FROM information_schema.tables
   WHERE table_schema = 'public'
     AND table_name IN ('membership_import_batches', 'membership_import_records')) = 2 AS import_tables_ok,
  (SELECT COUNT(*) FROM information_schema.columns
   WHERE table_schema = 'public' AND table_name = 'membership_cycles'
     AND column_name IN ('is_historical_import', 'historical_source', 'import_batch_id')) = 3 AS historical_columns_ok;
