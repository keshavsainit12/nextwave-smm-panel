# Provider Order Delivery Troubleshooting Guide

## Problem: Orders not reaching provider dashboard

If users are placing orders successfully but they're not showing up in the provider's dashboard, follow these steps:

## Step 1: Check Server Logs

When an order is placed, look for these logs:

```
[v0] ===== SENDING ORDER TO PROVIDER =====
[v0] Provider Details: {...}
[v0] Order Details: {...}
```

**If you see `✅ SUCCESS!`:** Order was sent successfully. Check provider dashboard after a few minutes.

**If you see `❌ FAILED`:** Order failed to send. Continue to Step 2.

**If you DON'T see these logs:** Order is not being sent at all. Check:
- Is service linked to a provider? (`service.provider` must exist)
- Is provider active? (`provider.is_active = true`)
- Does service have external_service_id? (must be set)

## Step 2: Test Provider Connection

Use the test-provider endpoint to diagnose the exact issue:

```bash
# From your admin session
curl -X POST "https://your-domain.com/api/admin/test-provider" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"provider_id": "YOUR_PROVIDER_ID"}'
```

This will test:
1. ✅ Configuration (API URL, API key present)
2. ✅ URL format validity
3. ✅ Authentication (balance check)
4. ✅ Services list retrieval

**Response will tell you:**
- If API key is invalid/expired → Regenerate on provider dashboard
- If URL is wrong → Check provider.api_url in database
- If auth mode is wrong → Set provider.auth_mode to "bearer" or "key"

## Step 3: Check Provider Configuration

Query your database:

```sql
-- Check provider configuration
SELECT id, name, api_url, is_active, auth_mode
FROM api_providers
WHERE id = 'YOUR_PROVIDER_ID';

-- Check if API key is set (should show a hash)
SELECT LENGTH(api_key) as key_length
FROM api_providers
WHERE id = 'YOUR_PROVIDER_ID';

-- Check service linking
SELECT s.id, s.name, s.external_service_id, s.provider_id
FROM services s
WHERE s.provider_id = 'YOUR_PROVIDER_ID'
LIMIT 5;
```

**Common issues:**
- `api_key` is NULL or empty
- `api_url` has wrong format or trailing slash
- `external_service_id` is NULL for the service
- `is_active` is false
- `auth_mode` is NULL (defaults to "key" but provider might need "bearer")

## Step 4: Manual API Test

Test the provider API directly with curl:

```bash
# Test balance (key authentication)
curl -X POST "https://provider-api-url.com/api/v2" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "key=YOUR_API_KEY&action=balance"

# Test balance (Bearer authentication)
curl -X POST "https://provider-api-url.com/api/v2" \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "action=balance"

# Test order creation
curl -X POST "https://provider-api-url.com/api/v2" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "key=YOUR_API_KEY&action=add&service=123&link=https://instagram.com/test&quantity=100"
```

**Expected responses:**
- `{"balance": "100.50", "currency": "USD"}` → API working!
- `{"error": "Invalid API key"}` → Regenerate API key
- `401 Unauthorized` → Check auth mode (try Bearer)
- Connection timeout → Check URL

## Step 5: Resend Failed Orders

Once you've fixed the provider configuration, resend pending orders:

```bash
curl -X POST "https://your-domain.com/api/admin/resend-order" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"order_id": "ORDER_ID_HERE"}'
```

This will:
1. Fetch current provider credentials from database
2. Retry sending the order
3. Update order status if successful
4. Log detailed error if it fails again

## Common Solutions

### Solution 1: API Key Expired
**Symptoms:** 401 Unauthorized, "Invalid API key"
**Fix:**
1. Go to provider dashboard
2. Regenerate API key
3. Update database: `UPDATE api_providers SET api_key = 'NEW_KEY' WHERE id = 'PROVIDER_ID'`
4. Resend pending orders

### Solution 2: Wrong Auth Mode
**Symptoms:** 401 or 403 even with correct key
**Fix:**
1. Check provider documentation for auth method
2. Update database: `UPDATE api_providers SET auth_mode = 'bearer' WHERE id = 'PROVIDER_ID'`
   (or set to 'key' if it requires key parameter)
3. Test with test-provider endpoint
4. Resend pending orders

### Solution 3: Wrong External Service ID
**Symptoms:** Order sent but provider returns "Invalid service"
**Fix:**
1. Get correct service IDs from provider dashboard
2. Update database: `UPDATE services SET external_service_id = 'CORRECT_ID' WHERE id = 'SERVICE_ID'`
3. Note: This won't fix old orders, only new ones

### Solution 4: Provider API URL Changed
**Symptoms:** Connection timeout, DNS errors
**Fix:**
1. Check provider documentation for current API endpoint
2. Update database: `UPDATE api_providers SET api_url = 'NEW_URL' WHERE id = 'PROVIDER_ID'`
3. Test with test-provider endpoint
4. Resend pending orders

## Debug Mode

For detailed debugging, enable debug logging:

```bash
# Set environment variable
DEBUG_SMM_API=true

# Restart your application
# Now all API requests will be logged in detail
```

When debug is enabled, you'll see:
- Full request payloads (with masked keys)
- Response bodies
- Retry attempts
- Timing information

**IMPORTANT:** Don't leave debug mode on in production as it generates many logs.

## Quick Checklist

- [ ] Provider exists and is active in database
- [ ] Provider has valid API URL
- [ ] Provider has API key set
- [ ] Service has external_service_id set
- [ ] Service is linked to provider (provider_id is set)
- [ ] Auth mode is correct (key or bearer)
- [ ] Test-provider endpoint returns success
- [ ] Manual curl test works
- [ ] Server logs show order being sent

If all above are ✅ but orders still fail, check:
- Provider balance (might be out of credits)
- Provider service status (service might be disabled on their end)
- Network/firewall issues between your server and provider
