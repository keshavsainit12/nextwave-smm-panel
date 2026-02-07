# SWACHERCONNECT PAYMENT SETUP - FINAL VERSION

## What Changed?

Based on client clarification: "Maine kabhi AccountPe use nahi kiya, sirf SwacherConnect use karta hu"

We've completely removed AccountPe authentication and now use your static SwacherConnect token.

---

## VERCEL ENVIRONMENT VARIABLES

### Add This (Required):
```
SWACHERCONNECT_TOKEN = eyJhbGciOiJIUzI1NiJ9.eyJhZG1pbl9pZCI6MTM5LCJtYWluX2FkbWluX2lkIjoxMzksInVzZXJfaWQiOjEzOSwiZXhwIjoxNzcwNTA5MTYyfQ.ggSfI9-dSATneGbJ5eN1v-idB_scdd5qNv6HHzKH5a8
```

### Remove These (Not Needed Anymore):
```
❌ ACCOUNTPE_EMAIL
❌ ACCOUNTPE_PASSWORD
```

---

## Steps to Deploy

1. **Go to Vercel Dashboard**
   - Your Project → Settings → Environment Variables

2. **Add New Variable**
   - Name: `SWACHERCONNECT_TOKEN`
   - Value: (your token from above)
   - Environment: Production, Preview, Development

3. **Remove Old Variables**
   - Delete `ACCOUNTPE_EMAIL` (if exists)
   - Delete `ACCOUNTPE_PASSWORD` (if exists)

4. **Deploy**
   - Code is already pushed to GitHub
   - Vercel will auto-deploy
   - OR manually redeploy from Vercel dashboard

---

## Token Information

**Your Token:**
- Admin ID: 139
- Valid Until: **February 8, 2026**
- Status: ✅ Active

**When Token Expires:**
Get new token from SwacherConnect dashboard and update the environment variable.

---

## How It Works Now

### Payment Flow:
1. User enters amount (XAF)
2. System uses your static token
3. Creates payment link via api.accountpe.com
4. User pays on SwacherConnect
5. System verifies payment (every 10 minutes)
6. Credits user balance automatically

### No More:
- ❌ Token refresh (not needed)
- ❌ Email/password authentication
- ❌ Database token storage

---

## Testing

After deploying:

1. Try creating instant payment
2. Should redirect to payment page
3. Complete test payment
4. Check if balance credited (within 10 minutes)

If any issues, check Vercel logs for:
- "SWACHERCONNECT_TOKEN not configured" error
- Payment creation success/failure
- Cron job execution

---

## Questions?

**Q: Why api.accountpe.com if using SwacherConnect?**
A: api.accountpe.com is SwacherConnect's payment API infrastructure. It's their technical domain for API calls.

**Q: Do I need database changes?**
A: No! All changes are in code and environment variables only.

**Q: What if token expires?**
A: Get new token from SwacherConnect and update SWACHERCONNECT_TOKEN in Vercel.

---

## Summary

✅ Simpler setup (1 variable instead of 3)
✅ No token refresh needed
✅ Uses your actual SwacherConnect token
✅ No confusion about AccountPe vs SwacherConnect

**All set! Just add the environment variable and deploy!** 🚀
