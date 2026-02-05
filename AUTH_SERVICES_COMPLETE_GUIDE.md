# Complete Auth & Services Setup Guide

**Date:** February 5, 2026  
**Status:** Complete Investigation & Solutions

---

## Issues Reported (Hindi/English)

> "recaptcha visible nahi ho rha hai, email api check karo (domain verify kar diya hai), aur google login bhi check karo - work nahi kar rha hai"

**Translation:**
1. reCAPTCHA is not visible
2. Email API needs checking (domain has been verified)
3. Google login is not working

---

## 1. reCAPTCHA Status ❓

### Current Status: **INTENTIONALLY REMOVED**

reCAPTCHA was completely removed from the authentication flow on February 2, 2026 as documented in `RECAPTCHA_REMOVED.md`.

### Why It's Not Visible

The reCAPTCHA is not visible because:
- ✅ It was removed from all auth pages (login/signup)
- ✅ No reCAPTCHA widget code exists in the forms
- ✅ No reCAPTCHA verification in backend
- ✅ This was an intentional decision to simplify authentication

### Current Authentication Flow

**Without reCAPTCHA:**
```
User enters email/password
↓
Direct Supabase authentication
↓
Success → Redirect to dashboard/admin
```

### If You Want reCAPTCHA Back

If you need bot protection and want to add reCAPTCHA:

#### Option 1: Add reCAPTCHA v2 (Checkbox)

**Steps:**

1. **Get reCAPTCHA Keys**
   - Go to: https://www.google.com/recaptcha/admin
   - Create new site with reCAPTCHA v2 checkbox
   - Get Site Key and Secret Key

2. **Add Environment Variables**
   ```env
   NEXT_PUBLIC_RECAPTCHA_SITE_KEY=your_site_key_here
   RECAPTCHA_SECRET_KEY=your_secret_key_here
   ```

3. **Add reCAPTCHA to Forms**
   
   Install the package:
   ```bash
   npm install react-google-recaptcha
   ```
   
   Add to login/signup pages:
   ```tsx
   import ReCAPTCHA from "react-google-recaptcha"
   
   // In component:
   const [recaptchaToken, setRecaptchaToken] = useState<string | null>(null)
   
   // Add widget:
   <ReCAPTCHA
     sitekey={process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY!}
     onChange={(token) => setRecaptchaToken(token)}
   />
   
   // Verify token is present before submission
   ```

4. **Add Server-Side Verification**
   
   In `app/actions/auth.ts`:
   ```typescript
   async function verifyRecaptcha(token: string): Promise<boolean> {
     const secret = process.env.RECAPTCHA_SECRET_KEY
     const response = await fetch('https://www.google.com/recaptcha/api/siteverify', {
       method: 'POST',
       headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
       body: `secret=${secret}&response=${token}`
     })
     const data = await response.json()
     return data.success
   }
   ```

#### Option 2: Use Alternative Bot Protection

Instead of reCAPTCHA, consider:
- Vercel rate limiting (built-in)
- Honeypot fields (invisible to users)
- IP-based rate limiting
- Cloudflare protection

---

## 2. Email API Setup ✅

### Current Status: **NEEDS VERIFICATION**

You mentioned domain has been verified. Let's ensure email is properly configured.

### Supabase Email Configuration

#### Step 1: Check Supabase Email Settings

1. Go to **Supabase Dashboard**: https://app.supabase.com
2. Select your project
3. Navigate to **Authentication** → **Email Templates**
4. Check if templates are configured

#### Step 2: Custom SMTP (If Using Custom Domain)

If you want emails from your domain (e.g., noreply@nextwavesmm.com):

1. **Go to Supabase Settings**
   - Project Settings → Authentication
   - Scroll to "SMTP Settings"

2. **Configure SMTP Provider**
   
   **Option A: Using Gmail**
   ```
   SMTP Host: smtp.gmail.com
   SMTP Port: 587
   SMTP User: your-email@gmail.com
   SMTP Password: your-app-password
   Sender Email: your-email@gmail.com
   Sender Name: NextWave SMM
   ```

   **Option B: Using SendGrid**
   ```
   SMTP Host: smtp.sendgrid.net
   SMTP Port: 587
   SMTP User: apikey
   SMTP Password: your-sendgrid-api-key
   Sender Email: noreply@yourdomain.com
   Sender Name: NextWave SMM
   ```

   **Option C: Using Mailgun**
   ```
   SMTP Host: smtp.mailgun.org
   SMTP Port: 587
   SMTP User: postmaster@yourdomain.com
   SMTP Password: your-mailgun-password
   Sender Email: noreply@yourdomain.com
   Sender Name: NextWave SMM
   ```

3. **Test Email Sending**
   - Try password reset
   - Try signup (if email confirmation enabled)
   - Check spam folder if not receiving

