# Email Notification Setup Guide

## Overview
This guide explains how to set up email notifications for deposit confirmations and other important events.

## Current Status
✅ Email templates are ready (`lib/email-templates.tsx`)
✅ Deposit confirmation template added: `getDepositConfirmationHTML()`
⚠️ Email sending service needs to be configured

## Recommended Solution: Resend

Resend is the easiest and most reliable email service for Next.js applications.

### Step 1: Install Resend

```bash
npm install resend
```

### Step 2: Get Resend API Key

1. Sign up at https://resend.com
2. Verify your domain (or use the test domain for development)
3. Get your API key from the dashboard
4. Add to `.env.local`:

```env
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxxx
```

### Step 3: Create Email Utility

Create `lib/email.ts`:

```typescript
import { Resend } from 'resend'
import { 
  getDepositConfirmationHTML, 
  getWelcomeEmailHTML 
} from './email-templates'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function sendDepositConfirmation(
  userEmail: string,
  userName: string,
  amount: number,
  transactionId: string
) {
  try {
    await resend.emails.send({
      from: 'NextWave SMM <noreply@yourdomain.com>',
      to: userEmail,
      subject: 'Deposit Confirmed - Your Balance Has Been Credited',
      html: getDepositConfirmationHTML(userName, amount, transactionId)
    })
    return { success: true }
  } catch (error) {
    console.error('Email sending failed:', error)
    return { success: false, error }
  }
}

export async function sendWelcomeEmail(
  userEmail: string,
  userName: string
) {
  try {
    await resend.emails.send({
      from: 'NextWave SMM <noreply@yourdomain.com>',
      to: userEmail,
      subject: 'Welcome to NextWave SMM Panel!',
      html: getWelcomeEmailHTML(userName, userEmail)
    })
    return { success: true }
  } catch (error) {
    console.error('Email sending failed:', error)
    return { success: false, error }
  }
}
```

### Step 4: Integrate into Webhook

Update `app/api/webhooks/instant-payment/route.ts`:

```typescript
import { sendDepositConfirmation } from '@/lib/email'

// After successful balance update:
try {
  const { data: user } = await supabase
    .from("users")
    .select("full_name, email")
    .eq("id", transaction.user_id)
    .single()

  if (user?.email) {
    await sendDepositConfirmation(
      user.email,
      user.full_name || 'User',
      transaction.amount,
      transaction.id
    )
    console.log("[v0] Deposit confirmation email sent to:", user.email)
  }
} catch (emailErr) {
  console.warn("[v0] Email sending failed (non-critical):", emailErr)
}
```

### Step 5: Test Email Notifications

1. Make a test deposit
2. Check console logs for email sending status
3. Verify email received in inbox
4. Check spam folder if not received

## Alternative: Supabase Edge Functions

If you prefer using Supabase's built-in email service:

1. Enable Email Auth in Supabase Dashboard
2. Configure SMTP settings
3. Use Supabase Edge Functions to send custom emails
4. See: https://supabase.com/docs/guides/auth/auth-smtp

## Email Templates Available

- `getWelcomeEmailHTML()` - Welcome new users
- `getEmailConfirmationHTML()` - Email verification
- `getPasswordResetHTML()` - Password reset
- `getDepositConfirmationHTML()` - Deposit confirmations (NEW)

## Production Checklist

- [ ] Install email service (Resend recommended)
- [ ] Add API key to environment variables
- [ ] Verify domain with email provider
- [ ] Test deposit confirmation emails
- [ ] Add email logs to activity_logs table
- [ ] Monitor email delivery rates
- [ ] Set up email templates in provider dashboard

## Troubleshooting

**Emails not sending:**
- Check API key is correct
- Verify domain is verified with Resend
- Check console logs for errors
- Ensure from email matches verified domain

**Emails going to spam:**
- Add SPF, DKIM, DMARC records
- Use a verified domain (not gmail/yahoo)
- Avoid spam trigger words
- Maintain good sender reputation

## Cost Estimate

Resend pricing:
- Free tier: 100 emails/day
- Pro: $20/month for 50,000 emails
- More than enough for SMM panel operations

## Support

For issues, contact:
- Resend Support: support@resend.com
- Supabase Support: support@supabase.io
