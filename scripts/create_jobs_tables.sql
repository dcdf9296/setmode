-- NEW FILE: jobs + invitations + applications schema

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Idempotent setup for job invitations only (do not redefine jobs here)
CREATE TABLE IF NOT EXISTS job_invitations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id UUID NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
  talent_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','accepted','declined','expired')),
  token TEXT, -- will enforce NOT NULL after backfill
  message TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  responded_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ
);

-- Ensure missing columns exist (safe if table existed without them)
ALTER TABLE job_invitations ADD COLUMN IF NOT EXISTS talent_id UUID;
ALTER TABLE job_invitations ADD COLUMN IF NOT EXISTS role TEXT;
ALTER TABLE job_invitations ADD COLUMN IF NOT EXISTS status TEXT;
ALTER TABLE job_invitations ADD COLUMN IF NOT EXISTS token TEXT;
ALTER TABLE job_invitations ADD COLUMN IF NOT EXISTS message TEXT;
ALTER TABLE job_invitations ADD COLUMN IF NOT EXISTS responded_at TIMESTAMPTZ;
ALTER TABLE job_invitations ADD COLUMN IF NOT EXISTS expires_at TIMESTAMPTZ;

-- Set defaults/checks if the column existed without defaults
DO $$
BEGIN
  -- set default only if not already set
  PERFORM 1
  FROM information_schema.columns
  WHERE table_name = 'job_invitations'
    AND column_name = 'status'
    AND column_default IS NOT NULL;
  IF NOT FOUND THEN
    ALTER TABLE job_invitations ALTER COLUMN status SET DEFAULT 'pending';
  END IF;
EXCEPTION WHEN others THEN
  -- ignore if lacking privileges to alter default/check
  NULL;
END $$;

-- Backfill token for any existing rows, then enforce NOT NULL
UPDATE job_invitations
SET token = encode(gen_random_bytes(16), 'hex')
WHERE token IS NULL;

ALTER TABLE job_invitations ALTER COLUMN token SET NOT NULL;

-- Indexes and constraints (idempotent)
CREATE UNIQUE INDEX IF NOT EXISTS uq_job_invitations_job_talent ON job_invitations(job_id, talent_id);
CREATE INDEX IF NOT EXISTS idx_job_invitations_job_status ON job_invitations(job_id, status);
CREATE INDEX IF NOT EXISTS idx_job_invitations_talent_status ON job_invitations(talent_id, status);
CREATE UNIQUE INDEX IF NOT EXISTS idx_job_invitations_token_unique ON job_invitations(token);

-- Invitations table compatible with your UI
CREATE TABLE IF NOT EXISTS job_invitations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id UUID NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
  talent_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','accepted','declined','expired')),
  token TEXT UNIQUE NOT NULL,
  message TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  responded_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ
);

CREATE UNIQUE INDEX IF NOT EXISTS uq_job_invitations_job_talent ON job_invitations(job_id, talent_id);
CREATE INDEX IF NOT EXISTS idx_job_invitations_job_status ON job_invitations(job_id, status);
CREATE INDEX IF NOT EXISTS idx_job_invitations_talent_status ON job_invitations(talent_id, status);
CREATE INDEX IF NOT EXISTS idx_job_invitations_token ON job_invitations(token);

-- If you already created job_applications elsewhere, do NOT recreate it.
-- Optionally add columns your UI expects (if they don't exist yet).
ALTER TABLE IF EXISTS job_applications
  ADD COLUMN IF NOT EXISTS role TEXT,
  ADD COLUMN IF NOT EXISTS talent_notes TEXT,
  ADD COLUMN IF NOT EXISTS hirer_notes TEXT,
  ADD COLUMN IF NOT EXISTS cover_letter TEXT;
