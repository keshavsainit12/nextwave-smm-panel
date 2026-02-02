# Critical Fixes Testing Guide

## Overview
This document provides testing steps for three critical fixes:
1. Currency Conversion (XAF to USD)
2. Price Multiplier Validation
3. reCAPTCHA Implementation

---

## 1. Currency Conversion Testing

### Issue Fixed
- Deposits in XAF (Central African Franc) were being stored as USD without conversion
- Example: 1000 XAF was showing as $1000 USD instead of $1.67 USD

### Exchange Rate
- **1 USD = 600 XAF**
- Conversion formula: `amountInUSD = amountInXAF / 600`

### Test Cases

#### Test 1: Minimum Deposit (100 XAF)
**Steps:**
1. Go to deposit page
2. Select "NextWave Global Payment" (instant payment)
3. Enter amount: 100 XAF
4. Complete payment
5. Check balance

**Expected:** Balance increased by $0.17 USD (100 / 600 = 0.17)

#### Test 2: Standard Deposit (1000 XAF)
**Steps:**
1. Note current balance (in USD)
2. Deposit 1000 XAF
3. After approval, check balance

**Expected:** Balance increased by $1.67 USD (1000 / 600 = 1.67)

#### Test 3: Large Deposit (60000 XAF)
**Steps:**
1. Deposit 60000 XAF
2. Check balance

**Expected:** Balance increased by $100.00 USD (60000 / 600 = 100)

#### Test 4: Transaction History
**Steps:**
1. Go to transaction history
2. Find recent deposit transaction
3. Check "Notes" field

**Expected:** 
- Notes should show: "XAF [amount] Payment ([USD amount] USD) - [username]"
- Example: "XAF 1000 Payment (1.67 USD) - John Doe"

#### Test 5: Admin Deposits View
**Steps:**
1. Login as admin
2. Go to Deposits section
3. Find pending deposits
4. Approve a deposit

**Expected:**
- Amount displayed should be in USD
- User balance should increase by USD amount (not XAF)

### Verification Queries
```sql
-- Check recent transactions
SELECT id, user_id, amount, type, notes, created_at 
FROM transactions 
WHERE type = 'deposit' 
  AND payment_method = 'instant_xaf'
ORDER BY created_at DESC 
LIMIT 10;

-- Check user balance
SELECT id, email, balance 
FROM users 
WHERE id = 'USER_ID';
```

---

## 2. Price Multiplier Testing

### Issue Fixed
- Bulk pricing showed "successfully added to 0 service"
- No feedback on which services were updated or skipped
- No validation for services without base prices

### Test Cases

#### Test 1: Apply 2x Multiplier
**Steps:**
1. Login as admin
2. Go to Services page
3. Click "2x" button in Bulk Pricing Control
4. Wait for completion

**Expected:**
- Toast message: "✓ Set X of Y services to 2x provider price (100% profit)"
- If some skipped: "X of Y services (Z skipped)"
- Services table refreshes with new prices
- Prices = Provider Price × 2

#### Test 2: Apply 3x Multiplier (Recommended)
**Steps:**
1. Click "3x" button
2. Check results

**Expected:**
- Message: "Set X services to 3x provider price (200% profit)"
- Services with provider_price updated
- Example: Provider price $1.00 → Selling price $3.00

#### Test 3: Services Without Base Price
**Steps:**
1. Create a service with no provider_price
2. Apply any multiplier
3. Check feedback

**Expected:**
- Message includes: "X skipped (no base price)"
- Service is not updated
- Console log: "Skipping service [name] - no valid base price"

#### Test 4: Browser Console Logs
**Steps:**
1. Open browser console (F12)
2. Apply multiplier
3. Watch logs

**Expected Logs:**
```
[v0] Setting multiplier to 3x
[v0] Found X services to update with 3x multiplier
[v0] ✓ Instagram Followers: $1.00 × 3 = $3.00
[v0] ✓ YouTube Views: $2.50 × 3 = $7.50
[v0] Successfully updated X/Y services (Z skipped, A errors)
```

#### Test 5: Error Handling
**Steps:**
1. Disconnect from network
2. Try to apply multiplier
3. Check error message

**Expected:**
- Clear error message
- No partial updates
- User can retry

### Verification Queries
```sql
-- Check service prices before/after
SELECT id, name, provider_price, price, base_price 
FROM services 
WHERE is_active = true
ORDER BY name;

-- Verify multiplier was applied correctly
SELECT 
  name,
  provider_price,
  price,
  ROUND(price / NULLIF(provider_price, 0), 2) as actual_multiplier
FROM services 
WHERE provider_price > 0
ORDER BY name;
```

---

## 3. reCAPTCHA Testing

### Setup Required
Before testing, ensure environment variables are set:
```env
NEXT_PUBLIC_RECAPTCHA_SITE_KEY=your_site_key_here
RECAPTCHA_SECRET_KEY=your_secret_key_here
```

