# 🔍 CHECK ADMIN USERNAME & PASSWORD

## ✅ Quick Answer

Run this SQL in Supabase to see your admin username:

```sql
SELECT username, email FROM admin_credentials;
```

---

## 📋 What You'll See:

```
username     | email
─────────────┼──────────────────────────
admin202502  | admin@nextwavesmm.com
```

**Your username is:** `admin202502` (unless you changed it)

---

## 🔐 About the Password

**⚠️ IMPORTANT:** You CANNOT see the actual password in the database!

The password is stored as a **bcrypt hash** (encrypted). It looks like this:
```
$2b$10$xAZfhfccemWZ.3qSG2Zpz.KJg15724ESXNnREOIwBNhkVXd9OGiVK
```

### Check if it's the default password:

```sql
SELECT 
    username,
    CASE 
        WHEN password_hash = '$2b$10$xAZfhfccemWZ.3qSG2Zpz.KJg15724ESXNnREOIwBNhkVXd9OGiVK' 
        THEN '✅ Default password: admin@123'
        ELSE '⚠️  Custom password (changed by admin)'
    END as password_status
FROM admin_credentials;
```

---

## 🎯 Quick Reference

### Default Admin Credentials:
```
Username: admin202502
Password: admin@123
```

### If Password is Default Hash:
- Password is: **`admin@123`**
- You should change it immediately!

### If Password is Different Hash:
- Password has been changed
- You cannot see what it is
- To reset: Run `FIX_ADMIN_LOGIN.sql`

---

## 📊 See All Admin Info:

```sql
-- Simple view
SELECT 
    username, 
    email, 
    created_at, 
    updated_at 
FROM admin_credentials;

-- With password hash
SELECT * FROM admin_credentials;
```

---

## 🔄 Reset Password to Default:

If you forgot the password, reset it to **admin@123**:

```sql
UPDATE admin_credentials 
SET password_hash = '$2b$10$xAZfhfccemWZ.3qSG2Zpz.KJg15724ESXNnREOIwBNhkVXd9OGiVK',
    updated_at = NOW()
WHERE username = 'admin202502';
```

Then login with: `admin202502` / `admin@123`

---

## 📝 Summary

**Hindi/Hinglish:**
```
SQL Query:
SELECT username, email FROM admin_credentials;

Result:
- Username dikhega: admin202502
- Password nahi dikhega (encrypted hai)

Default Password:
- Agar kisi ne change nahi kiya to: admin@123
- Agar change kiya hai to: reset karna padega

Password Reset:
FIX_ADMIN_LOGIN.sql file run karo
```

**English:**
```
SQL Query:
SELECT username, email FROM admin_credentials;

Result:
- Shows username: admin202502
- Can't show password (it's encrypted)

Default Password:
- If not changed: admin@123
- If changed: must reset

Password Reset:
Run FIX_ADMIN_LOGIN.sql file
```

---

## ✅ That's It!

The username is stored as plain text, so you can see it.  
The password is encrypted, so you can only verify if it matches a known value.

**Default credentials:** `admin202502` / `admin@123`
