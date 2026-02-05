# Auth Setup Quick Guide (Hindi)

**Date:** 5 February, 2026  
**Status:** Complete Investigation

---

## तीन Problems की जांच की गई

### 1. reCAPTCHA Visible Nahi Ho Raha ❓

**Current Status:**
- reCAPTCHA намеренно (intentionally) remove kiya gaya tha
- 2 February 2026 ko remove hua tha
- Reason: Login process ko simple banana tha

**Kyun Nahi Dikh Raha:**
- Code mein hai hi nahi
- Kisi form mein implement nahi kiya
- Намеренно remove kiya authentication ko simple karne ke liye

**Agar Chahiye Wapas:**

1. **Google se reCAPTCHA keys lo:**
   - Website: https://www.google.com/recaptcha/admin
   - reCAPTCHA v2 select karo
   - Site Key aur Secret Key copy karo

2. **Environment variables add karo:**
   ```
   NEXT_PUBLIC_RECAPTCHA_SITE_KEY=tumhari_site_key
   RECAPTCHA_SECRET_KEY=tumhari_secret_key
   ```

3. **Package install karo:**
   ```bash
   npm install react-google-recaptcha
   ```

4. **Login/Signup forms mein add karo:**
   - Code examples guide mein hai
   - Widget add karna hoga
   - Verification add karna hoga

**Alternative:**
- reCAPTCHA ki jagah:
  - Rate limiting use karo (Vercel built-in)
  - Honeypot fields add karo
  - Cloudflare protection use karo

**Decision:**
- Chahiye ya nahi? Tumhe decide karna hai
- Removed better hai (simple UX)
- reCAPTCHA better hai (bot protection)

---

### 2. Email API Check Karna Hai ✅

**Current Status:**
- Domain verify ho gaya ✅ (tumne kiya)
- Ab SMTP configure karna hai

**Kya Karna Hai:**

#### Step 1: Email Provider Choose Karo

**Option A: Gmail (Simple):**
```
SMTP Host: smtp.gmail.com
SMTP Port: 587
Username: tumhara-email@gmail.com
Password: app password (Gmail se generate karo)
```

**Option B: SendGrid (Professional):**
```
SMTP Host: smtp.sendgrid.net
SMTP Port: 587
Username: apikey
Password: SendGrid API key
```

**Option C: Mailgun (Scalable):**
```
SMTP Host: smtp.mailgun.org
SMTP Port: 587
Username: postmaster@yourdomain.com
Password: Mailgun password
```

#### Step 2: Supabase Mein Configure Karo

1. **Supabase Dashboard kholo:**
   - https://app.supabase.com
   - Apna project select karo

2. **Authentication settings mein jao:**
   - Settings → Authentication
   - Niche scroll karo "SMTP Settings" tak

3. **SMTP details add karo:**
   - SMTP Host enter karo
   - Port enter karo
   - Username enter karo
   - Password enter karo
   - Sender email set karo

4. **Save karo aur test karo:**
   - "Send test email" button dabao
   - Check karo email aaya ya nahi
   - Spam folder bhi check karo

#### Step 3: DNS Records Add Karo (Custom Domain Ke Liye)

Agar apne domain se email bhejna hai:

**SPF Record:**
```
Type: TXT
Name: @
Value: v=spf1 include:_spf.google.com ~all
        (ya apne provider ka)
```

**DKIM Record:**
```
Type: TXT
Name: [Provider se milega]
Value: [Provider ki DKIM key]
```

**DMARC Record:**
```
Type: TXT
Name: _dmarc
Value: v=DMARC1; p=none;
```

#### Step 4: Test Karo

1. Forgot password page pe jao: `/auth/forgot-password`
2. Email enter karo
3. "Send reset link" dabao
4. Email check karo (inbox + spam)
5. Link click karke test karo

**Agar Email Nahi Aaya:**
- SMTP settings check karo
- Password sahi hai?
- Provider account active hai?
- Spam folder dekha?

---

### 3. Google Login Work Nahi Kar Raha 🔧

**Current Status:**
- Code complete hai ✅
- Button hai login/signup pages pe ✅
- Callback handler ready hai ✅
- **Missing:** Google Cloud Console setup

