## AccountPe Setup Instructions for NextWave SMM Panel

### Your Configuration Details:
\`\`\`
Vercel URL: https://nextwavesmm.vercel.app
Merchant ID: nextwavedigitalsolutions1
Email: nextwavedigitalsolutions1@gmail.com
Password: FMdbnds53@@
\`\`\`

### Setup Steps:

#### 1. Login to AccountPe Dashboard
- Go to: https://app.accountpe.com/login
- Email: nextwavedigitalsolutions1@gmail.com
- Password: FMdbnds53@@

#### 2. Configure Redirect URLs
Navigate to **Settings → Webhooks & Redirects** and add:

**Success Redirect URL:**
\`\`\`
https://nextwavesmm.vercel.app/dashboard/deposit?status=success
\`\`\`

**Failure Redirect URL:**
\`\`\`
https://nextwavesmm.vercel.app/dashboard/deposit?status=failed
\`\`\`

**Webhook URL:**
\`\`\`
https://nextwavesmm.vercel.app/api/webhooks/instant-payment
\`\`\`

#### 3. Get API Credentials
In **Settings → API Keys** section, copy:
- Merchant ID
- API Key/Token
- API Secret (if available)

#### 4. Whitelist Domain
In **Settings → Security/Whitelist**, add:
\`\`\`
nextwavesmm.vercel.app
\`\`\`

#### 5. Test Payment Flow
1. Go to dashboard/deposit
2. Click "Pay" button
3. Should redirect to AccountPe payment dashboard
4. Complete test payment
5. Webhook should fire and balance should update

### Environment Variables Set:
\`\`\`
NEXT_PUBLIC_APP_URL=https://nextwavesmm.vercel.app
ACCOUNTPE_API_KEY=FMdbnds53@@
\`\`\`

### Payment Flow:
1. User clicks "Pay" button
2. Creates transaction record in database
3. Sends payment link creation request to AccountPe
4. User redirected to AccountPe payment dashboard
5. User completes payment
6. AccountPe sends webhook confirmation
7. Balance automatically credited to user account

### Webhook Response Codes:
- `status: 1` = Payment Successful
- `status: -1` = Payment Failed
- `status: 0` = Payment Pending

### Troubleshooting:
- If "401 Unauthorized": Check API key in environment variables
- If "This content is blocked": Domain not whitelisted - add to AccountPe security settings
- If webhook not firing: Check webhook URL is accessible and returning 200 status

---
**Note:** When you get a custom domain (e.g., nextwavesmm.com), just update these URLs with the new domain and restart webhook service.
