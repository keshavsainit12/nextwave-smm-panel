# User Role Management SQL Guide

## Quick Summary

**Purpose:** Manage user roles and delete accounts in Supabase database

**User Request:** "keshavtanwar835@gmail.com ko user banao ya delete karo"

---

## Quick Fix SQL (Copy-Paste)

### Option 1: Fix Roles (Recommended) ✅

```sql
-- Make keshavtanwar835@gmail.com a USER
UPDATE users 
SET role = 'user' 
WHERE email = 'keshavtanwar835@gmail.com';

-- Make nextwavedigitalsolutions1@gmail.com an ADMIN
UPDATE users 
SET role = 'admin' 
WHERE email = 'nextwavedigitalsolutions1@gmail.com';

-- Verify both accounts have correct roles
SELECT email, role, created_at 
FROM users 
WHERE email IN ('keshavtanwar835@gmail.com', 'nextwavedigitalsolutions1@gmail.com')
ORDER BY email;
```

**Expected Result:**
```
email                                | role  | created_at
-------------------------------------+-------+-------------------------
keshavtanwar835@gmail.com           | user  | 2024-...
nextwavedigitalsolutions1@gmail.com | admin | 2024-...
```

---

### Option 2: Delete keshavtanwar835@gmail.com ⚠️

```sql
-- WARNING: This permanently deletes the account!
-- Cannot be undone!
DELETE FROM users 
WHERE email = 'keshavtanwar835@gmail.com';

-- Verify account is deleted
SELECT email, role FROM users 
WHERE email = 'keshavtanwar835@gmail.com';
-- Should return: 0 rows (empty result)
```

**⚠️ WARNING:** This is permanent! The account and all associated data will be deleted!

---

## Detailed Instructions

### Option 1: Fix Roles (Keep Both Accounts)

**When to use:** You want to keep both accounts but ensure correct roles

**Benefits:**
- Can test user features with keshavtanwar835@gmail.com
- Can access admin panel with nextwavedigitalsolutions1@gmail.com
- No data loss
- Flexible for testing

**Steps:**

1. **Open Supabase Dashboard**
   - Go to your Supabase project
   - Click "SQL Editor" in left sidebar

2. **Run the Role Update SQL**
   ```sql
   UPDATE users SET role = 'user' WHERE email = 'keshavtanwar835@gmail.com';
   UPDATE users SET role = 'admin' WHERE email = 'nextwavedigitalsolutions1@gmail.com';
   ```

3. **Verify the Changes**
   ```sql
   SELECT email, role FROM users 
   WHERE email IN ('keshavtanwar835@gmail.com', 'nextwavedigitalsolutions1@gmail.com');
   ```

4. **Test Login**
   - Logout from current session
   - Clear browser cache (Ctrl+Shift+Delete)
   - Login with keshavtanwar835@gmail.com → Should go to /dashboard
   - Login with nextwavedigitalsolutions1@gmail.com → Should go to /admin-panel-2024

---

### Option 2: Delete Account

**When to use:** You don't need keshavtanwar835@gmail.com anymore

**Consequences:**
- Account permanently deleted
- Cannot login with this email anymore
- All associated data removed
- Cannot be undone!

**Steps:**

1. **⚠️ Confirm You Want to Delete**
   - Are you sure?
   - This is permanent!
   - Cannot recover the account!

2. **Run Delete SQL**
   ```sql
   DELETE FROM users WHERE email = 'keshavtanwar835@gmail.com';
   ```

3. **Verify Deletion**
   ```sql
   SELECT * FROM users WHERE email = 'keshavtanwar835@gmail.com';
   -- Should return: 0 rows
   ```

