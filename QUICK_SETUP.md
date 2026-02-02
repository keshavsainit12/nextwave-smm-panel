# 🚀 QUICK SETUP - Fix "table doesn't exist" Error

## ⚠️ You Got This Error:
```
Error running SQL query
Failed to run sql query: ERROR: 42P01: relation "admin_credentials" does not exist
```

## ✅ Here's How to Fix It (2 Minutes):

### Step 1: Open Supabase
1. Go to https://supabase.com/dashboard
2. Select your project
3. Click **SQL Editor** (left sidebar)
4. Click **New Query** button

### Step 2: Copy the SQL
1. Open this file: **`scripts/SETUP_ADMIN_COMPLETE.sql`**
2. Select ALL the text (Ctrl+A or Cmd+A)
3. Copy it (Ctrl+C or Cmd+C)

### Step 3: Paste and Run
1. Paste into Supabase SQL Editor (Ctrl+V or Cmd+V)
2. Click the green **Run** button
3. Wait 2 seconds

### Step 4: Success! 🎉
You'll see messages like:
```
✅ Admin credentials table created/verified
✅ Admin user created/updated successfully
✅ SETUP COMPLETE
```

### Step 5: Login
1. Go to your site: `/admin-login`
2. Enter:
   - **Username:** `admin202502`
   - **Password:** `admin@123`
3. Click Login
4. ✅ It works!

### Step 6: Change Password (Important!)
1. After login, go to **Settings > Account**
2. Change your password to something secure
3. Done!

---

## 📋 What This Does:

The SQL script:
- ✅ Creates the `admin_credentials` table
- ✅ Adds the admin user with correct password
- ✅ Safe to run multiple times
- ✅ No errors!

---

## 🔐 Default Login Credentials:

```
Username: admin202502
Password: admin@123
```

**⚠️ IMPORTANT:** Change these after first login!

---

## 🆘 Still Having Issues?

### Can't find the SQL file?
- File location: `scripts/SETUP_ADMIN_COMPLETE.sql`
- In the root of your repository

### SQL Editor not working?
Make sure you:
- Are logged into Supabase
- Have selected the correct project
- Have proper permissions

### Login still not working?
After running the SQL:
1. Refresh your browser
2. Clear cache (Ctrl+Shift+R or Cmd+Shift+R)
3. Try login again

---

## ✨ That's It!

Total time: **2 minutes**

You should now be able to login to your admin panel! 🎊
