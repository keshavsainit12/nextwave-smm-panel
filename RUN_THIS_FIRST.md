# ⚡ RUN THIS FIRST - Database Setup

## 🚨 ERROR: "admin_credentials table not found"

You need to run database migrations!

---

## ✅ 3-STEP SOLUTION

### STEP 1: Open Supabase
1. Go to: **https://supabase.com/dashboard**
2. Select your project
3. Click **"SQL Editor"** (left sidebar)

---

### STEP 2: Run These Scripts (Copy-Paste Each One)

Run in this exact order - copy entire file content and paste into SQL Editor:

#### 1️⃣ Create Tables
**File:** `scripts/001_create_tables.sql`
- Creates all database tables
- Click **"Run"** after pasting

#### 2️⃣ Security Policies  
**File:** `scripts/002_create_rls_policies_v2.sql`
- Sets up data access rules
- Click **"Run"**

#### 3️⃣ Database Functions
**File:** `scripts/003_create_functions.sql`
- Creates helper functions
- Click **"Run"**

#### 4️⃣ Fix User Policies
**File:** `scripts/006_fix_user_rls_policies.sql`
- Updates user access
- Click **"Run"**

#### 5️⃣ User Settings
**File:** `scripts/007_add_user_settings.sql`
- Adds user settings
- Click **"Run"**

#### 6️⃣ VIP Tiers
**File:** `scripts/008_add_tier_columns.sql`
- Adds VIP pricing
- Click **"Run"**

#### 7️⃣ **ADMIN LOGIN** ⭐ (MOST IMPORTANT!)
**File:** `scripts/009_create_admin_credentials.sql`
- **Creates admin_credentials table**
- **Adds default admin user**
- Click **"Run"**

---

### STEP 3: Verify It Worked

Run this query:
```sql
SELECT * FROM admin_credentials;
```

**Success looks like:**
```
username     | email                    
─────────────┼──────────────────────────
admin202502  | admin@nextwavesmm.com   
```

✅ **If you see this, you're done!**

---

## 🔐 Login Now!

Go to: `/admin-login`

```
Username: admin202502
Password: admin@123
```

⚠️ **Change password after first login!**

---

## 🆘 Still Not Working?

### Option A: Run Fix Script
**File:** `scripts/FIX_ADMIN_LOGIN.sql`
- This will create the table if missing
- Or update the password if table exists

### Option B: Manual Creation
Paste this directly into SQL Editor:

```sql
-- Create admin_credentials table
CREATE TABLE IF NOT EXISTS admin_credentials (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  username TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  email TEXT NOT NULL,
  user_id TEXT NOT NULL DEFAULT '00000000-0000-0000-0000-000000000001',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default admin
INSERT INTO admin_credentials (username, password_hash, email, user_id)
VALUES (
  'admin202502',
  '$2b$10$xAZfhfccemWZ.3qSG2Zpz.KJg15724ESXNnREOIwBNhkVXd9OGiVK',
  'admin@nextwavesmm.com',
  '00000000-0000-0000-0000-000000000001'
)
ON CONFLICT (username) DO NOTHING;
```

---

## 📖 Need More Help?

See these files:
- **DATABASE_SETUP.md** - Complete detailed guide
- **HOW_TO_FIX_LOGIN.md** - Troubleshooting login
- **HOW_TO_CHECK_CREDENTIALS.md** - Check admin username

---

## 🎯 Quick Summary

**Hindi/Hinglish:**
```
1. Supabase dashboard kholo
2. SQL Editor me 7 scripts run karo (order me)
3. Verify karo: SELECT * FROM admin_credentials;
4. Login test karo: admin202502 / admin@123

10 minute ka kaam ✅
```

**English:**
```
1. Open Supabase dashboard
2. Run 7 scripts in SQL Editor (in order)
3. Verify: SELECT * FROM admin_credentials;
4. Test login: admin202502 / admin@123

10 minutes work ✅
```

---

**Run the migrations and start using your panel!** 🚀
