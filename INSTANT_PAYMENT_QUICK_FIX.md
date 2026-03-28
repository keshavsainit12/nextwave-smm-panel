# ⚡ INSTANT PAYMENT - QUICK REFERENCE

## The Problem in 10 Seconds
Instant payments weren't working because:
1. Payment creation = `transactions` table
2. Verification code = looked in `instant_payments` table  
3. **Result:** Payments never found, never credited ❌

## The Fix in 10 Seconds
✅ Changed verification to use correct `transactions` table  
✅ Fixed transaction ID generation  
✅ Reversed webhook lookup order  
✅ Simplified cron job logic  

## Files Changed
```
3 files modified:
- app/actions/instant-payments.ts (+5 lines)
- app/api/webhooks/instant-payment/route.ts (+0 net, reordered)
- app/api/cron/verify-instant-payments/route.ts (-17 lines, simplified)
```

## Test It
1. Dashboard → Add Funds → Instant Payment
2. Enter amount & submit
3. Get redirected to AccountPe
4. Complete payment
5. **Check:** Balance should update instantly ✅

## Environment Variables Needed
```
ACCOUNTPE_API_KEY=email:password    ← Email and password separated by colon
CRON_SECRET=your_secret             ← For cron job auth
NEXT_PUBLIC_SUPABASE_URL=...        ← Database
NEXT_PUBLIC_SUPABASE_ANON_KEY=...   ← Database
```

## How Flow Works Now
```
User Payment → Transaction Created → User Pays AccountPe 
→ Webhook Received → Balance Credited ✅

Cron Job = Just monitors, doesn't break things anymore
```

## Check If Fixed
### In Vercel Logs:
```
✅ "[v0] Transaction created successfully"
✅ "[v0] Wallet credited successfully"
✅ "[Cron] Payment verification completed"
```

### In Database:
```sql
SELECT * FROM transactions 
WHERE payment_method = 'instant_xaf' 
ORDER BY created_at DESC LIMIT 5;
-- Should show: status='completed', payment_id set, user.balance updated
```

## Deployment
```bash
git push  # Vercel auto-deploys
# Wait for green checkmark
# Test payment flow
# Done! 🚀
```

## Emergency? 
- Webhook failing? Check logs in Vercel
- Cron not running? Verify CRON_SECRET in Vercel
- Still broken? Check ACCOUNTPE_API_KEY format: `email:password`

---

**Status:** ✅ READY  
**Risk:** 🟢 LOW  
**Deploy:** NOW 🚀
