-- Backfill referral codes for users who don't have one
-- This script generates unique referral codes for existing users without them

-- Create a function to generate a random referral code
CREATE OR REPLACE FUNCTION generate_referral_code()
RETURNS TEXT AS $$
DECLARE
  code TEXT;
  exists BOOLEAN;
BEGIN
  LOOP
    -- Generate a code like REF + 8 random characters
    code := 'REF' || upper(substring(md5(random()::text || clock_timestamp()::text) from 1 for 8));
    
    -- Check if code already exists
    SELECT EXISTS(SELECT 1 FROM users WHERE referral_code = code) INTO exists;
    
    -- If unique, return it
    IF NOT exists THEN
      RETURN code;
    END IF;
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Update all users without a referral code
UPDATE users
SET referral_code = generate_referral_code()
WHERE referral_code IS NULL OR referral_code = '';

-- Display count of updated users
DO $$
DECLARE
  updated_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO updated_count
  FROM users
  WHERE referral_code IS NOT NULL AND referral_code != '';
  
  RAISE NOTICE 'Total users with referral codes: %', updated_count;
END $$;

-- Clean up the function if you don't need it anymore (optional)
-- DROP FUNCTION IF EXISTS generate_referral_code();
