# 🔐 Fix Invalid Credentials Error

## Problem
Getting "invalid credentials" error when trying to login to admin panel.

---

## 🎯 Quick Fix (Works 99% of Time)

### Method 1: Use SQL_DIRECT.md (Easiest)

1. **Open** `SQL_DIRECT.md` in root folder
2. **Copy** entire SQL block
3. **Go to** Supabase Dashboard → SQL Editor
4. **Paste** and click "Run"
5. **Login** with:
   ```
   Username: admin202502
   Password: admin@123
   ```

**Done!** This creates the table and admin user with correct credentials.

---

## 🔍 Diagnostic Steps

### Step 1: Check if Table Exists

Run this SQL in Supabase:
```sql
SELECT EXISTS (
  SELECT FROM information_schema.tables 
  WHERE table_name = 'admin_credentials'
) as table_exists;
```

**Result:**
- `true` → Table exists, go to Step 2
- `false` → **Table doesn't exist! Run SQL_DIRECT.md**

### Step 2: Check if Admin User Exists

```sql
SELECT username, email 
FROM admin_credentials 
WHERE username = 'admin202502';
```

**Result:**
- Shows admin202502 → Admin exists, go to Step 3
- Empty → **Admin doesn't exist! Run SQL_DIRECT.md**

### Step 3: Verify Password Hash

```sql
SELECT 
  username,
  CASE 
    WHEN password_hash = '$2b$10$xAZfhfccemWZ.3qSG2Zpz.KJg15724ESXNnREOIwBNhkVXd9OGiVK'
    THEN '✅ Correct - password is: admin@123'
    ELSE '❌ Wrong hash - password has been changed or is incorrect'
  END as password_status
FROM admin_credentials
WHERE username = 'admin202502';
```

**Result:**
- ✅ Correct → Password hash is right, check if you're entering correct credentials
- ❌ Wrong → **Hash is wrong! Run SETUP_ADMIN_COMPLETE.sql to reset**

---

## 🔧 Fix Methods

### Method 1: Complete Setup (Recommended)

**File:** `SQL_DIRECT.md` (root folder) or `scripts/SETUP_ADMIN_COMPLETE.sql`

**What it does:**
- Creates `admin_credentials` table if doesn't exist
- Creates admin user in `users` table
- Links them together
- Sets correct password hash
- Safe to run multiple times

**How to use:**
1. Open file
2. Copy ALL content
3. Paste in Supabase SQL Editor
4. Run
5. Login: `admin202502` / `admin@123`

### Method 2: Reset Password Only

If table exists but password is wrong:

```sql
UPDATE admin_credentials 
SET 
  password_hash = '$2b$10$xAZfhfccemWZ.3qSG2Zpz.KJg15724ESXNnREOIwBNhkVXd9OGiVK',
  updated_at = NOW()
WHERE username = 'admin202502';

-- Verify
SELECT username, email FROM admin_credentials;
```

Then login with: `admin202502` / `admin@123`

### Method 3: Start Fresh

If everything is messed up:

```sql
-- Delete table
DROP TABLE IF EXISTS admin_credentials CASCADE;

-- Then run SQL_DIRECT.md or SETUP_ADMIN_COMPLETE.sql
```

---

## ✅ Correct Credentials

**These are the ONLY credentials that work by default:**

```
═══════════════════════════════════════
      ADMIN LOGIN CREDENTIALS
═══════════════════════════════════════
URL:      /admin-login
Username: admin202502
Password: admin@123

⚠️  EXACTLY as shown above!
⚠️  Case sensitive!
⚠️  No extra spaces!
═══════════════════════════════════════
```

---

## ❌ Common Mistakes

### 1. Wrong Credentials
- ❌ Using email instead of username
- ❌ Using different password
- ❌ Typos in username/password
- ✅ Use EXACTLY: `admin202502` / `admin@123`

### 2. Table Doesn't Exist
- ❌ Haven't run setup SQL
- ❌ SQL failed but didn't notice
- ✅ Run SQL_DIRECT.md completely

### 3. Wrong Password Hash
- ❌ Changed password in database manually
- ❌ Ran wrong migration script
- ✅ Reset with SETUP_ADMIN_COMPLETE.sql

### 4. Browser Issues
- ❌ Old cookies cached
- ❌ Browser cache issues
- ✅ Clear cookies/cache or use incognito

---

## 🆘 Still Not Working?

### 1. Run TEST_LOGIN.sql

File: `scripts/TEST_LOGIN.sql`

This script will:
- Check if table exists
- Check if admin exists
- Verify password hash
- Tell you exactly what's wrong
- Suggest specific fix

### 2. Check Browser Console

1. Press `F12` (Developer Tools)
2. Go to "Console" tab
3. Try to login
4. Look for error messages
5. Share error if asking for help

### 3. Verify Database Connection

```sql
SELECT NOW() as current_time;
```

If this doesn't work, your Supabase connection is broken.

### 4. Check Supabase Logs

1. Go to Supabase Dashboard
2. Click "Logs" in sidebar
3. Look for errors when you try to login
4. See what's failing

---

## 📋 Verification Checklist

Before asking for help, confirm:

- [ ] Ran SQL_DIRECT.md or SETUP_ADMIN_COMPLETE.sql
- [ ] Verified table exists: `SELECT * FROM admin_credentials;`
- [ ] Verified admin exists: `SELECT * FROM admin_credentials WHERE username = 'admin202502';`
- [ ] Verified password hash is correct (use Step 3 query above)
- [ ] Using exact credentials: `admin202502` / `admin@123`
- [ ] No typos, extra spaces, or wrong case
- [ ] Cleared browser cache/cookies
- [ ] Tried incognito/private mode
- [ ] Checked browser console for errors (F12)
- [ ] Verified Supabase is running: `SELECT NOW();`

---

## 🎊 Success!

After fixing, you should:

1. **Login** successfully with `admin202502` / `admin@123`
2. **See** admin panel dashboard
3. **Go to** Settings > Account
4. **Change** your password to something secure
5. **Change** your username if desired

---

## 📚 Related Files

- `SQL_DIRECT.md` - Complete setup SQL
- `scripts/SETUP_ADMIN_COMPLETE.sql` - Setup script
- `scripts/TEST_LOGIN.sql` - Diagnostic tool
- `QUICK_SETUP.md` - Quick setup guide
- `README_HINDI.md` - Hindi guide
- `HOW_TO_FIX_LOGIN.md` - Login troubleshooting
- `ADMIN_CREDENTIALS.md` - Credentials reference

---

## Summary (Hindi/Hinglish)

**Problem:** Invalid credentials error aa raha hai

**Quick Fix:**
1. `SQL_DIRECT.md` kholo (root folder me)
2. Pura SQL copy karo
3. Supabase SQL Editor me paste karo
4. Run karo
5. Login karo: `admin202502` / `admin@123`

**Agar fir bhi nahi chala:**
1. `TEST_LOGIN.sql` run karo (scripts folder me)
2. Dekhlo kya problem hai
3. Suggested fix apply karo
4. Dobara try karo

**Common Issues:**
- Table hi nahi hai → SQL_DIRECT.md run karo
- Password hash galat hai → SETUP_ADMIN_COMPLETE.sql run karo
- Galat username/password type kar rahe ho → `admin202502` / `admin@123` use karo (exactly!)

**Success Rate:** 99% issues fix ho jate hain SQL_DIRECT.md se! ✅

---

**Need more help? Check other .md files in root folder or scripts/ folder!**
