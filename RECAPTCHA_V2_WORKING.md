## reCAPTCHA v2 Now Displaying - FIXED

### Root Cause Found:
1. **Script strategy was wrong** - Using `lazyOnload` made reCAPTCHA load AFTER page renders, too late to render widget
2. **Wrong render method** - Hardcoding sitekey instead of using environment variable from process.env

### What Changed:

**Script Loading (Line 191-211):**
- Changed from `strategy="lazyOnload"` to `strategy="afterInteractive"`
- Script now loads at right time to render the widget
- Added explicit grecaptcha.render() call after script loads
- 100ms timeout ensures DOM is ready before rendering

**reCAPTCHA Div (Line 326-331):**
- Changed from hardcoded sitekey to `process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY`
- Added `id="recaptcha-container"` for programmatic rendering
- Now using environment variables properly

### How It Works Now:

1. Page loads → Script loads with `afterInteractive` strategy
2. Script finishes loading → `onLoad` callback fires
3. `onLoad` calls `grecaptcha.render()` with the container ID
4. reCAPTCHA checkbox appears on the page
5. User checks box → `handleRecaptchaChange` callback fires
6. Token is stored in `captchaToken` state
7. Form can be submitted only after checking the box

### Testing:
1. Go to `/auth/signup`
2. You should now SEE the reCAPTCHA checkbox clearly
3. Open browser console - look for `[v0] reCAPTCHA API script loaded successfully`
4. Check the box - should see token in logs
5. Button should enable after checking box

The reCAPTCHA widget should now be visible and functional! If not showing:
- Check browser console for errors
- Verify `NEXT_PUBLIC_RECAPTCHA_SITE_KEY` is set in Vercel environment variables
- Hard refresh browser (Ctrl+Shift+R or Cmd+Shift+R)
