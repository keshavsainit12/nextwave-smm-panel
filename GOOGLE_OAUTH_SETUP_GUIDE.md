# Google OAuth Setup Guide - Complete Steps

## Your App Details
**App URL:** https://nextwavesmm.com  
**Callback URL:** https://nextwavesmm.com/auth/callback  
**Supabase Project:** Already Connected ✓

---

## Step 1: Create Google Cloud Project

1. Go to **Google Cloud Console**: https://console.cloud.google.com/
2. Click **"Select a Project"** → **"NEW PROJECT"**
3. Enter Project Name: `NextWave SMM`
4. Click **"CREATE"**
5. Wait for project creation (30 seconds)

---

## Step 2: Enable Google+ API

1. Go to **APIs & Services** → **Library**
2. Search for **"Google+ API"**
3. Click on it → Click **"ENABLE"**
4. Go back and search for **"Gmail API"** (optional, for email features)
5. Click **"ENABLE"**

---

## Step 3: Create OAuth 2.0 Credentials

1. Go to **APIs & Services** → **Credentials**
2. Click **"+ CREATE CREDENTIALS"** → **"OAuth 2.0 Client ID"**
3. If prompted to configure consent screen first:
   - Click **"Configure Consent Screen"**
   - Choose **"External"**
   - Click **"CREATE"**

---

## Step 4: Configure OAuth Consent Screen

Fill these fields:

**Step 1: OAuth consent screen**
- **App name:** NextWave SMM
- **User support email:** support@nextwavesmm.com
- **Developer contact:** support@nextwavesmm.com
- Click **"SAVE AND CONTINUE"**

**Step 2: Scopes**
- Click **"ADD OR REMOVE SCOPES"**
- Add these:
  - `userinfo.email`
  - `userinfo.profile`
- Click **"UPDATE"** → **"SAVE AND CONTINUE"**

**Step 3: Test users (Optional)**
- Click **"ADD USERS"**
- Add your test email
- Click **"SAVE AND CONTINUE"**

**Step 4: Summary**
- Review and click **"BACK TO DASHBOARD"**

---

## Step 5: Create OAuth Client ID

1. Go back to **Credentials**
2. Click **"+ CREATE CREDENTIALS"** → **"OAuth 2.0 Client ID"**
3. Select **"Web application"**
4. Enter Name: `NextWave SMM Web`

**Add Authorized JavaScript origins:**
\`\`\`
http://localhost:3000
https://nextwavesmm.com
\`\`\`

**Add Authorized redirect URIs:**
\`\`\`
http://localhost:3000/auth/callback
https://nextwavesmm.com/auth/callback
\`\`\`

5. Click **"CREATE"**
6. Copy these values:
   - **Client ID:** (long string ending in .apps.googleusercontent.com)
   - **Client Secret:** (secret string)

---

## Step 6: Add to Supabase

1. Go to **Supabase Dashboard** → Your Project
2. Click **Authentication** → **Providers**
3. Find **Google** and click it
4. Enable **"Enable Sign in with Google"**
5. Paste:
   - **Client ID** (from Google Console)
   - **Client Secret** (from Google Console)
6. Click **"Save"**

---

## Step 7: Verify Your App Configuration

Your app already has these endpoints configured:

**Login Page:** `/auth/login` ✓  
**Signup Page:** `/auth/signup` ✓  
**Callback Handler:** `/auth/callback` ✓  
**Redirect URL:** `https://nextwavesmm.com/auth/callback` ✓

---

## Testing Checklist

- [ ] Google Console Project Created
- [ ] Google+ API Enabled
- [ ] OAuth 2.0 Client ID Created
- [ ] Client ID & Secret copied
- [ ] Added to Supabase Authentication
- [ ] Test login button on `/auth/login`
- [ ] Test signup button on `/auth/signup`
- [ ] Verify callback redirects to dashboard

---

## Troubleshooting

**Error: "Redirect URI mismatch"**
- Add `https://nextwavesmm.com/auth/callback` to Google Console authorized URIs

**Error: "Client ID not found"**
- Verify Client ID in Supabase matches Google Console exactly

**Error: "This app isn't verified"**
- This is normal for testing. Click "Continue" to proceed.

---

## API Endpoints in Your App

Your callback route at `/app/auth/callback/route.ts` handles:
- ✓ Exchanging OAuth code for session
- ✓ Creating user profile automatically
- ✓ Setting default tier for new users
- ✓ Redirecting to dashboard on success
