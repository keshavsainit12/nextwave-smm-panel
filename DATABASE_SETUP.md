# 🚀 COMPLETE DATABASE SETUP GUIDE

## ⚠️ IMPORTANT: Admin Credentials Table Missing

If you're getting errors about `admin_credentials` table not existing, you need to run the database migrations!

---

## 📋 STEP-BY-STEP GUIDE

### Step 1: Open Supabase Dashboard
1. Go to: **https://supabase.com/dashboard**
2. Select your project
3. Click **"SQL Editor"** in the left sidebar
4. You should see a blank query editor

---

### Step 2: Run Migrations in Order

Run these SQL scripts **ONE BY ONE** in the exact order shown below:

#### Migration 1: Create Tables ✅
**File:** `scripts/001_create_tables.sql`

This creates all basic tables:
- users
- services
- orders
- transactions
- service_categories
- crypto_deposits
- crypto_currencies
- coupons
- activity_logs
- system_settings

**How to run:**
1. Open the file `scripts/001_create_tables.sql`
2. Copy ALL the content
3. Paste into Supabase SQL Editor
4. Click **"Run"** (or press Ctrl+Enter)
5. Wait for success message ✅

---

#### Migration 2: Create RLS Policies ✅
**File:** `scripts/002_create_rls_policies_v2.sql` (use v2, not the old one)

This sets up Row Level Security policies for data access control.

**How to run:**
1. Open `scripts/002_create_rls_policies_v2.sql`
2. Copy ALL content
3. Paste into SQL Editor
4. Click **"Run"**
5. Wait for success ✅

---

#### Migration 3: Create Functions ✅
**File:** `scripts/003_create_functions.sql`

This creates database functions for special operations.

**How to run:**
1. Open `scripts/003_create_functions.sql`
2. Copy ALL content
3. Paste into SQL Editor
4. Click **"Run"**
5. Wait for success ✅

---

#### Migration 4: Fix User Policies ✅
**File:** `scripts/006_fix_user_rls_policies.sql`

Updates user access policies.

**How to run:**
1. Open `scripts/006_fix_user_rls_policies.sql`
2. Copy ALL content
3. Paste into SQL Editor
4. Click **"Run"**
5. Wait for success ✅

---

#### Migration 5: Add User Settings ✅
**File:** `scripts/007_add_user_settings.sql`

Adds user settings columns.

**How to run:**
1. Open `scripts/007_add_user_settings.sql`
2. Copy ALL content
3. Paste into SQL Editor
4. Click **"Run"**
5. Wait for success ✅

---

#### Migration 6: Add Tier Columns ✅
**File:** `scripts/008_add_tier_columns.sql`

Adds VIP tier and pricing columns to users table.

**How to run:**
1. Open `scripts/008_add_tier_columns.sql`
2. Copy ALL content
3. Paste into SQL Editor
4. Click **"Run"**
5. Wait for success ✅

---

#### Migration 7: Create Admin Credentials Table ✅ 
**File:** `scripts/009_create_admin_credentials.sql`

**⭐ THIS IS THE ONE YOU NEED FOR ADMIN LOGIN!**

Creates the `admin_credentials` table and inserts default admin:
- Username: `admin202502`
- Password: `admin@123`

**How to run:**
1. Open `scripts/009_create_admin_credentials.sql`
2. Copy ALL content
3. Paste into SQL Editor
4. Click **"Run"**
5. Wait for success ✅

---

### Step 3: Verify Migrations ✅

After running all migrations, verify they worked:

```sql
-- Check if admin_credentials table exists
SELECT * FROM admin_credentials;
```

**Expected result:**
```
username     | email                    | created_at
─────────────┼──────────────────────────┼────────────
admin202502  | admin@nextwavesmm.com   | 2024-...
```

If you see this, **SUCCESS!** ✅

---

## 🔍 Check All Tables

Run this to see all tables created:

```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;
```

**Expected tables:**
- activity_logs
- admin_credentials ← **This is the important one!**
- coupons
- crypto_currencies
- crypto_deposits
- orders
- service_categories
- services
- system_settings
- transactions
- users

---

## ✅ Quick Verification Checklist

Run these queries to verify everything is set up:

### 1. Check admin_credentials table:
```sql
SELECT COUNT(*) as admin_count FROM admin_credentials;
```
**Expected:** `1` (one admin user)