Get keys from: https://www.google.com/recaptcha/admin

### Test Cases

#### Test 1: Login with reCAPTCHA
**Steps:**
1. Go to /auth/login
2. Open browser console (F12)
3. Enter email and password
4. Click "Sign in"
5. Watch console logs

**Expected Logs:**
```
[v0] Getting reCAPTCHA token...
[v0] reCAPTCHA verified successfully
```

**Expected Behavior:**
- No visible reCAPTCHA widget (v3 is invisible)
- Login proceeds normally if valid
- If reCAPTCHA fails, shows error but may still allow login

#### Test 2: Signup with reCAPTCHA
**Steps:**
1. Go to /auth/signup
2. Fill in all fields
3. Submit form
4. Watch console

**Expected:**
- reCAPTCHA verification before account creation
- Console logs similar to login
- Account created successfully

#### Test 3: reCAPTCHA Script Loading
**Steps:**
1. Go to any page
2. View page source
3. Check `<head>` section

**Expected:**
```html
<script src="https://www.google.com/recaptcha/api.js?render=SITE_KEY" async defer></script>
```

#### Test 4: API Verification Endpoint
**Steps:**
1. Use curl or Postman
2. Test verification endpoint

```bash
curl -X POST http://localhost:3000/api/verify-recaptcha \
  -H "Content-Type: application/json" \
  -d '{"token":"test_token"}'
```

**Expected:** 
- Status 400 or 500 with "verification failed" (because test token is invalid)
- With real token: Status 200 with {"success": true}

#### Test 5: Without reCAPTCHA Configured
**Steps:**
1. Remove RECAPTCHA_SECRET_KEY from environment
2. Try to login

**Expected:**
- Warning in console
- Login still proceeds (graceful degradation)
- No blocking error

### Verification Logs
Check server logs for:
```
[v0] Verifying reCAPTCHA token with Google API...
[v0] reCAPTCHA API response: { success: true, score: 0.9, action: 'login' }
[v0] reCAPTCHA verification successful
```

---

## 4. Integration Testing

### Test Complete Flow
**Steps:**
1. Register new account (with reCAPTCHA)
2. Login (with reCAPTCHA)
3. Deposit 1000 XAF
4. Check balance shows $1.67 USD
5. Place an order
6. Check service prices are correct (multiplier applied)

### Admin Flow
**Steps:**
1. Login as admin
2. Apply 3x price multiplier
3. Verify all services updated
4. Approve a pending deposit
5. Check user balance increased by correct USD amount

---

## 5. Rollback Plan

If issues occur after deployment:

### Rollback Currency Conversion
```typescript
// In instant-payments.ts, revert to:
amount: params.amount  // No conversion
```

### Rollback Price Multiplier
- Previous version still works
- Just shows less detailed feedback

### Disable reCAPTCHA
```typescript
// In login/signup pages, comment out reCAPTCHA check
// Or remove RECAPTCHA_SECRET_KEY from environment
```

---

## 6. Success Criteria

### Currency Conversion ✅
- [ ] 600 XAF = $1.00 USD in balance
- [ ] 1000 XAF = $1.67 USD in balance
- [ ] Transaction notes show both currencies
- [ ] Admin panel shows USD amounts
- [ ] User dashboard shows USD amounts

### Price Multiplier ✅
- [ ] Shows number of services updated
- [ ] Shows number of services skipped
- [ ] Console logs detail each service
- [ ] No "0 services" message when services exist
- [ ] Prices calculated correctly (provider × multiplier)

### reCAPTCHA ✅
- [ ] Script loads in page head
- [ ] Login verifies reCAPTCHA token
- [ ] Signup verifies reCAPTCHA token
- [ ] API endpoint responds correctly
- [ ] Graceful fallback if not configured
- [ ] No JavaScript errors in console

---

## 7. Common Issues & Solutions

### Currency Conversion

**Issue:** Old deposits still show wrong amount
**Solution:** Only new deposits are affected. Old data remains unchanged.

**Issue:** Balance not updating
**Solution:** Check admin approved deposit correctly. Check transaction status.

### Price Multiplier

**Issue:** Still shows "0 services"
**Solution:** 
1. Check services exist in database
2. Check services have provider_price > 0
3. Check browser console for errors

**Issue:** Prices not updating
**Solution:** Refresh page. Check network tab for failed requests.

### reCAPTCHA

**Issue:** "reCAPTCHA not configured" error
**Solution:** Set both NEXT_PUBLIC_RECAPTCHA_SITE_KEY and RECAPTCHA_SECRET_KEY

**Issue:** Script not loading
**Solution:** Check browser console. Verify site key is correct.

**Issue:** Verification always fails
**Solution:** Check secret key matches site key. Check Google reCAPTCHA console for errors.

---

## Contact
For issues or questions about these fixes, check:
- Server logs in deployment platform
- Browser console (F12)
- Network tab for API calls
- Database transactions table
