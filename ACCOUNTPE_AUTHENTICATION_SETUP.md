# AccountPe Authentication Setup Guide

## Problem
"account pay me id password galt bta rha hai" - AccountPe showing wrong ID/password error

## Root Cause
**AccountPe uses JWT Bearer Token authentication, NOT email/password in each API call!**

## How AccountPe Authentication Works

### Step 1: Login to Get Token
```bash
curl -X POST https://api.accountpe.com/api/payin/admin/auth \
  -H "Content-Type: application/json" \
  -d '{
    "email": "nextwavedigitalsolutions1@gmail.com",
    "password": "FMdbnds53@@"
  }'
```

**Response:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MTIzLCJlbWFpbCI6InRlc3RAZXhhbXBsZS5jb20iLCJpYXQiOjE2NzU2NzIzNDUsImV4cCI6MTY3NTc1ODc0NX0.xxx"
}
```

### Step 2: Use Token in API Requests
```bash
curl -X POST https://api.accountpe.com/api/payin/create_payment_links \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "country_code": "CM",
    "name": "John Doe",
    "email": "john@example.com",
    "amount": 5000,
    "transaction_id": "TXN123456"
  }'
```

## Your Current Setup

### What You Have:

1. **PHP Token Script** (`token.php`):
   - Gets token from AccountPe
   - Saves to database: `settings.swacher_token`
   - Should run via cron

2. **Next.js Code** (`app/actions/instant-payments.ts`):
   - Uses: `process.env.ACCOUNTPE_API_KEY`
   - But this environment variable is NOT set!

### The Problem:
- `ACCOUNTPE_API_KEY` not configured in Vercel
- Next.js code can't authenticate with AccountPe
- All payment requests fail with auth error

## Solution Options

### Option 1: Environment Variable (Quick Fix)

**Steps:**
1. Get token manually
2. Add to Vercel
3. Redeploy

**Get Token:**
```bash
curl -X POST https://api.accountpe.com/api/payin/admin/auth \
  -H "Content-Type: application/json" \
  -d '{"email":"nextwavedigitalsolutions1@gmail.com","password":"FMdbnds53@@"}'
```

**Add to Vercel:**
1. Go to Vercel Dashboard
2. Select your project
3. Settings → Environment Variables
4. Add new variable:
   - Name: `ACCOUNTPE_API_KEY`
   - Value: (paste token from above)
   - Environment: Production, Preview, Development
5. Save
6. Redeploy your app

**Pros:**
- ✅ Quick fix
- ✅ Works immediately

**Cons:**
- ❌ Token expires (24-48 hours)
- ❌ Need manual refresh
- ❌ Site breaks when token expires

### Option 2: Database Token with Cron (Recommended)

**Setup:**

1. **Configure Cron Job** (runs `token.php` every 6 hours):
```bash
# Add to your server crontab
0 */6 * * * php /path/to/token.php
```

2. **Update Next.js Code** to read from database:

**Current code** in `instant-payments.ts`:
```typescript
const token = process.env.ACCOUNTPE_API_KEY
```

**Change to:**
```typescript
// Read token from Supabase settings table
const { data: settings } = await supabase
  .from('settings')
  .select('swacher_token')
  .eq('id', 1)
  .single()

const token = settings?.swacher_token

if (!token) {
  throw new Error('AccountPe token not configured')
}
```

**Pros:**
- ✅ Auto-refreshes
- ✅ No manual work
- ✅ Always up-to-date
- ✅ Production-ready

**Cons:**
- Requires cron setup
- Slightly more complex

## Quick Fix Instructions (Right Now!)

If you need payments working immediately:

### Step 1: Get Token
```bash
curl -X POST https://api.accountpe.com/api/payin/admin/auth \
  -H "Content-Type: application/json" \
  -d '{"email":"nextwavedigitalsolutions1@gmail.com","password":"FMdbnds53@@"}'
```

Copy the `token` from response.

### Step 2: Add to Vercel
1. Login to Vercel
2. Go to your project
3. Settings → Environment Variables
4. Click "Add New"
5. Name: `ACCOUNTPE_API_KEY`
6. Value: (paste token)
7. Select all environments
8. Save

### Step 3: Redeploy
1. Go to Deployments tab
2. Click "Redeploy" on latest deployment
3. Wait for deployment to complete

### Step 4: Test
1. Try making a payment
2. Should work now!

**Note:** This token will expire in 24-48 hours. You'll need to repeat these steps or setup the cron job solution.

## Testing Your Token

### Test if token is valid:
```bash
curl -X POST https://api.accountpe.com/api/payin/create_payment_links \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "country_code": "CM",
    "name": "Test User",
    "email": "test@test.com",
    "amount": 1000,
    "transaction_id": "TEST123",
    "pass_digital_charge": true
  }'
```

**Expected Responses:**
- ✅ 200 OK with payment link = Token valid
- ❌ 401 Unauthorized = Token expired or invalid
- ❌ 403 Forbidden = Wrong credentials

## Troubleshooting

### Error: "Invalid credentials" or "Unauthorized"
**Cause:** Token expired or wrong token

**Fix:**
1. Get new token using login endpoint
2. Update environment variable
3. Redeploy

### Error: "Token not configured"
**Cause:** `ACCOUNTPE_API_KEY` not set in Vercel

**Fix:**
1. Add environment variable in Vercel
2. Redeploy

### Payment still not working after token update
**Fix:**
1. Check Vercel deployment logs
2. Verify environment variable is set
3. Ensure redeploy happened
4. Test token manually with curl

## Long-Term Solution

**Setup Automatic Token Refresh:**

1. Deploy `token.php` on a server with cron
2. Configure cron to run every 6 hours:
```bash
0 */6 * * * php /path/to/token.php >> /var/log/accountpe-token.log 2>&1
```
3. Update Next.js to read from database (see Option 2 above)
4. Monitor cron job logs
5. Set up alerts if token refresh fails

## Summary

**Current Issue:**
- AccountPe token not configured ❌
- All payment requests failing ❌

**Quick Fix:**
1. Get token via curl
2. Add to Vercel env vars
3. Redeploy
4. Test

**Recommended Fix:**
1. Setup cron for token.php
2. Update code to read from database
3. Auto-refresh working
4. Production-ready

---

**Hindi Summary:**

**Problem:**
- AccountPe token nahi hai
- Payment fail ho raha hai

**Quick Fix (Abhi ke liye):**
1. Command run karke token lo
2. Vercel mein add karo
3. Redeploy karo
4. 24-48 ghante kaam karega

**Proper Fix (Long-term):**
1. Cron job setup karo
2. Token auto-refresh hoga
3. Hamesha kaam karega

**Token lene ka command:**
```bash
curl -X POST https://api.accountpe.com/api/payin/admin/auth -H "Content-Type: application/json" -d '{"email":"nextwavedigitalsolutions1@gmail.com","password":"FMdbnds53@@"}'
```
