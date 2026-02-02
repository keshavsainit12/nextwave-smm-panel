# How to Fix "Orders Not Reaching Provider" Issue

## 🚨 Quick Start - Use This First!

If orders are not reaching your provider dashboard, follow these steps IN ORDER:

## Step 1: Test Your Provider Connection 🔍

This is the MOST IMPORTANT step. Run this first to find exactly what's wrong:

```bash
curl -X POST "https://nextwavesmm.com/api/admin/test-provider" \
  -H "Authorization: Bearer YOUR_ADMIN_SESSION_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"provider_id": "YOUR_PROVIDER_ID"}'
```

### What This Tests:
✅ Is the API URL configured correctly?  
✅ Is the API key present?  
✅ Can we authenticate with the provider? (balance check)  
✅ Can we retrieve services list?  

### Example Success Response:
```json
{
  "success": true,
  "diagnostics": {
    "overall_status": "ALL_TESTS_PASSED",
    "message": "Provider API working correctly!",
    "tests": [
      {
        "test": "Balance Check (Auth Test)",
        "status": "PASSED",
        "message": "Authentication successful",
        "data": { "balance": "150.50", "currency": "USD" }
      }
    ]
  }
}
```

### Example Failure (API Key Issue):
```json
{
  "success": false,
  "diagnostics": {
    "overall_status": "TESTS_FAILED",
    "tests": [
      {
        "test": "Balance Check (Auth Test)",
        "status": "FAILED",
        "http_status": 401,
        "provider_response": { "error": "Invalid API key" },
        "suggestion": "API key invalid/expired. Regenerate on provider dashboard."
      }
    ]
  }
}
```

## Step 2: Fix The Issue Based on Test Results

### Issue: "Invalid API key" (401 Unauthorized)

**Cause:** Provider API key was regenerated but not updated in your database

**Fix:**
1. Login to your provider's dashboard
2. Generate a new API key
3. Update your database:
```sql
UPDATE api_providers 
SET api_key = 'your-new-api-key-here' 
WHERE id = 'your-provider-id';
```
4. Test again with Step 1
5. Resend pending orders (see Step 3)

### Issue: Wrong authentication mode

**Cause:** Provider expects "Bearer" token but you're sending "key" parameter (or vice versa)

**Fix:**
1. Check your provider's API documentation
2. Update database:
```sql
-- If provider needs Bearer authentication:
UPDATE api_providers 
SET auth_mode = 'bearer' 
WHERE id = 'your-provider-id';

-- If provider needs key parameter (default):
UPDATE api_providers 
SET auth_mode = 'key' 
WHERE id = 'your-provider-id';
```
3. Test again with Step 1
4. Resend pending orders (see Step 3)

### Issue: Invalid API URL

**Cause:** API endpoint URL is wrong or has changed

**Fix:**
1. Get correct API URL from provider documentation
2. Update database:
```sql
UPDATE api_providers 
SET api_url = 'https://correct-api-url.com/api/v2' 
WHERE id = 'your-provider-id';
```
3. Test again with Step 1

### Issue: Service not linked to provider

**Cause:** Services don't have external_service_id set

**Fix:**
1. Get service IDs from provider dashboard
2. Update database:
```sql
UPDATE services 
SET external_service_id = '123', provider_id = 'your-provider-id' 
WHERE id = 'your-service-id';
```

## Step 3: Resend Pending Orders 🔄

Once you've fixed the provider configuration, resend all pending orders:

```bash
# Get list of pending orders
SELECT id, created_at, user_id, price 
FROM orders 
WHERE status = 'pending' 
AND service_id IN (
  SELECT id FROM services WHERE provider_id = 'your-provider-id'
)
ORDER BY created_at DESC;

# Resend each order
curl -X POST "https://nextwavesmm.com/api/admin/resend-order" \
  -H "Authorization: Bearer YOUR_ADMIN_SESSION_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"order_id": "ORDER_ID_HERE"}'
```

### Resend Response:
```json
{
  "success": true,
  "message": "Order successfully sent to provider",
  "external_order_id": "12345"
}
```

## Step 4: Check Server Logs 📋

