-- Adding database functions for referral system
-- Function to process referrals and update user stats
CREATE OR REPLACE FUNCTION process_referrals(p_user_id UUID, p_referred_emails TEXT[])
RETURNS VOID AS $$
DECLARE
    ref_email TEXT;
    new_referrals INTEGER := 0;
BEGIN
    FOREACH ref_email IN ARRAY p_referred_emails
    LOOP
        -- only count if not already registered
        IF NOT EXISTS (SELECT 1 FROM users u WHERE u.email = ref_email) THEN
            new_referrals := new_referrals + 1;

            -- Insert into contacts (contacts has full_name, not name)
            INSERT INTO contacts (user_id, email, full_name, invited_at)
            VALUES (p_user_id, ref_email, ref_email, NOW())
            ON CONFLICT (user_id, email) DO NOTHING;
        END IF;
    END LOOP;

    -- Update user's referral stats safely
    UPDATE users 
    SET 
        referral_count = COALESCE(referral_count, 0) + new_referrals,
        referral_points = COALESCE(referral_points, 0) + (new_referrals * 10)
    WHERE id = p_user_id;
END;
$$ LANGUAGE plpgsql;

-- Ensure a unique constraint exists for ON CONFLICT in contacts
CREATE UNIQUE INDEX IF NOT EXISTS uq_contacts_user_email ON contacts(user_id, email);

-- Add referral columns to users table if they don't exist
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS referral_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS referral_points INTEGER DEFAULT 0;

-- Ensure referral fields exist
ALTER TABLE users 
  ADD COLUMN IF NOT EXISTS referral_count INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS referral_points INTEGER DEFAULT 0;
