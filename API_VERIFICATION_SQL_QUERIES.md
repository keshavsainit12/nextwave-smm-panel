# 🔍 API Configuration Verification - SQL Queries

## Run these queries to verify API is properly configured

---

## 1. Check Provider Configuration

```sql
-- Check all providers and their status
SELECT 
  id,
  name,
  api_url,
  CASE 
    WHEN api_key IS NULL THEN '❌ MISSING'
    WHEN LENGTH(api_key) < 10 THEN '⚠️ TOO SHORT'
    ELSE '✅ SET (' || LENGTH(api_key) || ' chars)'
  END as api_key_status,
  is_active,
  priority,
  success_rate,
  last_checked_at,
  created_at
FROM api_providers
ORDER BY priority, name;
```

**Expected:**
- At least 1 provider should exist
- `api_key_status` should be ✅ SET
- `is_active` should be `true` for at least one

---

## 2. Check Services are Linked to Providers

```sql
-- Check services and their provider linking
SELECT 
  s.id,
  s.name,
  s.is_active,
  CASE 
    WHEN s.provider_id IS NULL THEN '❌ NOT LINKED'
    ELSE '✅ LINKED'
  END as provider_status,
  CASE 
    WHEN s.external_service_id IS NULL THEN '❌ MISSING'
    WHEN s.external_service_id = '' THEN '❌ EMPTY'
    ELSE '✅ SET (' || s.external_service_id || ')'
  END as external_id_status,
  p.name as provider_name,
  p.is_active as provider_active
FROM services s
LEFT JOIN api_providers p ON s.provider_id = p.id
WHERE s.is_active = true
ORDER BY s.name
LIMIT 50;
```

**Expected:**
- Active services should have `provider_status` = ✅ LINKED
- `external_id_status` should be ✅ SET
- `provider_active` should be `true`

---

## 3. Check Recent Orders

```sql
-- Check recent orders and their provider status
SELECT 
  o.id,
  o.created_at,
  o.status,
  CASE 
    WHEN o.external_order_id IS NULL THEN '❌ NOT SENT'
    ELSE '✅ SENT (ID: ' || o.external_order_id || ')'
  END as provider_status,
  s.name as service_name,
  p.name as provider_name,
  o.price,
  o.quantity
FROM orders o
JOIN services s ON o.service_id = s.id
LEFT JOIN api_providers p ON s.provider_id = p.id
WHERE o.created_at > NOW() - INTERVAL '24 hours'
ORDER BY o.created_at DESC
LIMIT 20;
```

**Expected:**
- Orders with `status` = 'processing' or 'completed' should have `provider_status` = ✅ SENT
- Orders stuck in 'pending' with '❌ NOT SENT' indicate API problem

---

## 4. Check API Keys for Users

```sql
-- Check if users have API keys for API access
SELECT 
  id,
  email,
  CASE 
    WHEN api_key IS NULL THEN '❌ NO API KEY'
    WHEN api_key = '' THEN '❌ EMPTY KEY'
    ELSE '✅ HAS KEY (' || SUBSTRING(api_key, 1, 8) || '...)'
  END as api_key_status,
  created_at
FROM users
WHERE email IS NOT NULL
ORDER BY created_at DESC
LIMIT 10;
```

**Expected:**
- Users who need API access should have `api_key_status` = ✅ HAS KEY

---

## 5. Order Success Rate (Last 24 hours)

```sql
-- Check order delivery success rate
SELECT 
  COUNT(*) as total_orders,
  COUNT(external_order_id) as sent_to_provider,
  COUNT(*) - COUNT(external_order_id) as failed_to_send,
  ROUND(
    (COUNT(external_order_id)::DECIMAL / NULLIF(COUNT(*), 0) * 100), 2
  ) as success_rate_percent,
  COUNT(*) FILTER (WHERE status = 'pending') as stuck_pending,
  COUNT(*) FILTER (WHERE status = 'processing') as processing,
  COUNT(*) FILTER (WHERE status = 'completed') as completed
FROM orders
WHERE created_at > NOW() - INTERVAL '24 hours';
```

**Expected:**
- `success_rate_percent` should be close to 100%
- `stuck_pending` should be 0 or very low
- If `failed_to_send` is high, there's an API problem

---

## 6. Check Provider Service Sync Status

```sql
-- Check when services were last synced from providers
SELECT 
  p.id,
  p.name as provider_name,
  p.is_active,
  COUNT(s.id) as total_services,
  COUNT(s.id) FILTER (WHERE s.is_active = true) as active_services,
  MAX(s.updated_at) as last_service_update,
  p.last_checked_at as provider_last_checked
FROM api_providers p
LEFT JOIN services s ON s.provider_id = p.id
GROUP BY p.id, p.name, p.is_active, p.last_checked_at
ORDER BY p.priority, p.name;
```

**Expected:**
- Each provider should have `total_services` > 0
- `last_service_update` should be recent
- Active providers should have `active_services` > 0

---

## 7. Find Orders Stuck Without Provider

