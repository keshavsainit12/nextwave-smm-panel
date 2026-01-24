-- NextWave Panel Database Schema
-- Create all tables for SMM panel

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- User tiers table (for pricing tiers)
CREATE TABLE IF NOT EXISTS user_tiers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE,
  discount_percentage DECIMAL DEFAULT 0,
  min_order_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Users table (extends auth.users)
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  full_name TEXT,
  role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin', 'reseller')),
  tier_id UUID REFERENCES user_tiers(id),
  balance DECIMAL DEFAULT 0 CHECK (balance >= 0),
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'banned', 'suspended')),
  api_key TEXT UNIQUE,
  referral_code TEXT UNIQUE,
  referred_by UUID REFERENCES users(id),
  total_orders INTEGER DEFAULT 0,
  total_spent DECIMAL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Crypto currencies table (admin managed)
CREATE TABLE IF NOT EXISTS crypto_currencies (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  symbol TEXT NOT NULL,
  network TEXT,
  wallet_address TEXT NOT NULL,
  qr_code_url TEXT,
  minimum_deposit DECIMAL DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- API providers table (external SMM APIs)
CREATE TABLE IF NOT EXISTS api_providers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  api_url TEXT NOT NULL,
  api_key TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  priority INTEGER DEFAULT 0,
  success_rate DECIMAL DEFAULT 100,
  last_checked_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Service categories table
CREATE TABLE IF NOT EXISTS service_categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE,
  icon TEXT,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Services table
CREATE TABLE IF NOT EXISTS services (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  category_id UUID REFERENCES service_categories(id) ON DELETE SET NULL,
  provider_id UUID REFERENCES api_providers(id) ON DELETE SET NULL,
  external_service_id TEXT,
  name TEXT NOT NULL,
  description TEXT,
  platform TEXT,
  base_price DECIMAL NOT NULL,
  min_quantity INTEGER DEFAULT 1,
  max_quantity INTEGER DEFAULT 100000,
  is_active BOOLEAN DEFAULT true,
  has_refill BOOLEAN DEFAULT false,
  refill_days INTEGER DEFAULT 30,
  average_time TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Service failover (multiple providers per service)
CREATE TABLE IF NOT EXISTS service_providers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  service_id UUID REFERENCES services(id) ON DELETE CASCADE,
  provider_id UUID REFERENCES api_providers(id) ON DELETE CASCADE,
  priority INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(service_id, provider_id)
);

-- Orders table
CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  service_id UUID REFERENCES services(id) ON DELETE SET NULL,
  external_order_id TEXT,
  link TEXT NOT NULL,
  quantity INTEGER NOT NULL,
  price DECIMAL NOT NULL,
  start_count INTEGER DEFAULT 0,
  remains INTEGER DEFAULT 0,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'partial', 'canceled', 'refunding', 'refunded')),
  can_refill BOOLEAN DEFAULT false,
  refill_count INTEGER DEFAULT 0,
  last_refill_at TIMESTAMP WITH TIME ZONE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Transactions table (all financial transactions)
CREATE TABLE IF NOT EXISTS transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  order_id UUID REFERENCES orders(id) ON DELETE SET NULL,
  type TEXT NOT NULL CHECK (type IN ('deposit', 'order', 'refund', 'referral', 'admin_adjustment')),
  amount DECIMAL NOT NULL,
  balance_before DECIMAL NOT NULL,
  balance_after DECIMAL NOT NULL,
  payment_method TEXT,
  payment_id TEXT,
  crypto_currency_id UUID REFERENCES crypto_currencies(id),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed', 'canceled')),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Crypto deposits table (pending crypto payments)
CREATE TABLE IF NOT EXISTS crypto_deposits (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  transaction_id UUID REFERENCES transactions(id) ON DELETE CASCADE,
  crypto_currency_id UUID REFERENCES crypto_currencies(id),
  amount DECIMAL NOT NULL,
  crypto_amount TEXT,
  transaction_hash TEXT,
  screenshot_url TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  admin_notes TEXT,
  reviewed_by UUID REFERENCES users(id),
  reviewed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Support tickets table
CREATE TABLE IF NOT EXISTS support_tickets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  order_id UUID REFERENCES orders(id) ON DELETE SET NULL,
  subject TEXT NOT NULL,
  status TEXT DEFAULT 'open' CHECK (status IN ('open', 'replied', 'closed')),
  priority TEXT DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Ticket messages table
CREATE TABLE IF NOT EXISTS ticket_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  ticket_id UUID REFERENCES support_tickets(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  is_admin BOOLEAN DEFAULT false,
  is_internal BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Coupons table
CREATE TABLE IF NOT EXISTS coupons (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code TEXT NOT NULL UNIQUE,
  discount_type TEXT NOT NULL CHECK (discount_type IN ('percentage', 'fixed')),
  discount_value DECIMAL NOT NULL,
  min_order_amount DECIMAL DEFAULT 0,
  max_uses INTEGER,
  used_count INTEGER DEFAULT 0,
  valid_for TEXT DEFAULT 'all' CHECK (valid_for IN ('all', 'new_users')),
  expires_at TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Coupon usage table
CREATE TABLE IF NOT EXISTS coupon_usage (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  coupon_id UUID REFERENCES coupons(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  discount_amount DECIMAL NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(coupon_id, user_id, order_id)
);

-- Referral earnings table
CREATE TABLE IF NOT EXISTS referral_earnings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  referrer_id UUID REFERENCES users(id) ON DELETE CASCADE,
  referred_id UUID REFERENCES users(id) ON DELETE CASCADE,
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  commission_amount DECIMAL NOT NULL,
  commission_percentage DECIMAL NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- System settings table
CREATE TABLE IF NOT EXISTS system_settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  description TEXT,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Activity logs table (for admin actions)
CREATE TABLE IF NOT EXISTS activity_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  entity_type TEXT,
  entity_id UUID,
  details JSONB,
  ip_address TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default user tiers
INSERT INTO user_tiers (name, discount_percentage, min_order_count) VALUES
  ('Regular', 0, 0),
  ('Bronze', 5, 10),
  ('Silver', 10, 50),
  ('Gold', 15, 100),
  ('Platinum', 20, 500)
ON CONFLICT (name) DO NOTHING;

-- Insert default service categories
INSERT INTO service_categories (name, icon, display_order) VALUES
  ('Instagram', 'instagram', 1),
  ('YouTube', 'youtube', 2),
  ('Facebook', 'facebook', 3),
  ('TikTok', 'tiktok', 4),
  ('Twitter', 'twitter', 5),
  ('Telegram', 'telegram', 6)
ON CONFLICT (name) DO NOTHING;

-- Insert default system settings
INSERT INTO system_settings (key, value, description) VALUES
  ('site_name', 'NextWave Panel', 'Website name'),
  ('currency_symbol', '$', 'Currency symbol'),
  ('min_deposit', '10', 'Minimum deposit amount'),
  ('min_order', '1', 'Minimum order amount'),
  ('global_markup', '20', 'Global markup percentage'),
  ('referral_enabled', 'true', 'Enable referral system'),
  ('referral_commission', '5', 'Referral commission percentage'),
  ('admin_secret_path', '/admin-panel-2024', 'Admin panel secret URL path')
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;
