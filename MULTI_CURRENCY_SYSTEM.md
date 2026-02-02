# Multi-Currency System - Complete Implementation Guide

## Overview

This document explains the complete multi-currency system implementation for the NextWave SMM Panel, allowing admins to change the website currency and have it automatically update across the entire platform with real-time conversion.

## Problem Statement (Original in Hinglish)

```
ek or issue hai bhai ki ye jo admin panel se mai setting me general setting karta hu change vaha mai jo bhi currency select karu vo change honi honi chahiye user ke wallet icons me services currency also change ok sabhi ki total price calculation me vohi currency dikhana chahiye or real time currency exchange hona chahiye manlo user ke wallet me 20 dollar hai or maine admin panel website ki currency change kardi hai xaf kardi to user ke wallet me xaf ka icon ana chahiye or vaha currency 20 dollar sae xaf me kitna hota hai perfectly convert ho jaye or user ko show ho uske dashboard me ok same user ko service ke prices show ho or same total pricing during order and ha symbol bhi change hona chahiye jaise user ke wallet me $ ka sign arha hai to vo bhi change hona chahiye ok perfect smoothly
```

**English Translation:**
"There's one more issue - in admin panel settings when I do general settings, whatever currency I select should change everywhere: user wallet icons, service currency should also change, all total price calculations should show in that currency, and real-time currency exchange should happen. For example, if user has $20 and I change admin panel website currency to XAF, then user's wallet should show XAF icon and the currency should perfectly convert from 20 dollars to XAF and show to user in their dashboard. Same for service prices, same for total pricing during order. And the symbol should also change, like if $ sign is showing in user wallet it should also change. OK, perfect and smoothly."

---

## Architecture

### Core Principle: "Store in USD, Display in Selected Currency"

All monetary values are stored in the database in USD (base currency). When displaying to users, amounts are converted in real-time to the selected currency using admin-configured exchange rates.

**Benefits:**
- Single source of truth (USD in database)
- Easy conversion between any currencies
- No data migration needed when changing currency
- Historical accuracy maintained
- Multi-currency support without complex migrations

---

## Phase 1: Infrastructure (COMPLETE ✅)

### 1. Enhanced Currency Utilities (`lib/currency.ts`)

**Supported Currencies:**
- USD: US Dollar ($) - Base currency
- XAF: Central African Franc (FCFA)
- EUR: Euro (€)
- GBP: British Pound (£)
- NGN: Nigerian Naira (₦)
- GHS: Ghanaian Cedi (GH₵)
- KES: Kenyan Shilling (KSh)

**Key Functions:**
```typescript
// Convert USD to any currency
convertFromUSD(usdAmount: number, targetCurrency: string, rate?: number): number

// Convert any currency to USD
convertToUSD(amount: number, sourceCurrency: string, rate?: number): number

// Format with correct symbol and decimals
formatCurrency(amount: number, currency: string, symbol?: string): string

// Get currency icon/emoji
getCurrencyIcon(currency: string): string

// Get list of supported currencies
getSupportedCurrencies(): Array<{code: string, name: string, symbol: string}>
```

**Exchange Rates (Default):**
```typescript
USD: 1 (base)
XAF: 600 (1 USD = 600 XAF)
EUR: 0.92 (1 USD = 0.92 EUR)
GBP: 0.79 (1 USD = 0.79 GBP)
NGN: 770 (1 USD = 770 NGN)
GHS: 12 (1 USD = 12 GHS)
KES: 129 (1 USD = 129 KES)
```

### 2. Currency Context Provider (`contexts/currency-context.tsx`)

**Purpose:** Global state management for currency settings

**Features:**
- Auto-fetches currency settings from API on mount
- Auto-refreshes every 60 seconds
- Provides conversion and formatting functions
- Easy-to-use React hook