```sql
-- Find orders that should have been sent but weren't
SELECT 
  o.id,
  o.created_at,
  o.status,
  o.external_order_id,
  s.name as service_name,
  s.provider_id,
  s.external_service_id,
  p.name as provider_name,
  p.is_active as provider_active
FROM orders o
JOIN services s ON o.service_id = s.id
LEFT JOIN api_providers p ON s.provider_id = p.id
WHERE o.status = 'pending'
  AND o.external_order_id IS NULL
  AND o.created_at > NOW() - INTERVAL '7 days'
ORDER BY o.created_at DESC
LIMIT 50;
```

**This shows orders that failed to send. Check:**
- Is `provider_id` NULL? → Service not linked
- Is `external_service_id` NULL? → Service misconfigured
- Is `provider_active` false? → Provider disabled

---

## 8. Check Cron Job Status (if using)

```sql
-- Check if orders are being auto-synced
SELECT 
  DATE_TRUNC('hour', updated_at) as hour,
  COUNT(*) as orders_updated,
  COUNT(DISTINCT id) as unique_orders
FROM orders
WHERE updated_at > NOW() - INTERVAL '24 hours'
  AND status IN ('processing', 'completed')
GROUP BY DATE_TRUNC('hour', updated_at)
ORDER BY hour DESC;
```

**Expected:**
- Should see regular updates if cron is running
- If no updates, cron might not be configured

---

## 9. Check API Authentication Tokens

```sql
-- Check user API keys distribution
SELECT 
  CASE 
    WHEN api_key IS NULL OR api_key = '' THEN 'No API Key'
    ELSE 'Has API Key'
  END as key_status,
  COUNT(*) as user_count
FROM users
GROUP BY key_status;
```

---

## 10. Provider Health Score

```sql
-- Calculate provider health based on order success
SELECT 
  p.name as provider_name,
  p.is_active,
  COUNT(o.id) as total_orders,
  COUNT(o.external_order_id) as successful_sends,
  COUNT(*) FILTER (WHERE o.status = 'completed') as completed_orders,
  ROUND(
    (COUNT(o.external_order_id)::DECIMAL / NULLIF(COUNT(o.id), 0) * 100), 2
  ) as send_success_rate,
  ROUND(
    (COUNT(*) FILTER (WHERE o.status = 'completed')::DECIMAL / NULLIF(COUNT(o.id), 0) * 100), 2
  ) as completion_rate
FROM api_providers p
LEFT JOIN services s ON s.provider_id = p.id
LEFT JOIN orders o ON o.service_id = s.id AND o.created_at > NOW() - INTERVAL '7 days'
GROUP BY p.id, p.name, p.is_active
ORDER BY send_success_rate DESC;
```

**Expected:**
- `send_success_rate` should be 100% or close to it
- Low rates indicate API problems

---

## 🎯 Quick Health Check (Run this first!)

```sql
-- Overall API health check
WITH provider_check AS (
  SELECT COUNT(*) as total, COUNT(*) FILTER (WHERE is_active = true AND api_key IS NOT NULL) as configured
  FROM api_providers
),
service_check AS (
  SELECT COUNT(*) as total, COUNT(*) FILTER (WHERE provider_id IS NOT NULL AND external_service_id IS NOT NULL) as linked
  FROM services WHERE is_active = true
),
recent_orders AS (
  SELECT COUNT(*) as total, COUNT(external_order_id) as sent
  FROM orders WHERE created_at > NOW() - INTERVAL '24 hours'
)
SELECT 
  'Providers' as component,
  p.configured || '/' || p.total as status,
  CASE WHEN p.configured > 0 THEN '✅' ELSE '❌' END as health
FROM provider_check p
UNION ALL
SELECT 
  'Services' as component,
  s.linked || '/' || s.total as status,
  CASE WHEN s.linked > 0 THEN '✅' ELSE '❌' END as health
FROM service_check s
UNION ALL
SELECT 
  'Orders (24h)' as component,
  r.sent || '/' || r.total as status,
  CASE 
    WHEN r.total = 0 THEN '⚠️'
    WHEN r.sent::DECIMAL / r.total > 0.9 THEN '✅' 
    ELSE '❌' 
  END as health
FROM recent_orders r;
```

**This gives you instant overview:**
- All components should show ✅
- If ❌ appears, check detailed queries above

---

## 📊 How to Use These Queries

### Step 1: Run Quick Health Check
```sql
-- Copy and run the "Quick Health Check" query above
-- This shows overall status
```

### Step 2: If any ❌ appears, run specific checks
```sql
-- For provider issues: Run queries 1, 6, 10
-- For service issues: Run query 2
-- For order issues: Run queries 3, 5, 7
```

### Step 3: Fix issues found
```sql
-- Missing API key? Update provider
UPDATE api_providers SET api_key = 'new-key' WHERE id = 'xxx';

-- Service not linked? Link it
UPDATE services SET provider_id = 'provider-uuid', external_service_id = '123' WHERE id = 'service-uuid';

-- Provider inactive? Activate it
UPDATE api_providers SET is_active = true WHERE id = 'xxx';
```

---

## 🎉 Expected Perfect State

All these should be true:
- ✅ At least 1 active provider with API key
- ✅ Active services linked to providers with external IDs
- ✅ Recent orders have external_order_id (sent to provider)
- ✅ Success rate > 95%
- ✅ No orders stuck in pending for > 1 hour

If all ✅, your API is working perfectly! 🚀
