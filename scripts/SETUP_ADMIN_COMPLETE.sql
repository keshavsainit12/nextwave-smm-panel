-- ================================================================
-- COMPLETE ADMIN SETUP - LINKED TO USERS TABLE
-- ================================================================
-- This script will:
-- 1. Create admin user in users table (main system)
-- 2. Create admin_credentials table with FK to users
-- 3. Create/update admin credentials (linked)
-- 4. Show success confirmation with verification
-- 
-- ✅ Safe to run multiple times
-- ✅ Works on fresh database
-- ✅ Works on existing database
-- ✅ Links admin to main user system
-- ================================================================

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ========================================
-- STEP 1: Create admin user in users table
-- ========================================
INSERT INTO users (
  id,
  email,
  full_name,
  role,
  balance,
  status,
  created_at,
  updated_at
) VALUES (
  '550e8400-e29b-41d4-a716-446655440000'::uuid,
  'admin@nextwavesmm.com',
  'Admin User',
  'admin',
  10000.00,
  'active',
  NOW(),
  NOW()
) ON CONFLICT (email) DO UPDATE SET
  role = 'admin',
  full_name = 'Admin User',
  updated_at = NOW();

-- ========================================
-- STEP 2: Create admin_credentials table (linked to users)
-- ========================================
CREATE TABLE IF NOT EXISTS admin_credentials (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  username TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  email TEXT NOT NULL,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_admin_credentials_username ON admin_credentials(username);
CREATE INDEX IF NOT EXISTS idx_admin_credentials_user_id ON admin_credentials(user_id);

-- ========================================
-- STEP 3: Insert/Update admin credentials (linked to user)
-- ========================================
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
  '550e8400-e29b-41d4-a716-446655440000'::uuid,
  NOW(),
  NOW()
)
ON CONFLICT (username) DO UPDATE SET
  password_hash = EXCLUDED.password_hash,
  email = EXCLUDED.email,
  user_id = EXCLUDED.user_id,
  updated_at = NOW();

-- ========================================
-- STEP 4: VERIFICATION & SUCCESS MESSAGE
-- ========================================

-- Verify admin user in users table
SELECT 
  '✅ Admin user in users table:' as status,
  id,
  email,
  role,
  balance,
  status
FROM users 
WHERE email = 'admin@nextwavesmm.com';

-- Verify admin credentials
SELECT 
  '✅ Admin credentials created:' as status,
  username,
  email,
  user_id
FROM admin_credentials
WHERE username = 'admin202502';

-- Verify link between tables
SELECT 
  '✅ Admin linked to user (JOIN):' as status,
  ac.username as admin_username,
  ac.email as admin_email,
  u.id as user_id,
  u.role as user_role,
  u.balance as user_balance,
  'Can access both panels!' as note
FROM admin_credentials ac
JOIN users u ON ac.user_id = u.id
WHERE ac.username = 'admin202502';

-- Success message
SELECT 
  '===========================================' as separator;

SELECT 
  '✅ SETUP COMPLETE - You can now login with:' as message;

SELECT 
  '===========================================' as separator;

SELECT 
  'Admin Panel Login:' as panel,
  '  URL: /admin-login' as url,
  '  Username: admin202502' as username,
  '  Password: admin@123' as password;

SELECT 
  '===========================================' as separator;

SELECT 
  'User Dashboard Login:' as dashboard,
  '  URL: /auth/login' as url,
  '  Email: admin@nextwavesmm.com' as email,
  '  (Set password in Supabase Auth)' as note;

SELECT 
  '===========================================' as separator;

SELECT 
  '⚠️  IMPORTANT: Change password after first login!' as warning,
  'Go to: Settings > Account' as instruction;

SELECT 
  '===========================================' as separator;
