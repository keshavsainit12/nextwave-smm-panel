# Google OAuth Login & Signup - Complete Troubleshooting Guide

## Fixes Applied

### 1. **Login Page (app/auth/login/page.tsx)** ✅
- Added environment variable logging to debug missing Supabase config
- Enhanced Google OAuth parameters (offline access, consent prompt)
- Improved error messages with detailed logging

### 2. **Signup Page (app/auth/signup/page.tsx)** ✅
- Synced with login page OAuth improvements
- Added environment variable checks
- Removed `?source=signup` query param (kept consistent redirect URL)
- Enhanced error handling

### 3. **Auth Callback (app/auth/callback/route.ts)** ✅
- Removed invalid columns that were breaking profile creation
- Simplified user profile insertion
- Better error logging for debugging

### 4. **Dashboard (app/dashboard/page.tsx)** ✅
- Removed complex relationship queries that were failing
- Added error boundaries and fallback UI
- Simplified data fetching with better error handling

---

## Required Environment Variables

**Add these to your Vercel project settings (Settings → Environment Variables):**

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**How to find these:**
1. Go to Supabase Dashboard → Your Project
2. Settings → API
3. Copy `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
4. Copy `anon` public key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
5. Copy `service_role` secret key → `SUPABASE_SERVICE_ROLE_KEY`

---

## Google OAuth Configuration Steps

### Step 1: Google Cloud Console Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select/Create a project
3. Search for "OAuth 2.0 Client IDs" in APIs & Services
4. Click "Create Credentials" → "OAuth 2.0 Client ID"
5. Choose "Web application"
6. Add Authorized redirect URIs:
   - `http://localhost:3000/auth/callback` (development)
   - `https://yourdomain.com/auth/callback` (production)
7. Copy Client ID and Client Secret

### Step 2: Supabase Google OAuth Setup

1. Go to Supabase Dashboard → Authentication → Providers
2. Enable "Google"
3. Paste the Google Client ID and Secret from Step 1
4. Note the Callback URL shown in Supabase: `https://your-project.supabase.co/auth/v1/callback?provider=google`

### Step 3: Add Callback URL to Google Console

1. Go back to Google Cloud Console
2. Edit the OAuth 2.0 Client ID from Step 1
3. Add the Supabase callback URL:
   - `https://your-project.supabase.co/auth/v1/callback?provider=google`
4. Save

---

## Debugging Steps

### Check 1: Browser Console Logs
1. Open your browser's Developer Tools (F12)
2. Go to Console tab
3. Trigger login/signup
4. Look for `[v0]` messages:
   - `[v0] Environment check:` should show env vars exist
   - `[v0] Starting Google sign-in...` should show callback URL
   - `[v0] OAuth response:` will show error if present

**Common logs:**
```
[v0] SUPABASE_URL exists: true
[v0] ANON_KEY exists: true
[v0] Starting Google sign-in with callback URL: https://yourdomain.com/auth/callback
```

### Check 2: Verify Environment Variables in Production
1. Deploy to Vercel
2. Go to Vercel Project → Settings → Environment Variables
3. Confirm all 3 Supabase variables are set
4. Rerun production build if needed

### Check 3: Test OAuth Flow
1. Open incognito/private window
2. Try login first (simpler flow)
3. Check these redirect URLs:
   - Start: `https://yourdomain.com/auth/login`
   - Google: `https://accounts.google.com/...` (Google login screen)
   - Callback: `https://yourdomain.com/auth/callback` (brief redirect)
   - Final: `https://yourdomain.com/dashboard` (dashboard loads)

---

## Common Issues & Solutions

### Issue 1: "Invalid redirect_uri"
**Cause:** Callback URL in Google Console doesn't match Supabase setting
**Fix:** 
- Check Google Console: Should have BOTH your domain callback AND Supabase callback
- In Supabase: Verify callback URL is correct in provider settings

### Issue 2: "redirect_uri_mismatch"
**Cause:** Domain mismatch between Google, Supabase, and your app
**Fix:**
- Google Console: `https://yourdomain.com/auth/callback`
- Supabase callback: Will auto-generate correctly
- Your app: Check `window.location.origin` in console logs

### Issue 3: Environment variables not found
**Cause:** Variables not set in Vercel or development `.env.local` missing
**Fix:**
- Development: Create `.env.local` with all 3 variables
- Production: Add to Vercel project environment variables
- Verify with `echo $NEXT_PUBLIC_SUPABASE_URL` in terminal

### Issue 4: Dashboard won't load after login
**Cause:** Database queries failing or missing data
**Fix:**
- Check browser console for error messages
- Verify Supabase RLS policies allow user queries
- Check if `users` table exists and has required columns

---

## Testing Checklist

- [ ] Env variables set in Vercel
- [ ] Google OAuth Client ID & Secret in Supabase
- [ ] Callback URL added to Google Console
- [ ] Can see `[v0]` logs in browser console
- [ ] Google login redirects to Google login screen
- [ ] After Google auth, redirected to `/auth/callback`
- [ ] Dashboard loads and shows user data
- [ ] Signup flow works same as login
- [ ] Can create account with email/password
- [ ] Auto-login after signup redirects to dashboard

---

## Advanced Debugging

### Enable Detailed Logging (Optional)
Edit login/signup pages to add more logs:
```typescript
console.log("[v0] Window location:", window.location)
console.log("[v0] Full error object:", JSON.stringify(err, null, 2))
```

### Check Database Directly
1. Supabase Dashboard → SQL Editor
2. Run: `SELECT id, email, full_name FROM users WHERE id = 'user-id-here';`
3. Verify profile was created after OAuth signup

### Monitor Supabase Logs
1. Supabase Dashboard → Logs
2. Check auth logs for OAuth events
3. Look for any error details

---

## Support Resources

- [Supabase Auth Docs](https://supabase.com/docs/guides/auth)
- [Google OAuth Setup Guide](https://developers.google.com/identity/protocols/oauth2)
- [Common Supabase Auth Issues](https://github.com/supabase/supabase/discussions)