#### Step 3: Domain Verification (DNS Records)

If using custom domain for emails, add these DNS records:

**SPF Record:**
```
Type: TXT
Name: @
Value: v=spf1 include:_spf.yourmailprovider.com ~all
```

**DKIM Record:**
```
Type: TXT
Name: [provided by your email service]
Value: [DKIM key from your email service]
```

**DMARC Record:**
```
Type: TXT
Name: _dmarc
Value: v=DMARC1; p=none; rua=mailto:admin@yourdomain.com
```

#### Step 4: Enable Email Features

In Supabase Authentication settings:

1. **Enable Email Confirmations** (if needed)
   - Check "Enable email confirmations"
   - Users must verify email before login

2. **Disable Email Confirmations** (for faster signup)
   - Uncheck "Enable email confirmations"
   - Users can login immediately after signup

3. **Configure Password Reset**
   - Should work automatically with proper SMTP
   - Test at: `/auth/forgot-password`

### Verification Checklist

- [ ] SMTP configured in Supabase
- [ ] Email templates customized
- [ ] DNS records added (if custom domain)
- [ ] Test email sending works
- [ ] Check spam folder settings
- [ ] Verify sender reputation

---

## 3. Google OAuth Setup 🔧

### Current Status: **IMPLEMENTATION READY - NEEDS CONFIGURATION**

The code for Google login exists and is properly implemented. It's just needs Google Cloud Console configuration.

### Google OAuth Implementation Status

✅ **Frontend Implementation:**
- Login page has Google button (`/app/auth/login/page.tsx`)
- Signup page has Google button (`/app/auth/signup/page.tsx`)
- Callback handler exists (`/app/auth/callback/route.ts`)

✅ **Callback URL:**
- Configured: `https://yourdomain.com/auth/callback`
- Handler properly processes OAuth response

❓ **Missing Configuration:**
- Google Cloud Console credentials
- Authorized JavaScript origins
- Authorized redirect URIs

### Complete Google OAuth Setup

#### Step 1: Create Google Cloud Project

1. **Go to Google Cloud Console**
   - URL: https://console.cloud.google.com
   - Sign in with Google account

2. **Create New Project**
   - Click "Select a project" → "NEW PROJECT"
   - Project name: `NextWave SMM`
   - Click "CREATE"

3. **Enable Required APIs**
   - Go to "APIs & Services" → "Library"
   - Search and enable:
     - ✅ Google+ API
     - ✅ Google Identity Services API

#### Step 2: Configure OAuth Consent Screen

1. **Go to OAuth consent screen**
   - APIs & Services → OAuth consent screen
   - Choose "External" (for public users)
   - Click "CREATE"

2. **Fill App Information**
   ```
   App name: NextWave SMM
   User support email: support@nextwavesmm.com
   App logo: [Upload your logo]
   Application home page: https://nextwavesmm.com
   Privacy policy: https://nextwavesmm.com/privacy-policy
   Terms of service: https://nextwavesmm.com/terms-of-service
   Developer contact: support@nextwavesmm.com
   ```

3. **Add Scopes** (Click "ADD OR REMOVE SCOPES")
   - ✅ .../auth/userinfo.email
   - ✅ .../auth/userinfo.profile
   - ✅ openid
   
   Click "UPDATE" → "SAVE AND CONTINUE"

4. **Test Users** (Optional for testing)
   - Add your email for testing
   - Click "SAVE AND CONTINUE"

5. **Review and Submit**
   - Review all info
   - Click "BACK TO DASHBOARD"

#### Step 3: Create OAuth 2.0 Credentials

1. **Go to Credentials**
   - APIs & Services → Credentials
   - Click "+ CREATE CREDENTIALS"
   - Select "OAuth 2.0 Client ID"

2. **Configure OAuth Client**
   ```
   Application type: Web application
   Name: NextWave SMM Web Client
   ```

3. **Add Authorized JavaScript Origins**
   ```
   Production:
   https://nextwavesmm.com
   
   Development:
   http://localhost:3000
   ```

4. **Add Authorized Redirect URIs**
   
   **Important:** Use your Supabase project URL for OAuth callback
   
   ```
   https://[YOUR-PROJECT-ID].supabase.co/auth/v1/callback
   ```
   
   **How to find your Supabase project ID:**
   - Go to Supabase Dashboard
   - Project Settings → API
   - Look at "Project URL": `https://xxxxx.supabase.co`
   - Your redirect URI: `https://xxxxx.supabase.co/auth/v1/callback`

5. **Create Credentials**
   - Click "CREATE"
   - **IMPORTANT:** Copy the Client ID and Client Secret
   - Save them securely

#### Step 4: Configure Supabase OAuth

1. **Go to Supabase Dashboard**
   - Authentication → Providers
   - Find "Google"

