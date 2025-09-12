-- Adding database functions for referral system
-- Function to process referrals and update user stats
CREATE OR REPLACE FUNCTION process_referrals(user_id UUID, referred_emails TEXT[])
RETURNS VOID AS $$
DECLARE
    email TEXT;
    referral_count INTEGER := 0;
BEGIN
    -- Count successful referrals (emails not already in system)
    FOREACH email IN ARRAY referred_emails
    LOOP
        -- Check if email is not already registered
        IF NOT EXISTS (SELECT 1 FROM users WHERE email = email) THEN
            referral_count := referral_count + 1;
            
            -- Insert into contacts table for tracking
            INSERT INTO contacts (user_id, email, name, invited_at)
            VALUES (user_id, email, email, NOW())
            ON CONFLICT (user_id, email) DO NOTHING;
        END IF;
    END LOOP;
    
    -- Update user's referral stats
    UPDATE users 
    SET 
        referral_count = COALESCE(referral_count, 0) + referral_count,
        referral_points = COALESCE(referral_points, 0) + (referral_count * 10)
    WHERE id = user_id;
END;
$$ LANGUAGE plpgsql;

-- Add referral columns to users table if they don't exist
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS referral_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS referral_points INTEGER DEFAULT 0;
