# 🚀 Direct SQL - Admin Setup (Copy & Paste Ready)

## ⚡ COMPLETE ADMIN SETUP - Run This SQL

**Just copy everything below and paste in Supabase SQL Editor!**

```sql
-- ========================================
-- COMPLETE ADMIN SETUP (Linked to Users)
-- ========================================
-- This creates admin in both systems:
-- 1. users table (main system)
-- 2. admin_credentials table (admin panel login)
-- Both are linked with foreign key!
-- ✅ Works even if no tables exist yet!

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Step 1: Create users table (if doesn't exist)
-- This creates the main users table
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT NOT NULL UNIQUE,
  full_name TEXT,
  role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin', 'reseller')),
  balance DECIMAL DEFAULT 0 CHECK (balance >= 0),
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'banned', 'suspended')),
  api_key TEXT UNIQUE,
  referral_code TEXT UNIQUE,
  referred_by UUID REFERENCES users(id),
  total_orders INTEGER DEFAULT 0,
  total_spent DECIMAL DEFAULT 0,
  tier INTEGER DEFAULT 1,
  price_multiplier DECIMAL DEFAULT 3.0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);

-- Step 2: Create admin user in users table
-- This makes admin a real user in the system
INSERT INTO users (
  id,
  email,
  full_name,
  role,
  balance,
  status,
  tier,
  price_multiplier,
  created_at,
  updated_at
) VALUES (
  '550e8400-e29b-41d4-a716-446655440000'::uuid,
  'admin@nextwavesmm.com',
  'Admin User',
  'admin',
  10000.00,
  'active',
  4,
  2.8,
  NOW(),
  NOW()
) ON CONFLICT (email) DO UPDATE SET
  role = 'admin',
  full_name = 'Admin User',
  tier = 4,
  price_multiplier = 2.8,
  updated_at = NOW();

-- Step 3: Create admin_credentials table (if doesn't exist)
-- This table stores admin panel login credentials
CREATE TABLE IF NOT EXISTS admin_credentials (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  username TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  email TEXT NOT NULL,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_admin_credentials_username ON admin_credentials(username);
CREATE INDEX IF NOT EXISTS idx_admin_credentials_user_id ON admin_credentials(user_id);

-- Step 4: Insert/Update admin credentials (linked to user)
-- Password: admin@123 (bcrypt hashed)
INSERT INTO admin_credentials (
  username,
  password_hash,
  email,
  user_id
) VALUES (
  'admin202502',
  '$2b$10$xAZfhfccemWZ.3qSG2Zpz.KJg15724ESXNnREOIwBNhkVXd9OGiVK',
  'admin@nextwavesmm.com',
  '550e8400-e29b-41d4-a716-446655440000'::uuid
) ON CONFLICT (username) DO UPDATE SET
  password_hash = EXCLUDED.password_hash,
  email = EXCLUDED.email,
  user_id = EXCLUDED.user_id,
  updated_at = NOW();

-- ========================================
-- VERIFICATION QUERIES
-- ========================================

-- Check admin user in users table
SELECT 
  '✅ ADMIN USER' as check_type,
  id,
  email,
  role,
  balance,
  status
FROM users 
WHERE email = 'admin@nextwavesmm.com';

-- Check admin credentials
SELECT 
  '✅ ADMIN CREDENTIALS' as check_type,
  username,
  email,
  user_id
FROM admin_credentials
WHERE username = 'admin202502';

-- Check foreign key link (JOIN)
SELECT 
  '✅ LINKED ADMIN' as check_type,
  ac.username as admin_username,
  ac.email as admin_email,
  u.id as user_id,
  u.role as user_role,
  u.balance as user_balance,
  'Admin can access both panels!' as note
FROM admin_credentials ac
JOIN users u ON ac.user_id = u.id
WHERE ac.username = 'admin202502';

-- Success message
SELECT 
  '═══════════════════════════════════════' as line1,
  '✅ ADMIN SETUP COMPLETE!' as status,
  '═══════════════════════════════════════' as line2,
  'Admin Panel Login:' as panel,
  '  URL: /admin-login' as url,
  '  Username: admin202502' as username,
  '  Password: admin@123' as password,
  '═══════════════════════════════════════' as line3,
  'User Dashboard Login:' as dashboard,
  '  URL: /auth/login' as dashboard_url,
  '  Email: admin@nextwavesmm.com' as email,
  '  (Set password in Supabase Auth)' as auth_note,
  '═══════════════════════════════════════' as line4,
  '⚠️  CHANGE PASSWORD AFTER FIRST LOGIN!' as warning,
  'Go to: Settings > Account' as action,
  '═══════════════════════════════════════' as line5;
```

---

## 🔐 Login Credentials

### Admin Panel:
```
URL:      /admin-login
Username: admin202502
Password: admin@123
```

### User Dashboard (Optional):
```
URL:   /auth/login
Email: admin@nextwavesmm.com
(Set password in Supabase Auth if needed)
```

---

## ✅ What This Does:

1. **Creates admin in users table**
   - Real user in the system
   - Role: admin
   - Balance: $10,000
   - Status: active

2. **Creates admin_credentials table**
   - Stores login credentials
   - Bcrypt password hashing
   - Foreign key to users table

3. **Links them together**
   - admin_credentials.user_id → users.id
   - Single admin account
   - Access both panels

4. **Verifies setup**
   - Shows admin user info
   - Shows credentials
   - Shows link between them

---

## 🎯 After Running:

✅ Admin exists in users table  
✅ Admin credentials stored securely  
✅ Both tables linked with FK  
✅ Can login to admin panel  
✅ Can access user dashboard  
✅ Single unified admin account  

---

## 🔍 Quick Checks:

### Is admin in users table?
```sql
SELECT * FROM users WHERE email = 'admin@nextwavesmm.com';
```

### Is admin credentials created?
```sql
SELECT * FROM admin_credentials WHERE username = 'admin202502';
```

### Are they linked?
```sql
SELECT ac.username, u.email, u.role, u.balance
FROM admin_credentials ac
JOIN users u ON ac.user_id = u.id;
```

---

## ⚠️ Important Notes:

- **Password is hashed:** You won't see "admin@123" in database, it's bcrypt hashed
- **User ID is fixed:** `550e8400-e29b-41d4-a716-446655440000` (consistent across both tables)
- **Foreign key enforced:** Can't delete user without deleting credentials (CASCADE)
- **Change password:** After first login, go to Settings > Account

---

## 🎊 Done!

Admin is now properly set up and linked to the user system!

**Time taken:** 30 seconds  
**Status:** ✅ Complete  
**Next step:** Login and change password!
