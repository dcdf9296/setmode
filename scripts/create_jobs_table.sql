-- NEW FILE: creates jobs table aligned with MyJobs UI (safe: IF NOT EXISTS)
CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  location TEXT,
  roles_needed TEXT[] NOT NULL DEFAULT '{}', -- aligns with UI
  budget NUMERIC,
  currency TEXT,
  date TEXT, -- or TIMESTAMPTZ if you prefer strict date; UI shows string
  status TEXT NOT NULL DEFAULT 'draft',
  hirer_id UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_jobs_hirer_id ON jobs(hirer_id);
CREATE INDEX IF NOT EXISTS idx_jobs_status ON jobs(status);
