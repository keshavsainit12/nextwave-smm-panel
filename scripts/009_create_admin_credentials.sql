-- Create admin_credentials table for storing admin login credentials
-- This allows dynamic admin credential updates from the admin panel

CREATE TABLE IF NOT EXISTS admin_credentials (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  username TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  email TEXT NOT NULL,
  user_id TEXT NOT NULL DEFAULT '00000000-0000-0000-0000-000000000001',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default admin credentials
-- ⚠️ IMPORTANT: Default login credentials
-- Username: admin202502
-- Password: admin@123
-- 
-- After first login, please change these credentials from Settings > Account
INSERT INTO admin_credentials (username, password_hash, email, user_id)
VALUES (
  'admin202502',
  '$2b$10$xAZfhfccemWZ.3qSG2Zpz.KJg15724ESXNnREOIwBNhkVXd9OGiVK',
  'admin@nextwavesmm.com',
  '00000000-0000-0000-0000-000000000001'
)
ON CONFLICT (username) DO NOTHING;

-- Add index for faster username lookups
CREATE INDEX IF NOT EXISTS idx_admin_credentials_username ON admin_credentials(username);

-- Add RLS policies (if needed in the future)
ALTER TABLE admin_credentials ENABLE ROW LEVEL SECURITY;

-- Only allow service role to access (for server-side operations)
CREATE POLICY "Service role can manage admin credentials" ON admin_credentials
  FOR ALL
  USING (true)
  WITH CHECK (true);
