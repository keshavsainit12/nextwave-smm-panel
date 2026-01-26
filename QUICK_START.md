# 🚀 NextWave SMM - Quick Start Guide

## What Was Fixed & Setup

### ✅ Order Page Desktop Issue (FIXED)
- Added complete order table for desktop view
- Displays: Order ID, Service, Quantity, Link, Status, Price, Date
- Status color coding: Green (Complete), Yellow (Pending), Red (Failed), Blue (Processing)
- Responsive and mobile-friendly

### ✅ API System Complete Setup
- Domain: `nextwavesmm.com` configured
- All API endpoints ready
- Payment gateway (AccountPe) configured
- Multiple SMM provider support
- Email system ready
- Security (reCAPTCHA) integrated

---

## Quick Setup (5 Steps)

### 1️⃣ Set Environment Variables
Copy these to Vercel Settings > Environment Variables:

```bash
# Database (Required)
NEXT_PUBLIC_SUPABASE_URL=your_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_key
SUPABASE_SERVICE_ROLE_KEY=your_key

# Payment (Required)
ACCOUNTPE_API_KEY=your_email:your_password
ACCOUNTPE_MERCHANT_ID=nextwavedigitalsolutions1

# SMM Provider (Required)
DEFAULT_SMM_API_URL=https://your-provider-api.com
DEFAULT_SMM_API_KEY=your_api_key

# Email (Optional but recommended)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASSWORD=your_app_password
FROM_EMAIL=noreply@nextwavesmm.com

# Security (Optional)
NEXT_PUBLIC_RECAPTCHA_SITE_KEY=your_key
RECAPTCHA_SECRET_KEY=your_key
```

### 2️⃣ Setup Domain
1. In Vercel: Settings > Domains
2. Add `nextwavesmm.com`
3. Update DNS with Vercel nameservers
4. Wait 24-48 hours for DNS propagation

### 3️⃣ Deploy
```bash
git push origin main
# Wait for Vercel to auto-deploy
```

### 4️⃣ Add SMM Provider
1. Go to: `https://nextwavesmm.com/admin-panel-2024`
2. Login with admin credentials
3. Go to "API Providers"
4. Click "Add Provider"
5. Enter your SMM API details
6. Click "Sync Services"

### 5️⃣ Test Everything
```bash
# Test API
curl https://nextwavesmm.com/api/v1/services

# Test Order Page
# Visit: https://nextwavesmm.com/dashboard/orders
```

---

## Key Files Modified

| File | Purpose |
|------|---------|
| `/app/dashboard/orders/page.tsx` | Fixed desktop order table |
| `/lib/config.ts` | Complete API configuration |
| `/next.config.mjs` | Domain & CORS setup |
| `/lib/api-validator.ts` | API validation utility |

---

## New Documentation Files

| File | Purpose |
|------|---------|
| `/API_CONFIG_SETUP.md` | Complete API setup guide |
| `/DEPLOYMENT_CHECKLIST.md` | Pre/post deployment checklist |
| `/IMPLEMENTATION_SUMMARY.md` | What was completed |
| `/QUICK_START.md` | This file (quick reference) |

---

## API Endpoints

### Public
```
GET  /api/v1/services        - Get all services
GET  /api/v1/balance         - Get user balance
POST /api/v1/order           - Create order
POST /api/v1/contact         - Contact form
```

### Admin
```
POST /api/admin/login           - Admin login
POST /api/admin/sync-services   - Sync services from provider
POST /api/admin/change-username - Change admin username
```

### Webhook
```
POST /api/webhooks/instant-payment - Payment confirmation
```

---

## Troubleshooting

### "Domain not working"
- Check DNS propagation: `nslookup nextwavesmm.com`
- Wait 24-48 hours
- Clear browser cache and try again

### "Order page blank on desktop"
- ✅ FIXED - Should now show full order table
- Clear cache: Ctrl+Shift+Del
- Hard refresh: Ctrl+Shift+R

### "API connection failed"
- Check environment variables in Vercel
- Verify SMM provider API key is correct
- Check firewall/CORS settings

### "Payment not working"
- Verify ACCOUNTPE_API_KEY format: `email:password`
- Check webhook URL in AccountPe dashboard
- Ensure merchant ID matches

---

## Database Tables

Your Supabase has these tables:

- `users` - User accounts
- `orders` - User orders
- `services` - Available services
- `service_categories` - Service categories
- `api_providers` - SMM provider connections
- `transactions` - Payment transactions
- `coupons` - Discount codes
- `support_tickets` - Support tickets
- `user_settings` - User preferences

---

## Important Links

| Link | Purpose |
|------|---------|
| https://nextwavesmm.com | Main website |
| https://nextwavesmm.com/dashboard | User dashboard |
| https://nextwavesmm.com/admin-panel-2024 | Admin panel |
| https://nextwavesmm.com/auth/login | Login page |
| https://nextwavesmm.com/auth/signup | Signup page |

---

## Admin Credentials

Default admin account:
- **Username:** Set during first admin-setup
- **Password:** Set during first admin-setup
- **Access:** https://nextwavesmm.com/admin-login

To reset admin credentials:
1. Go to: https://nextwavesmm.com/admin-setup
2. Re-enter credentials (overwrites existing)

---

## Configuration Structure

```
lib/config.ts exports:
├── Domain Configuration
│   ├── DOMAIN = "nextwavesmm.com"
│   ├── APP_URL = "https://nextwavesmm.com"
│   └── API_BASE_URL = "https://nextwavesmm.com/api"
├── Payment (AccountPe)
├── SMM API Providers
├── Crypto Support
├── Email SMTP
├── reCAPTCHA
├── Database (Supabase)
└── Validation Functions
```

---

## Next.js Config

Configured for:
- Image optimization (domain whitelisted)
- CORS headers for API
- Environment variables exposure
- TypeScript strict mode (disabled for compatibility)

---

## Email Templates

Available in `/lib/email-templates.tsx`:
- Welcome email
- Password reset
- Email verification
- Order confirmation
- Support ticket reply

---

## Performance Tips

1. **Images:** All images should be < 100KB
2. **API:** Keep response times < 500ms
3. **Database:** Index frequently queried columns
4. **Frontend:** Use React.lazy() for large components
5. **Caching:** Use revalidatePath() for dynamic content

---

## Security Best Practices

✅ Implemented:
- reCAPTCHA form protection
- Password hashing with bcrypt
- JWT token authentication
- RLS policies in database
- CORS headers configured
- API key validation

To enable:
- Set RECAPTCHA_ENABLED=true
- Add reCAPTCHA site key

---

## Monitoring

Monitor these in Vercel:
- Deployment logs
- Runtime logs
- Error logs
- API performance
- Database queries

---

## Support

### For Setup Issues
1. Check `/API_CONFIG_SETUP.md`
2. Read `/DEPLOYMENT_CHECKLIST.md`
3. Review `/IMPLEMENTATION_SUMMARY.md`

### Contact
- Email: support@nextwavesmm.com
- Website: https://nextwavesmm.com
- Admin: https://nextwavesmm.com/admin-panel-2024

---

## Next Steps

1. ✅ Set environment variables
2. ✅ Deploy to production
3. ✅ Add SMM provider
4. ✅ Test all features
5. ✅ Monitor in Vercel dashboard

---

**Status:** Ready for production! 🚀

**Last Updated:** 2026-01-26
**Domain:** nextwavesmm.com
**System:** NextWave SMM Panel
