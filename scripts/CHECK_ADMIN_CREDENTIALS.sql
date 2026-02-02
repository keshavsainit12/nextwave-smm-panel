-- ============================================================================
-- CHECK ADMIN CREDENTIALS
-- ============================================================================
--
-- Run this SQL in Supabase SQL Editor to see your admin credentials
--
-- ⚠️  NOTE: Password is stored as bcrypt hash (you can't see plaintext)
--
-- ============================================================================

-- Query 1: Show all admin credentials
SELECT 
    '👤 ADMIN CREDENTIALS' as info,
    username as "Username",
    email as "Email",
    user_id as "User ID",
    created_at as "Created",
    updated_at as "Last Updated"
FROM admin_credentials
ORDER BY created_at DESC;

-- ============================================================================

-- Query 2: Show password hash (for verification)
SELECT 
    '🔐 PASSWORD HASH' as info,
    username as "Username",
    substring(password_hash, 1, 20) || '...' as "Hash Preview",
    length(password_hash) as "Hash Length"
FROM admin_credentials
ORDER BY created_at DESC;

-- ============================================================================

-- Query 3: Check if default credentials exist
SELECT 
    CASE 
        WHEN username = 'admin202502' THEN '✅ Default username found: admin202502'
        ELSE '⚠️  Custom username: ' || username
    END as "Username Status",
    CASE 
        WHEN password_hash = '$2b$10$xAZfhfccemWZ.3qSG2Zpz.KJg15724ESXNnREOIwBNhkVXd9OGiVK' 
        THEN '⚠️  Using default password: admin@123'
        ELSE '✅ Custom password set (secure)'
    END as "Password Status"
FROM admin_credentials;

-- ============================================================================

-- Query 4: Count total admin accounts
SELECT 
    '📊 TOTAL ADMINS' as info,
    COUNT(*) as "Count",
    string_agg(username, ', ') as "Usernames"
FROM admin_credentials;

-- ============================================================================
-- ⚠️  SECURITY NOTE
-- ============================================================================
--
-- The password is stored as a bcrypt hash. You CANNOT see the actual password.
-- 
-- If the hash is:
--   $2b$10$xAZfhfccemWZ.3qSG2Zpz.KJg15724ESXNnREOIwBNhkVXd9OGiVK
-- 
-- Then the password is the DEFAULT: admin@123
--
-- If the hash is different, the admin has changed the password.
-- You cannot recover it - you must reset it using FIX_ADMIN_LOGIN.sql
--
-- ============================================================================

-- Query 5: Full admin information (all fields)
SELECT * FROM admin_credentials;