4. **Test**
   - Try to login with keshavtanwar835@gmail.com
   - Should fail (account doesn't exist)
   - Login with nextwavedigitalsolutions1@gmail.com
   - Should work and go to admin panel

---

## Verification SQL Commands

### Check All Admins
```sql
SELECT email, role, created_at 
FROM users 
WHERE role = 'admin'
ORDER BY created_at DESC;
```

### Check All Users
```sql
SELECT email, role, created_at 
FROM users 
WHERE role = 'user'
ORDER BY created_at DESC;
```

### Check Specific Account
```sql
SELECT email, role, created_at 
FROM users 
WHERE email = 'keshavtanwar835@gmail.com';
```

### Check Both Accounts
```sql
SELECT email, role, created_at 
FROM users 
WHERE email IN ('keshavtanwar835@gmail.com', 'nextwavedigitalsolutions1@gmail.com')
ORDER BY email;
```

### Count Users by Role
```sql
SELECT role, COUNT(*) as count 
FROM users 
GROUP BY role;
```

---

## After Running SQL

### Testing Checklist

**For keshavtanwar835@gmail.com (USER):**
- [ ] Logout completely
- [ ] Clear browser cache
- [ ] Login with keshavtanwar835@gmail.com
- [ ] Should redirect to `/dashboard`
- [ ] Try to access `/admin-panel-2024`
- [ ] Should be blocked and redirected back to `/dashboard`
- [ ] User features work correctly

**For nextwavedigitalsolutions1@gmail.com (ADMIN):**
- [ ] Logout completely
- [ ] Clear browser cache
- [ ] Login with nextwavedigitalsolutions1@gmail.com
- [ ] Should redirect to `/admin-panel-2024`
- [ ] Admin panel features accessible
- [ ] Can access all admin functions
- [ ] Account section shows nextwavedigitalsolutions1@gmail.com

---

## Troubleshooting

### Issue: Can't Login with Admin Account

**Symptoms:**
- Login with nextwavedigitalsolutions1@gmail.com fails
- Or redirects to wrong dashboard

**Solution:**
```sql
-- Check role
SELECT email, role FROM users WHERE email = 'nextwavedigitalsolutions1@gmail.com';

-- If role is NOT 'admin', fix it:
UPDATE users SET role = 'admin' WHERE email = 'nextwavedigitalsolutions1@gmail.com';
```

### Issue: Still Seeing keshavtanwar Email in Account Section

**Cause:** You're logged in with keshavtanwar835@gmail.com

**Solution:**
- Logout
- Login with nextwavedigitalsolutions1@gmail.com
- Account section is personal - shows YOUR email

### Issue: Role Not Changing

**Possible Causes:**
1. SQL didn't execute properly
2. Wrong email in WHERE clause
3. Case sensitivity issue

**Solution:**
```sql
-- Check if account exists
SELECT email, role FROM users WHERE email = 'keshavtanwar835@gmail.com';

-- If exists, force update
UPDATE users SET role = 'user' WHERE email = 'keshavtanwar835@gmail.com';

-- Verify again
SELECT email, role FROM users WHERE email = 'keshavtanwar835@gmail.com';
```

### Issue: Delete Didn't Work

**Check if account still exists:**
```sql
SELECT * FROM users WHERE email = 'keshavtanwar835@gmail.com';
```

**If still exists, try again:**
```sql
DELETE FROM users WHERE email = 'keshavtanwar835@gmail.com';
```

**If still failing, check for foreign key constraints:**
```sql
-- May need to delete related data first
-- (Depends on your database schema)
```

---

## Recommendations

### Best Practice: Keep Both Accounts ✅

**Why?**
- Separate accounts for admin and user testing
- No confusion about which email to use
- Can test both user and admin features
- Professional separation

**Setup:**
- keshavtanwar835@gmail.com → USER (testing, personal use)
- nextwavedigitalsolutions1@gmail.com → ADMIN (admin panel access)

**Result:**
- Clear separation
- Easy testing
- No confusion
- Professional

### When to Delete

**Delete keshavtanwar835@gmail.com if:**
- You don't need this account anymore
- It was created by mistake
- You want to clean up unused accounts
- You're absolutely sure you won't need it

**Don't delete if:**
- You might need it later
- It has important data
- You're not 100% sure
- You want to test user features

---

## Quick Reference Table

| Action | SQL Command | Time | Reversible |
|--------|-------------|------|------------|
| Make USER | `UPDATE users SET role = 'user' WHERE email = '...'` | 1 sec | Yes |
| Make ADMIN | `UPDATE users SET role = 'admin' WHERE email = '...'` | 1 sec | Yes |
| Delete Account | `DELETE FROM users WHERE email = '...'` | 1 sec | **NO** ⚠️ |
| Check Role | `SELECT email, role FROM users WHERE email = '...'` | 1 sec | N/A |
| Check All Users | `SELECT email, role FROM users` | 1 sec | N/A |

---

## Hindi Guide / हिंदी गाइड

### समस्या:
"keshavtanwar835@gmail.com को user बनाना है या delete करना है"

### Option 1: दोनों accounts रखो (Recommended) ✅

**SQL Commands:**
```sql
-- keshavtanwar को USER बनाओ
UPDATE users SET role = 'user' WHERE email = 'keshavtanwar835@gmail.com';

-- nextwavedigital को ADMIN बनाओ
UPDATE users SET role = 'admin' WHERE email = 'nextwavedigitalsolutions1@gmail.com';

-- Check करो
SELECT email, role FROM users 
WHERE email IN ('keshavtanwar835@gmail.com', 'nextwavedigitalsolutions1@gmail.com');
```

**Result:**
- keshavtanwar835@gmail.com → user ✅
- nextwavedigitalsolutions1@gmail.com → admin ✅

### Option 2: keshavtanwar को delete करो ⚠️

**SQL Command:**
```sql
-- WARNING: Permanent delete!
DELETE FROM users WHERE email = 'keshavtanwar835@gmail.com';
```

**⚠️ Warning:** Yeh permanent hai! Undo nahi ho sakta!

### Testing:

**After SQL:**
1. Logout करो
2. Cache clear करो (Ctrl+Shift+Delete)
3. keshavtanwar835@gmail.com से login → Dashboard
4. nextwavedigitalsolutions1@gmail.com से login → Admin Panel

### Recommendation:

**Best:** Dono accounts rakho!
- keshavtanwar → user (testing)
- nextwavedigital → admin (admin work)

**Delete only if:** 100% sure nahi chahiye!

---

## Summary

**User Request:** Fix or remove keshavtanwar835@gmail.com

**Provided:**
- ✅ SQL to make it USER
- ✅ SQL to make nextwavedigital ADMIN
- ✅ SQL to DELETE keshavtanwar (if needed)
- ✅ SQL to VERIFY all changes
- ✅ Testing procedures
- ✅ Troubleshooting guide
- ✅ Recommendations

**Recommendation:** Keep both, fix roles (Option 1) ✅

**Status:** Complete SQL guide ready to use!

---

## Support

If you need help:
1. Check the verification SQL commands
2. Review troubleshooting section
3. Ensure SQL executed successfully
4. Test with clear cache
5. Verify database shows correct roles

**Remember:** Account section shows YOUR email (whoever is logged in), not a generic "admin email"!
