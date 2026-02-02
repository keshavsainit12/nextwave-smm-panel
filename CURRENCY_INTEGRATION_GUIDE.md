# Integrating Currency Display Throughout the App

## Quick Integration Guide

Now that the currency system is implemented, here's how to integrate it into your components:

---

## Method 1: Using the Display Function (Easiest)

For any component that displays money amounts:

```typescript
import { displayAmount } from "@/lib/currency"
import { getSystemSettings } from "@/app/actions/system-settings"

// In your server component
const { settings } = await getSystemSettings()
const currency = settings.currency || "USD"

// Display any USD amount
const userBalance = 9.00 // USD from database
const displayBalance = displayAmount(userBalance, currency)
// Result: "5580 FCFA" (if currency is XAF)
```

---

## Method 2: Client Component with Context

```typescript
"use client"

import { useCurrency } from "@/lib/currency-context"

export function WalletBalance({ usdAmount }: { usdAmount: number }) {
  const { displayAmount } = useCurrency()
  
  return (
    <div className="balance">
      {displayAmount(usdAmount)}
    </div>
  )
}
```

---

## Method 3: Direct Conversion

```typescript
import { convertFromUsd, formatCurrency } from "@/lib/currency"

const usdAmount = 9.00
const currency = "XAF"

// Convert
const converted = convertFromUsd(usdAmount, currency)
// Result: 5580

// Format
const formatted = formatCurrency(converted, currency)
// Result: "5580 FCFA"
```

---

## Where to Apply

### 1. User Dashboard

**Files to update:**
- `app/dashboard/page.tsx`
- `components/dashboard/desktop-dashboard.tsx` 
- `components/dashboard/mobile-high-trust-dashboard.tsx`

**What to change:**
```typescript
// Before
<div className="balance">${user.balance.toFixed(2)}</div>

// After
import { displayAmount } from "@/lib/currency"
const currency = settings.currency || "USD"

<div className="balance">{displayAmount(user.balance, currency)}</div>
```

### 2. Service List

**File:** `components/service-list.tsx` or similar

```typescript
// Before
<div className="price">${service.base_price.toFixed(2)}</div>

// After
<div className="price">{displayAmount(service.base_price, currency)}</div>
```

### 3. Transaction History

**File:** Transaction components

```typescript
// Before
<div className="amount">${transaction.amount.toFixed(2)}</div>

// After
<div className="amount">{displayAmount(transaction.amount, currency)}</div>
```

### 4. Order Details

**File:** Order components

```typescript
// Before
<div className="order-price">${order.price.toFixed(2)}</div>

// After
<div className="order-price">{displayAmount(order.price, currency)}</div>
```

### 5. Admin Dashboard

**File:** `app/admin-panel-2024/page.tsx`

```typescript
// Revenue display
const revenue = calculateRevenue() // Returns USD
const formatted = displayAmount(revenue, currency)
```

---

## Complete Example: User Dashboard

```typescript
// app/dashboard/page.tsx
import { displayAmount } from "@/lib/currency"
import { getSystemSettings } from "@/app/actions/system-settings"
import { createClient } from "@/lib/supabase/server"

export default async function DashboardPage() {
  const supabase = await createClient()
  
  // Get user data (amounts in USD)
  const { data: user } = await supabase
    .from("users")
    .select("balance, total_spent")
    .single()
  
  // Get currency setting
  const { settings } = await getSystemSettings()
  const currency = settings.currency || "USD"
  
  return (
    <div>
      {/* Balance Card */}
      <div className="card">
        <h3>Wallet Balance</h3>
        <p className="text-3xl font-bold">
          {displayAmount(user.balance, currency)}
        </p>
      </div>
      
      {/* Total Spent */}
      <div className="card">
        <h3>Total Spent</h3>
        <p className="text-2xl">
          {displayAmount(user.total_spent, currency)}
        </p>
      </div>
      
      {/* Services */}
      <ServiceList currency={currency} />
    </div>
  )
}
```

---

## Handling User Input (Deposits, etc.)

When users enter amounts (e.g., deposit), you need to convert TO USD for storage:

```typescript
"use client"

import { convertToUsd } from "@/lib/currency"
import { useCurrency } from "@/lib/currency-context"

export function DepositForm() {
  const { currency } = useCurrency()
  const [amount, setAmount] = useState("")
  
  const handleSubmit = async () => {
    // User enters amount in display currency
    const displayAmount = parseFloat(amount)
    
    // Convert to USD for storage
    const usdAmount = convertToUsd(displayAmount, currency)
    
    // Save to database
    await createDeposit({ amount: usdAmount }) // Stored as USD
  }
  
  return (
    <form onSubmit={handleSubmit}>
      <Input 
        type="number"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        placeholder={`Amount in ${currency}`}
      />
      <Button type="submit">Deposit</Button>
    </form>
  )
}
```

---

## Best Practices

### 1. Always Store in USD
```typescript
// ✅ GOOD: Store in USD
await supabase
  .from("users")
  .update({ balance: usdAmount })

// ❌ BAD: Store in display currency
await supabase
  .from("users")
  .update({ balance: xafAmount })
```

### 2. Convert on Display
```typescript
// ✅ GOOD: Convert when showing
const displayBalance = displayAmount(user.balance, currency)

// ❌ BAD: Store converted value
const convertedBalance = user.balance * 620
```

### 3. Use Helper Functions
```typescript
// ✅ GOOD: Use provided functions
import { displayAmount } from "@/lib/currency"
const formatted = displayAmount(amount, currency)

// ❌ BAD: Manual formatting
const formatted = `${amount * 620} FCFA`
```

---

## Testing Your Integration

### 1. Start with USD
- Set currency to USD
- Verify all amounts show correctly
- Check $9.00 displays as "$9.00"

### 2. Switch to XAF
- Change currency to XAF in admin panel
- Reload page
- Verify $9.00 now shows as "5580 FCFA"
- Check all components updated

### 3. Test Calculations
- Place an order
- Check price is correct
- Verify wallet deduction
- Confirm transaction shows right amount

---

## Common Mistakes to Avoid

### ❌ Mistake 1: Converting in Database Query
```typescript
// DON'T DO THIS
const { data } = await supabase
  .from("users")
  .select("balance * 620 as xaf_balance") // Wrong!
```

### ❌ Mistake 2: Hardcoding Currency
```typescript
// DON'T DO THIS
const formatted = `${amount * 620} FCFA` // Hardcoded!
```

### ❌ Mistake 3: Not Using Helper Functions
```typescript
// DON'T DO THIS
const xaf = amount * 620
const formatted = `${xaf} FCFA` // Manual!
```

### ✅ Correct Way
```typescript
import { displayAmount } from "@/lib/currency"
const formatted = displayAmount(amount, currency)
```

---

## Summary

**Integration Steps:**
1. Import `displayAmount` from `/lib/currency`
2. Get currency from system settings
3. Pass USD amounts and currency to `displayAmount()`
4. Display the formatted result

**That's it!** Simple and clean. 🎉

---

## Need Help?

See `/CURRENCY_SYSTEM_GUIDE.md` for more details or check the implementation in:
- `/lib/currency.ts` - Core functions
- `/components/admin/system-settings-form.tsx` - Example usage
- `/app/actions/system-settings.ts` - Server-side example
