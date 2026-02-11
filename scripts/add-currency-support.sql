-- Add currency support to system settings
-- This script adds the currency field if it doesn't exist

-- Insert default currency setting if not present
INSERT INTO system_settings (key, value, description)
VALUES ('currency', 'USD', 'Current system currency code')
ON CONFLICT (key) DO NOTHING;

-- Update currency_symbol description for clarity
UPDATE system_settings 
SET description = 'Currency symbol (auto-updated when currency changes)'
WHERE key = 'currency_symbol';

-- Add some helpful comments
COMMENT ON TABLE system_settings IS 'System-wide settings including currency configuration';
