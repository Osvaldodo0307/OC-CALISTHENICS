-- Fase 2B: seguimiento administrativo de membresias
-- Idempotente via create_all en dev; en MySQL ejecutar una vez.

CREATE TABLE IF NOT EXISTS membership_followups (
  id INTEGER PRIMARY KEY AUTO_INCREMENT,
  user_id INTEGER NOT NULL,
  membership_id INTEGER NULL,
  membership_cycle_id INTEGER NULL,
  followup_type VARCHAR(30) NOT NULL DEFAULT 'otro',
  channel VARCHAR(30) NOT NULL DEFAULT 'nota_interna',
  status VARCHAR(30) NOT NULL DEFAULT 'pendiente',
  contact_at TIMESTAMP NULL,
  next_followup_at TIMESTAMP NULL,
  note TEXT NULL,
  created_by INTEGER NOT NULL,
  updated_by INTEGER NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX ix_membership_followups_user_id (user_id),
  INDEX ix_membership_followups_status (status),
  INDEX ix_membership_followups_next (next_followup_at)
);

CREATE TABLE IF NOT EXISTS membership_followup_audits (
  id INTEGER PRIMARY KEY AUTO_INCREMENT,
  followup_id INTEGER NOT NULL,
  changed_by INTEGER NOT NULL,
  event VARCHAR(60) NOT NULL,
  reason TEXT NULL,
  old_payload JSON NOT NULL,
  new_payload JSON NOT NULL,
  changed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX ix_membership_followup_audits_followup_id (followup_id)
);
