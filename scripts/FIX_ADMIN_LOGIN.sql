-- ============================================================================
-- FIX ADMIN LOGIN - Update Password Hash
-- ============================================================================
-- 
-- ⚠️  RUN THIS IF YOU'RE GETTING "INVALID CREDENTIALS" ERROR
--
-- This script fixes the admin login by updating the password hash
-- to the correct bcrypt hash for password: admin@123
--
-- IMPORTANT: Run this SQL in your Supabase SQL Editor
--
-- ============================================================================

-- Step 1: Check if admin_credentials table exists
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'admin_credentials') THEN
        RAISE EXCEPTION 'Table admin_credentials does not exist! Please run migration 009_create_admin_credentials.sql first';
    END IF;
END $$;

-- Step 2: Update the admin password hash to correct value
UPDATE admin_credentials 
SET 
    password_hash = '$2b$10$xAZfhfccemWZ.3qSG2Zpz.KJg15724ESXNnREOIwBNhkVXd9OGiVK',
    updated_at = NOW()
WHERE username = 'admin202502';

-- Step 3: Verify the update
DO $$ 
DECLARE
    admin_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO admin_count FROM admin_credentials WHERE username = 'admin202502';
    
    IF admin_count = 0 THEN
        RAISE NOTICE '❌ ERROR: No admin user found with username "admin202502"';
        RAISE NOTICE 'Creating admin user now...';
        
        INSERT INTO admin_credentials (username, password_hash, email, user_id)
        VALUES (
            'admin202502',
            '$2b$10$xAZfhfccemWZ.3qSG2Zpz.KJg15724ESXNnREOIwBNhkVXd9OGiVK',
            'admin@nextwavesmm.com',
            '00000000-0000-0000-0000-000000000001'
        );
        
        RAISE NOTICE '✅ Admin user created successfully';
    ELSE
        RAISE NOTICE '✅ Admin password updated successfully';
    END IF;
    
    RAISE NOTICE '';
    RAISE NOTICE '===========================================';
    RAISE NOTICE '✅ FIX COMPLETE - You can now login with:';
    RAISE NOTICE '===========================================';
    RAISE NOTICE 'Username: admin202502';
    RAISE NOTICE 'Password: admin@123';
    RAISE NOTICE '';
    RAISE NOTICE '⚠️  IMPORTANT: Change your password after login!';
    RAISE NOTICE 'Go to: Settings > Account';
    RAISE NOTICE '===========================================';
END $$;

-- Step 4: Display current admin credentials (for verification)
SELECT 
    username,
    email,
    user_id,
    created_at,
    updated_at,
    '✅ Ready to login!' as status
FROM admin_credentials 
WHERE username = 'admin202502';
