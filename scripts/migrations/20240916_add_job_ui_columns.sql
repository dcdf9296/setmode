-- Add UI-friendly columns used by the Create Job page (safe to run multiple times)
ALTER TABLE jobs
  ADD COLUMN IF NOT EXISTS start_date TEXT,
  ADD COLUMN IF NOT EXISTS end_date TEXT,
  ADD COLUMN IF NOT EXISTS budget NUMERIC,
  ADD COLUMN IF NOT EXISTS roles_needed TEXT[];

-- Optional: keep start_date/end_date in sync when you save only legacy fields (date/deadline)
-- Not required now, as we write both in the API
