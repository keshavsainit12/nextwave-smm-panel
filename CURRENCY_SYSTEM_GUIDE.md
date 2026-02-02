# Multi-Currency System - Complete Guide

## Overview

The system now supports multiple currencies with automatic conversion. All amounts are stored in **USD** in the database (base currency) but can be displayed in any supported currency.

---

## Supported Currencies

| Currency | Code | Symbol | Exchange Rate (to USD) |
|----------|------|--------|------------------------|
| US Dollar | USD | $ | 1 (base) |
| CFA Franc (XAF) | XAF | FCFA | 620 |
| Euro | EUR | € | 0.92 |
| British Pound | GBP | £ | 0.79 |
| Indian Rupee | INR | ₹ | 83 |
| Nigerian Naira | NGN | ₦ | 1550 |

**Note:** Exchange rates are approximate and can be updated in `/lib/currency.ts`

---

## How to Change Currency

### Step 1: Access Admin Panel
1. Login to admin panel: `/admin-login`
2. Go to **Settings** page
3. Click **System** tab

### Step 2: Select Currency
1. Find the **Currency** dropdown
2. Select your desired currency (e.g., XAF)
3. See the exchange rate displayed below
4. Click **Save Settings**

### Step 3: Automatic Reload
- Page will automatically reload
- All amounts convert to new currency
- User wallets display in new currency
- Service prices display in new currency
- Transaction history displays in new currency

---

## Example: Changing to XAF

**Before (USD):**
```
User Wallet: $9.00
Service Price: $3.00
Transaction: $5.00 deposit
```

**After (XAF) - with 1 USD = 620 XAF:**
```
User Wallet: 5,580 FCFA
Service Price: 1,860 FCFA
Transaction: 3,100 FCFA deposit
```

**✅ Everything converts automatically!**

---

## What Happens Behind the Scenes

### Database Storage
- **All amounts stay in USD** in the database
- User wallet: `9.00` (USD)
- Service base_price: `3.00` (USD)
- No data migration needed!

### Display Conversion
- Frontend reads system currency setting
- Converts USD amounts using exchange rate
- Displays with correct currency symbol
- Formula: `DisplayAmount = USD_Amount × ExchangeRate`

### Example Calculation
```
User has $9 in database
System currency = XAF (rate: 620)
Display: 9 × 620 = 5,580 FCFA
```

---

## Features

### ✅ Automatic Conversion
- **Wallets:** User balances convert instantly
- **Services:** All service prices convert
- **Transactions:** Deposit/order history converts
- **Orders:** Order amounts convert
- **Dashboard:** All stats convert

### ✅ Smart Formatting
- **XAF/NGN/INR:** Shows whole numbers (no decimals)
  - Example: `5,580 FCFA` (not `5,580.00 FCFA`)
- **USD/EUR/GBP:** Shows 2 decimals
  - Example: `$9.00` or `€8.28`

### ✅ Symbol Placement
- **USD/EUR/GBP:** Symbol before amount (`$9.00`)
- **XAF:** Symbol after amount with space (`5580 FCFA`)

---

## Files Modified

### Core Currency System
1. **`/lib/currency.ts`** - Currency conversion logic
2. **`/lib/currency-context.tsx`** - React context for currency
3. **`/app/actions/system-settings.ts`** - Server actions
4. **`/components/admin/system-settings-form.tsx`** - UI for currency selection

### Database
5. **`/scripts/add-currency-support.sql`** - Database setup

---

## Technical Details

### Currency Conversion Functions

**Convert from USD to display currency:**
```typescript
import { displayAmount } from "@/lib/currency"

// User has $9 in database
const usdAmount = 9.00
const currency = "XAF"

// Display in XAF
const formatted = displayAmount(usdAmount, currency)
// Result: "5580 FCFA"
```

**Convert to USD for storage:**
```typescript
import { convertToUsd } from "@/lib/currency"

// User enters 5580 XAF
const xafAmount = 5580
const usdAmount = convertToUsd(xafAmount, "XAF")
// Result: 9.00 (stored in database)
```

---

## Exchange Rate Management

### Update Exchange Rates

Edit `/lib/currency.ts`:

```typescript
export const CURRENCIES: Record<string, Currency> = {
  USD: {
    code: "USD",
    name: "US Dollar",
    symbol: "$",
    exchangeRate: 1,
  },
  XAF: {
    code: "XAF",
    name: "Central African CFA Franc",
    symbol: "FCFA",
    exchangeRate: 620, // ← Update this
  },
  // ... other currencies
}
```

### Add New Currency

```typescript
NGN: {
  code: "NGN",
  name: "Nigerian Naira",
  symbol: "₦",
  exchangeRate: 1550, // 1 USD = 1550 NGN
},
```

---

## Testing

### Test Currency Change

1. **Login as admin**
2. **Go to Settings → System**
3. **Change currency to XAF**
4. **Save settings**
5. **Verify:**
   - ✅ Page reloads
   - ✅ User wallets show FCFA
   - ✅ Service prices show FCFA
   - ✅ Transactions show FCFA
   - ✅ Orders show FCFA

### Test Multiple Users

1. **User A** has $10 in wallet
2. **Admin** changes currency to XAF
3. **User A** sees `6,200 FCFA` (10 × 620)
4. **User B** has $5 in wallet
5. **User B** sees `3,100 FCFA` (5 × 620)
6. ✅ All users see converted amounts

---

## Troubleshooting

### Issue: Currency not changing
**Solution:** 
- Clear browser cache
- Logout and login again
- Check system_settings table for currency value

### Issue: Amounts showing wrong
**Solution:**
- Verify exchange rate in `/lib/currency.ts`
- Check currency code matches exactly
- Restart application after changes

### Issue: Account section empty
**Solution:**
- Verify user is authenticated
- Check admin_settings_form.tsx is loaded
- Verify userId is passed correctly

---

## Security Notes

### Exchange Rate Updates
- Exchange rates are **hardcoded** in code
- Update rates by modifying `/lib/currency.ts`
- Restart app after updating rates
- **Future:** Can be moved to database for admin control

### Data Integrity
- Database amounts **never change** (stay in USD)
- Only display changes based on currency
- Easy to switch back to USD anytime
- No risk of data corruption

---

## Summary

**What Works Now:**
- ✅ Currency selection in admin panel (System tab)
- ✅ Support for USD, XAF, EUR, GBP, INR, NGN
- ✅ Automatic conversion of all amounts
- ✅ Proper symbol and formatting
- ✅ Exchange rate display
- ✅ Smooth currency changes without issues

**User Experience:**
1. Admin changes currency to XAF
2. Page reloads automatically
3. All amounts convert to FCFA
4. Users see XAF everywhere
5. No manual work needed!

**Database:**
- All amounts stay in USD
- No migration needed
- Switch currencies anytime
- Clean and safe

---

## Contact

If you need to:
- Add new currencies
- Update exchange rates
- Troubleshoot issues

Check the files mentioned above or contact support.

**Everything is working smoothly now!** 🎉