**Kya Karna Hai:**

#### Step 1: Google Cloud Project Banao

1. **Google Cloud Console kholo:**
   - https://console.cloud.google.com
   - Google account se login karo

2. **New Project banao:**
   - "Select a project" pe click karo
   - "NEW PROJECT" select karo
   - Name: `NextWave SMM`
   - "CREATE" dabao

3. **APIs enable karo:**
   - "APIs & Services" → "Library"
   - Search karo: "Google+ API"
   - "ENABLE" dabao

#### Step 2: OAuth Consent Screen Configure Karo

1. **OAuth consent screen pe jao:**
   - APIs & Services → OAuth consent screen
   - "External" choose karo
   - "CREATE" dabao

2. **App information bharo:**
   ```
   App name: NextWave SMM
   User support email: support@nextwavesmm.com
   Privacy policy: https://nextwavesmm.com/privacy-policy
   Terms of service: https://nextwavesmm.com/terms-of-service
   Developer contact: support@nextwavesmm.com
   ```

3. **Scopes add karo:**
   - "ADD OR REMOVE SCOPES" click karo
   - Select karo:
     - .../auth/userinfo.email ✅
     - .../auth/userinfo.profile ✅
     - openid ✅
   - "UPDATE" → "SAVE AND CONTINUE"

4. **Save karo:**
   - "BACK TO DASHBOARD"

#### Step 3: OAuth Credentials Banao

1. **Credentials pe jao:**
   - APIs & Services → Credentials
   - "+ CREATE CREDENTIALS"
   - "OAuth 2.0 Client ID" select karo

2. **Details bharo:**
   ```
   Application type: Web application
   Name: NextWave SMM Web Client
   ```

3. **Authorized JavaScript origins add karo:**
   ```
   Production:
   https://nextwavesmm.com
   
   Development:
   http://localhost:3000
   ```

4. **Authorized redirect URIs add karo:**
   
   **IMPORTANT:** Supabase ka callback URL use karna hai!
   
   ```
   https://[YOUR-PROJECT-ID].supabase.co/auth/v1/callback
   ```
   
   **Apna Project ID kaise pata karein:**
   - Supabase Dashboard kholo
   - Settings → API
   - "Project URL" dekho: `https://xxxxx.supabase.co`
   - Callback URL: `https://xxxxx.supabase.co/auth/v1/callback`

5. **CREATE dabao:**
   - Client ID copy karo (save karo)
   - Client Secret copy karo (save karo)

#### Step 4: Supabase Mein Configure Karo

1. **Supabase Dashboard kholo:**
   - Authentication → Providers
   - "Google" dhundo

2. **Google enable karo:**
   - Toggle ON karo

3. **Credentials add karo:**
   ```
   Client ID: [Google se copy kiya]
   Client Secret: [Google se copy kiya]
   ```

4. **Save karo**

#### Step 5: Test Karo

1. **Browser cache clear karo**

2. **Login page pe jao:**
   - https://yourdomain.com/auth/login

3. **"Continue with Google" dabao:**
   - Google login page khulna chahiye
   - Account select karo
   - Permissions allow karo
   - Dashboard pe redirect hona chahiye

**Agar Error Aaye:**

**Error: "redirect_uri_mismatch"**
- Google Console mein jao
- Redirect URI sahi add kiya?
- Exact Supabase callback URL use kiya?
- 5 minute wait karo phir retry

**Error: "Access blocked"**
- OAuth consent screen complete kiya?
- Scopes add kiye?
- Test user add kiya (agar testing mode mein)?

---

## Quick Checklist

### Email Setup:
- [ ] Email provider choose kiya (Gmail/SendGrid/Mailgun)
- [ ] SMTP credentials Supabase mein add kiye
- [ ] DNS records domain mein add kiye (if custom domain)
- [ ] Test email bheja aur mila

### Google OAuth Setup:
- [ ] Google Cloud project banaya
- [ ] OAuth consent screen configure kiya
- [ ] OAuth credentials create kiye
- [ ] JavaScript origins add kiye
- [ ] Redirect URI add kiya (Supabase callback)
- [ ] Supabase mein Google enable kiya
- [ ] Client ID aur Secret add kiye
- [ ] Login test kiya

