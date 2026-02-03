# Check User Role Guide - Fix Admin Panel Redirect

## Problem

User login is redirecting to admin panel when you want to go to user dashboard.

**Why?** Your role in the database is set to `'admin'` instead of `'user'`.

---

## Quick Solution

### Step 1: Check Your Current Role

Run this in **Supabase SQL Editor:**

```sql
SELECT id, email, role, created_at 
FROM users 
ORDER BY created_at DESC 
LIMIT 10;
```

**Look for your email and check the `role` column.**

---

### Step 2: Change Role to 'user'

**If you see `role = 'admin'` and want user dashboard access:**

```sql
UPDATE users 
SET role = 'user' 
WHERE email = 'your-email@example.com';
```

**⚠️ IMPORTANT:** Replace `'your-email@example.com'` with your actual email!

---

### Step 3: Verify the Change

```sql
SELECT email, role 
FROM users 
WHERE email = 'your-email@example.com';
```

**Should show:**
- email: your-email@example.com
- role: **user** ✅

---

### Step 4: Test Login

1. **Logout** from the application
2. **Clear browser cache** (Ctrl+Shift+Delete or Cmd+Shift+Delete)
3. **Close all browser tabs** of the application
4. **Login again**
5. **Should redirect to** `/dashboard` ✅

---

## Alternative Methods

### Method 1: Change by User ID

**If you know your user ID:**

```sql
UPDATE users 
SET role = 'user' 
WHERE id = 'abc-123-def-456';
```

### Method 2: Find User ID First

```sql
SELECT id, email, role 
FROM users 
WHERE email = 'your-email@example.com';
```

Copy the `id`, then update:

```sql
UPDATE users 
SET role = 'user' 
WHERE id = 'copied-id-here';
```

---

## Understanding How It Works

### Auth Callback Logic

**File:** `app/auth/callback/route.ts` (lines 130-134)

```typescript
if (existingUser.role === "admin") {
  return NextResponse.redirect(new URL("/admin-panel-2024", request.url))
}

return NextResponse.redirect(new URL("/dashboard", request.url))
```

**What happens:**
1. User logs in
2. System checks `role` in database
3. If `role = 'admin'` → Go to `/admin-panel-2024`
4. If `role = 'user'` → Go to `/dashboard`

**This is correct behavior!** The system is working as designed.

---

## Multiple Accounts Setup

### Want both Admin and User access?

**Create 2 accounts:**

**Account 1 (Admin):**
```sql
-- Set first account as admin
UPDATE users 
SET role = 'admin' 
WHERE email = 'admin@example.com';
```

**Account 2 (User):**
```sql
-- Set second account as user
UPDATE users 
SET role = 'user' 
WHERE email = 'user@example.com';
```

**Use:**
- `admin@example.com` → Access admin panel
- `user@example.com` → Access user dashboard

---

## Common Issues & Solutions

### Issue 1: "Still going to admin panel after changing role"

**Solution:**
1. Clear browser cache completely
2. Logout and close all tabs
3. Open incognito/private window
4. Login again
5. Should work now ✅

### Issue 2: "How do I know what my role is?"

**Solution:**
```sql
-- Check all users and their roles
SELECT email, role, created_at 
FROM users 
ORDER BY created_at DESC;
```

Find your email in the results.

### Issue 3: "Can't access admin panel anymore"

**Solution:**
```sql
-- Change back to admin
UPDATE users 
SET role = 'admin' 
WHERE email = 'your-email@example.com';
```

Then logout, clear cache, and login.

### Issue 4: "Getting 'Unauthorized' error"

**Solution:**
Your role might be set correctly, but you're trying to access admin panel as a user (or vice versa). The middleware is blocking you (this is correct security behavior).

Check your role:
```sql
SELECT role FROM users WHERE email = 'your-email@example.com';
```

---

## Verification Checklist

After changing role, verify everything works:

**✅ Database Check:**
```sql
SELECT email, role FROM users WHERE email = 'your-email@example.com';
```
Should show: `role: user`

**✅ Logout:**
- Click logout button
- Or clear all cookies

