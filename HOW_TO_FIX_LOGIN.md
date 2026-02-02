# 🔧 FIX ADMIN LOGIN - STEP BY STEP GUIDE

## ❌ Problem: Getting "Invalid Credentials" Error

If you're seeing "invalid credentials" when trying to login to the admin panel, follow these steps to fix it.

---

## ✅ SOLUTION - Run This SQL Script

### Step 1: Open Supabase Dashboard
1. Go to your Supabase project: https://supabase.com/dashboard
2. Click on your project
3. Click on **SQL Editor** in the left sidebar

### Step 2: Run the Fix Script
1. Click **"New Query"** button
2. Copy and paste the entire contents of this file:
   ```
   scripts/FIX_ADMIN_LOGIN.sql
   ```
3. Click **"Run"** button (or press Ctrl+Enter)

### Step 3: Check the Results
You should see output like this:
```
NOTICE: ✅ Admin password updated successfully
NOTICE: 
NOTICE: ===========================================
NOTICE: ✅ FIX COMPLETE - You can now login with:
NOTICE: ===========================================
NOTICE: Username: admin202502
NOTICE: Password: admin@123
NOTICE: 
NOTICE: ⚠️  IMPORTANT: Change your password after login!
```

### Step 4: Test Login
1. Go to your admin panel login page: `/admin-login`
2. Enter:
   - **Username:** `admin202502`
   - **Password:** `admin@123`
3. Click "Login"
4. ✅ **Should work now!**

---

## 🔐 Your Admin Credentials

```
URL: /admin-login
Username: admin202502
Password: admin@123
```

**⚠️ IMPORTANT:** Change these credentials immediately after first login!

---

## 🛡️ Change Your Password (After First Login)

1. Login with the default credentials above
2. Click **Settings** in the admin panel
3. Go to **Account** tab
4. Enter your current password: `admin@123`
5. Enter a new secure password
6. Click **"Change Password"**
7. ✅ Done! Use your new password from now on

---

## 🔍 What Does the Fix Script Do?

The script:
1. ✅ Checks if the `admin_credentials` table exists
2. ✅ Updates the password hash to the correct bcrypt hash
3. ✅ If no admin user exists, creates one
4. ✅ Shows confirmation message
5. ✅ Displays the admin credentials for verification

---

## 💡 Alternative: Manual SQL Command

If you prefer, you can run just this simple UPDATE command:

```sql
-- Update admin password to: admin@123
UPDATE admin_credentials 
SET password_hash = '$2b$10$xAZfhfccemWZ.3qSG2Zpz.KJg15724ESXNnREOIwBNhkVXd9OGiVK',
    updated_at = NOW()
WHERE username = 'admin202502';
```

Then verify it worked:
```sql
SELECT username, email FROM admin_credentials;
```

---

## 🆘 Still Not Working?

### Check 1: Does the table exist?
```sql
SELECT * FROM admin_credentials;
```

**If you get "relation does not exist" error:**
- Run the migration first: `scripts/009_create_admin_credentials.sql`

### Check 2: Is there an admin record?
```sql
SELECT username, email FROM admin_credentials WHERE username = 'admin202502';
```

**If no rows returned:**
- The admin user doesn't exist
- Run the fix script - it will create the user

### Check 3: Check the password hash
```sql
SELECT 
    username, 
    substring(password_hash, 1, 10) as hash_prefix,
    length(password_hash) as hash_length
FROM admin_credentials 
WHERE username = 'admin202502';
```

**Expected values:**
- `hash_prefix`: `$2b$10$xAZ`
- `hash_length`: `60`

**If values are different:**
- The hash is wrong
- Run the fix script to update it

---

## 🔐 Security Notes

### Why "admin@123"?
This is the **default** password for initial setup. You MUST change it after first login.

### How to Create a Strong Password:
- Minimum 12 characters
- Mix of uppercase, lowercase, numbers, symbols
- Don't use dictionary words
- Don't reuse passwords from other sites

### Example Strong Passwords:
- `M7$kPqR2@nL9vXz`
- `Tr8!bNm4#yK6wQp`
- `Zx9@vCn3$pWm7Lq`

---

## 📋 Quick Checklist

- [ ] Opened Supabase dashboard
- [ ] Went to SQL Editor
- [ ] Copied and ran `FIX_ADMIN_LOGIN.sql`
- [ ] Saw success message
- [ ] Tested login with `admin202502` / `admin@123`
- [ ] Login successful ✅
- [ ] Changed password in Settings > Account
- [ ] Tested login with new password
- [ ] All working! 🎉

---

## 📞 Need More Help?

If you're still having issues:

1. **Check Supabase logs:**
   - Go to Supabase Dashboard > Logs
   - Look for errors related to `admin_credentials`

2. **Verify RLS policies:**
   ```sql
   SELECT * FROM pg_policies WHERE tablename = 'admin_credentials';
   ```
   Should show a policy allowing service role access

3. **Check environment variables:**
   - `NEXT_PUBLIC_SUPABASE_URL` set correctly?
   - `SUPABASE_SERVICE_ROLE_KEY` set correctly?

4. **Check browser console:**
   - Open developer tools (F12)
   - Look for any JavaScript errors on login

---

## 🎯 Summary

**Problem:** Invalid credentials error  
**Cause:** Wrong password hash in database  
**Fix:** Run `FIX_ADMIN_LOGIN.sql` script  
**Result:** Login works with `admin202502` / `admin@123`  
**Action:** Change password after first login  

**That's it!** 🚀