### 2. Check users table:
```sql
SELECT COUNT(*) as user_count FROM users;
```
**Expected:** `0` or more (depending on if you have users)

### 3. Check services table:
```sql
SELECT COUNT(*) as service_count FROM services;
```
**Expected:** `0` or more (you can add services later)

### 4. Check system_settings:
```sql
SELECT * FROM system_settings;
```
**Expected:** Some default settings

---

## 🆘 Troubleshooting

### Error: "relation already exists"
**Solution:** Table already exists, skip that migration and move to next one.

### Error: "permission denied"
**Solution:** Make sure you're using your project's service role key, not anon key.

### Error: "syntax error"
**Solution:** 
1. Make sure you copied the ENTIRE file content
2. Don't modify the SQL
3. Run the complete script, not partial

### Admin table still not found:
**Solution:**
1. Make sure you ran migration `009_create_admin_credentials.sql`
2. Run verification query: `SELECT * FROM admin_credentials;`
3. If error persists, run `FIX_ADMIN_LOGIN.sql` script

---

## 🔐 Default Admin Credentials

After running all migrations, you can login with:

```
═══════════════════════════════════
      ADMIN LOGIN DETAILS
═══════════════════════════════════
URL:      /admin-login
Username: admin202502
Password: admin@123

⚠️  CHANGE THESE AFTER FIRST LOGIN!
═══════════════════════════════════
```

---

## 📊 Migration Summary

| # | Script | Purpose | Required |
|---|--------|---------|----------|
| 1 | 001_create_tables.sql | Create all tables | ✅ Yes |
| 2 | 002_create_rls_policies_v2.sql | Security policies | ✅ Yes |
| 3 | 003_create_functions.sql | Database functions | ✅ Yes |
| 4 | 006_fix_user_rls_policies.sql | Fix user access | ✅ Yes |
| 5 | 007_add_user_settings.sql | User settings | ✅ Yes |
| 6 | 008_add_tier_columns.sql | VIP tiers | ✅ Yes |
| 7 | 009_create_admin_credentials.sql | **Admin login** | ✅ **MUST RUN** |

---

## 🎯 Quick Start (Minimum Required)

If you just want to get admin login working, run at minimum:

1. **001_create_tables.sql** - Creates tables
2. **009_create_admin_credentials.sql** - Creates admin login

But for full functionality, run ALL migrations in order!

---

## 💡 Additional Scripts (Optional)

### Check Admin Credentials:
**File:** `scripts/CHECK_ADMIN_CREDENTIALS.sql`
- Verify your admin username and password status
- See if using default or custom credentials

### Fix Admin Login:
**File:** `scripts/FIX_ADMIN_LOGIN.sql`
- Reset admin password to default
- Use if you can't login

---

## 🔄 What to Do After Setup

1. ✅ Run all migrations (steps above)
2. ✅ Verify tables exist
3. ✅ Test admin login: `/admin-login`
4. ✅ Login with: `admin202502` / `admin@123`
5. ✅ Change password in Settings > Account
6. ✅ Add services, configure system settings
7. ✅ Start using your SMM panel!

---

## 📝 Summary

**Hindi/Hinglish:**
```
Problem:
❌ Supabase me admin_credentials table nahi hai
❌ Login kaam nahi kar raha

Solution:
✅ Supabase dashboard kholo
✅ SQL Editor me jao
✅ Migrations run karo order me (1 se 7 tak)
✅ Especially 009_create_admin_credentials.sql zaroori hai
✅ Verification queries run karo
✅ Admin login test karo

Bas 10-15 minute ka kaam hai! 🚀
```

**English:**
```
Problem:
❌ No admin_credentials table in Supabase
❌ Login not working

Solution:
✅ Open Supabase dashboard
✅ Go to SQL Editor
✅ Run migrations in order (1 to 7)
✅ Especially 009_create_admin_credentials.sql is critical
✅ Run verification queries
✅ Test admin login

Takes just 10-15 minutes! 🚀
```

---

## 🎊 Done!

After running all migrations:
- ✅ All tables created
- ✅ Admin credentials table exists
- ✅ Default admin user created
- ✅ Can login to admin panel
- ✅ System ready to use!

**Next step:** Login and start configuring your SMM panel! 🎉
