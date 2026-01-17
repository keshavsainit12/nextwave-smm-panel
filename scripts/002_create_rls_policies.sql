-- Row Level Security Policies for NextWave Panel

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

-- Helper function to check if user is admin
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM users
    WHERE id = auth.uid() AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Updated users table policies to allow signup trigger to work
-- Users table policies
CREATE POLICY "Users can view own profile" ON users FOR SELECT USING (auth.uid() = id OR is_admin());
CREATE POLICY "Users can update own profile" ON users FOR UPDATE USING (auth.uid() = id OR is_admin());
CREATE POLICY "Users can be created on signup" ON users FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Service role can insert users" ON users FOR INSERT TO service_role WITH CHECK (true);
CREATE POLICY "Admins can delete users" ON users FOR DELETE USING (is_admin());

-- Crypto currencies policies (public read, admin write)
CREATE POLICY "Anyone can view active crypto currencies" ON crypto_currencies FOR SELECT USING (is_active = true OR is_admin());
CREATE POLICY "Admins can manage crypto currencies" ON crypto_currencies FOR ALL USING (is_admin());

-- API providers policies (admin only)
CREATE POLICY "Admins can manage API providers" ON api_providers FOR ALL USING (is_admin());

-- Service categories policies (public read, admin write)
CREATE POLICY "Anyone can view service categories" ON service_categories FOR SELECT USING (true);
CREATE POLICY "Admins can manage service categories" ON service_categories FOR ALL USING (is_admin());

-- Services policies (public read active services, admin write)
CREATE POLICY "Anyone can view active services" ON services FOR SELECT USING (is_active = true OR is_admin());
CREATE POLICY "Admins can manage services" ON services FOR ALL USING (is_admin());

-- Service providers policies (admin only)
CREATE POLICY "Admins can manage service providers" ON service_providers FOR ALL USING (is_admin());

-- Orders policies
CREATE POLICY "Users can view own orders" ON orders FOR SELECT USING (auth.uid() = user_id OR is_admin());
CREATE POLICY "Users can create orders" ON orders FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admins can manage all orders" ON orders FOR ALL USING (is_admin());

-- Transactions policies
CREATE POLICY "Users can view own transactions" ON transactions FOR SELECT USING (auth.uid() = user_id OR is_admin());
CREATE POLICY "System can create transactions" ON transactions FOR INSERT WITH CHECK (true);
CREATE POLICY "Admins can manage transactions" ON transactions FOR ALL USING (is_admin());

-- Crypto deposits policies
CREATE POLICY "Users can view own deposits" ON crypto_deposits FOR SELECT USING (auth.uid() = user_id OR is_admin());
CREATE POLICY "Users can create deposits" ON crypto_deposits FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admins can manage deposits" ON crypto_deposits FOR ALL USING (is_admin());

-- Support tickets policies
CREATE POLICY "Users can view own tickets" ON support_tickets FOR SELECT USING (auth.uid() = user_id OR is_admin());
CREATE POLICY "Users can create tickets" ON support_tickets FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own tickets" ON support_tickets FOR UPDATE USING (auth.uid() = user_id OR is_admin());
CREATE POLICY "Admins can manage all tickets" ON support_tickets FOR ALL USING (is_admin());

-- Ticket messages policies
CREATE POLICY "Users can view messages of own tickets" ON ticket_messages FOR SELECT USING (
  auth.uid() = user_id OR 
  is_admin() OR 
  EXISTS (SELECT 1 FROM support_tickets WHERE id = ticket_id AND user_id = auth.uid())
);
CREATE POLICY "Users can create messages" ON ticket_messages FOR INSERT WITH CHECK (
  auth.uid() = user_id OR is_admin()
);

-- Coupons policies
CREATE POLICY "Anyone can view active coupons" ON coupons FOR SELECT USING (is_active = true OR is_admin());
CREATE POLICY "Admins can manage coupons" ON coupons FOR ALL USING (is_admin());

-- Coupon usage policies
CREATE POLICY "Users can view own coupon usage" ON coupon_usage FOR SELECT USING (auth.uid() = user_id OR is_admin());
CREATE POLICY "System can record coupon usage" ON coupon_usage FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Referral earnings policies
CREATE POLICY "Users can view own referral earnings" ON referral_earnings FOR SELECT USING (auth.uid() = referrer_id OR is_admin());
CREATE POLICY "System can create referral earnings" ON referral_earnings FOR INSERT WITH CHECK (true);

-- System settings policies
CREATE POLICY "Anyone can view settings" ON system_settings FOR SELECT USING (true);
CREATE POLICY "Admins can manage settings" ON system_settings FOR ALL USING (is_admin());

-- Activity logs policies (admin only)
CREATE POLICY "Admins can view activity logs" ON activity_logs FOR SELECT USING (is_admin());
CREATE POLICY "System can create activity logs" ON activity_logs FOR INSERT WITH CHECK (true);

-- User tiers policies (public read)
CREATE POLICY "Anyone can view user tiers" ON user_tiers FOR SELECT USING (true);
CREATE POLICY "Admins can manage user tiers" ON user_tiers FOR ALL USING (is_admin());
