# Google OAuth Authentication Setup Guide

## Issue: Google Login Not Working

If Google login is not working on your domain, follow these steps:

---

## 1. Supabase Dashboard Configuration

### Enable Google Provider
1. Go to your Supabase Dashboard
2. Navigate to **Authentication** > **Providers**
3. Find **Google** and enable it
4. Add your Google OAuth credentials:
   - Client ID
   - Client Secret

### Configure Redirect URLs
1. In Supabase Dashboard, go to **Authentication** > **URL Configuration**
2. Add your domain's callback URL to **Redirect URLs**:
   ```
   https://yourdomain.com/auth/callback
   ```
3. For local development, also add:
   ```
   http://localhost:3000/auth/callback
   ```

### Site URL Configuration
1. Set your **Site URL** in Supabase Dashboard
2. Format: `https://yourdomain.com` (production) or `http://localhost:3000` (dev)

---

## 2. Google Cloud Console Configuration

### Create OAuth 2.0 Client
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create or select a project
3. Enable **Google+ API** (if not already enabled)
4. Go to **Credentials**
5. Create **OAuth 2.0 Client ID**

### Configure Authorized Redirect URIs
Add these URIs to your Google OAuth Client:

**For Supabase Projects:**
```
https://<your-project-ref>.supabase.co/auth/v1/callback
```

Example:
```
https://abcdefghijklmnop.supabase.co/auth/v1/callback
```

**Find your project ref:**
- In Supabase Dashboard > Settings > API
- Look for "Project URL"
- Extract the subdomain before `.supabase.co`

### Authorized JavaScript Origins
Add:
```
https://yourdomain.com
https://<your-project-ref>.supabase.co
```

---

## 3. Environment Variables

Ensure these are set in your `.env.local`:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://<your-project-ref>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
```

---

## 4. Testing the Flow

### Test Locally First
1. Use `http://localhost:3000/auth/login`
2. Click "Google" button
3. Should redirect to Google login
4. After login, should redirect back to `/auth/callback`
5. Finally redirected to `/dashboard`

### Test on Production Domain
1. Deploy your application
2. Go to `https://yourdomain.com/auth/login`
3. Click "Google" button
4. Check browser console for any errors
5. Check server logs in Vercel/your hosting

---

## 5. Common Issues & Solutions

### Issue: "Invalid redirect URI"
**Solution:** 
- Check Supabase Dashboard redirect URLs
- Must exactly match your domain
- Include `/auth/callback` path
- Use HTTPS in production

### Issue: "OAuth callback error"
**Solution:**
- Check Google Cloud Console authorized redirect URIs
- Must include Supabase project URL
- Format: `https://<project-ref>.supabase.co/auth/v1/callback`

### Issue: "No authorization code"
**Solution:**
- Check if Google provider is enabled in Supabase
- Verify Google OAuth credentials are correct
- Check browser console for errors

### Issue: "Failed to create profile"
**Solution:**
- Check database permissions
- Ensure `users` table exists
- Verify service role key is set correctly

---

## 6. Debugging Steps

### Check Browser Console
Open DevTools (F12) and look for:
```javascript
[v0] Starting Google sign-in with callback URL: ...
[v0] OAuth response: ...
```

### Check Server Logs
Look for:
```
[v0] OAuth callback received: ...
[v0] User authenticated: ...
[v0] User profile created successfully
```

### Verify Supabase Configuration
```bash
# Check if environment variables are loaded
console.log(process.env.NEXT_PUBLIC_SUPABASE_URL)
console.log(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)
```

---

## 7. Quick Checklist

- [ ] Google provider enabled in Supabase Dashboard
- [ ] Google OAuth Client ID and Secret added to Supabase
- [ ] Redirect URL added in Supabase: `https://yourdomain.com/auth/callback`
- [ ] Site URL set in Supabase: `https://yourdomain.com`
- [ ] Authorized redirect URI in Google Cloud Console: `https://<project-ref>.supabase.co/auth/v1/callback`
- [ ] Environment variables set correctly
- [ ] Application redeployed after configuration changes

---

## Need Help?

If Google login still doesn't work:

1. **Check Supabase Logs:**
   - Dashboard > Logs
   - Look for authentication errors

2. **Check Browser Network Tab:**
   - See OAuth redirect URLs
   - Check for 4xx/5xx errors

3. **Verify Domain:**
   - Ensure using correct domain
   - HTTPS in production
   - No trailing slashes

4. **Test Email/Password Login:**
   - If working, issue is OAuth-specific
   - Focus on redirect URI configuration

---

## Contact Support

If you've followed all steps and it still doesn't work:
- Share browser console errors
- Share server logs
- Verify your Supabase project URL
- Check Google Cloud Console configuration
