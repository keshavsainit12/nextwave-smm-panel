# Google OAuth Redirect URI Fix - EXACT Configuration

## The Problem: redirect_uri_mismatch
Google is rejecting the OAuth request because the redirect URI in your Google Cloud Console doesn't match what's being sent.

## Root Cause
Google's OAuth flow works like this:
1. Your app → sends user to Google with `client_id` + `redirect_uri`
2. Google → validates that `redirect_uri` is in your Console's whitelist
3. If it doesn't match EXACTLY → Error 400: redirect_uri_mismatch

## EXACT Fix - What to Add to Google Cloud Console

### Step 1: Open Google Cloud Console
- Go to: console.cloud.google.com
- Select your project
- APIs & Services → Credentials

### Step 2: Find Your OAuth 2.0 Client ID
- Click on the client you created
- Look for "Authorized redirect URIs" section

### Step 3: Add ONLY This URL
```
https://hhtvvlzsjamprvxeayxm.supabase.co/auth/v1/callback
```

**IMPORTANT:** 
- ✅ Copy-paste exactly as shown (case-sensitive)
- ✅ Include the full path `/auth/v1/callback`
- ❌ DON'T add `http://localhost:3000/auth/callback` to Google Console
- ❌ DON'T add `https://nextwavesmm.com/auth/callback` to Google Console

### Step 4: JavaScript Origins (Different Field!)
In the "Authorized JavaScript Origins" section, add:
```
https://hhtvvlzsjamprvxeayxm.supabase.co
http://localhost:3000
https://nextwavesmm.com
```

## How the Flow Works
1. User clicks "Sign in with Google"
2. Your app → sends to Supabase OAuth handler
3. Supabase → sends to Google with redirect: `https://hhtvvlzsjamprvxeayxm.supabase.co/auth/v1/callback`
4. Google → validates against Console whitelist ✅
5. Google → sends code back to Supabase
6. Supabase → exchanges code for token
7. Supabase → redirects to your app at `/auth/callback`

## Test Steps
1. Complete Google Console configuration ✅
2. Wait 5 minutes for changes to propagate
3. Clear browser cache (Ctrl+Shift+Delete)
4. Try Google login again
5. You should see the Google consent screen

## Still Getting Error?
- Check spelling of Supabase URL (copy from Supabase Dashboard)
- Make sure Client ID and Secret are correct
- Clear all cookies for the domain
- Try in incognito/private mode
- Contact Google if issue persists: https://issuetracker.google.com/issues?q=componentid:187172
