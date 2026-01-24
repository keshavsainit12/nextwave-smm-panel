# API Setup Complete - User Guide

## What I've Set Up For You

Your users can now:
1. ✅ Generate unique API keys automatically
2. ✅ Access all your services via REST API
3. ✅ Place orders programmatically
4. ✅ Check order status and account balance
5. ✅ Use custom pricing with automatic multiplier

---

## User Flow

### Step 1: User Generates API Key
1. User logs in to dashboard
2. Goes to **Dashboard → API Access**
3. Clicks **"Generate API Key"**
4. Key format: `nw_[random]_[timestamp]`
5. User copies and saves the key

### Step 2: User Implements Integration
User can now make API calls with their key:

```bash
curl -X GET "https://yourdomain.com/api/v1/services" \
  -H "Authorization: Bearer nw_[their_key]"
```

### Step 3: Services Auto-Apply Pricing
- User's price multiplier (default 3.0x) automatically applied
- All prices in API responses are user-specific
- Admin can customize per-user multiplier

---

## Complete API Endpoints

### 1. Get All Services
**Endpoint:** `GET /api/v1/services`
**Auth:** Optional (with key for custom pricing)
```json
Response: {
  "services": [...],
  "categories": ["Instagram", "TikTok", ...]
}
```

### 2. Check Balance
**Endpoint:** `GET /api/v1/balance`
**Auth:** Required
```json
Response: { "balance": 250.50 }
```

### 3. Place Order
**Endpoint:** `POST /api/v1/order`
**Auth:** Required
```json
Body: {
  "service_id": "uuid",
  "link": "https://instagram.com/username",
  "quantity": 1000
}
Response: { "order_id": "uuid", "charge": 2.99 }
```

### 4. Check Order Status
**Endpoint:** `GET /api/v1/order?order_id=UUID`
**Auth:** Required
```json
Response: { "order_status": "completed" }
```

---

## Files Updated/Created

1. **`/app/actions/api-access.ts`** - API key generation/management
2. **`/app/dashboard/api/page.tsx`** - Enhanced API dashboard
3. **`/API_COMPLETE_DOCUMENTATION.md`** - Full API documentation
4. **API Routes Already Exist:**
   - `/app/api/v1/services/route.ts` - Returns services with user multiplier
   - `/app/api/v1/balance/route.ts` - Check user balance
   - `/app/api/v1/order/route.ts` - Place orders & check status

---

## API Key Security Features

✅ Each user has unique API key
✅ Keys can be regenerated anytime
✅ Keys can be revoked (disabled)
✅ Keys never expire (admin controlled)
✅ API key format: `nw_[random_32_bytes]_[timestamp]`

---

## How Pricing Works

### User Creates API Key
```
Price Multiplier = 3.0x (default, customizable by admin)
```

### User Makes API Call
```
Provider Price: $1.00
User Multiplier: 3.0x
API Response Price: $3.00 ✓
```

### User Places Order
```
Service: Instagram Followers
API Price: $3.00
Deducted from balance: $3.00 ✓
```

---

## Testing the API

### Test 1: Generate Key (UI Test)
1. Login as user
2. Go to Dashboard → API Access
3. Click "Generate API Key"
4. Copy the key

### Test 2: Get Services
```bash
curl -X GET "https://yourdomain.com/api/v1/services" \
  -H "Authorization: Bearer YOUR_KEY"
```

### Test 3: Check Balance
```bash
curl -X GET "https://yourdomain.com/api/v1/balance" \
  -H "Authorization: Bearer YOUR_KEY"
```

### Test 4: Place Order
```bash
curl -X POST "https://yourdomain.com/api/v1/order" \
  -H "Authorization: Bearer YOUR_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "service_id": "service-uuid",
    "link": "https://instagram.com/testuser",
    "quantity": 100
  }'
```

---

## Domain Configuration

The API automatically uses your domain from env variables:
- **Env Variable:** `NEXT_PUBLIC_APP_URL`
- **Used In:** API dashboard, documentation, links
- **Current Value:** Set in your environment config

All API documentation automatically shows the correct base URL!

---

## What Users See

### API Dashboard Features
1. ✅ One-click API key generation
2. ✅ Key display with copy button
3. ✅ Price multiplier visible (transparency)
4. ✅ Quick start guide with examples
5. ✅ Multiple code examples (Python, JS, cURL)
6. ✅ Full endpoint documentation
7. ✅ Download full documentation link

---

## Admin Controls

As admin, you can:
1. **View User API Keys** - In user management
2. **Reset User Keys** - Force key regeneration
3. **Set Custom Multipliers** - Per user pricing
4. **View API Usage** - (Optional: can be added)
5. **Rate Limit Control** - (Optional: can be added)

---

## Production Checklist

✅ API key generation system
✅ Authentication validation
✅ Price multiplier system working
✅ Services endpoint with filtering
✅ Balance check endpoint
✅ Order placement via API
✅ Order status checking
✅ All debug logs removed
✅ Documentation complete
✅ UI dashboard ready

---

## Next Steps (Optional Enhancements)

- [ ] Add rate limiting per API key
- [ ] Add webhook support for order updates
- [ ] Add API usage analytics
- [ ] Add request logging
- [ ] Add IP whitelisting
- [ ] Add API key scopes (permissions)

---

## Your Domain

Users will use their API with:
```
https://yourdomain.com/api/v1
```

Update `NEXT_PUBLIC_APP_URL` in your environment to change the domain shown in the dashboard.

---

**Setup Complete! Users can now start generating API keys and integrating with your panel!**
