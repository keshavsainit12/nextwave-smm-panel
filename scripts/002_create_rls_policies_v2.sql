-- Row Level Security Policies for NextWave Panel (Updated Version)
-- This script safely recreates all RLS policies

-- Drop all existing policies first to avoid conflicts
DO $$ 
DECLARE
    r RECORD;
BEGIN
    -- Drop all existing policies on all tables
    FOR r IN (
        SELECT schemaname, tablename, policyname 
        FROM pg_policies 
        WHERE schemaname = 'public'
    ) LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON %I.%I', r.policyname, r.schemaname, r.tablename);
    END LOOP;
END $$;

-- Drop and recreate the is_admin function
DROP FUNCTION IF EXISTS is_admin();
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM users
    WHERE id = auth.uid() AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE crypto_currencies ENABLE ROW LEVEL SECURITY;
ALTER TABLE api_providers ENABLE ROW LEVEL SECURITY;
ALTER TABLE service_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE service_providers ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE crypto_deposits ENABLE ROW LEVEL SECURITY;
ALTER TABLE support_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE ticket_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE coupon_usage ENABLE ROW LEVEL SECURITY;
ALTER TABLE referral_earnings ENABLE ROW LEVEL SECURITY;
ALTER TABLE system_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_tiers ENABLE ROW LEVEL SECURITY;

-- Users table policies
CREATE POLICY "users_select_own" ON users FOR SELECT USING (auth.uid() = id OR is_admin());
CREATE POLICY "users_update_own" ON users FOR UPDATE USING (auth.uid() = id OR is_admin());
CREATE POLICY "users_insert_signup" ON users FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "users_delete_admin" ON users FOR DELETE USING (is_admin());

-- Crypto currencies policies
CREATE POLICY "crypto_select_active" ON crypto_currencies FOR SELECT USING (is_active = true OR is_admin());
CREATE POLICY "crypto_all_admin" ON crypto_currencies FOR ALL USING (is_admin());

-- API providers policies
CREATE POLICY "api_providers_all_admin" ON api_providers FOR ALL USING (is_admin());

-- Service categories policies
CREATE POLICY "categories_select_all" ON service_categories FOR SELECT USING (true);
CREATE POLICY "categories_all_admin" ON service_categories FOR ALL USING (is_admin());

-- Services policies
CREATE POLICY "services_select_active" ON services FOR SELECT USING (is_active = true OR is_admin());
CREATE POLICY "services_all_admin" ON services FOR ALL USING (is_admin());

-- Service providers policies
CREATE POLICY "service_providers_all_admin" ON service_providers FOR ALL USING (is_admin());

-- Orders policies
CREATE POLICY "orders_select_own" ON orders FOR SELECT USING (auth.uid() = user_id OR is_admin());
CREATE POLICY "orders_insert_own" ON orders FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "orders_all_admin" ON orders FOR ALL USING (is_admin());

-- Transactions policies
CREATE POLICY "transactions_select_own" ON transactions FOR SELECT USING (auth.uid() = user_id OR is_admin());
CREATE POLICY "transactions_insert_system" ON transactions FOR INSERT WITH CHECK (true);
CREATE POLICY "transactions_all_admin" ON transactions FOR ALL USING (is_admin());

-- Crypto deposits policies
CREATE POLICY "deposits_select_own" ON crypto_deposits FOR SELECT USING (auth.uid() = user_id OR is_admin());
CREATE POLICY "deposits_insert_own" ON crypto_deposits FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "deposits_all_admin" ON crypto_deposits FOR ALL USING (is_admin());

-- Support tickets policies
CREATE POLICY "tickets_select_own" ON support_tickets FOR SELECT USING (auth.uid() = user_id OR is_admin());
CREATE POLICY "tickets_insert_own" ON support_tickets FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "tickets_update_own" ON support_tickets FOR UPDATE USING (auth.uid() = user_id OR is_admin());
CREATE POLICY "tickets_all_admin" ON support_tickets FOR ALL USING (is_admin());

-- Ticket messages policies
CREATE POLICY "messages_select_own" ON ticket_messages FOR SELECT USING (
  auth.uid() = user_id OR 
  is_admin() OR 
  EXISTS (SELECT 1 FROM support_tickets WHERE id = ticket_id AND user_id = auth.uid())
);
CREATE POLICY "messages_insert_own" ON ticket_messages FOR INSERT WITH CHECK (
  auth.uid() = user_id OR is_admin()
);

-- Coupons policies
CREATE POLICY "coupons_select_active" ON coupons FOR SELECT USING (is_active = true OR is_admin());
CREATE POLICY "coupons_all_admin" ON coupons FOR ALL USING (is_admin());

-- Coupon usage policies
CREATE POLICY "coupon_usage_select_own" ON coupon_usage FOR SELECT USING (auth.uid() = user_id OR is_admin());
CREATE POLICY "coupon_usage_insert_own" ON coupon_usage FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Referral earnings policies
CREATE POLICY "referrals_select_own" ON referral_earnings FOR SELECT USING (auth.uid() = referrer_id OR is_admin());
CREATE POLICY "referrals_insert_system" ON referral_earnings FOR INSERT WITH CHECK (true);

-- System settings policies
CREATE POLICY "settings_select_all" ON system_settings FOR SELECT USING (true);
CREATE POLICY "settings_all_admin" ON system_settings FOR ALL USING (is_admin());

-- Activity logs policies
CREATE POLICY "logs_select_admin" ON activity_logs FOR SELECT USING (is_admin());
CREATE POLICY "logs_insert_system" ON activity_logs FOR INSERT WITH CHECK (true);

-- User tiers policies
CREATE POLICY "tiers_select_all" ON user_tiers FOR SELECT USING (true);
CREATE POLICY "tiers_all_admin" ON user_tiers FOR ALL USING (is_admin());