**Usage Example:**
```typescript
import { useCurrency } from '@/contexts/currency-context'

function MyComponent() {
  const { currency, symbol, convert, format, icon } = useCurrency()
  
  // Convert USD amount to display currency
  const displayAmount = convert(usdAmount)
  
  // Format with symbol
  const formatted = format(usdAmount)  // "$20.00" or "12,000 FCFA"
  
  // Get currency icon
  const currencyIcon = icon  // "💵" or "💰"
  
  return <div>{formatted}</div>
}
```

### 3. Currency Settings API (`app/api/currency-settings/route.ts`)

**Endpoint:** `GET /api/currency-settings`

**Response:**
```json
{
  "currency": "XAF",
  "currency_symbol": "FCFA",
  "exchange_rate": "600"
}
```

**Features:**
- Force-dynamic (no caching)
- Falls back to USD defaults
- Fast and lightweight

### 4. System Settings Actions (`app/actions/system-settings.ts`)

**Functions:**
```typescript
// Update multiple settings at once
updateSystemSettings(settings: Record<string, string>)

// Get all settings
getSystemSettings()
```

**Auto-revalidation:**
- `/admin-panel-2024/settings`
- `/dashboard`
- `/api/currency-settings`

### 5. Enhanced Admin Settings Form (`components/admin/system-settings-form.tsx`)

**Features:**
- Currency dropdown with 7 currencies
- Auto-updates symbol when currency changes
- Auto-sets exchange rate from defaults
- Clear help text
- Loading states and error handling

**How It Works:**
1. Admin selects currency (e.g., XAF)
2. Form auto-sets `currency_symbol` to "FCFA"
3. Form auto-sets `exchange_rate` to "600"
4. On save, updates system_settings table
5. All users see new currency after refresh

---

## Phase 2: UI Integration (TO BE IMPLEMENTED)

### Required Changes

#### 1. Wrap Dashboard with CurrencyProvider

**File:** `app/dashboard/layout.tsx`

```typescript
import { CurrencyProvider } from '@/contexts/currency-context'

export default function DashboardLayout({ children }: { children: React.Node }) {
  return (
    <CurrencyProvider>
      {children}
    </CurrencyProvider>
  )
}
```

#### 2. Update Wallet Modal (`components/dashboard/wallet-modal.tsx`)

**Changes:**
- Import `useCurrency` hook
- Replace hardcoded `$` symbols
- Convert balance from USD to display currency
- Update icon to match currency

**Before:**
```typescript
<span>${balance?.toFixed(2) || "0.00"}</span>
```

**After:**
```typescript
const { format, icon } = useCurrency()
<span>{format(balance || 0)}</span>
```

#### 3. Update Service Price Displays

**Files to Update:**
- `components/dashboard/service-card.tsx`
- `components/dashboard/mobile-order-interface.tsx`
- `components/dashboard/desktop-dashboard.tsx`
- `components/dashboard/order-dialog.tsx`

**Pattern:**
```typescript
// Before
const priceDisplay = `$${service.base_price.toFixed(2)}`

// After
const { format } = useCurrency()
const priceDisplay = format(service.base_price)
```

#### 4. Update Order Total Calculations

**Files to Update:**
- `components/dashboard/mobile-order-interface.tsx`
- `components/dashboard/order-dialog.tsx`

**Pattern:**
```typescript
// Before
const totalPrice = (quantity / 1000) * servicePrice
<span>${totalPrice.toFixed(2)}</span>

// After
const { format } = useCurrency()
const totalPrice = (quantity / 1000) * servicePrice
<span>{format(totalPrice)}</span>
```

#### 5. Update Transaction History

**Files to Update:**
- `components/dashboard/transaction-history.tsx`
- `components/admin/transaction-manager.tsx`

**Pattern:**
```typescript
// Before
<td>${transaction.amount.toFixed(2)}</td>

// After
const { format } = useCurrency()
<td>{format(transaction.amount)}</td>
```

---

## Database Setup

### Required System Settings

Add these to the `system_settings` table:

```sql
-- Add currency settings
INSERT INTO system_settings (key, value, description) VALUES
  ('currency', 'USD', 'Website display currency code')
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;

INSERT INTO system_settings (key, value, description) VALUES
  ('exchange_rate', '1', 'Exchange rate for selected currency (1 USD = X units)')
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;

-- The currency_symbol field already exists from initial setup
```

