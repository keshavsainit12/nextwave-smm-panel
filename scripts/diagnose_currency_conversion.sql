-- Currency Conversion Diagnostic Query
-- Run this in your Supabase SQL Editor or psql to check if XAF deposits are properly converted

-- ============================================================================
-- CHECK 1: Recent XAF Instant Payment Transactions
-- ============================================================================
SELECT 
  id,
  user_id,
  amount as amount_in_database,
  CASE 
    WHEN amount > 100 THEN '❌ WRONG - Looks like XAF (should be USD)'
    WHEN amount < 10 THEN '✅ CORRECT - Properly converted to USD'
    ELSE '⚠️  CHECK - Amount seems unusual'
  END as conversion_status,
  notes,
  metadata,
  payment_method,
  status,
  created_at
FROM transactions
WHERE payment_method = 'instant_xaf'
  AND type = 'deposit'
ORDER BY created_at DESC
LIMIT 20;

-- ============================================================================
-- CHECK 2: Summary Statistics
-- ============================================================================
SELECT 
  COUNT(*) as total_xaf_deposits,
  COUNT(CASE WHEN amount > 100 THEN 1 END) as likely_not_converted,
  COUNT(CASE WHEN amount < 10 THEN 1 END) as likely_converted,
  MIN(amount) as min_amount,
  MAX(amount) as max_amount,
  AVG(amount) as avg_amount,
  SUM(amount) as total_deposited_usd
FROM transactions
WHERE payment_method = 'instant_xaf'
  AND type = 'deposit';

-- ============================================================================
-- CHECK 3: Users Affected (if amounts are wrong)
-- ============================================================================
SELECT 
  u.id,
  u.email,
  u.full_name,
  u.balance as current_balance_usd,
  COUNT(t.id) as xaf_deposit_count,
  SUM(t.amount) as total_xaf_deposits_amount,
  ARRAY_AGG(t.amount ORDER BY t.created_at DESC) as recent_amounts
FROM users u
JOIN transactions t ON t.user_id = u.id
WHERE t.payment_method = 'instant_xaf'
  AND t.type = 'deposit'
  AND t.status = 'completed'
GROUP BY u.id, u.email, u.full_name, u.balance
ORDER BY SUM(t.amount) DESC;

-- ============================================================================
-- CHECK 4: Metadata Check (should contain original XAF amount)
-- ============================================================================
SELECT 
  id,
  amount,
  notes,
  metadata->>'original_amount_xaf' as original_xaf,
  metadata->>'exchange_rate' as rate,
  CASE 
    WHEN metadata->>'original_amount_xaf' IS NULL THEN '⚠️  Missing metadata'
    WHEN (metadata->>'original_amount_xaf')::numeric / (metadata->>'exchange_rate')::numeric != amount THEN '❌ Conversion mismatch'
    ELSE '✅ Metadata matches'
  END as metadata_status
FROM transactions
WHERE payment_method = 'instant_xaf'
  AND type = 'deposit'
ORDER BY created_at DESC
LIMIT 20;

-- ============================================================================
-- INTERPRETATION GUIDE:
-- ============================================================================
-- If amount_in_database > 100: 
--   ❌ PROBLEM: XAF amount stored directly instead of USD
--   Example: 1000 XAF stored as 1000 instead of 1.61 USD
--   
-- If amount_in_database < 10:
--   ✅ CORRECT: Properly converted (typical 1000-5000 XAF = 1.61-8.06 USD)
--
-- If notes contain "XAF XXX Payment (Y.YY USD)":
--   ✅ CORRECT: Conversion happened, notes show both amounts
--
-- If metadata has original_amount_xaf:
--   ✅ CORRECT: Original XAF amount was preserved
-- ============================================================================
