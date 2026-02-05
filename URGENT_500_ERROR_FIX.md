# CRITICAL: 500 Error Analysis and Fix

## The Problem

You're getting a **500 Internal Server Error** on the Vercel deployment but your production (nextwavesmm.com) works fine.

## Root Cause

The error is happening in `/admin-panel-2024/services` endpoint. This could be due to:

### 1. Environment Variables Missing on Vercel
The Supabase client needs these environment variables:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY` (for admin operations)

**Check Vercel Dashboard:**
1. Go to your Vercel project settings
2. Navigate to Environment Variables
3. Ensure all three variables are set
4. Redeploy after adding them

### 2. Database Schema Difference

My changes assume the `services` table has a `base_price` column.

**If your production uses `price` column instead**, this would cause 500 errors.

**To check your production schema:**
```sql
-- Run this in Supabase SQL Editor
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'services' 
AND column_name IN ('price', 'base_price', 'provider_price');
```

### 3. Recent Code Changes

The changes I made:
```typescript
// Line 52-56 in app/actions/services.ts
const { error, data } = await supabase
  .from("services")
  .update({ base_price: newPrice })  // Changed from 'price' to 'base_price'
  .eq("id", serviceId)
  .select()  // Added .select() to return data
```

If production uses `price` column, this breaks everything.

## SOLUTION

### Option 1: Revert My Changes (Safest)
If production works with `price` column, revert to that:

```typescript
// Revert to this in app/actions/services.ts line 45-68
export async function updateServicePrice(serviceId: string, newPrice: number) {
  const supabase = await createClient()
  
  // Use 'price' if that's what production has
  const { error } = await supabase
    .from("services")
    .update({ price: newPrice })
    .eq("id", serviceId)
  
  if (error) throw error
  
  revalidatePath("/admin-panel-2024/services")
  return { success: true }
}
```

### Option 2: Check What Production Uses
1. Log into Supabase dashboard
2. Check services table schema
3. If it has `base_price`, my code is correct
4. If it has `price`, need to revert changes

### Option 3: Make It Work with Both
```typescript
export async function updateServicePrice(serviceId: string, newPrice: number) {
  const supabase = await createClient()
  
  // Try to update both columns - one will work
  const { error } = await supabase
    .from("services")
    .update({ 
      price: newPrice,  // For backward compatibility
      base_price: newPrice  // For new schema
    })
    .eq("id", serviceId)
  
  if (error) throw error
  
  revalidatePath("/admin-panel-2024/services")
  return { success: true }
}
```

## What I Recommend

**IMMEDIATELY:**
1. Check Vercel environment variables
2. Check your production database schema  
3. Tell me which column your production uses: `price` or `base_price`

**Then:**
- If production uses `price` → I'll revert my changes
- If production uses `base_price` → My changes are correct, just need env vars

## How to Check Your Production Schema

**Option 1: Supabase Dashboard**
1. Go to https://supabase.com
2. Select your project
3. Go to Table Editor
4. Click on `services` table
5. Look at column names

**Option 2: SQL Query**
Run this in SQL Editor:
```sql
SELECT * FROM services LIMIT 1;
```
This will show you all column names.

## The Real Issue

I made changes assuming your schema had `base_price`, but if production has `price`, that's why it's breaking.

**This branch should NOT be deployed to production until we confirm column names match!**

---

**Action Required:**
Please check your production database and tell me which column it uses:
- `price`
- `base_price`  
- Both

Then I can fix the code accordingly.
