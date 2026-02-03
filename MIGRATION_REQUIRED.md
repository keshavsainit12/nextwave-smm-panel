# 🚨 DATABASE MIGRATION REQUIRED

## Currency Column Missing Error

If you're seeing this error:
```
Could not find the 'currency' column of 'users' in the schema cache
```

This means the database migration for currency support hasn't been run yet.

---

## Quick Fix (30 seconds)

### Option 1: Run in Supabase SQL Editor (Recommended)

1. Go to your Supabase Dashboard
2. Click "SQL Editor" in the sidebar
3. Create a new query
4. Copy and paste this SQL:

```sql
-- Add currency columns to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS currency TEXT DEFAULT 'USD';
ALTER TABLE users ADD COLUMN IF NOT EXISTS currency_updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Add constraint to ensure only valid currencies
ALTER TABLE users ADD CONSTRAINT users_currency_check 
CHECK (currency IN ('USD', 'EUR', 'GBP', 'INR', 'PKR', 'AED'));

-- Add index for performance
CREATE INDEX IF NOT EXISTS idx_users_currency ON users(currency);

-- Verify the columns were added
SELECT column_name, data_type, column_default 
FROM information_schema.columns 
WHERE table_name = 'users' 
AND column_name IN ('currency', 'currency_updated_at');
```

5. Click "Run" or press Cmd/Ctrl + Enter
6. Verify you see the columns in the results

---

### Option 2: Run Complete Migration Script

If you want the full migration with audit table:

1. Open Supabase SQL Editor
2. Load and run: `scripts/008_add_user_currency.sql`

This includes:
- Currency columns
- Validation constraints
- Indexes
- Optional audit table for tracking currency changes

---

## Verification

After running the migration, verify it worked:

```sql
-- Check if columns exist
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'users' 
AND column_name LIKE '%currency%';
```

You should see:
- `currency` (text)
- `currency_updated_at` (timestamp with time zone)

---

## What This Migration Does

1. **Adds currency column** - Stores user's preferred currency (USD, EUR, GBP, INR, PKR, AED)
2. **Adds timestamp column** - Tracks when currency was last changed
3. **Adds validation** - Ensures only supported currencies can be saved
4. **Adds index** - Improves query performance
5. **Sets default** - All existing users get 'USD' as default currency

---

## After Migration

Once migration is complete:

1. **Admin Panel:**
   - Can change system currency in Settings
   - Changes apply to all new users by default

2. **User Settings:**
   - Users can change their preferred currency
   - Prices display in their chosen currency
   - Conversion happens automatically

3. **No Code Changes Needed:**
   - Currency feature is already implemented in code
   - Just needed the database schema update

---

## Troubleshooting

### Error: "permission denied for table users"
**Solution:** Make sure you're using the Supabase SQL Editor as the service role user, not regular auth.

### Error: "relation users does not exist"
**Solution:** Make sure you're connected to the correct database/project.

### Error: "constraint already exists"
**Solution:** Migration partially ran before. You can ignore this or drop the constraint first:
```sql
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_currency_check;
```

---

## Migration Status Check

Run this to check if migration is needed:

```sql
SELECT 
  CASE 
    WHEN EXISTS (
      SELECT 1 
      FROM information_schema.columns 
      WHERE table_name = 'users' 
      AND column_name = 'currency'
    ) THEN '✅ Migration complete - currency column exists'
    ELSE '❌ Migration required - currency column missing'
  END as migration_status;
```

---

## Support

If you continue to have issues:

1. Check Supabase logs for detailed error messages
2. Verify you have proper permissions
3. Ensure you're in the correct project/database
4. Check that the users table exists and is accessible

---

**Last Updated:** 2026-02-03  
**Migration Script:** `scripts/008_add_user_currency.sql`  
**Related Feature:** Multi-currency support (6 currencies)
