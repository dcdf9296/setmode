-- Adding missing columns and tables for complete functionality

-- Ensure extension for gen_random_uuid()
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Create/replace the generic updated_at trigger function (safe if already present)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Mirror new auth users into public.users (so they appear in browse)
CREATE OR REPLACE FUNCTION public.handle_auth_user_created()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1))
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger
    WHERE tgname = 'on_auth_user_created' AND tgrelid = 'auth.users'::regclass
  ) THEN
    CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_auth_user_created();
  END IF;
END;
$$;

-- Backfill public.users for existing auth accounts (safe/no-dup thanks to ON CONFLICT)
INSERT INTO public.users (id, email, full_name)
SELECT au.id, au.email, COALESCE(au.raw_user_meta_data->>'full_name', split_part(au.email, '@', 1))
FROM auth.users au
LEFT JOIN public.users pu ON pu.id = au.id
WHERE pu.id IS NULL;

-- Ensure public read access to users for browsing (RLS)
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

DO $pol$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'users' AND policyname = 'Public read users'
  ) THEN
    CREATE POLICY "Public read users"
      ON public.users
      FOR SELECT
      USING (true);
  END IF;
END;
$pol$;

-- Ensure users table has roles, location, and availability date columns used by the app
ALTER TABLE users ADD COLUMN IF NOT EXISTS roles TEXT[] DEFAULT '{}';
ALTER TABLE users ADD COLUMN IF NOT EXISTS location TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS availability_start_date DATE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS availability_end_date DATE;

-- Helpful indexes for filters
CREATE INDEX IF NOT EXISTS idx_users_roles ON users USING GIN (roles);
CREATE INDEX IF NOT EXISTS idx_users_location ON users (location);
CREATE INDEX IF NOT EXISTS idx_users_availability_start_date ON users (availability_start_date);
CREATE INDEX IF NOT EXISTS idx_users_availability_end_date ON users (availability_end_date);

-- Add portfolio and CV fields to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS portfolio_urls TEXT[];
ALTER TABLE users ADD COLUMN IF NOT EXISTS cv_url TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS portfolio_description TEXT;

-- Create job invitations tracking table
CREATE TABLE IF NOT EXISTS job_invitations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  job_id UUID REFERENCES jobs(id) ON DELETE CASCADE,
  talent_id UUID REFERENCES users(id) ON DELETE CASCADE,
  hirer_id UUID REFERENCES users(id) ON DELETE CASCADE,
  status VARCHAR DEFAULT 'sent' CHECK (status IN ('sent', 'accepted', 'declined', 'expired')),
  message TEXT,
  sent_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  responded_at TIMESTAMP WITH TIME ZONE,
  expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '7 days'),
  UNIQUE(job_id, talent_id)
);

-- Ensure timestamps exist on job_invitations for the trigger
ALTER TABLE job_invitations ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
ALTER TABLE job_invitations ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Create user contacts table for imported contacts
CREATE TABLE IF NOT EXISTS user_contacts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  contact_name VARCHAR NOT NULL,
  contact_email VARCHAR NOT NULL,
  contact_phone VARCHAR,
  is_registered BOOLEAN DEFAULT FALSE,
  registered_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  imported_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, contact_email)
);

-- Create job bookmarks/favorites table
CREATE TABLE IF NOT EXISTS job_bookmarks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  job_id UUID REFERENCES jobs(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, job_id)
);

-- Create talent bookmarks/favorites table  
CREATE TABLE IF NOT EXISTS talent_bookmarks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  hirer_id UUID REFERENCES users(id) ON DELETE CASCADE,
  talent_id UUID REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(hirer_id, talent_id)
);

-- Add indexes for new tables
CREATE INDEX IF NOT EXISTS idx_job_invitations_job_id ON job_invitations(job_id);
CREATE INDEX IF NOT EXISTS idx_job_invitations_talent_id ON job_invitations(talent_id);
CREATE INDEX IF NOT EXISTS idx_job_invitations_status ON job_invitations(status);
CREATE INDEX IF NOT EXISTS idx_user_contacts_user_id ON user_contacts(user_id);
CREATE INDEX IF NOT EXISTS idx_user_contacts_email ON user_contacts(contact_email);
CREATE INDEX IF NOT EXISTS idx_job_bookmarks_user_id ON job_bookmarks(user_id);
CREATE INDEX IF NOT EXISTS idx_talent_bookmarks_hirer_id ON talent_bookmarks(hirer_id);

-- Create the trigger ONLY if it doesn't already exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger
    WHERE tgname = 'update_job_invitations_updated_at'
  ) THEN
    CREATE TRIGGER update_job_invitations_updated_at
    BEFORE UPDATE ON job_invitations
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
  END IF;
END;
$$;

-- Ensure job_roles table exists (used for multi-role jobs)
CREATE TABLE IF NOT EXISTS job_roles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  job_id UUID REFERENCES jobs(id) ON DELETE CASCADE,
  role VARCHAR NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  budget INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_job_roles_job_id ON job_roles(job_id);
CREATE INDEX IF NOT EXISTS idx_job_roles_role ON job_roles(role);

-- Allow job.role to be nullable (first role stored for quick filter)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'jobs' AND column_name = 'role'
  ) THEN
    ALTER TABLE jobs ALTER COLUMN role DROP NOT NULL;
  END IF;
END;
$$;

-- Optional: store array of roles for quick filters
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS roles_needed TEXT[] DEFAULT '{}';

-- Add job_role_id to job_applications so invitations/applications are per role
ALTER TABLE job_applications
  ADD COLUMN IF NOT EXISTS job_role_id UUID REFERENCES job_roles(id) ON DELETE CASCADE;

-- Replace old unique constraint (job_id, talent_id) with (job_id, talent_id, job_role_id)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'job_applications_job_id_talent_id_key'
  ) THEN
    ALTER TABLE job_applications DROP CONSTRAINT job_applications_job_id_talent_id_key;
  END IF;
END;
$$;

ALTER TABLE job_applications
  ADD CONSTRAINT job_applications_unique UNIQUE (job_id, talent_id, job_role_id);

-- Create job_roles table for multi-role jobs
CREATE TABLE IF NOT EXISTS job_roles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  job_id UUID REFERENCES jobs(id) ON DELETE CASCADE,
  role VARCHAR NOT NULL,          -- e.g., "hair-stylist", "makeup-artist"
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  budget INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_job_roles_job_id ON job_roles(job_id);
CREATE INDEX IF NOT EXISTS idx_job_roles_role ON job_roles(role);

-- Allow job.role to be nullable (first role stored for quick filter)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'jobs' AND column_name = 'role'
  ) THEN
    ALTER TABLE jobs ALTER COLUMN role DROP NOT NULL;
  END IF;
END;
$$;

-- Optional: store array of roles needed for quick filters
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS roles_needed TEXT[] DEFAULT '{}';

-- Optional: allow job.role to be nullable (first role stored for quick filter)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'jobs' AND column_name = 'role'
  ) THEN
    ALTER TABLE jobs ALTER COLUMN role DROP NOT NULL;
  END IF;
END;
$$;

-- Optional: store roles_needed array for quick text filters (not required)
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS roles_needed TEXT[] DEFAULT '{}';

-- RLS read policies (optional if using service role). Safe if re-run.
ALTER TABLE job_roles ENABLE ROW LEVEL SECURITY;

DO $pol$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='job_roles' AND policyname='Public read job_roles'
  ) THEN
    CREATE POLICY "Public read job_roles"
      ON public.job_roles FOR SELECT USING (true);
  END IF;
END;
$pol$;
