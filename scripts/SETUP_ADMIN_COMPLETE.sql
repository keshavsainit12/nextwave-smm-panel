-- ================================================================
-- COMPLETE ADMIN SETUP - ONE SCRIPT FOR EVERYTHING
-- ================================================================
-- This script will:
-- 1. Create admin_credentials table (if doesn't exist)
-- 2. Create/update admin user with correct password
-- 3. Show success confirmation
-- 
-- ✅ Safe to run multiple times
-- ✅ Works on fresh database
-- ✅ Works on existing database
-- ================================================================

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Step 1: Create the admin_credentials table
CREATE TABLE IF NOT EXISTS admin_credentials (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  username TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  email TEXT NOT NULL,
  user_id TEXT NOT NULL DEFAULT '00000000-0000-0000-0000-000000000001',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Step 2: Create index on username for fast lookups
CREATE INDEX IF NOT EXISTS idx_admin_credentials_username ON admin_credentials(username);

-- Step 3: Insert or update admin user
-- Password: admin@123
-- Bcrypt hash: $2b$10$xAZfhfccemWZ.3qSG2Zpz.KJg15724ESXNnREOIwBNhkVXd9OGiVK
INSERT INTO admin_credentials (
  username, 
  password_hash, 
  email, 
  user_id,
  created_at,
  updated_at
)
VALUES (
  'admin202502',
  '$2b$10$xAZfhfccemWZ.3qSG2Zpz.KJg15724ESXNnREOIwBNhkVXd9OGiVK',
  'admin@nextwavesmm.com',
  '00000000-0000-0000-0000-000000000001',
  NOW(),
  NOW()
)
ON CONFLICT (username) DO UPDATE SET
  password_hash = EXCLUDED.password_hash,
  updated_at = NOW();

-- Step 4: Show confirmation message
SELECT 
  '✅ Admin credentials table created/verified' as status;

SELECT 
  '✅ Admin user created/updated successfully' as status;

-- Step 5: Display the credentials for easy reference
SELECT 
  '===========================================' as separator;

SELECT 
  '✅ SETUP COMPLETE - You can now login with:' as message;

SELECT 
  '===========================================' as separator;

SELECT 
  'Username: admin202502' as credential_1,
  'Password: admin@123' as credential_2;

SELECT 
  '===========================================' as separator;

SELECT 
  '⚠️  IMPORTANT: Change password after first login!' as warning,
  'Go to: Settings > Account' as instruction;

SELECT 
  '===========================================' as separator;

-- Step 6: Verify the admin user exists
SELECT 
  username as "Current Username",
  email as "Email",
  user_id as "User ID",
  created_at as "Created At",
  updated_at as "Last Updated"
FROM admin_credentials
WHERE username = 'admin202502';
