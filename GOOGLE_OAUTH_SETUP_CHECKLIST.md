# Google OAuth & Dashboard Fix - Complete Setup Guide

## ✅ Issues Fixed

1. **Google OAuth Callback URL Mismatch** - Updated with environment detection
2. **Dashboard Query Issues** - Simplified queries, removed complex relationships
3. **Error Handling** - Added better error messages and logging

---

## 🔧 Environment Variables Required

Make sure these are set in your Vercel project:

```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
NEXT_PUBLIC_RECAPTCHA_SITE_KEY=your_recaptcha_key
RECAPTCHA_SECRET_KEY=your_recaptcha_secret
```

---

## 🔐 Google OAuth Configuration in Supabase

### Step 1: Get Your Callback URL

Go to your Supabase Dashboard → Authentication → Providers → Google

Your callback URL should be:
- **Development:** `http://localhost:3000/auth/callback`
- **Production:** `https://yourdomain.com/auth/callback`

### Step 2: Add Callback URL to Google Console

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Select your project
3. Go to **APIs & Services** → **Credentials**
4. Click on your OAuth 2.0 Client ID
5. Add these Authorized redirect URIs:
   - `http://localhost:3000/auth/callback`
   - `https://yourdomain.com/auth/callback`
   - `https://yourdomain.com.vercel.app/auth/callback`

### Step 3: Update Supabase

1. In Supabase Dashboard, go to **Authentication** → **Providers** → **Google**
2. Enable the provider
3. Add your Google Client ID and Client Secret
4. Set the Redirect URL to: `https://yourdomain.com/auth/callback`

---

## 🧪 Testing Google Login

1. Open your app in a **new incognito/private window**
2. Click "Sign in with Google" button
3. Check browser console for debug logs (look for `[v0]` prefix)
4. If you see errors, check:
   - Supabase URL & Keys are correct
   - Google Client ID/Secret are correct
   - Callback URL matches exactly
   - No typos in domain names

---

## 📊 Dashboard Loading Issues

### If dashboard shows errors:

1. **Check user profile exists:**
   ```sql
   SELECT * FROM users WHERE id = 'user-id-here';
   ```

2. **Check tables exist:**
   ```sql
   SELECT * FROM orders LIMIT 1;
   SELECT * FROM services LIMIT 1;
   SELECT * FROM service_categories LIMIT 1;
   ```

3. **Check Row Level Security (RLS):**
   - Tables should have RLS policies for users
   - Ensure policies allow SELECT on user's own data

---

## 🐛 Common Issues & Solutions

### Issue: "Google sign-in failed"
- ✅ Check env vars are set
- ✅ Check Google OAuth credentials
- ✅ Check callback URL matches exactly
- ✅ Clear browser cache & cookies

### Issue: "Failed to create profile"
- ✅ Check `users` table exists
- ✅ Check RLS policies aren't blocking inserts
- ✅ Check service role key is correct

### Issue: Dashboard loads but no data
- ✅ Check `orders`, `services`, `service_categories` tables exist
- ✅ Check RLS policies allow SELECT
- ✅ Check data is actually in tables

### Issue: Redirect loop after Google login
- ✅ Check callback route `/app/auth/callback/route.ts` exists
- ✅ Check user profile creation in callback
- ✅ Check redirect URL in login page matches callback

---

## 🚀 Quick Checklist

- [ ] Supabase URL set in env vars
- [ ] Supabase anon key set in env vars
- [ ] Service role key set in env vars
- [ ] Google Client ID set in Supabase
- [ ] Google Client Secret set in Supabase
- [ ] Redirect URI in Google Console matches callback URL
- [ ] Callback URL in Supabase matches your domain
- [ ] Users table exists and has correct columns
- [ ] RLS is enabled on tables
- [ ] Service has at least one active service in database

---

## 📞 Debug Command

In browser console, run:
```javascript
// Check if environment is loaded
fetch('/api/v1/balance').then(r => r.json()).then(console.log)
```

---

## 💡 What Changed

1. **Login Page (`/app/auth/login/page.tsx`)**
   - Added environment variable logging
   - Improved error messages
   - Added `access_type` & `prompt` for better OAuth flow

2. **Callback Route (`/app/auth/callback/route.ts`)**
   - Removed `tier_id` and `company` from profile creation
   - Simplified user profile insertion
   - Better error logging

3. **Dashboard (`/app/dashboard/page.tsx`)**
   - Removed complex relationship queries
   - Added error handling for missing tables
   - Simplified service query
   - Added fallback UI for errors

---

## ✨ Next Steps

1. Set environment variables in Vercel
2. Test Google OAuth in incognito window
3. If errors persist, check browser console for `[v0]` debug logs
4. Verify database tables exist and have correct data
