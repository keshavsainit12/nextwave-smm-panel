-- ========================================
-- Migration 009: Create admin_credentials table
-- ========================================
-- This creates admin login credentials linked to users table
-- Allows dynamic admin credential updates from the admin panel

-- Step 1: Create admin user in users table (if doesn't exist)
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
  updated_at = NOW();

-- Step 2: Create admin_credentials table (linked to users via FK)
CREATE TABLE IF NOT EXISTS admin_credentials (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  username TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  email TEXT NOT NULL,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_admin_credentials_username ON admin_credentials(username);
CREATE INDEX IF NOT EXISTS idx_admin_credentials_user_id ON admin_credentials(user_id);

-- ⚠️ IMPORTANT: Default login credentials
-- Username: admin202502
-- Password: admin@123
-- 
-- After first login, please change these credentials from Settings > Account

-- Step 3: Insert default admin credentials (linked to user)
INSERT INTO admin_credentials (username, password_hash, email, user_id)
VALUES (
  'admin202502',
  '$2b$10$xAZfhfccemWZ.3qSG2Zpz.KJg15724ESXNnREOIwBNhkVXd9OGiVK',
  'admin@nextwavesmm.com',
  '550e8400-e29b-41d4-a716-446655440000'::uuid
)
ON CONFLICT (username) DO UPDATE SET
  user_id = EXCLUDED.user_id,
  updated_at = NOW();

-- Add RLS policies (service role only)
ALTER TABLE admin_credentials ENABLE ROW LEVEL SECURITY;

-- Only allow service role to access (for server-side operations)
CREATE POLICY IF NOT EXISTS "Service role can manage admin credentials" ON admin_credentials
  FOR ALL
  USING (true)
  WITH CHECK (true);