---

## User Experience Flow

### Scenario: Admin Changes Currency from USD to XAF

#### Step 1: Admin Changes Setting
```
1. Admin opens Admin Panel → Settings → System
2. Selects "Central African Franc (FCFA)" from dropdown
3. Clicks "Save Settings"
4. System updates:
   - currency = "XAF"
   - currency_symbol = "FCFA"
   - exchange_rate = "600"
```

#### Step 2: User Sees Changes
```
Before (USD):
- Wallet Balance: $20.00
- Service Price: $5.00 per 1000
- Order Total: $10.00
- Symbol: $

After (XAF):
- Wallet Balance: 12,000 FCFA (20 × 600)
- Service Price: 3,000 FCFA per 1000 (5 × 600)
- Order Total: 6,000 FCFA (10 × 600)
- Symbol: FCFA
```

#### Step 3: Real-Time Updates
```
1. User refreshes dashboard
2. CurrencyProvider fetches new settings
3. All amounts auto-convert:
   - useCurrency() hook provides convert() function
   - format() function adds correct symbol
4. UI updates smoothly:
   - Wallet shows XAF balance
   - Services show XAF prices
   - Orders calculate in XAF
   - All symbols updated
```

---

## Testing Checklist

### Admin Panel Testing

- [ ] Open Admin Panel → Settings → System
- [ ] See currency dropdown with 7 options
- [ ] Select USD → Save → Verify symbol is $
- [ ] Select XAF → Save → Verify symbol is FCFA
- [ ] Select EUR → Save → Verify symbol is €
- [ ] Select GBP → Save → Verify symbol is £
- [ ] Check system_settings table for correct values

### User Dashboard Testing

- [ ] User wallet shows correct currency symbol
- [ ] User wallet shows converted balance
- [ ] Service prices show in selected currency
- [ ] Order total calculates in selected currency
- [ ] Transaction history shows in selected currency
- [ ] All $ symbols replaced with selected symbol
- [ ] Currency icon matches selection

### Conversion Testing

**USD to XAF (Rate 600):**
- [ ] $1 = 600 FCFA
- [ ] $10 = 6,000 FCFA
- [ ] $20 = 12,000 FCFA
- [ ] $100 = 60,000 FCFA

**USD to EUR (Rate 0.92):**
- [ ] $1 = €0.92
- [ ] $10 = €9.20
- [ ] $100 = €92.00

**USD to GBP (Rate 0.79):**
- [ ] $1 = £0.79
- [ ] $10 = £7.90
- [ ] $100 = £79.00

### Edge Cases

- [ ] Balance = 0 displays correctly
- [ ] Negative amounts (refunds) display correctly
- [ ] Very large amounts display correctly
- [ ] Very small amounts (< $1) display correctly
- [ ] Switching currency mid-order works
- [ ] Multiple users with different currencies
- [ ] Currency change doesn't affect stored database values

---

## Code Examples

### Example 1: Simple Balance Display

```typescript
"use client"

import { useCurrency } from '@/contexts/currency-context'

export function BalanceDisplay({ balance }: { balance: number }) {
  const { format, icon } = useCurrency()
  
  return (
    <div className="flex items-center gap-2">
      <span>{icon}</span>
      <span className="text-2xl font-bold">{format(balance)}</span>
    </div>
  )
}
```

### Example 2: Service Price with Conversion

```typescript
"use client"

import { useCurrency } from '@/contexts/currency-context'

export function ServicePrice({ usdPrice }: { usdPrice: number }) {
  const { format, currency } = useCurrency()
  
  return (
    <div>
      <span className="text-lg font-semibold">{format(usdPrice)}</span>
      <span className="text-xs text-muted-foreground"> per 1000</span>
    </div>
  )
}
```

### Example 3: Order Total with Validation

