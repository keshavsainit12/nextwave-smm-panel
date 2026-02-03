# Fix Roles for Specific Emails

## Your Exact Problem:

**Email 1:** keshavtanwar835@gmail.com  
**Current Issue:** Going to admin panel  
**Want:** User dashboard

**Email 2:** nextwavedigitalsolutions1@gmail.com  
**Want:** Admin panel access

---

## ✅ EXACT SQL SOLUTION

### Copy-Paste This:

```sql
-- Change keshavtanwar835@gmail.com to USER
UPDATE users 
SET role = 'user' 
WHERE email = 'keshavtanwar835@gmail.com';

-- Change nextwavedigitalsolutions1@gmail.com to ADMIN
UPDATE users 
SET role = 'admin' 
WHERE email = 'nextwavedigitalsolutions1@gmail.com';

-- Verify both changes
SELECT email, role, created_at 
FROM users 
WHERE email IN ('keshavtanwar835@gmail.com', 'nextwavedigitalsolutions1@gmail.com')
ORDER BY email;
```

---

## Step-by-Step Instructions:

### Step 1: Open Supabase
1. Go to your Supabase dashboard
2. Select your project
3. Click "SQL Editor" in the left sidebar

### Step 2: Run SQL
1. Create a new query
2. Copy the SQL commands above
3. Paste into the editor
4. Click "Run" button (bottom right)

### Step 3: Check Results
You should see:
```
email: keshavtanwar835@gmail.com          role: user    created_at: [date]
email: nextwavedigitalsolutions1@gmail.com role: admin   created_at: [date]
```

### Step 4: Test Login

**Test keshavtanwar835@gmail.com:**
1. Logout completely from the app
2. Clear browser cache (Ctrl+Shift+Delete)
3. Login with keshavtanwar835@gmail.com
4. Should redirect to `/dashboard` ✅

**Test nextwavedigitalsolutions1@gmail.com:**
1. Logout completely
2. Clear browser cache
3. Login with nextwavedigitalsolutions1@gmail.com
4. Should redirect to `/admin-panel-2024` ✅

---

## Expected Results:

| Email | Role | Dashboard URL | Access |
|-------|------|---------------|--------|
| keshavtanwar835@gmail.com | user | /dashboard | User features only |
| nextwavedigitalsolutions1@gmail.com | admin | /admin-panel-2024 | Full admin access |

---

## Troubleshooting:

### Issue: SQL Returns "0 rows affected"
**Possible Causes:**
- Email doesn't exist in database
- Email spelled wrong
- Case sensitivity issue

**Solution:**
```sql
-- Check if emails exist
SELECT email, role FROM users WHERE email LIKE '%keshav%' OR email LIKE '%nextwave%';
```

### Issue: Still Going to Wrong Dashboard
**Possible Causes:**
- Browser cache not cleared
- Still logged in with old session
- Role change didn't save

**Solution:**
1. Clear ALL browser data (not just cache)
2. Close ALL tabs
3. Restart browser
4. Login fresh
5. Verify SQL ran successfully

### Issue: Can't Access Admin Panel After Change
**Check:**
```sql
SELECT email, role FROM users WHERE email = 'nextwavedigitalsolutions1@gmail.com';
```
Should show role = 'admin'

### Issue: One Email Doesn't Exist
**If keshavtanwar835@gmail.com doesn't exist:**
The account needs to be created first through signup.

**If nextwavedigitalsolutions1@gmail.com doesn't exist:**
Create account through signup, then run SQL to make it admin.

---

## Verification Queries:

### Check Current Roles:
```sql
SELECT email, role 
FROM users 
WHERE email IN ('keshavtanwar835@gmail.com', 'nextwavedigitalsolutions1@gmail.com');
```

### Check All Users and Their Roles:
```sql
SELECT email, role, created_at 
FROM users 
ORDER BY created_at DESC 
LIMIT 10;
```

### Check All Admins:
```sql
SELECT email, created_at 
FROM users 
WHERE role = 'admin';
```

---

## Quick Reference:

### Your SQL (Copy This):
```sql
UPDATE users SET role = 'user' WHERE email = 'keshavtanwar835@gmail.com';
UPDATE users SET role = 'admin' WHERE email = 'nextwavedigitalsolutions1@gmail.com';
```

### Verification (Copy This):
```sql
SELECT email, role FROM users WHERE email IN ('keshavtanwar835@gmail.com', 'nextwavedigitalsolutions1@gmail.com');
```

---

## Hindi Summary / हिंदी सारांश:

### समस्या:
- keshavtanwar835@gmail.com से login करने पर admin panel खुल रहा है
- nextwavedigitalsolutions1@gmail.com को admin बनाना है

### समाधान:

**SQL Commands:**
```sql
UPDATE users SET role = 'user' WHERE email = 'keshavtanwar835@gmail.com';
UPDATE users SET role = 'admin' WHERE email = 'nextwavedigitalsolutions1@gmail.com';
```

**Steps:**
1. Supabase dashboard खोलें
2. SQL Editor में जाएं
3. ऊपर के commands paste करें
4. Run button दबाएं
5. Results verify करें
6. Logout करें और cache clear करें
7. फिर से login करें
8. Perfect! ✅

**Result:**
- keshavtanwar835@gmail.com → User Dashboard में जाएगा
- nextwavedigitalsolutions1@gmail.com → Admin Panel में जाएगा

---

## Important Notes:

1. **Both emails must exist in database**
   - Create accounts through signup if they don't exist
   - Then run SQL to change roles

2. **Clear cache is important**
   - Old sessions can cause wrong redirects
   - Always clear cache after role changes

3. **Logout before testing**
   - Complete logout required
   - Close all tabs
   - Fresh login recommended

4. **Multiple admins allowed**
   - You can have many admin accounts
   - Just set role = 'admin' for any email

5. **Change roles anytime**
   - Not permanent
   - Can switch between user/admin as needed
   - Just run UPDATE SQL again

---

## Support:

If you still have issues after following this guide:
1. Check that SQL ran successfully
2. Verify roles in database
3. Clear ALL browser data
4. Try incognito/private window
5. Check for typos in emails

---

**Status:** ✅ Ready to use! Just copy-paste and run! 🚀
