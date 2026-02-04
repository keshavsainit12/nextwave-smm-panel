# Bulk Pricing Debug Guide

## How to Test Bulk Pricing

### Step 1: Open Browser Console
1. Open your app in browser
2. Press `F12` (or right-click → Inspect)
3. Go to **Console** tab

### Step 2: Place an Order and Watch Console

#### Test Case 1: Service with min_quantity = 100
1. Go to Dashboard
2. Find a service with min quantity 100 or higher
3. Click "Order"
4. Set quantity to 10,000 (or higher)
5. **Watch Console Output - should see:**
   \`\`\`
   [v0] Bulk pricing calculation: {
     quantity: 10000,
     min_quantity: 100,
     isBulkEligible: true,  ← Should be TRUE
     ...
   }
   [v0] Price calculation: {
     isBulkEligible: true,
     priceMultiplier: 2.5,  ← Should be 2.5
     ...
   }
   \`\`\`
6. **UI Check:**
   - Should see GREEN alert: "Bulk Pricing Active! 2.5x multiplier"
   - Price should show "(Bulk: 2.5x)" label

#### Test Case 2: Service with min_quantity = 10
1. Go to Dashboard
2. Find a service with min quantity 10 or less
3. Click "Order"
4. Set quantity to 10,000
5. **Watch Console Output - should see:**
   \`\`\`
   [v0] Bulk pricing calculation: {
     quantity: 10000,
     min_quantity: 10,
     isBulkEligible: false,  ← Should be FALSE
     ...
   }
   \`\`\`
6. **UI Check:**
   - Should see AMBER alert: "Bulk pricing not available for services with min quantity ≤ 10"
   - NO green "Bulk Pricing Active" alert
   - Price should NOT show bulk label

#### Test Case 3: Same Service, Different Quantities
1. Same service with min = 100
2. Quantity 5,000 → isBulkEligible: false
3. Quantity 10,000 → isBulkEligible: true
4. Should see price change in real-time

### Step 3: When Placing Order
After clicking "Place Order Now", console should show:
\`\`\`
[v0] Submitting order with bulk flag: {
  serviceId: "...",
  quantity: 10000,
  isBulkEligible: true,  ← This must be true for bulk to work
  totalPrice: "..."
}
\`\`\`

### Backend Confirmation
After order is placed, check the **Vercel Logs** or server logs for:
\`\`\`
[v0] Order calculation: 10000 units × $0.5/1K × 2.5x (BULK) = $12.5
\`\`\`

If you see `3x (REGULAR)` instead, bulk flag didn't reach backend!

---

## Common Issues & Solutions

### Issue 1: Green Alert Not Showing
**Cause:** `isBulkEligible` is false (console will show)
**Check:**
- Is quantity >= 10,000? (Look at console: quantity value)
- Is min_quantity > 10? (Look at console: min_quantity value)
- BOTH must be true!

### Issue 2: Price Not Changing
**Cause:** priceMultiplier not updating
**Console Check:**
- Look at `[v0] Price calculation` logs
- Should show `priceMultiplier: 2.5` when bulk is active
- If still showing 3.0, the memoize dependency might be wrong

### Issue 3: Order Placed Without Bulk Flag
**Cause:** isBulkEligible not passed to backend
**Console Check:**
- Look at `[v0] Submitting order with bulk flag`
- Should show `isBulkEligible: true`
- If false, bulk won't be applied on backend

### Issue 4: Backend Not Applying Bulk
**Cause:** isBulkBuy parameter not recognized
**Server Log Check:** (in Vercel Logs)
- Should show `2.5x (BULK)` in order calculation
- If showing `3x (REGULAR)`, backend didn't receive flag

---

## How to Share Debug Info

When reporting bulk pricing issue, please provide:
1. **Browser Console Output** (Screenshot of [v0] logs)
2. **Service Info** (name, min_quantity)
3. **Order Attempt** (quantity you tried, expected vs actual price)
4. **Expected Result** (what should have happened)

Example:
\`\`\`
Service: Instagram Likes (min_quantity: 100)
Quantity: 10,000
Expected: Green alert + 2.5x multiplier = $XX
Actual: No alert + still 3x multiplier = $YY
Console shows: [paste logs here]
\`\`\`

---

**Debug logging added to:**
- Order Dialog service data loading
- Bulk pricing eligibility check
- Price calculation
- Order submission

---

Generated: 2026-02-02
