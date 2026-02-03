# Admin Role Setup Guide

## Problem: "Unauthorized - Admin access required"

This error occurs when your user account doesn't have the "admin" role in the database.

---

## Quick Fix (5 minutes)

### Step 1: Find Your User ID

**Option A: Check Browser Console**
1. Open Admin Panel in browser
2. Press F12 to open Developer Console
3. Try to change currency (will fail)
4. Look in console for log like:
   ```
   [v0] Verifying admin role for provided userId: abc-123-xyz-456
   ```
5. Copy the user ID

**Option B: Check Supabase Dashboard**
1. Go to Supabase Dashboard
2. Click on "Authentication" → "Users"
3. Find your email
4. Copy your User ID

---

### Step 2: Set Admin Role

**Copy and run this SQL in Supabase SQL Editor:**

Replace `your-email@example.com` with your actual email:

```sql
UPDATE users 
SET role = 'admin' 
WHERE email = 'your-email@example.com';
```

Or replace `your-user-id` with your actual user ID:

```sql
UPDATE users 
SET role = 'admin' 
WHERE id = 'your-user-id';
```

---

### Step 3: Verify

Run this to check:

```sql
SELECT id, email, role, created_at 
FROM users 
WHERE role = 'admin';
```

You should see your user with `role = 'admin'`.

---

### Step 4: Test

1. Refresh the admin panel page
2. Try to change currency again
3. Should work now! ✅

---

## Alternative Methods

### Method 1: Set First User as Admin

If you're the first user, run this:

```sql
UPDATE users 
SET role = 'admin' 
WHERE id = (SELECT id FROM users ORDER BY created_at ASC LIMIT 1);
```

### Method 2: Set All Existing Users as Admin (Development Only)

**⚠️ WARNING: Only use in development!**

```sql
UPDATE users 
SET role = 'admin' 
WHERE role IS NULL OR role = '';
```

---

## Troubleshooting

### Issue: "User not found in database"

**Cause:** User ID not in users table

**Fix:**
1. Check if you're logged in
2. Verify user ID is correct
3. Check Supabase Authentication → Users
4. Make sure user exists

### Issue: Still getting error after setting role

**Possible causes:**
1. Wrong user ID (check console logs)
2. Typo in email
3. Role not saved (verify with SELECT query)
4. Browser cache (hard refresh: Ctrl+Shift+R)

**Debug steps:**
1. Open browser console (F12)
2. Look for these logs:
   ```
   [v0] Verifying admin role for provided userId: ...
   [v0] User role (lowercase): ... for email: ...
   ```
3. If role shows as null or empty, SQL didn't work
4. If role shows different value, check for typos

---

## How Role Check Works

### Code Flow:
```
1. Page Component → Get user from session
2. Page Component → Pass userId to form
3. Form Component → Pass userId to server action
4. Server Action → Query database for user role
5. Server Action → Check if role === 'admin'
6. Server Action → Allow or deny
```

### Database Query:
```sql
SELECT role, email 
FROM users 
WHERE id = 'user-id'
```

### Role Check:
```typescript
if (userData.role?.toLowerCase() !== "admin") {
  return error
}
```

---

## Common Issues

### 1. Role is NULL
**Symptom:** Error says "Your role is: 'null'"  
**Fix:** Run UPDATE query to set role = 'admin'

### 2. Role is Empty String
**Symptom:** Error says "Your role is: ''"  
**Fix:** Run UPDATE query to set role = 'admin'

### 3. Role is "user"
**Symptom:** Error says "Your role is: 'user'"  
**Fix:** Run UPDATE query to change to 'admin'

### 4. User Not in Database
**Symptom:** "User not found in database"  
**Fix:** Check authentication, might need to re-login

---

## Verification Commands

### Check Your Role:
```sql
SELECT id, email, role 
FROM users 
WHERE email = 'your-email@example.com';
```

### Check All Users:
```sql
SELECT id, email, role, created_at 
FROM users 
ORDER BY created_at ASC;
```

### Count Admin Users:
```sql
SELECT COUNT(*) as admin_count 
FROM users 
WHERE role = 'admin';
```

---

## Prevention

### For New Installations:

Add this trigger to automatically make the first user an admin:

```sql
CREATE OR REPLACE FUNCTION make_first_user_admin()
RETURNS TRIGGER AS $$
BEGIN
  -- If this is the first user, make them admin
  IF (SELECT COUNT(*) FROM users) = 0 THEN
    NEW.role := 'admin';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER first_user_admin_trigger
BEFORE INSERT ON users
FOR EACH ROW
EXECUTE FUNCTION make_first_user_admin();
```

---

## Success Criteria

✅ You know your user ID  
✅ SQL query executed successfully  
✅ Verification query shows role = 'admin'  
✅ Admin panel currency change works  
✅ No "Unauthorized" error  

---

## Need Help?

### Console Logs to Share:
1. Open browser console (F12)
2. Try to change currency
3. Copy all logs that start with `[v0]`
4. Share those logs

### Information Needed:
- User ID (from console or Supabase)
- Error message (exact text)
- Console logs (starting with [v0])
- Result of verification query

---

**Status:** Once role is set to 'admin', everything will work! ✅
