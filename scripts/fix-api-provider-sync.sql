-- Fix API Provider and Service Sync Issues
-- Run this SQL in your database

-- 1. Add missing columns to services table if they don't exist
DO $$ 
BEGIN
    -- Add provider_price column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'services' AND column_name = 'provider_price') THEN
        ALTER TABLE services ADD COLUMN provider_price DECIMAL DEFAULT 0;
    END IF;

    -- Add cancel column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'services' AND column_name = 'cancel') THEN
        ALTER TABLE services ADD COLUMN cancel BOOLEAN DEFAULT false;
    END IF;

    -- Add can_cancel column (if different from cancel)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'services' AND column_name = 'can_cancel') THEN
        ALTER TABLE services ADD COLUMN can_cancel BOOLEAN DEFAULT false;
    END IF;

    -- Add dripfeed column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'services' AND column_name = 'dripfeed') THEN
        ALTER TABLE services ADD COLUMN dripfeed BOOLEAN DEFAULT false;
    END IF;

    -- Add auth_mode column to api_providers (for Bearer vs Key auth)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'api_providers' AND column_name = 'auth_mode') THEN
        ALTER TABLE api_providers ADD COLUMN auth_mode TEXT DEFAULT 'key';
    END IF;

    -- Add last_sync column to api_providers
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'api_providers' AND column_name = 'last_sync') THEN
        ALTER TABLE api_providers ADD COLUMN last_sync TIMESTAMP WITH TIME ZONE;
    END IF;
END $$;

-- 2. Create unique constraint for service sync (if not exists)
-- This prevents duplicate services from same provider
DO $$
BEGIN
    -- Drop existing constraint if it exists with wrong definition
    IF EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'services_external_provider_unique') THEN
        ALTER TABLE services DROP CONSTRAINT services_external_provider_unique;
    END IF;

    -- Add proper unique constraint
    -- Only apply if both external_service_id and provider_id are not null
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'services_provider_external_id_key'
    ) THEN
        -- Create unique index that handles nulls properly
        CREATE UNIQUE INDEX services_provider_external_id_key 
        ON services (provider_id, external_service_id)
        WHERE provider_id IS NOT NULL AND external_service_id IS NOT NULL;
    END IF;
END $$;

-- 3. Update existing services to have proper provider_price if missing
UPDATE services 
SET provider_price = base_price / 3.0
WHERE provider_price IS NULL OR provider_price = 0;

-- 4. Verify the changes
SELECT 
    table_name,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_name IN ('services', 'api_providers')
AND column_name IN ('provider_price', 'cancel', 'can_cancel', 'dripfeed', 'auth_mode', 'last_sync')
ORDER BY table_name, column_name;
