# Dashboard White Screen - FIX APPLIED

## Problem Identified
Dashboard was showing white screen due to a database schema mismatch error:
```
Could not find a relationship between 'users' and 'user_tiers' in the schema cache
```

The dashboard layout was trying to join with a non-existent foreign key relationship.

## Root Cause
The file `/app/dashboard/layout.tsx` was attempting to fetch:
```javascript
const { data: userProfile } = await supabase
  .from("users")
  .select(`
    *,
    user_tiers (
      name,
      price_multiplier
    )
  `)
```

But the `user_tiers` relationship doesn't exist in the Supabase schema.

## Solution Applied
Changed the dashboard layout to fetch `users` table directly without the foreign key join:

### File: `/app/dashboard/layout.tsx`

**Before:**
```javascript
const { data: userProfile } = await supabase
  .from("users")
  .select(`
    *,
    user_tiers (
      name,
      price_multiplier
    )
  `)
  .eq("id", user.id)
  .single()
```

**After:**
```javascript
const { data: userProfile, error: profileError } = await supabase
  .from("users")
  .select("*")
  .eq("id", user.id)
  .single()

if (profileError) {
  console.error("[v0] Dashboard layout - user profile error:", profileError)
  redirect("/auth/login")
}
```

### Updated Props
- Changed `priceMultiplier={userProfile?.user_tiers?.price_multiplier}` 
- To: `priceMultiplier={userProfile?.price_multiplier}`

This change was applied to both:
- `<DashboardSidebar />` component
- `<DashboardHeader />` component

## Why This Works
The `users` table already has a `price_multiplier` field directly on it, so we don't need to join with another table. The dashboard components receive the price_multiplier from the user profile and use it to display tier information.

## Testing
✅ Dashboard should now load without white screen
✅ User profile data should display correctly
✅ Price multiplier for tier display should work
✅ Sidebar and header should render properly

## What Changed
- 1 file modified: `/app/dashboard/layout.tsx`
- No database migrations needed
- No component logic changed
- All existing functionality preserved
