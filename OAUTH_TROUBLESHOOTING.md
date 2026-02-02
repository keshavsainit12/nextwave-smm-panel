# OAuth "Invalid Flow State" Troubleshooting Guide

## Current Error
```
invalid flow state, no valid flow state found
https://nextwavesmm.com/auth/login?error=invalid+flow+state%2C+no+valid+flow+state+found
```

## What This Means
The PKCE (Proof Key for Code Exchange) flow is failing because the code verifier cannot be found when the OAuth callback is processed. This typically happens when cookies are not persisting between the initial OAuth request and the callback.

## Code Implementation Status ✅

### Browser Client (`/lib/supabase/client.ts`)
✅ Cookie handlers implemented
✅ Proper encoding/decoding
✅ Document.cookie integration

### Server Client (`/lib/supabase/server.ts`)
✅ Next.js cookies() API
✅ Error handling
✅ Server-side cookie management

## Step-by-Step Troubleshooting

### 1. Verify Deployment
```bash
# Check if latest commit is deployed
# Should be: c717345 - Cookie handlers fix
git log -1
```

### 2. Supabase Dashboard Configuration

#### URL Configuration
Go to: `Authentication` → `URL Configuration`

Set:
```
Site URL: https://nextwavesmm.com

Redirect URLs (add all):
https://nextwavesmm.com/auth/callback
https://nextwavesmm.com/*
http://localhost:3000/auth/callback
```

#### Google Provider
Go to: `Authentication` → `Providers` → `Google`

Verify:
- ✅ Enabled
- ✅ Client ID set (from Google Console)
- ✅ Client Secret set (from Google Console)

### 3. Browser Testing Checklist

#### Clear Everything
1. Press `Ctrl+Shift+Delete` (or `Cmd+Shift+Delete` on Mac)
2. Select "All time"
3. Check:
   - Cookies and other site data
   - Cached images and files
4. Click "Clear data"

#### Try Incognito Mode
- Chrome: `Ctrl+Shift+N`
- Firefox: `Ctrl+Shift+P`
- Safari: `Cmd+Shift+N`

#### Disable Extensions
Temporarily disable:
- Privacy Badger
- uBlock Origin
- Ghostery
- Any privacy/security extensions

#### Browser Console Check
1. Open Dev Tools (`F12`)
2. Go to Console tab
3. Try Google login
4. Look for logs like:
```
[v0] OAuth code detected...
[v0] Exchanging code for session...
```

#### Cookie Storage Check
1. Open Dev Tools (`F12`)
2. Go to Application → Cookies
3. Look for cookies starting with `sb-`
4. If missing → cookies not being saved!

### 4. Common Issues & Solutions

#### Issue: Cookies Not Saving
**Symptoms:** No Supabase cookies in browser storage
**Solutions:**
1. Enable third-party cookies in browser
2. Add your domain to cookie exceptions
3. Check if running on `localhost` vs production domain

#### Issue: Cookie Domain Mismatch
**Symptoms:** Cookies set but not accessible
**Solutions:**
1. Ensure Site URL matches deployment URL exactly
2. Don't mix `www` and non-`www`
3. Use consistent protocol (https)

#### Issue: SameSite Attribute
**Symptoms:** Cookies blocked in cross-site context
**Solutions:**
1. Set `sameSite: 'lax'` (already in code)
2. Ensure both initial request and callback on same domain
3. Use HTTPS in production

#### Issue: OAuth Flow Timeout
**Symptoms:** Error after waiting too long
**Solutions:**
1. Complete OAuth flow quickly (< 5 minutes)
2. Don't refresh or go back during flow
3. Try again if interrupted

### 5. Network Debugging

#### Check Network Tab
1. Open Dev Tools (`F12`)
2. Go to Network tab
3. Try Google login
4. Look for:
   - Request to `/auth/callback`
   - Response headers
   - Set-Cookie headers

#### Expected Flow
```
1. Click Google Login
   → POST to Supabase (sets cookies)
2. Redirect to Google
   → google.com
3. Authenticate
   → User logs in
4. Redirect to callback
   → GET /auth/callback?code=xxx (reads cookies)
5. Process callback
   → POST to Supabase (exchanges code)
6. Redirect to dashboard
   → GET /dashboard
```

### 6. Alternative Solutions

#### Option 1: Verify Environment Variables
```bash
# Check .env.local or deployment env vars
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
```

#### Option 2: Check Google Console
1. Go to Google Cloud Console
2. APIs & Services → Credentials
3. Find your OAuth 2.0 Client ID
4. Verify Authorized redirect URIs:
   - `https://xxxxx.supabase.co/auth/v1/callback`
   - `https://nextwavesmm.com/auth/callback`

#### Option 3: Test with Different Browser
Sometimes specific browser configurations cause issues:
- Try Chrome if using Firefox
- Try Firefox if using Chrome
- Try Safari if on Mac

### 7. Getting Help

If still failing, collect this information:

1. **Browser Console Logs**
   ```
   Open F12 → Console
   Copy all logs when doing Google login
   ```

2. **Network Requests**
   ```
   Open F12 → Network
   Filter by 'callback'
   Show request/response details
   ```

3. **Cookie Storage**
   ```
   Open F12 → Application → Cookies
   Screenshot all cookies for your domain
   ```

4. **Exact Error**
   ```
   The full error message from URL or console
   ```

5. **Browser & Version**
   ```
   Chrome 120, Firefox 119, Safari 17, etc.
   ```

## Expected Successful Flow

When working correctly, you should see:

1. ✅ Click Google login
2. ✅ Cookies set (check in dev tools)
3. ✅ Redirect to Google
4. ✅ Google auth page loads
5. ✅ User authenticates
6. ✅ Redirect to /auth/callback?code=xxx
7. ✅ Console logs: "Exchanging code for session"
8. ✅ Console logs: "Session created successfully"
9. ✅ Redirect to /dashboard
10. ✅ Dashboard loads with user logged in

## Quick Debug Commands

### Browser Console
```javascript
// Check if cookies are accessible
console.log(document.cookie)

// Try to manually set a test cookie
document.cookie = "test=value; path=/; samesite=lax"
console.log(document.cookie)

// Clear all cookies
document.cookie.split(";").forEach(c => {
  document.cookie = c.replace(/^ +/, "")
    .replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
});
```

### Server Logs
Look for these patterns:
```
[v0] OAuth callback received
[v0] Code parameter: xxx
[v0] Exchanging code for session...
[v0] Session created successfully
```

Or error patterns:
```
[v0] Exchange error: PKCE code verifier not found
[v0] Exchange error: invalid_grant
```

## Final Notes

The code implementation is correct. If the error persists, it's likely:
1. Configuration issue (Supabase URLs)
2. Browser cookie blocking
3. Deployment not updated
4. Network/cache issues

Follow the steps above systematically to identify the specific cause.
