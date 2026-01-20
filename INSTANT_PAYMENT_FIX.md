# Instant Payment Gateway - Complete Fix

## Issues Fixed:

### 1. **Webhook Not Finding Transactions** ✅
- **Before**: Webhook only searched by `payment_id` field
- **After**: Now tries 3 methods:
  1. Search by `payment_id` (AccountPe transaction ID)
  2. Search by direct transaction ID (fallback)
  3. Better error logging to show what was searched

### 2. **Payment_ID Not Being Stored** ✅
- **Before**: Transaction created without `payment_id`, then updated later
- **After**: Payment_id is now properly captured from AccountPe response and stored immediately
- **Added**: Payment ID also included in transaction notes for audit trail

### 3. **Balance Not Being Credited** ✅
- **Before**: Webhook fetched transaction but balance calculation had errors (string vs number issues)
- **After**: Fixed balance calculation with proper `Number()` casting
- **Added**: Proper error handling if balance update fails

### 4. **API Key Format Support** ✅
- **Format Supported**: `email:password` (as you provided)
- **Webhook**: Properly extracts password for signature verification
- **How it works**: Splits on `:` to get password from `ACCOUNTPE_API_KEY` environment variable

## How Instant Payment Flow Works Now:

```
1. User enters amount and submits form
   ↓
2. Transaction created in DB with payment_id field initialized
   ↓
3. AccountPe API called to create payment link
   ↓
4. Response contains transaction ID/payment_id
   ↓
5. Update transaction with payment_id from AccountPe
   ↓
6. Redirect user to payment link
   ↓
7. User completes payment on AccountPe
   ↓
8. AccountPe sends webhook to: /api/webhooks/instant-payment
   ↓
9. Webhook tries to find transaction by payment_id (now works!)
   ↓
10. If found, update transaction status to "completed"
    ↓
11. Credit user's wallet with deposit amount
    ↓
12. Pages revalidate to show new balance

```

## What's Stored Where:

| Field | Where | Purpose |
|-------|-------|---------|
| `transaction_id` (our ID) | `transactions.id` | Internal tracking |
| `payment_id` (AccountPe ID) | `transactions.payment_id` | Webhook lookup |
| `amount` | `transactions.amount` | Deposit amount |
| `status` | `transactions.status` | pending → completed |
| `balance_after` | `users.balance` | Updated when webhook completes |

## Environment Variables Required:

```
ACCOUNTPE_API_KEY=email@example.com:password123
ACCOUNTPE_MERCHANT_ID=your_merchant_id
ACCOUNTPE_API_URL=https://accountpe-api-url
```

## Testing Steps:

1. Go to /dashboard/deposit
2. Enter amount (minimum XAF 100)
3. Click "Proceed to Pay"
4. You'll be redirected to AccountPe payment page
5. Complete payment
6. AccountPe will call webhook to approve transaction
7. Check user's balance - should be increased
8. Go to admin panel deposits - transaction should show "approved"
