# Service Price Update Debugging Guide

## Issue
Individual service price update not working: "nahi ho rha hai bahi bhi updaten inviduasl price"

## Latest Changes (Just Applied)

### Added Detailed Logging
The code now logs every step of the price update process to help identify where it's failing.

### How to Debug

#### Step 1: Open Browser Console
1. Go to https://nextwavesmm.com/admin-panel-2024/services
2. Press **F12** (or right-click → Inspect)
3. Click on **Console** tab

#### Step 2: Try to Update a Price
1. Find any service in the list
2. Click on the **green price number** (e.g., $10.00)
3. Input field should appear
4. Change the price (e.g., to $15.00)
5. Click the **green checkmark** ✓

#### Step 3: Check Console Messages
Look for these messages in the console:

**If Working:**
```
[v0] Saving price: { id: "abc123...", price: 15 }
[v0] Updating service price: { serviceId: "abc123...", newPrice: 15 }
[v0] Service price updated successfully: [{ ...service data... }]
```
Toast notification: "Price updated successfully"

**If NOT Working:**
```
[v0] Saving price: { id: "abc123...", price: 15 }
[v0] Updating service price: { serviceId: "abc123...", newPrice: 15 }
[v0] Update service price error: { message: "...", details: "..." }
[v0] Failed to update price: { error details }
```
Toast notification: "Error: [error message]"

## Possible Issues & Solutions

### Issue 1: Database Permission Error
**Error Message**: "permission denied" or "insufficient privileges"

**Solution**: 
```sql
-- Run this SQL in your Supabase dashboard
GRANT UPDATE ON services TO authenticated;
GRANT UPDATE ON services TO service_role;
```

### Issue 2: Column Doesn't Exist
**Error Message**: "column base_price does not exist"

**Solution**: 
```sql
-- Check if column exists
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'services' AND column_name = 'base_price';

-- If not exists, add it
ALTER TABLE services ADD COLUMN base_price DECIMAL DEFAULT 0;
```

### Issue 3: RLS (Row Level Security) Blocking Update
**Error Message**: "new row violates row-level security policy"

**Solution**:
```sql
-- Check existing policies
SELECT * FROM pg_policies WHERE tablename = 'services';

-- Add policy for admin updates
CREATE POLICY "Allow admin to update services"
ON services FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);
```

### Issue 4: Supabase Client Not Initialized
**Error Message**: "Cannot read property 'from' of undefined"

**Solution**: Check that environment variables are set:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

### Issue 5: Authentication Problem
**Error Message**: "Invalid JWT" or "User not authenticated"

**Solution**: 
1. Log out of admin panel
2. Clear browser cookies
3. Log back in
4. Try updating price again

## Quick Test Query

Run this in Supabase SQL Editor to test direct update:

```sql
-- Find a service
SELECT id, name, base_price FROM services LIMIT 1;

-- Try to update it (use actual ID from above)
UPDATE services 
SET base_price = 99.99 
WHERE id = 'your-service-id-here';

-- Check if it updated
SELECT id, name, base_price FROM services WHERE id = 'your-service-id-here';
```

If this works, the problem is in the application code.
If this fails, the problem is in the database/permissions.

## Admin Panel Verification

### Check Admin Panel is Intact
✅ Layout should be the same as https://nextwavesmm.com/admin-panel-2024/
✅ All pages should be accessible
✅ No visual changes
✅ Only improved error messages

### Test Other Admin Functions
Try these to confirm other features work:
1. Toggle service status (on/off switch)
2. Edit service via Edit button
3. Add new service
4. Delete service

If these work but inline price edit doesn't, there's a specific issue with the `updateServicePrice` function.

## Contact Developer

If you see error messages in console, share:
1. The exact error message from console
2. Screenshot of the error
3. Which service you're trying to update
4. What price you're trying to set

This will help identify the exact issue.

---

## Expected Behavior

### Before (BROKEN)
- Click price → input appears
- Change value → click ✓
- **No visible error but price doesn't change**
- Refresh page → old price still shows

### After Fix (SHOULD WORK)
- Click price → input appears
- Change value → click ✓
- **See "Price updated successfully" toast**
- Price changes immediately in the list
- Refresh page → new price persists

---

**Created**: 2026-02-05
**Status**: Debugging version deployed
**Action Required**: Test and report console errors if any
