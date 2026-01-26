# NextWave SMM - API & Domain Configuration Guide

## Domain Configuration ✅

**Domain:** `nextwavesmm.com`

### DNS Records Required

```
A Record:
- Name: @
- Type: A
- Value: [Your Vercel IP]

CNAME Record:
- Name: www
- Type: CNAME
- Value: cname.vercel-dns.com

MX Records (for email):
- Priority: 10, Value: aspmx.l.google.com
- Priority: 20, Value: alt1.aspmx.l.google.com
- Priority: 30, Value: alt2.aspmx.l.google.com
```

---

## Environment Variables Setup

### Required Variables (Add to Vercel Project Settings)

#### Database (Supabase)
```bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

#### Payment Gateway (AccountPe)
```bash
ACCOUNTPE_API_KEY=your_email:your_password
ACCOUNTPE_MERCHANT_ID=nextwavedigitalsolutions1
ACCOUNTPE_WEBHOOK_URL=https://nextwavesmm.com/api/webhooks/instant-payment
```

#### SMM API Provider (Connect your SMM API)
```bash
DEFAULT_SMM_API_URL=https://your-smm-provider-api.com
DEFAULT_SMM_API_KEY=your_api_key_here
```

#### Email Configuration (SMTP)
```bash
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASSWORD=your_app_password
FROM_EMAIL=noreply@nextwavesmm.com
```

#### Security (reCAPTCHA)
```bash
NEXT_PUBLIC_RECAPTCHA_SITE_KEY=your_site_key
RECAPTCHA_SECRET_KEY=your_secret_key
RECAPTCHA_ENABLED=true
```

#### Application URLs
```bash
NEXT_PUBLIC_APP_URL=https://nextwavesmm.com
NEXT_PUBLIC_API_URL=https://nextwavesmm.com/api
NEXT_PUBLIC_DOMAIN=nextwavesmm.com
```

---

## API Endpoints Available

### User APIs
- `GET /api/v1/balance` - Get user balance
- `POST /api/v1/order` - Create new order
- `GET /api/v1/services` - Get all services

### Admin APIs
- `POST /api/admin/login` - Admin login
- `POST /api/admin/sync-services` - Sync services from provider
- `POST /api/admin/change-username` - Change admin username

### Webhook APIs
- `POST /api/webhooks/instant-payment` - AccountPe payment webhook

---

## API Provider Integration

### To Add SMM Provider:

1. **Get Provider Credentials:**
   - Contact your SMM API provider
   - Get API URL and API Key

2. **Add to Admin Panel:**
   - Navigate to Admin Panel > API Providers
   - Click "Add Provider"
   - Enter Provider Details:
     - Name: e.g., "Main SMM Provider"
     - API URL: `https://provider-api.com`
     - API Key: Your actual API key
     - Priority: 1 (higher = used first)
     - Active: Toggle ON

3. **Sync Services:**
   - Click "Sync Services" to fetch available services
   - Services will be automatically added to the database

4. **Verify Setup:**
   - Go to Admin Panel > Services
   - Check if services are listed with correct pricing

---

## Testing API Setup

### Test Account Balance
```bash
curl -X GET "https://nextwavesmm.com/api/v1/balance" \
  -H "Authorization: Bearer YOUR_API_KEY"
```

### Test Order Creation
```bash
curl -X POST "https://nextwavesmm.com/api/v1/order" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -d '{
    "service_id": "service_123",
    "link": "https://instagram.com/username",
    "quantity": 100
  }'
```

### Get Available Services
```bash
curl -X GET "https://nextwavesmm.com/api/v1/services"
```

---

## Troubleshooting

### Issue: "API Connection Failed"
**Solution:**
- Check API URL is correct
- Verify API Key is valid
- Ensure provider is marked as active
- Check firewall/CORS settings

### Issue: "Domain Not Resolving"
**Solution:**
- Verify DNS records are properly configured
- Wait 24-48 hours for DNS propagation
- Check domain registrar settings

### Issue: "Payment Webhook Not Working"
**Solution:**
- Verify ACCOUNTPE_WEBHOOK_URL is set correctly
- Check webhook URL in AccountPe dashboard
- Verify webhook secret matches

---

## Deployment Checklist

- [ ] Domain DNS configured
- [ ] Supabase credentials added
- [ ] AccountPe credentials configured
- [ ] SMM Provider added and synced
- [ ] Email SMTP configured
- [ ] reCAPTCHA keys added
- [ ] All environment variables deployed to Vercel
- [ ] API endpoints tested
- [ ] Admin panel accessible
- [ ] Payment webhook verified

---

## Support

For issues or questions:
- Email: support@nextwavesmm.com
- Dashboard: https://nextwavesmm.com/admin-panel-2024
