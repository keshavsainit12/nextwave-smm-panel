# Email Setup - 2 Steps Only

## 1. Get Resend API Key

1. Go to https://resend.com
2. Sign up (free)
3. Get your API key

## 2. Add to Vercel

Go to your Vercel project → Settings → Environment Variables

Add:
```
RESEND_API_KEY=re_xxxxxxxxxxxxx
```

**That's it!** Emails will work automatically.

## Testing

Make a test deposit - you'll receive an email confirmation.

## Notes

- Free tier: 100 emails/day (enough for most users)
- Emails send automatically when deposits complete
- No code changes needed - already implemented
