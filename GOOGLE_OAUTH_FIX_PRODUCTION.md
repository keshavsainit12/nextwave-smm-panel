# Google OAuth Fix for Production Domain

## The Problem
Your app is running at `https://www.nextwavesmm.com` but your Supabase OAuth configuration is set to `http://localhost:3000/auth/callback`. **These must match exactly!**

---

## Step 1: Configure Supabase Dashboard

### Go to Supabase Console:
1. Open [Supabase Dashboard](https://app.supabase.com)
2. Select your project
3. Go to: **Authentication** → **Providers** → **Google**

### Add Redirect URIs:
You need to add **BOTH** URLs to support local development AND production:

```
http://localhost:3000/auth/callback
https://www.nextwavesmm.com/auth/callback
```

**Important:** These must be on separate lines or added individually in Supabase

---

## Step 2: Configure Google Cloud Console

### Go to Google Cloud Console:
1. Open [Google Cloud Console](https://console.cloud.google.com)
2. Select your project
3. Go to: **APIs & Services** → **Credentials**
4. Find and click your **OAuth 2.0 Client ID** for your app

### Update Authorized Redirect URIs:
Add both URLs:
```
http://localhost:3000/auth/callback
https://www.nextwavesmm.com/auth/callback
```

### Important: Also add JavaScript Origins:
```
http://localhost:3000
https://www.nextwavesmm.com
```

---

## Step 3: Verify Your Setup

After making changes, wait **1-2 minutes** for Google to propagate the changes.

### Test Locally:
1. Go to `http://localhost:3000/auth/login`
2. Click "Google" button
3. Should redirect to Google login successfully

### Test Production:
1. Go to `https://www.nextwavesmm.com/auth/login`
2. Click "Google" button
3. Should redirect to Google login successfully

---

## What Happens During Google OAuth Login:

1. User clicks "Google" button
2. Your app sends user to Google
3. User logs in with Google
4. Google redirects back to: `https://www.nextwavesmm.com/auth/callback` (matches YOUR domain)
5. Supabase receives the callback at the URL you configured in their dashboard
6. User is authenticated and redirected to `/dashboard`

---

## Common Issues:

### ❌ Issue: "redirect_uri_mismatch" error
**Fix:** The redirect URI in Google Cloud Console doesn't match your domain
- Make sure BOTH Supabase AND Google have the same redirect URI

### ❌ Issue: Works locally but not in production
**Fix:** You didn't add the production domain to both services
- Add `https://www.nextwavesmm.com/auth/callback` to Supabase
- Add `https://www.nextwavesmm.com/auth/callback` to Google Cloud Console

### ❌ Issue: Works but user isn't created in database
**Fix:** Check the `/auth/callback` route - the code is already correct
- Should automatically create user profile on first login

---

## Your Current Configuration:

- **App URL (Production):** https://www.nextwavesmm.com
- **Callback Route:** /auth/callback
- **Full Production Redirect URI:** `https://www.nextwavesmm.com/auth/callback`
- **Full Local Redirect URI:** `http://localhost:3000/auth/callback`

Both must be added to Supabase Dashboard and Google Cloud Console.
