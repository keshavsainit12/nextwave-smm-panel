-- Add currency support to users table
-- This allows each user to have their own preferred currency

-- Add currency column with default USD
ALTER TABLE users ADD COLUMN IF NOT EXISTS currency TEXT DEFAULT 'USD';

-- Add timestamp to track when currency was last changed
ALTER TABLE users ADD COLUMN IF NOT EXISTS currency_updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Add check constraint for valid currencies
ALTER TABLE users ADD CONSTRAINT users_currency_check 
CHECK (currency IN ('USD', 'EUR', 'GBP', 'INR', 'PKR', 'AED'));

-- Create index for currency queries
CREATE INDEX IF NOT EXISTS idx_users_currency ON users(currency);

-- Optional: Create audit table for currency changes
CREATE TABLE IF NOT EXISTS currency_changes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  old_currency TEXT NOT NULL,
  new_currency TEXT NOT NULL,
  changed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_currency_changes_user_id ON currency_changes(user_id);
CREATE INDEX IF NOT EXISTS idx_currency_changes_changed_at ON currency_changes(changed_at);

-- Add comment for documentation
COMMENT ON COLUMN users.currency IS 'User preferred currency for displaying prices';
COMMENT ON COLUMN users.currency_updated_at IS 'Timestamp of last currency change';
COMMENT ON TABLE currency_changes IS 'Audit log of user currency preference changes';
