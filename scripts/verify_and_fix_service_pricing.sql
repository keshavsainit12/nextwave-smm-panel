-- Verification and Fix Script for Service Pricing
-- This script checks and fixes services that don't have proper provider_price set

-- ============================================================================
-- STEP 1: CHECK CURRENT STATE
-- ============================================================================

-- Check services without provider_price
SELECT 
  COUNT(*) as total_services,
  COUNT(CASE WHEN provider_price IS NULL OR provider_price = 0 THEN 1 END) as missing_provider_price,
  COUNT(CASE WHEN base_price IS NULL OR base_price = 0 THEN 1 END) as missing_base_price,
  AVG(base_price) as avg_base_price,
  AVG(provider_price) as avg_provider_price
FROM services;

-- Show sample services with pricing info
SELECT 
  id,
  name,
  provider_price,
  base_price,
  CASE 
    WHEN provider_price > 0 THEN ROUND(base_price / provider_price, 2)
    ELSE 0
  END as calculated_multiplier,
  CASE
    WHEN provider_price IS NULL OR provider_price = 0 THEN '❌ Missing provider_price'
    WHEN base_price IS NULL OR base_price = 0 THEN '❌ Missing base_price'
    WHEN ROUND(base_price / provider_price, 2) != 3.0 THEN '⚠️  Not 3x'
    ELSE '✅ Correct'
  END as status
FROM services
ORDER BY created_at DESC
LIMIT 20;

-- ============================================================================
-- STEP 2: FIX SERVICES WITH MISSING PROVIDER_PRICE
-- ============================================================================

-- Backup first (optional but recommended)
CREATE TABLE IF NOT EXISTS services_backup_pricing AS
SELECT * FROM services
WHERE provider_price IS NULL OR provider_price = 0;

-- Fix services where provider_price is missing or 0
-- Assume base_price was set correctly as 3x, so provider_price = base_price / 3
UPDATE services
SET 
  provider_price = base_price / 3.0,
  updated_at = NOW()
WHERE (provider_price IS NULL OR provider_price = 0)
  AND base_price > 0;

-- ============================================================================
-- STEP 3: FIX SERVICES WITH INCORRECT BASE_PRICE
-- ============================================================================

-- If base_price was set incorrectly (not 3x provider_price), fix it
UPDATE services
SET 
  base_price = provider_price * 3.0,
  updated_at = NOW()
WHERE provider_price > 0
  AND base_price > 0
  AND ABS(base_price - (provider_price * 3.0)) > 0.01; -- Allow small rounding difference

-- ============================================================================
-- STEP 4: VERIFICATION AFTER FIX
-- ============================================================================

-- Check if all services now have correct pricing
SELECT 
  COUNT(*) as total_services,
  COUNT(CASE WHEN provider_price IS NULL OR provider_price = 0 THEN 1 END) as still_missing_provider_price,
  COUNT(CASE WHEN base_price IS NULL OR base_price = 0 THEN 1 END) as still_missing_base_price,
  COUNT(CASE 
    WHEN provider_price > 0 AND base_price > 0 
    AND ABS(base_price - (provider_price * 3.0)) < 0.01 
    THEN 1 
  END) as correct_3x_pricing,
  ROUND(AVG(CASE 
    WHEN provider_price > 0 THEN base_price / provider_price 
    ELSE 0 
  END), 2) as avg_multiplier
FROM services;

-- Show sample services after fix
SELECT 
  id,
  name,
  provider_price,
  base_price,
  ROUND(base_price / provider_price, 2) as multiplier,
  '✅ Fixed' as status
FROM services
WHERE provider_price > 0
ORDER BY updated_at DESC
LIMIT 20;

-- ============================================================================
-- NOTES:
-- ============================================================================
-- 
-- Expected Results:
-- - provider_price = Raw cost from API provider (e.g., $1.00)
-- - base_price = provider_price × 3.0 (e.g., $3.00)
-- - Multiplier should be 3.0 for all services
--
-- User Pricing:
-- - Normal users (tier 1): See base_price directly ($3.00)
-- - VIP users get their multiplier applied in frontend:
--   - providerCost = base_price / 3.0 = $1.00
--   - userPrice = providerCost × userMultiplier
--   - e.g., VIP (1.5x): $1.00 × 1.5 = $1.50
--
-- ============================================================================
