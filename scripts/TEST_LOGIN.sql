-- ═══════════════════════════════════════════════════════════
-- TEST ADMIN LOGIN CREDENTIALS
-- This script checks if your admin credentials are set up correctly
-- ═══════════════════════════════════════════════════════════

-- 1. Check if admin_credentials table exists
SELECT 
  '══════════════════════════════════════' as divider,
  'Step 1: Checking if admin_credentials table exists...' as step;

SELECT 
  CASE 
    WHEN EXISTS (
      SELECT FROM information_schema.tables 
      WHERE table_name = 'admin_credentials'
    )
    THEN '✅ Table EXISTS'
    ELSE '❌ Table DOES NOT EXIST - Run SQL_DIRECT.md or SETUP_ADMIN_COMPLETE.sql'
  END as table_status;

-- 2. Check if admin user exists
SELECT 
  '══════════════════════════════════════' as divider,
  'Step 2: Checking if admin user exists...' as step;

SELECT 
  CASE 
    WHEN EXISTS (
      SELECT FROM admin_credentials 
      WHERE username = 'admin202502'
    )
    THEN '✅ Admin user EXISTS'
    ELSE '❌ Admin user DOES NOT EXIST - Run SQL_DIRECT.md or SETUP_ADMIN_COMPLETE.sql'
  END as admin_status;

-- 3. Check current credentials
SELECT 
  '══════════════════════════════════════' as divider,
  'Step 3: Current admin credentials...' as step;

SELECT 
  username as "Username",
  email as "Email",
  CASE 
    WHEN password_hash = '$2b$10$xAZfhfccemWZ.3qSG2Zpz.KJg15724ESXNnREOIwBNhkVXd9OGiVK'
    THEN '✅ Correct (password: admin@123)'
    ELSE '❌ WRONG HASH - Password has been changed or is incorrect!'
  END as "Password Status",
  created_at as "Created",
  updated_at as "Last Updated"
FROM admin_credentials
WHERE username = 'admin202502';

-- 4. Show what credentials SHOULD be
SELECT 
  '══════════════════════════════════════' as divider,
  'Step 4: What credentials SHOULD be...' as step;

SELECT 
  'admin202502' as "Correct Username",
  'admin@123' as "Correct Password",
  'admin@nextwavesmm.com' as "Correct Email";

-- 5. Final diagnosis
SELECT 
  '══════════════════════════════════════' as divider,
  'Step 5: Final Diagnosis...' as step;

SELECT 
  CASE 
    WHEN NOT EXISTS (
      SELECT FROM information_schema.tables 
      WHERE table_name = 'admin_credentials'
    )
    THEN '❌ PROBLEM: Table does not exist
    
    FIX: Run SQL_DIRECT.md or SETUP_ADMIN_COMPLETE.sql'
    
    WHEN NOT EXISTS (
      SELECT FROM admin_credentials 
      WHERE username = 'admin202502'
    )
    THEN '❌ PROBLEM: Admin user does not exist
    
    FIX: Run SQL_DIRECT.md or SETUP_ADMIN_COMPLETE.sql'
    
    WHEN EXISTS (
      SELECT FROM admin_credentials 
      WHERE username = 'admin202502'
      AND password_hash != '$2b$10$xAZfhfccemWZ.3qSG2Zpz.KJg15724ESXNnREOIwBNhkVXd9OGiVK'
    )
    THEN '❌ PROBLEM: Password hash is incorrect
    
    FIX: Run this SQL to reset password:
    
    UPDATE admin_credentials 
    SET password_hash = ''$2b$10$xAZfhfccemWZ.3qSG2Zpz.KJg15724ESXNnREOIwBNhkVXd9OGiVK'',
        updated_at = NOW()
    WHERE username = ''admin202502'';
    
    Then login with: admin202502 / admin@123'
    
    ELSE '✅ EVERYTHING LOOKS GOOD!
    
    Credentials are correct. Try logging in with:
    Username: admin202502
    Password: admin@123
    
    If still not working:
    1. Clear browser cookies/cache
    2. Try incognito/private mode
    3. Check browser console (F12) for errors
    4. Verify you''re typing credentials EXACTLY'
  END as diagnosis;

-- Success message
SELECT 
  '══════════════════════════════════════' as divider,
  '✅ Diagnostic complete!' as status,
  'Follow the instructions above to fix any issues.' as next_step;
