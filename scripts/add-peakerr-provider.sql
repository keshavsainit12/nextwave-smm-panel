-- Add Peakerr Provider
-- URL: https://peakerr.com/api/v2
-- API Key: d70c246dda5cd8c87626e6a5d225d2b8

-- First, make sure we have the required columns
-- (This is from fix-api-provider-sync.sql)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'api_providers' AND column_name = 'auth_mode') THEN
        ALTER TABLE api_providers ADD COLUMN auth_mode TEXT DEFAULT 'key';
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'api_providers' AND column_name = 'last_sync') THEN
        ALTER TABLE api_providers ADD COLUMN last_sync TIMESTAMP WITH TIME ZONE;
    END IF;
END $$;

-- Insert Peakerr provider (or update if exists by name)
INSERT INTO api_providers (name, api_url, api_key, is_active, priority, auth_mode)
VALUES (
    'Peakerr',
    'https://peakerr.com/api/v2',
    'd70c246dda5cd8c87626e6a5d225d2b8',
    true,
    1,
    'key'
)
ON CONFLICT (name) 
DO UPDATE SET 
    api_url = EXCLUDED.api_url,
    api_key = EXCLUDED.api_key,
    is_active = EXCLUDED.is_active,
    priority = EXCLUDED.priority,
    auth_mode = EXCLUDED.auth_mode,
    updated_at = NOW();

-- Note: This assumes api_providers has a unique constraint on name
-- If not, you may get duplicates. Check with:
-- SELECT * FROM api_providers WHERE name = 'Peakerr';
