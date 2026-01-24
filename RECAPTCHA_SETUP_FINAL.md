# reCAPTCHA Setup - Final Configuration Guide

## Your reCAPTCHA Keys

```
Site Key (Public):     6Lea01QsAAAAAG7Wv83BSoSV7NWF14KLe6poX4As
Secret Key (Private):  6Lea01QsAAAAAFmpctyqalpZY9iGhywZrEMKAD3F
```

## Step 1: Add Environment Variables to Vercel

Go to **Vercel Dashboard → Your Project → Settings → Environment Variables**

Add these 2 variables:

### Variable 1: NEXT_PUBLIC_RECAPTCHA_SITE_KEY
- **Key**: `NEXT_PUBLIC_RECAPTCHA_SITE_KEY`
- **Value**: `6Lea01QsAAAAAG7Wv83BSoSV7NWF14KLe6poX4As`
- **Environments**: Select All (Production, Preview, Development)
- **Click**: Add

### Variable 2: RECAPTCHA_SECRET_KEY
- **Key**: `RECAPTCHA_SECRET_KEY`
- **Value**: `6Lea01QsAAAAAFmpctyqalpZY9iGhywZrEMKAD3F`
- **Environments**: Select All (Production, Preview, Development)
- **Click**: Add

## Step 2: Verify in Your Code

The reCAPTCHA is already integrated in these files:

### Frontend Pages (Client-side)
- `/app/auth/signup/page.tsx` - Already has reCAPTCHA v2 checkbox
- `/app/auth/login/page.tsx` - Can be enhanced with reCAPTCHA

### Backend Verification (Server-side)
- `/app/actions/auth.ts` - Contains `verifyRecaptcha()` function that validates the token

### Configuration File
- `/lib/recaptcha-config.ts` - Centralized reCAPTCHA configuration

## How It Works

1. **User visits signup page** → reCAPTCHA widget displays
2. **User completes "I'm not a robot" check** → Google returns token
3. **Form submission** → Token sent to server
4. **Server verifies token** using secret key
5. **Account created** if verification passes

## Protected Pages

| Page | Path | Protection |
|------|------|-----------|
| Sign Up | `/auth/signup` | reCAPTCHA v2 Checkbox (Required) |
| Verification | `/app/actions/auth.ts` | Token validation with score check |

## Testing

### Local Development
1. The keys work on localhost:3000
2. Make sure `.env.local` or Vercel preview has the environment variables

### Production (nextwavesmm.com)
1. Verify the domain is registered in Google reCAPTCHA Console
2. Check the keys match the Google project

## Troubleshooting

**"reCAPTCHA not configured"**
- Check that `NEXT_PUBLIC_RECAPTCHA_SITE_KEY` is set in Vercel
- Check that `RECAPTCHA_SECRET_KEY` is set in Vercel
- Redeploy the project after adding variables

**"reCAPTCHA verification failed"**
- Token might be expired (tokens expire after 2 minutes)
- Score might be below 0.5 (appears human-like)
- Secret key might be incorrect

**Widget not showing**
- Check browser console for errors
- Ensure `NEXT_PUBLIC_RECAPTCHA_SITE_KEY` is set
- Check that `google/recaptcha/api.js` script loads

## Security Notes

- **Site Key**: Public, safe to expose on client
- **Secret Key**: Private, never expose to client (server-side only)
- **Token Expiry**: Google tokens expire in 2 minutes
- **Score**: Ranges from 0 (likely bot) to 1 (likely human)
- **Minimum Score**: 0.5 (can be adjusted in `/app/actions/auth.ts`)

## More Info

- Google reCAPTCHA Docs: https://www.google.com/recaptcha/admin
- reCAPTCHA Console: https://www.google.com/recaptcha/admin/dashboard