When users place new orders, check your server logs to verify orders are being sent:

### Look for these logs:

**Success:**
```
[v0] ===== SENDING ORDER TO PROVIDER =====
[v0] Provider Details: { provider_id: "...", api_url: "...", auth_mode: "key" }
[v0] ✅ SUCCESS! API order created with external ID: 12345
```

**Failure:**
```
[v0] ===== SENDING ORDER TO PROVIDER =====
[v0] ❌ FAILED to send order to API provider
[v0] Error Details: { 
  provider_http_status: 401, 
  provider_response_body: "Invalid API key" 
}
```

## Step 5: Enable Debug Mode (Optional) 🐛

For extremely detailed debugging, enable debug mode:

```bash
# Set environment variable
export DEBUG_SMM_API=true

# Restart your application
```

**Warning:** Don't leave this on in production! It generates lots of logs.

With debug mode, you'll see:
- Every API request with full payload
- Every API response
- Retry attempts
- Timing information

## Common Scenarios & Solutions

### Scenario 1: "API key is correct but still failing"
**Possible causes:**
- Auth mode is wrong (try switching between "key" and "bearer")
- API URL has trailing slash or wrong endpoint
- Provider changed their API format
- Your server's IP might be blocked by provider

**Solution:**
- Test with manual curl (see PROVIDER_TROUBLESHOOTING.md)
- Contact provider support to verify your API access

### Scenario 2: "Some orders work, some don't"
**Possible causes:**
- Different services use different external_service_id
- Some services don't have external_service_id set
- Provider disabled certain services

**Solution:**
```sql
-- Check which services have external IDs
SELECT s.id, s.name, s.external_service_id, s.provider_id
FROM services s
WHERE s.provider_id = 'your-provider-id';

-- Update missing external IDs
UPDATE services 
SET external_service_id = 'correct-id-from-provider' 
WHERE id = 'service-id';
```

### Scenario 3: "Provider balance is low"
**Symptoms:** 
- Test endpoint shows success
- Orders fail with "Insufficient balance" from provider

**Solution:**
- Add funds to your provider account
- Provider balance is different from your customer balance!

## Database Queries for Troubleshooting

### Check provider configuration:
```sql
SELECT id, name, api_url, is_active, auth_mode, 
       LENGTH(api_key) as key_length
FROM api_providers
WHERE id = 'your-provider-id';
```

### Find pending orders:
```sql
SELECT o.id, o.created_at, o.status, o.external_order_id,
       s.name as service_name, s.external_service_id
FROM orders o
JOIN services s ON o.service_id = s.id
WHERE o.status = 'pending'
AND s.provider_id = 'your-provider-id'
ORDER BY o.created_at DESC
LIMIT 50;
```

### Check service configuration:
```sql
SELECT s.id, s.name, s.external_service_id, s.provider_id,
       p.name as provider_name, p.is_active as provider_active
FROM services s
LEFT JOIN api_providers p ON s.provider_id = p.id
WHERE s.provider_id = 'your-provider-id'
OR s.external_service_id IS NULL;
```

## Quick Checklist ✅

Before contacting support, verify:

- [ ] Provider exists in database and is active
- [ ] Provider has api_url set
- [ ] Provider has api_key set (check LENGTH)
- [ ] Provider auth_mode is correct ("key" or "bearer")
- [ ] Service has external_service_id set
- [ ] Service provider_id links to your provider
- [ ] Test-provider endpoint returns success
- [ ] Manual curl test works
- [ ] Server logs show orders being sent
- [ ] Provider account has sufficient balance

## Need More Help?

See **PROVIDER_TROUBLESHOOTING.md** for:
- Step-by-step troubleshooting guide
- Manual curl testing examples
- All possible error scenarios
- Advanced debugging techniques

## API Endpoints Reference

### Test Provider Connection
```
POST /api/admin/test-provider
Body: {"provider_id": "uuid"}
Auth: Admin session required
```

### Resend Order
```
POST /api/admin/resend-order  
Body: {"order_id": "uuid"}
Auth: Admin session required
```

## Environment Variables

```bash
# Enable detailed debug logging
DEBUG_SMM_API=true

# Restart application after changing
```
