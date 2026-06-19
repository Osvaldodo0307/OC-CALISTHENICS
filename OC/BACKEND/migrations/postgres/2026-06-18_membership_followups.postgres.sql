-- Fase 2B: seguimiento administrativo de membresias (PostgreSQL / Supabase)
-- Idempotente: CREATE TABLE IF NOT EXISTS, indices y FKs condicionales.
-- Alineado con app.models.MembershipFollowUp y MembershipFollowUpAudit

BEGIN;

-- ---------------------------------------------------------------------------
-- membership_followups
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS membership_followups (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL,
  membership_id INTEGER,
  membership_cycle_id INTEGER,
  followup_type VARCHAR(30) NOT NULL DEFAULT 'otro',
  channel VARCHAR(30) NOT NULL DEFAULT 'nota_interna',
  status VARCHAR(30) NOT NULL DEFAULT 'pendiente',
  contact_at TIMESTAMPTZ,
  next_followup_at TIMESTAMPTZ,
  note TEXT,
  created_by INTEGER NOT NULL,
  updated_by INTEGER,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS ix_membership_followups_user_id
  ON membership_followups (user_id);

CREATE INDEX IF NOT EXISTS ix_membership_followups_membership_id
  ON membership_followups (membership_id);

CREATE INDEX IF NOT EXISTS ix_membership_followups_membership_cycle_id
  ON membership_followups (membership_cycle_id);

CREATE INDEX IF NOT EXISTS ix_membership_followups_status
  ON membership_followups (status);

CREATE INDEX IF NOT EXISTS ix_membership_followups_followup_type
  ON membership_followups (followup_type);

CREATE INDEX IF NOT EXISTS ix_membership_followups_next_followup_at
  ON membership_followups (next_followup_at);

CREATE INDEX IF NOT EXISTS ix_membership_followups_created_at
  ON membership_followups (created_at);

-- Foreign keys (solo si no existen)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'membership_followups_user_id_fkey') THEN
    ALTER TABLE membership_followups
      ADD CONSTRAINT membership_followups_user_id_fkey
      FOREIGN KEY (user_id) REFERENCES users (id);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'membership_followups_membership_id_fkey') THEN
    ALTER TABLE membership_followups
      ADD CONSTRAINT membership_followups_membership_id_fkey
      FOREIGN KEY (membership_id) REFERENCES memberships (id);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'membership_followups_membership_cycle_id_fkey') THEN
    ALTER TABLE membership_followups
      ADD CONSTRAINT membership_followups_membership_cycle_id_fkey
      FOREIGN KEY (membership_cycle_id) REFERENCES membership_cycles (id);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'membership_followups_created_by_fkey') THEN
    ALTER TABLE membership_followups
      ADD CONSTRAINT membership_followups_created_by_fkey
      FOREIGN KEY (created_by) REFERENCES users (id);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'membership_followups_updated_by_fkey') THEN
    ALTER TABLE membership_followups
      ADD CONSTRAINT membership_followups_updated_by_fkey
      FOREIGN KEY (updated_by) REFERENCES users (id);
  END IF;
END $$;

-- ---------------------------------------------------------------------------
-- membership_followup_audits
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS membership_followup_audits (
  id SERIAL PRIMARY KEY,
  followup_id INTEGER NOT NULL,
  changed_by INTEGER NOT NULL,
  event VARCHAR(60) NOT NULL,
  reason TEXT,
  old_payload JSON NOT NULL,
  new_payload JSON NOT NULL,
  changed_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS ix_membership_followup_audits_followup_id
  ON membership_followup_audits (followup_id);

CREATE INDEX IF NOT EXISTS ix_membership_followup_audits_changed_at
  ON membership_followup_audits (changed_at);

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'membership_followup_audits_followup_id_fkey') THEN
    ALTER TABLE membership_followup_audits
      ADD CONSTRAINT membership_followup_audits_followup_id_fkey
      FOREIGN KEY (followup_id) REFERENCES membership_followups (id);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'membership_followup_audits_changed_by_fkey') THEN
    ALTER TABLE membership_followup_audits
      ADD CONSTRAINT membership_followup_audits_changed_by_fkey
      FOREIGN KEY (changed_by) REFERENCES users (id);
  END IF;
END $$;

COMMIT;

-- Verificacion rapida de tablas
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_name IN ('membership_followups', 'membership_followup_audits')
ORDER BY table_name;