```typescript
"use client"

import { useCurrency } from '@/contexts/currency-context'

export function OrderTotal({ 
  quantity, 
  pricePerThousand, 
  userBalance 
}: { 
  quantity: number
  pricePerThousand: number
  userBalance: number 
}) {
  const { convert, format } = useCurrency()
  
  const totalUSD = (quantity / 1000) * pricePerThousand
  const totalDisplay = convert(totalUSD)
  const balanceDisplay = convert(userBalance)
  
  const canAfford = userBalance >= totalUSD
  
  return (
    <div>
      <div>Total: {format(totalUSD)}</div>
      <div>Balance: {format(userBalance)}</div>
      {!canAfford && (
        <div className="text-red-500">Insufficient balance</div>
      )}
    </div>
  )
}
```

---

## Performance Considerations

### Caching Strategy
- Currency settings cached in CurrencyContext
- Refreshed every 60 seconds
- API endpoint force-dynamic (no server cache)
- Reduces database queries

### Optimization Tips
- Don't fetch settings on every component render
- Use `useCurrency()` hook (already cached)
- Format once, display multiple times
- Avoid recalculating conversions

### Load Testing
- Test with 100+ concurrent users
- Monitor API response times
- Check for memory leaks in context
- Verify conversion accuracy under load

---

## Maintenance

### Adding New Currencies

1. **Update `lib/currency.ts`:**
```typescript
export const DEFAULT_EXCHANGE_RATES: Record<string, number> = {
  // ... existing
  INR: 83,  // Indian Rupee
}

export const CURRENCY_SYMBOLS: Record<string, string> = {
  // ... existing
  INR: '₹',
}

export const CURRENCY_DECIMALS: Record<string, number> = {
  // ... existing
  INR: 2,
}
```

2. **Update `getSupportedCurrencies()`:**
```typescript
{ code: 'INR', name: 'Indian Rupee (₹)', symbol: '₹' },
```

3. **Test the new currency**

### Updating Exchange Rates

**Option 1: Manual (Current)**
- Admin updates in system settings form
- Changes take effect immediately

**Option 2: Automatic (Future Enhancement)**
- Integrate with currency API (e.g., exchangerate-api.com)
- Auto-update rates daily
- Store rate history for auditing

---

## Future Enhancements

### Short Term
1. Add rate update schedule (daily/weekly)
2. Display last updated timestamp
3. Add currency comparison tool
4. Show equivalent in USD for reference

### Long Term
1. Real-time exchange rate API integration
2. Multi-currency user wallets
3. Currency preference per user
4. Historical rate tracking
5. Automatic rate adjustment alerts
6. Admin notification on large rate changes

---

## Security Considerations

1. **Rate Manipulation:** Only admins can change rates
2. **Balance Integrity:** Stored in USD, only display converted
3. **Transaction Accuracy:** All calculations use USD base
4. **Audit Trail:** Log all currency setting changes
5. **Input Validation:** Validate rates before saving

---

## Troubleshooting

### Issue: Currency not updating

**Solution:**
1. Check `/api/currency-settings` returns correct values
2. Clear browser cache
3. Check CurrencyProvider is wrapping components
4. Verify system_settings table has correct values

### Issue: Conversion inaccurate

**Solution:**
1. Check exchange rate in system_settings
2. Verify CURRENCY_DECIMALS configuration
3. Check for floating-point precision issues
4. Use provided conversion functions (don't calculate manually)

### Issue: Symbol not showing

**Solution:**
1. Check CURRENCY_SYMBOLS has entry for currency
2. Verify font supports the symbol
3. Use fallback symbols if needed
4. Check browser encoding (UTF-8)

---

## Conclusion

This multi-currency system provides a robust, scalable solution for displaying prices in different currencies while maintaining data integrity by storing everything in USD. The system is:

- ✅ Easy to use (one hook: `useCurrency()`)
- ✅ Flexible (add new currencies easily)
- ✅ Performant (cached, optimized)
- ✅ Accurate (proper decimal handling)
- ✅ Maintainable (well-documented)
- ✅ Secure (admin-controlled)

**Status:** Phase 1 complete, Phase 2 ready to implement!
