# Complete API Documentation & Setup Guide

## Overview
Your SMM panel provides a complete REST API for programmatic access to all services. Users can generate unique API keys and integrate with their own applications.

---

## Getting Started

### 1. Generate Your API Key
1. Login to your dashboard
2. Go to **Dashboard → API Access**
3. Click **"Generate API Key"**
4. Copy and save your key securely (format: `nw_[random]_[timestamp]`)

### 2. Using Your API Key
Include your API key in request headers:
```
Authorization: Bearer YOUR_API_KEY_HERE
```

---

## API Endpoints

### Base URL
```
https://yourdomain.com/api/v1
```

---

## 1. GET Services List

**Endpoint:** `GET /services`

**Authentication:** Optional (with key for custom pricing)

**Description:** Get all active services with their details

**Headers:**
```
Authorization: Bearer YOUR_API_KEY
```

**Response:**
```json
{
  "status": "success",
  "services": [
    {
      "id": "service-uuid",
      "name": "Instagram Followers",
      "price": "2.99",
      "min": 10,
      "max": 50000,
      "platform": "instagram",
      "description": "Real active followers",
      "category": "Instagram",
      "categories": ["Instagram"]
    }
  ],
  "categories": ["Instagram", "TikTok", "YouTube"]
}
```

---

## 2. GET User Balance

**Endpoint:** `GET /balance`

**Authentication:** Required

**Description:** Check your current account balance

**Headers:**
```
Authorization: Bearer YOUR_API_KEY
```

**Response:**
```json
{
  "status": "success",
  "balance": 150.50
}
```

---

## 3. POST Place Order

**Endpoint:** `POST /order`

**Authentication:** Required

**Description:** Place a new service order

**Headers:**
```
Authorization: Bearer YOUR_API_KEY
Content-Type: application/json
```

**Request Body:**
```json
{
  "service_id": "service-uuid",
  "link": "https://instagram.com/username",
  "quantity": 1000
}
```

**Response:**
```json
{
  "status": "success",
  "order_id": "order-uuid",
  "charge": 2.99,
  "order_status": "pending"
}
```

**Error Responses:**
```json
{
  "status": "error",
  "message": "Insufficient balance"
}
```

---

## 4. GET Order Status

**Endpoint:** `GET /order?order_id=ORDER_ID`

**Authentication:** Required

**Description:** Check the status of an order

**Headers:**
```
Authorization: Bearer YOUR_API_KEY
```

**Query Parameters:**
- `order_id` (required): The order ID to check

**Response:**
```json
{
  "status": "success",
  "order_id": "order-uuid",
  "order_status": "completed",
  "quantity": 1000,
  "start_count": 100,
  "remains": 1000,
  "link": "https://instagram.com/username"
}
```

---

## Pricing

### Price Multiplier System
- Each user has their own **price multiplier**
- Default multiplier: **3.0x** (provider price × 3.0)
- Admin can customize per user
- Prices automatically calculated and applied to all API responses

**Example:**
- Provider price: $1.00
- Your multiplier: 3.0x
- API price: $3.00

---

## Error Handling

### Authentication Errors (401)
```json
{
  "status": "error",
  "message": "Missing API key"
}
```

### Validation Errors (400)
```json
{
  "status": "error",
  "message": "Missing required fields"
}
```

### Server Errors (500)
```json
{
  "status": "error",
  "message": "Internal server error"
}
```

---

## Code Examples

### Python
```python
import requests

BASE_URL = "https://yourdomain.com/api/v1"
API_KEY = "your_api_key_here"

headers = {
    "Authorization": f"Bearer {API_KEY}"
}

# Get services
response = requests.get(f"{BASE_URL}/services", headers=headers)
services = response.json()
print(services)

# Check balance
response = requests.get(f"{BASE_URL}/balance", headers=headers)
balance = response.json()
print(f"Balance: ${balance['balance']}")

# Place order
order_data = {
    "service_id": "service-uuid",
    "link": "https://instagram.com/username",
    "quantity": 1000
}
response = requests.post(f"{BASE_URL}/order", json=order_data, headers=headers)
order = response.json()
print(f"Order ID: {order['order_id']}")
```

### JavaScript/Node.js
```javascript
const API_KEY = "your_api_key_here";
const BASE_URL = "https://yourdomain.com/api/v1";

const headers = {
  "Authorization": `Bearer ${API_KEY}`,
  "Content-Type": "application/json"
};

// Get services
async function getServices() {
  const response = await fetch(`${BASE_URL}/services`, { headers });
  return response.json();
}

// Check balance
async function getBalance() {
  const response = await fetch(`${BASE_URL}/balance`, { headers });
  return response.json();
}

// Place order
async function placeOrder(serviceId, link, quantity) {
  const response = await fetch(`${BASE_URL}/order`, {
    method: "POST",
    headers,
    body: JSON.stringify({
      service_id: serviceId,
      link,
      quantity
    })
  });
  return response.json();
}

// Usage
getServices().then(console.log);
getBalance().then(console.log);
placeOrder("service-uuid", "https://instagram.com/username", 1000).then(console.log);
```

### cURL
```bash
# Get services
curl -X GET "https://yourdomain.com/api/v1/services" \
  -H "Authorization: Bearer your_api_key_here"

# Check balance
curl -X GET "https://yourdomain.com/api/v1/balance" \
  -H "Authorization: Bearer your_api_key_here"

# Place order
curl -X POST "https://yourdomain.com/api/v1/order" \
  -H "Authorization: Bearer your_api_key_here" \
  -H "Content-Type: application/json" \
  -d '{
    "service_id": "service-uuid",
    "link": "https://instagram.com/username",
    "quantity": 1000
  }'

# Check order status
curl -X GET "https://yourdomain.com/api/v1/order?order_id=order-uuid" \
  -H "Authorization: Bearer your_api_key_here"
```

---

## Best Practices

1. **Keep Your API Key Secure**
   - Never commit to version control
   - Don't share publicly
   - Regenerate if compromised

2. **Regenerate Regularly**
   - Update API keys periodically
   - Use the "Regenerate Key" button in Dashboard

3. **Error Handling**
   - Always check the response status
   - Implement retry logic for network errors
   - Handle rate limiting gracefully

4. **Validate Inputs**
   - Verify link format before submitting
   - Check quantity is within min/max range
   - Confirm sufficient balance before orders

---

## Webhooks & Callbacks

Coming soon: Real-time order status webhooks

---

## Support

For API support:
- Email: support@yourdomain.com
- Dashboard: Create a support ticket
- Documentation: Visit your API dashboard for live examples

---

## Rate Limiting

- API Requests: 1000 per hour per API key
- Order Placement: 100 orders per hour

---

## API Response Time

Average response times:
- Services list: < 100ms
- Balance check: < 50ms
- Place order: < 200ms
- Order status: < 100ms

---

**Last Updated:** $(date)
**API Version:** v1
