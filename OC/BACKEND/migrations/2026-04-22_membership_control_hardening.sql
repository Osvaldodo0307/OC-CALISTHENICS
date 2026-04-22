-- Hardening de Control de Membresias
-- Fecha: 2026-04-22

-- 1) Baja logica de usuarios
ALTER TABLE users ADD COLUMN is_active BOOLEAN DEFAULT TRUE;
ALTER TABLE users ADD COLUMN deactivated_at TIMESTAMP NULL;
ALTER TABLE users ADD COLUMN deactivated_by INTEGER NULL;
ALTER TABLE users ADD COLUMN deactivation_reason TEXT NULL;

-- 2) Trazabilidad de ciclos
ALTER TABLE membership_cycles ADD COLUMN renewed_from_cycle_id INTEGER NULL;
ALTER TABLE membership_cycles ADD COLUMN created_by INTEGER NULL;
ALTER TABLE membership_cycles ADD COLUMN updated_by INTEGER NULL;

-- 3) Idempotencia de pagos
ALTER TABLE membership_payments ADD COLUMN idempotency_key VARCHAR(120) NULL;
ALTER TABLE membership_payments ADD COLUMN reversed_at TIMESTAMP NULL;
ALTER TABLE membership_payments ADD COLUMN reversed_by INTEGER NULL;
ALTER TABLE membership_payments ADD COLUMN reversal_reason TEXT NULL;
CREATE UNIQUE INDEX ux_membership_payments_cycle_idempotency
ON membership_payments (membership_cycle_id, idempotency_key);

-- 4) Auditoria de cambios estructurales en ciclos
CREATE TABLE membership_cycle_audits (
  id INTEGER PRIMARY KEY,
  membership_cycle_id INTEGER NOT NULL,
  changed_by INTEGER NOT NULL,
  reason TEXT NOT NULL,
  old_payload JSON NOT NULL,
  new_payload JSON NOT NULL,
  changed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