### reCAPTCHA Decision:
- [ ] Decide kiya: chahiye ya nahi?
- [ ] Agar chahiye: Keys liye?
- [ ] Agar chahiye: Package install kiya?
- [ ] Agar chahiye: Forms mein add kiya?

---

## Common Problems & Solutions

### Problem 1: Email Nahi Aa Raha

**Check karo:**
1. SMTP credentials sahi hai?
2. SMTP provider account active hai?
3. Spam folder dekha?
4. Supabase test email kaam karta hai?

**Solution:**
- Supabase mein "Send test email" try karo
- Different email provider try karo
- Email provider dashboard check karo for errors

### Problem 2: Google Button Click Nahi Ho Raha

**Check karo:**
1. Browser console mein error?
2. Environment variables set hai?
3. Supabase URL sahi hai?

**Solution:**
- F12 dabao (console kholo)
- Button click karo
- Error message dekho
- Network tab check karo

### Problem 3: Google Login Redirect Ke Baad Error

**Check karo:**
1. Callback URL sahi add kiya Google mein?
2. User database mein create hua?
3. Error message kya hai?

**Solution:**
- Error message carefully padho
- Google Console mein redirect URI check karo
- Supabase logs check karo
- Database check karo: user create hua ki nahi

---

## Testing Steps

### Test 1: Email/Password Login
```
1. /auth/login pe jao
2. Email aur password enter karo
3. "Sign in" dabao
4. Dashboard pe jana chahiye
5. Console mein error nahi hona chahiye
```

### Test 2: Email/Password Signup
```
1. /auth/signup pe jao
2. Form bharo (name, email, password)
3. "Create account" dabao
4. Success message dikhna chahiye
5. Auto-login hona chahiye
6. Dashboard pe redirect hona chahiye
```

### Test 3: Google OAuth Login
```
1. /auth/login pe jao
2. "Continue with Google" dabao
3. Google login complete karo
4. Permissions allow karo
5. Dashboard pe redirect hona chahiye
6. Database mein user check karo
```

### Test 4: Password Reset
```
1. /auth/forgot-password pe jao
2. Email enter karo
3. "Send reset link" dabao
4. Email check karo (inbox + spam)
5. Link click karo
6. New password set karo
7. New password se login try karo
```

---

## Important Links

### Documentation:
- Complete Guide (English): `AUTH_SERVICES_COMPLETE_GUIDE.md`
- Google OAuth Guides: Multiple files in project root

### External Services:
- Google Cloud Console: https://console.cloud.google.com
- Google reCAPTCHA: https://www.google.com/recaptcha/admin
- Supabase Dashboard: https://app.supabase.com

### Project Files:
- Login Page: `/app/auth/login/page.tsx`
- Signup Page: `/app/auth/signup/page.tsx`
- Callback Handler: `/app/auth/callback/route.ts`
- Auth Actions: `/app/actions/auth.ts`

---

## Summary

### रeCAPTCHA:
- **Status:** Намеренно remove kiya gaya
- **Decision:** Tumhe decide karna hai - chahiye ya nahi
- **Guide:** Section 1 mein complete steps hai

### Email API:
- **Status:** Domain verify ✅, SMTP setup needed
- **Action:** Email provider choose karo, SMTP configure karo
- **Guide:** Section 2 mein complete steps hai

### Google OAuth:
- **Status:** Code ready ✅, Google Console setup needed
- **Action:** Google Cloud setup karo, Supabase mein enable karo
- **Guide:** Section 3 mein complete steps hai

---

## Next Steps

1. **Pehle decide karo:** reCAPTCHA chahiye ya nahi?
2. **Email setup karo:** SMTP configure karo Supabase mein
3. **Google OAuth setup karo:** Step-by-step follow karo
4. **Test karo:** Sab features properly check karo
5. **Production deploy karo:** Sab working hone ke baad

---

**Koi problem ho toh complete guide padho:** `AUTH_SERVICES_COMPLETE_GUIDE.md`

**सब कुछ detail mein है! Good luck! 🚀**