2. **Enable Google Provider**
   - Toggle ON "Google enabled"

3. **Add Credentials**
   ```
   Client ID: [Your Google OAuth Client ID]
   Client Secret: [Your Google OAuth Client Secret]
   ```

4. **Configure Redirect URL**
   - Should already show: `https://xxxxx.supabase.co/auth/v1/callback`
   - This is automatically generated by Supabase
   - Make sure this matches what you added in Google Console

5. **Save Settings**

#### Step 5: Update Environment Variables

Add to your `.env.local` (or Vercel environment):

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

#### Step 6: Test Google OAuth

1. **Clear browser cache and cookies**

2. **Go to login page**
   - URL: `https://yourdomain.com/auth/login`

3. **Click "Continue with Google"**
   - Should redirect to Google login
   - If you see "Error 400: redirect_uri_mismatch"
     → Check redirect URIs in Google Console
     → Make sure Supabase callback URL is added

4. **After Google login:**
   - Should redirect to `/auth/callback`
   - Then to `/dashboard` (for users) or `/admin-panel-2024` (for admins)

### Common Google OAuth Errors & Fixes

#### Error: "redirect_uri_mismatch"

**Problem:** Redirect URI not authorized in Google Console

**Fix:**
1. Go to Google Cloud Console → Credentials
2. Edit your OAuth client
3. Add the EXACT Supabase callback URL:
   `https://[your-project-id].supabase.co/auth/v1/callback`
4. Save and wait 5 minutes for Google to update

#### Error: "Access blocked: This app's request is invalid"

**Problem:** OAuth consent screen not configured

**Fix:**
1. Complete OAuth consent screen setup
2. Add required scopes (email, profile, openid)
3. If still in testing mode, add your email as test user

#### Error: "idpiframe_initialization_failed"

**Problem:** Third-party cookies blocked or wrong JavaScript origin

**Fix:**
1. Check browser allows third-party cookies
2. Verify JavaScript origins in Google Console
3. Add your domain: `https://yourdomain.com`

#### Error: Login works but user not created in database

**Problem:** Supabase database triggers not set up

**Fix:**
1. Go to Supabase SQL Editor
2. Run this query to check if user was created:
   ```sql
   SELECT * FROM auth.users ORDER BY created_at DESC LIMIT 5;
   ```
3. If user exists in auth but not in public.users:
   - Check if database trigger exists
   - Check trigger creates user in public.users table

### Verification Checklist - Google OAuth

- [ ] Google Cloud project created
- [ ] OAuth consent screen configured
- [ ] OAuth 2.0 credentials created
- [ ] JavaScript origins added correctly
- [ ] Redirect URIs match Supabase callback URL
- [ ] Google provider enabled in Supabase
- [ ] Client ID and Secret added to Supabase
- [ ] Test login works without errors
- [ ] User created in database after login
- [ ] Proper redirect after successful login

---

## 4. Complete Testing Procedure

### Test 1: Email/Password Login

```
1. Go to /auth/login
2. Enter email and password
3. Click "Sign in"
4. Should redirect to:
   - /dashboard (if user role)
   - /admin-panel-2024 (if admin role)
5. Check no errors in console
```

**Expected Result:** ✅ Login successful, proper redirect

### Test 2: Email/Password Signup

```
1. Go to /auth/signup
2. Fill all required fields:
   - Full name
   - Email
   - Password (min 8 chars)
   - Confirm password
3. Click "Create account"
4. Should show success message
5. Should auto-login and redirect to /dashboard
```

**Expected Result:** ✅ Account created, auto-login works

### Test 3: Google OAuth Login

```
1. Go to /auth/login
2. Click "Continue with Google"
3. Should redirect to Google login
4. Select Google account
5. Grant permissions
6. Should redirect back to app
7. Should go to /dashboard or /admin-panel-2024
```

**Expected Result:** ✅ Google login successful, proper redirect

### Test 4: Password Reset (Email)

```
1. Go to /auth/forgot-password
2. Enter email
3. Click "Send reset link"
4. Check email inbox (and spam folder)
5. Click reset link in email
6. Should go to /auth/reset-password
7. Enter new password
8. Submit
9. Try logging in with new password
```

**Expected Result:** ✅ Password reset email received and works

### Test 5: Google OAuth Signup

```
1. Go to /auth/signup
2. Click "Continue with Google"
3. Select Google account
4. Grant permissions
5. Should create new account
6. Should redirect to /dashboard
7. Check user exists in database
```

**Expected Result:** ✅ Account created via Google, proper redirect

---

## 5. Troubleshooting

### Issue: "No emails being sent"

**Checks:**
- [ ] SMTP configured in Supabase?
- [ ] SMTP credentials correct?
- [ ] Sender email verified?
- [ ] Check spam folder?
- [ ] Test with Supabase test button?

