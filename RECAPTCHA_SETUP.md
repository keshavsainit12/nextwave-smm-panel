# reCAPTCHA Setup Guide

## Environment Variables Required

Add these environment variables to your Vercel project:

### reCAPTCHA Keys
```
RECAPTCHA_SECRET_KEY=6Lea01QsAAAAAFmpctyqalpZY9iGhywZrEMKAD3F
NEXT_PUBLIC_RECAPTCHA_SITE_KEY=6Lea01QsAAAAAG7Wv83BSoSV7NWF14KLe6poX4As
```

### How to Add in Vercel:
1. Go to your Vercel Project Settings
2. Navigate to "Environment Variables"
3. Add the following variables:
   - Key: `RECAPTCHA_SECRET_KEY`
   - Value: `6Lea01QsAAAAAFmpctyqalpZY9iGhywZrEMKAD3F`
   - Environments: Production, Preview, Development

## reCAPTCHA Configuration

### Site Key (Public)
- **Key**: `6Lea01QsAAAAAG7Wv83BSoSV7NWF14KLe6poX4As`
- **Usage**: Used in frontend (client-side) for reCAPTCHA widget display
- **Location**: `/app/auth/signup/page.tsx` and `/app/auth/login/page.tsx`
- **Prefix**: `NEXT_PUBLIC_` (accessible on client)

### Secret Key (Private)
- **Key**: `6Lea01QsAAAAAFmpctyqalpZY9iGhywZrEMKAD3F`
- **Usage**: Used in backend (server-side) for token verification
- **Location**: `/app/actions/auth.ts` function `verifyRecaptcha()`
- **DO NOT**: Expose this key on the client-side

## Pages Protected with reCAPTCHA

1. **Signup Page** (`/app/auth/signup/page.tsx`)
   - reCAPTCHA v2 checkbox verification
   - Required before account creation
   - Server-side token verification via `verifyRecaptcha()`

2. **Login Page** (`/app/auth/login/page.tsx`)
   - Optional: Can be added for security (future enhancement)

## How It Works

1. **User fills form** on signup page
2. **reCAPTCHA widget** renders with site key
3. **User completes reCAPTCHA** (checks "I'm not a robot")
4. **Google returns token** to client
5. **Form submission** sends token to server
6. **Server verifies token** using secret key
7. **Account created** if verification passes

## Testing

### Local Development
- reCAPTCHA will work with test/localhost
- Make sure environment variables are set in `.env.local` or Vercel

### Production
- reCAPTCHA will work on production domain
- Domain must be registered in Google reCAPTCHA console

## Security Notes

- Secret key never exposed to client-side code
- Token verification happens on secure server
- Prevents automated signup attacks and abuse
- Score-based validation helps identify suspicious traffic
