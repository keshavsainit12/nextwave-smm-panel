-- Fix Script for XAF Currency Conversion Issue
-- ⚠️ ONLY RUN THIS IF YOU'VE CONFIRMED DEPOSITS WERE NOT CONVERTED
-- Run diagnostic script first: scripts/diagnose_currency_conversion.sql

-- ============================================================================
-- STEP 1: BACKUP BEFORE MAKING CHANGES
-- ============================================================================
CREATE TABLE IF NOT EXISTS transactions_backup_20260202 AS
SELECT * FROM transactions
WHERE payment_method = 'instant_xaf'
  AND type = 'deposit';

-- Verify backup
SELECT COUNT(*) as backed_up_transactions FROM transactions_backup_20260202;

-- ============================================================================
-- STEP 2: FIX TRANSACTIONS (Convert XAF amounts to USD)
-- ============================================================================

-- Only fix transactions where amount > 100 (likely XAF stored as-is)
-- Typical XAF deposits: 1000-10000 XAF = 1.61-16.13 USD
-- If amount > 100, it's likely XAF that wasn't converted

UPDATE transactions
SET 
  amount = amount / 620, -- Convert to USD
  metadata = jsonb_set(
    COALESCE(metadata, '{}'::jsonb),
    '{original_amount_xaf}',
    to_jsonb(amount),
    true
  ),
  metadata = jsonb_set(
    COALESCE(metadata, '{}'::jsonb),
    '{exchange_rate}',
    to_jsonb(620),
    true
  ),
  metadata = jsonb_set(
    COALESCE(metadata, '{}'::jsonb),
    '{fixed_on}',
    to_jsonb(NOW()),
    true
  ),
  notes = CONCAT(
    'XAF ', 
    amount, 
    ' Payment (', 
    ROUND(amount / 620, 2), 
    ' USD) - FIXED'
  )
WHERE payment_method = 'instant_xaf'
  AND type = 'deposit'
  AND status = 'completed'
  AND amount > 100 -- Only fix if amount is suspiciously large
  AND created_at >= '2026-01-01'; -- Only recent transactions

-- Check how many transactions were fixed
SELECT COUNT(*) as transactions_fixed FROM transactions
WHERE payment_method = 'instant_xaf'
  AND metadata->>'fixed_on' IS NOT NULL;

-- ============================================================================
-- STEP 3: RECALCULATE USER BALANCES
-- ============================================================================

-- This is more complex - need to recalculate each user's balance
-- by summing all their transactions (deposits - withdrawals - orders)

-- ⚠️ WARNING: This will recalculate balances for ALL users with XAF deposits
-- Make sure to test on staging first!

WITH user_balances AS (
  SELECT 
    user_id,
    -- Sum all deposits (positive)
    COALESCE(SUM(CASE WHEN type = 'deposit' THEN amount ELSE 0 END), 0) -
    -- Subtract all orders (negative)
    COALESCE(SUM(CASE WHEN type = 'order' THEN amount ELSE 0 END), 0) -
    -- Subtract all withdrawals (negative) 
    COALESCE(SUM(CASE WHEN type = 'withdrawal' THEN amount ELSE 0 END), 0) as calculated_balance
  FROM transactions
  WHERE status = 'completed'
  GROUP BY user_id
)
UPDATE users u
SET balance = ub.calculated_balance
FROM user_balances ub
WHERE u.id = ub.user_id
  AND u.id IN (
    -- Only update users who have XAF deposits
    SELECT DISTINCT user_id 
    FROM transactions 
    WHERE payment_method = 'instant_xaf'
  );

-- ============================================================================
-- STEP 4: VERIFY FIXES
-- ============================================================================

-- Check updated transactions
SELECT 
  id,
  amount as amount_now_in_usd,
  notes,
  metadata->>'original_amount_xaf' as original_xaf,
  metadata->>'fixed_on' as fixed_date,
  created_at
FROM transactions
WHERE payment_method = 'instant_xaf'
  AND metadata->>'fixed_on' IS NOT NULL
ORDER BY created_at DESC
LIMIT 10;

-- Check user balances
SELECT 
  u.id,
  u.email,
  u.balance,
  COUNT(t.id) as xaf_deposits_count,
  SUM(CASE WHEN t.type = 'deposit' THEN t.amount ELSE 0 END) as total_deposits,
  SUM(CASE WHEN t.type = 'order' THEN t.amount ELSE 0 END) as total_spent
FROM users u
JOIN transactions t ON t.user_id = u.id AND t.payment_method = 'instant_xaf'
GROUP BY u.id, u.email, u.balance
ORDER BY u.balance DESC
LIMIT 10;

-- ============================================================================
-- ROLLBACK (if something went wrong)
-- ============================================================================

-- To rollback, restore from backup:
/*
UPDATE transactions t
SET 
  amount = b.amount,
  metadata = b.metadata,
  notes = b.notes
FROM transactions_backup_20260202 b
WHERE t.id = b.id
  AND t.payment_method = 'instant_xaf'
  AND t.metadata->>'fixed_on' IS NOT NULL;
*/

-- ============================================================================
-- PREVENTION: Add Check Constraint
-- ============================================================================

-- Prevent future incorrect XAF deposits by adding a check constraint
-- This will reject any instant_xaf transaction with amount > 100

ALTER TABLE transactions
ADD CONSTRAINT check_xaf_converted
CHECK (
  payment_method != 'instant_xaf' 
  OR type != 'deposit'
  OR amount <= 100
);

-- Or create a trigger (more flexible):
CREATE OR REPLACE FUNCTION validate_xaf_deposit()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.payment_method = 'instant_xaf' 
     AND NEW.type = 'deposit' 
     AND NEW.amount > 100 THEN
    RAISE EXCEPTION 'XAF deposit amount too large (%). Check if conversion was applied.', NEW.amount
      USING HINT = 'XAF deposits should be converted to USD (divided by 620)';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER validate_xaf_deposits
BEFORE INSERT OR UPDATE ON transactions
FOR EACH ROW
EXECUTE FUNCTION validate_xaf_deposit();

-- ============================================================================
-- NOTES:
-- ============================================================================
-- 1. Always backup before running fixes
-- 2. Test on staging environment first
-- 3. Run diagnostic script first to confirm issue
-- 4. Check a few transactions manually after fixing
-- 5. Monitor user balances after deployment
-- 6. Keep backup for at least 30 days
-- ============================================================================
