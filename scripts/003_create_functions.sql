-- Database Functions for NextWave Panel

-- Function to create user profile on signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  default_tier_id UUID;
  new_referral_code TEXT;
BEGIN
  -- Get default tier
  SELECT id INTO default_tier_id FROM user_tiers WHERE name = 'Regular' LIMIT 1;
  
  -- Generate referral code
  new_referral_code := 'REF' || UPPER(SUBSTRING(MD5(NEW.id::text) FROM 1 FOR 8));
  
  -- Insert user profile
  INSERT INTO users (id, email, full_name, tier_id, referral_code, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NULL),
    default_tier_id,
    new_referral_code,
    COALESCE(NEW.raw_user_meta_data->>'role', 'user')
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for new user creation
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();

-- Function to update user updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add triggers for updated_at
DROP TRIGGER IF EXISTS update_users_updated_at ON users;
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_crypto_currencies_updated_at ON crypto_currencies;
CREATE TRIGGER update_crypto_currencies_updated_at BEFORE UPDATE ON crypto_currencies
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_api_providers_updated_at ON api_providers;
CREATE TRIGGER update_api_providers_updated_at BEFORE UPDATE ON api_providers
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_services_updated_at ON services;
CREATE TRIGGER update_services_updated_at BEFORE UPDATE ON services
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_orders_updated_at ON orders;
CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON orders
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_support_tickets_updated_at ON support_tickets;
CREATE TRIGGER update_support_tickets_updated_at BEFORE UPDATE ON support_tickets
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to calculate user tier based on total orders
CREATE OR REPLACE FUNCTION update_user_tier()
RETURNS TRIGGER AS $$
DECLARE
  new_tier_id UUID;
BEGIN
  SELECT id INTO new_tier_id
  FROM user_tiers
  WHERE NEW.total_orders >= min_order_count
  ORDER BY min_order_count DESC
  LIMIT 1;
  
  IF new_tier_id IS NOT NULL AND new_tier_id != NEW.tier_id THEN
    NEW.tier_id := new_tier_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-update tier
DROP TRIGGER IF EXISTS update_tier_on_order_count ON users;
CREATE TRIGGER update_tier_on_order_count
  BEFORE UPDATE OF total_orders ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_user_tier();
