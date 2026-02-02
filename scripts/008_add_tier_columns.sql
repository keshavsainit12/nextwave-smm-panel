-- Add tier and price_multiplier columns to users table if they don't exist
ALTER TABLE users ADD COLUMN IF NOT EXISTS tier INTEGER DEFAULT 1;
ALTER TABLE users ADD COLUMN IF NOT EXISTS price_multiplier DECIMAL DEFAULT 3.0;

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_users_tier ON users(tier);
CREATE INDEX IF NOT EXISTS idx_users_total_spent ON users(total_spent);
