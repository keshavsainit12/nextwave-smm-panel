# 🚀 NextWave SMM - Deployment Checklist

## Pre-Deployment Phase

### Code Quality
- [ ] All TypeScript errors resolved
- [ ] No console errors in development build
- [ ] Environment variables are defined
- [ ] API endpoints are accessible
- [ ] Order page displays correctly on desktop
- [ ] Mobile responsive design verified

### Configuration Files
- [ ] `.env.local` created with all variables
- [ ] `next.config.mjs` properly configured
- [ ] `lib/config.ts` has all API settings
- [ ] Domain set to `nextwavesmm.com`

---

## Vercel Deployment

### Step 1: Connect Domain
- [ ] Login to Vercel Dashboard
- [ ] Select your project
- [ ] Go to Settings > Domains
- [ ] Add domain: `nextwavesmm.com`
- [ ] Add www subdomain: `www.nextwavesmm.com` (optional)
- [ ] Copy Vercel nameservers

### Step 2: Update DNS
- [ ] Login to domain registrar (GoDaddy, Namecheap, etc.)
- [ ] Update nameservers to Vercel's:
  - `ns1.vercel-dns.com`
  - `ns2.vercel-dns.com`
  - `ns3.vercel-dns.com`
  - `ns4.vercel-dns.com`
- [ ] Wait for DNS propagation (usually 5-30 minutes)

### Step 3: Set Environment Variables in Vercel
Go to Project Settings > Environment Variables

#### Database Variables
```
NEXT_PUBLIC_SUPABASE_URL = [your_supabase_url]
NEXT_PUBLIC_SUPABASE_ANON_KEY = [your_anon_key]
SUPABASE_SERVICE_ROLE_KEY = [your_service_key]
```

#### Payment Gateway
```
ACCOUNTPE_API_KEY = [your_email:your_password]
ACCOUNTPE_MERCHANT_ID = nextwavedigitalsolutions1
```

#### SMM Provider
```
DEFAULT_SMM_API_URL = https://[your-provider-api].com
DEFAULT_SMM_API_KEY = [your_api_key]
```

#### Email Configuration
```
SMTP_HOST = smtp.gmail.com
SMTP_PORT = 587
SMTP_USER = [your_email@gmail.com]
SMTP_PASSWORD = [your_app_password]
FROM_EMAIL = noreply@nextwavesmm.com
```

#### Security
```
NEXT_PUBLIC_RECAPTCHA_SITE_KEY = [your_site_key]
RECAPTCHA_SECRET_KEY = [your_secret_key]
RECAPTCHA_ENABLED = true
```

#### URLs
```
NEXT_PUBLIC_APP_URL = https://nextwavesmm.com
NEXT_PUBLIC_API_URL = https://nextwavesmm.com/api
NEXT_PUBLIC_DOMAIN = nextwavesmm.com
```

### Step 4: Deploy Project
- [ ] Push code to main/production branch
- [ ] Wait for automatic deployment
- [ ] Check deployment status in Vercel dashboard
- [ ] Verify no build errors

---

## Post-Deployment Verification

### Domain & SSL
- [ ] Domain resolves to Vercel: `https://nextwavesmm.com`
- [ ] SSL certificate is valid (green lock icon)
- [ ] Both www and non-www versions work
- [ ] Automatic HTTPS redirect is working

### Application Access
- [ ] Homepage loads at `https://nextwavesmm.com`
- [ ] Login page accessible at `/auth/login`
- [ ] Signup page accessible at `/auth/signup`
- [ ] Dashboard accessible after login
- [ ] Order page visible and functional on desktop

### API Endpoints
Test these endpoints:

```bash
# Get Services
curl https://nextwavesmm.com/api/v1/services

# Get Balance (requires auth)
curl https://nextwavesmm.com/api/v1/balance \
  -H "Authorization: Bearer YOUR_TOKEN"

# Admin Health Check
curl https://nextwavesmm.com/api/admin/login
```

### Admin Panel
- [ ] Admin login works: `https://nextwavesmm.com/admin-panel-2024`
- [ ] API Providers page accessible
- [ ] Services page showing data
- [ ] Dashboard showing stats

### Database
- [ ] Supabase connection successful
- [ ] Tables populated with data
- [ ] RLS policies enforced
- [ ] Real-time updates working

---

## Integration Testing

### User Authentication
- [ ] Google OAuth working
- [ ] Email/Password signup working
- [ ] Email verification sent
- [ ] Password reset working
- [ ] Session persistence working

### Orders System
- [ ] Services load on dashboard
- [ ] Can create new order
- [ ] Order validation working
- [ ] Quantity limits enforced
- [ ] Orders appear in order history
- [ ] Order status updates properly

### Payments
- [ ] Instant payment option appears
- [ ] AccountPe redirect working
- [ ] Payment webhook received
- [ ] Balance updated after payment
- [ ] Transaction history recorded

### Admin Functions
- [ ] Can add new API provider
- [ ] Can sync services from provider
- [ ] Can modify services pricing
- [ ] Can manage users
- [ ] Can view transactions
- [ ] Can process refunds

### Notifications
- [ ] Welcome email sent after signup
- [ ] Password reset email working
- [ ] Order confirmation email sent
- [ ] Support ticket replies sent

---

## Performance & Security

### Performance
- [ ] Pages load in < 3 seconds
- [ ] No CLS (Cumulative Layout Shift) issues
- [ ] Images optimized and cached
- [ ] API responses < 500ms
- [ ] Database queries optimized

### Security
- [ ] reCAPTCHA protecting forms
- [ ] CORS headers set correctly
- [ ] API keys not exposed in frontend
- [ ] Passwords hashed in database
- [ ] JWT tokens validated
- [ ] Rate limiting implemented (if needed)

### Monitoring
- [ ] Vercel Analytics enabled
- [ ] Error tracking setup
- [ ] Log monitoring configured
- [ ] Uptime monitoring active

---

## Backup & Recovery

- [ ] Database backups configured
- [ ] Backup frequency: daily
- [ ] Backup retention: 30 days
- [ ] Recovery procedure documented
- [ ] Disaster recovery plan ready

---

## Documentation

- [ ] README.md updated
- [ ] API documentation complete
- [ ] Setup guide written (`/API_CONFIG_SETUP.md`)
- [ ] Troubleshooting guide created
- [ ] Admin documentation ready
- [ ] User guide prepared

---

## Final Sign-off

### Launch Readiness
- [ ] All tests passed
- [ ] No critical issues remaining
- [ ] Performance acceptable
- [ ] Security audit completed
- [ ] Team approval obtained
- [ ] Go/No-go decision: **GO** 🚀

### Go-Live
- [ ] Deployment complete
- [ ] Domain active
- [ ] All systems operational
- [ ] Monitoring active
- [ ] Support ready

---

## Post-Launch Tasks

- [ ] Monitor error logs daily
- [ ] Check performance metrics
- [ ] Respond to user issues
- [ ] Track transaction success rate
- [ ] Monitor API performance
- [ ] Weekly backup verification
- [ ] Monthly security audit
- [ ] Quarterly performance review

---

## Contact & Support

- **Email:** support@nextwavesmm.com
- **Website:** https://nextwavesmm.com
- **Admin Panel:** https://nextwavesmm.com/admin-panel-2024
- **Status Page:** https://nextwavesmm.com/status

---

**Deployment Date:** _______________
**Deployed By:** _______________
**Verified By:** _______________

✅ **All systems GO for production launch!**