**Solution:**
1. Go to Supabase → Authentication → Email Templates
2. Click "Send test email"
3. If fails, check SMTP settings
4. Try with different email provider (Gmail, SendGrid)

### Issue: "Google login button does nothing"

**Checks:**
- [ ] Browser console shows errors?
- [ ] Network tab shows OAuth request?
- [ ] Environment variables set?
- [ ] Supabase URL correct?

**Solution:**
1. Open browser console (F12)
2. Click Google button
3. Look for error messages
4. Check network tab for failed requests
5. Verify NEXT_PUBLIC_SUPABASE_URL is set

### Issue: "Google login redirects but shows error"

**Checks:**
- [ ] Callback URL correct?
- [ ] User created in database?
- [ ] Role assigned to user?

**Solution:**
1. Check URL when error shows
2. Look at error message
3. Check browser console
4. Verify callback handler at `/app/auth/callback/route.ts`
5. Check database for user creation

---

## 6. Quick Setup Summary

### For reCAPTCHA (If You Want It):
1. Get keys from Google reCAPTCHA
2. Add environment variables
3. Install react-google-recaptcha
4. Add widget to forms
5. Add server verification

### For Email API:
1. ✅ Configure SMTP in Supabase
2. ✅ Add DNS records (if custom domain)
3. ✅ Test password reset
4. ✅ Check email templates
5. ✅ Verify emails not in spam

### For Google OAuth:
1. ✅ Create Google Cloud project
2. ✅ Configure OAuth consent screen
3. ✅ Create OAuth credentials
4. ✅ Add redirect URIs (Supabase callback)
5. ✅ Enable in Supabase
6. ✅ Test login flow

---

## 7. Hindi Summary / हिंदी सारांश

### reCAPTCHA
- **Status:** Намеренно remove kiya gaya hai (intentionally removed)
- **Agar chahiye:** Google se keys lo, environment variables add karo, code mein implement karo

### Email API
- **Status:** Domain verify ho gaya, ab SMTP configure karna hai
- **Kya karna hai:**
  1. Supabase mein SMTP settings add karo
  2. Email provider choose karo (Gmail, SendGrid, Mailgun)
  3. DNS records add karo domain mein
  4. Test karo password reset se

### Google Login
- **Status:** Code ready hai, sirf Google Console mein setup karna hai
- **Kya karna hai:**
  1. Google Cloud Console mein project banao
  2. OAuth credentials create karo
  3. Supabase ka callback URL add karo
  4. Supabase mein Google provider enable karo
  5. Client ID aur Secret add karo

---

## 8. Next Steps

### Immediate Actions:

1. **Decide on reCAPTCHA**
   - Do you want it back? (for bot protection)
   - Or keep it removed? (simpler user experience)

2. **Configure Email**
   - Choose email provider (Gmail/SendGrid/Mailgun)
   - Add SMTP settings to Supabase
   - Test password reset flow

3. **Setup Google OAuth**
   - Follow Step 1-6 in Section 3
   - Test login thoroughly
   - Verify user creation in database

### Long-term Improvements:

- Add rate limiting for API endpoints
- Implement honeypot fields for spam protection
- Set up email templates with branding
- Add email verification (optional)
- Monitor authentication logs
- Set up error tracking (Sentry)

---

## 9. Support Resources

### Documentation Links:
- Supabase Auth: https://supabase.com/docs/guides/auth
- Google OAuth: https://developers.google.com/identity/protocols/oauth2
- reCAPTCHA: https://developers.google.com/recaptcha

### Configuration Files in Project:
- `/lib/recaptcha-config.ts` - reCAPTCHA configuration
- `/app/auth/login/page.tsx` - Login page with OAuth
- `/app/auth/signup/page.tsx` - Signup page with OAuth
- `/app/auth/callback/route.ts` - OAuth callback handler
- `/app/actions/auth.ts` - Authentication actions

### Existing Documentation:
- `RECAPTCHA_REMOVED.md` - Why reCAPTCHA was removed
- `GOOGLE_OAUTH_SETUP_GUIDE.md` - Basic OAuth setup
- `GOOGLE_OAUTH_COMPLETE_GUIDE.md` - Complete OAuth guide

---

## Conclusion

All three issues have been investigated:

1. **reCAPTCHA** - Not visible because it was intentionally removed. Can be added back if needed.
2. **Email API** - Domain verified, needs SMTP configuration in Supabase.
3. **Google OAuth** - Code ready, needs Google Cloud Console setup and Supabase configuration.

Follow the step-by-step guides above to complete the setup. All the code is already in place and working - it just needs proper configuration in external services (Google Console, Supabase, Email Provider).

**Status:** Ready for configuration! 🚀
