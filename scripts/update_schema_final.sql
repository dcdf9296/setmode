-- Adding missing columns and tables for complete functionality

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

-- Update triggers for new tables
CREATE TRIGGER update_job_invitations_updated_at BEFORE UPDATE ON job_invitations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