**✅ Clear Cache:**
- Chrome: Ctrl+Shift+Delete
- Firefox: Ctrl+Shift+Delete
- Safari: Cmd+Option+E

**✅ Login Test:**
- Login with your credentials
- Should redirect to `/dashboard`
- NOT to `/admin-panel-2024`

**✅ Access Test:**
- Try to visit `/admin-panel-2024` directly
- Should be redirected to `/dashboard` (blocked by middleware)

---

## SQL Command Reference

### Check Single User
```sql
SELECT * FROM users WHERE email = 'your-email@example.com';
```

### Check All Users
```sql
SELECT id, email, role, full_name, created_at 
FROM users 
ORDER BY created_at DESC;
```

### Change to User
```sql
UPDATE users SET role = 'user' WHERE email = 'your-email@example.com';
```

### Change to Admin
```sql
UPDATE users SET role = 'admin' WHERE email = 'your-email@example.com';
```

### Count Users by Role
```sql
SELECT role, COUNT(*) as count 
FROM users 
GROUP BY role;
```

### Find All Admins
```sql
SELECT email, full_name, created_at 
FROM users 
WHERE role = 'admin' 
ORDER BY created_at DESC;
```

### Find All Regular Users
```sql
SELECT email, full_name, created_at 
FROM users 
WHERE role = 'user' 
ORDER BY created_at DESC;
```

---

## Important Notes

### 1. Code is Working Correctly ✅

The auth system, middleware, and role checking are all working as designed. The "problem" is just that your database role is set to 'admin' when you want 'user'.

### 2. Role Determines Access

```
Database Role → System Behavior
---------------------------------
'admin'       → Admin Panel (/admin-panel-2024)
'user'        → User Dashboard (/dashboard)
```

### 3. Security Features

- Middleware checks role on every request
- Auth callback checks role on login
- Database is source of truth for roles
- Cannot bypass role checking (secure!)

### 4. Best Practices

- Use separate accounts for admin and user testing
- Don't frequently switch roles on same account
- Clear cache after role changes
- Document which account has which role

---

## FAQ

**Q: Is this a bug in the code?**  
A: No! The code is working correctly. Your database role is 'admin'.

**Q: Why was my role set to 'admin'?**  
A: You probably ran an SQL command to set it, either for testing or during setup.

**Q: Can I change my role anytime?**  
A: Yes, but you need to logout and clear cache after changing.

**Q: Will my data be lost if I change role?**  
A: No! Only the `role` column changes. All other data (balance, orders, etc.) stays the same.

**Q: How do I test both admin and user features?**  
A: Create two accounts with different emails, one admin and one user.

**Q: Can I have multiple admins?**  
A: Yes! Set multiple users' roles to 'admin' in the database.

**Q: What if I forget which account is admin?**  
A: Run this SQL to see all admins:
```sql
SELECT email, role FROM users WHERE role = 'admin';
```

---

## Hindi Summary (हिंदी में सारांश)

### समस्या:
तुम्हारा database में role 'admin' है, इसलिए admin panel में जा रहे हो।

### समाधान:

**Step 1:** Supabase SQL Editor में ये run करो:
```sql
UPDATE users SET role = 'user' WHERE email = 'your-email@example.com';
```

**Step 2:** Logout करो

**Step 3:** Browser cache clear करो (Ctrl+Shift+Delete)

**Step 4:** फिर से login करो

**Step 5:** अब dashboard में जाओगे! ✅

### समझना:
- Code में कोई problem नहीं है!
- तुम्हारा role database में 'admin' है
- इसलिए admin panel दिख रहा है
- Role 'user' करो तो user dashboard दिखेगा
- यह system सही तरीके से काम कर रहा है! ✅

---

## Need Help?

If you're still having issues after following this guide:

1. Check you're using the correct email in SQL commands
2. Verify the SQL command ran successfully
3. Ensure you cleared cache completely
4. Try in incognito/private window
5. Check browser console for errors (F12)

**Remember:** The system is working correctly! You just need to set your role in the database to match what you want to access.

---

**Status:** Complete guide ready for fixing user role issues! ✅
