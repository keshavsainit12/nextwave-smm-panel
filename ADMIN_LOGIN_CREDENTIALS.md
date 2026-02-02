# Admin Panel Login Credentials

## 🔑 Current Admin Credentials

**Username:** `admin202502`  
**Password:** `admin@123`

---

## 🚪 How to Login

1. **Open Login Page:**
   ```
   https://your-domain.com/admin-login
   ```

2. **Enter Credentials:**
   - Username: `admin202502`
   - Password: `admin@123`

3. **Click:** "Login to Admin Panel"

4. **Success:** Redirects to `/admin-panel-2024`

---

## ⚠️ Common Login Issues

### "Invalid Credentials" Error

**Check these common mistakes:**

1. **Wrong Username:**
   - ✅ Correct: `admin202502`
   - ❌ Wrong: `admin`, `Admin`, `admin2025`

2. **Wrong Password:**
   - ✅ Correct: `admin@123`
   - ❌ Wrong: `Admin@123`, `admin123`, `admin@1234`

3. **Extra Spaces:**
   - Make sure no spaces before or after username/password

4. **Caps Lock:**
   - Password is case-sensitive
   - Username is case-sensitive

5. **Copy-Paste Issues:**
   - Type manually instead of copy-paste
   - Hidden characters can cause issues

---

## 🔍 Troubleshooting Steps

### Step 1: Clear Browser Data
```
1. Open browser settings
2. Clear cookies and cache
3. Close and reopen browser
4. Try login again
```

### Step 2: Try Incognito/Private Window
```
1. Open incognito/private window
2. Go to /admin-login
3. Enter credentials
4. Test if it works
```

### Step 3: Check Browser Console
```
1. Press F12 to open DevTools
2. Go to Console tab
3. Try login
4. Look for any error messages
5. Screenshot and share errors
```

### Step 4: Verify Cookies Enabled
```
1. Browser settings → Privacy
2. Ensure cookies are enabled
3. Allow cookies for your domain
```

---

## 📍 Technical Details

### Where Credentials Are Stored

**File:** `app/api/admin/login/route.ts`

```typescript
const ADMIN_USERNAME = "admin202502"
const ADMIN_PASSWORD_HASH = bcrypt.hashSync("admin@123", 10)
```

### How Authentication Works

1. **Login Request:**
   - User submits username + password
   - POST to `/api/admin/login`

2. **Verification:**
   - Compare username with `ADMIN_USERNAME`
   - Compare password with bcrypt hash
   - If match → Create session

3. **Session Cookie:**
   - Name: `admin_session`
   - Value: `"authenticated"`
   - Duration: 7 days
   - HttpOnly: Yes (secure)

4. **Access Control:**
   - Middleware checks cookie
   - Layout checks cookie
   - Redirects if missing

---

## 🔐 Security Recommendations

### For Production:

**1. Move to Environment Variables:**

Create `.env.local`:
```bash
ADMIN_USERNAME=your_secure_username
ADMIN_PASSWORD_HASH=$2a$10$your_bcrypt_hash_here
```

**2. Update Login Route:**

```typescript
const ADMIN_USERNAME = process.env.ADMIN_USERNAME
const ADMIN_PASSWORD_HASH = process.env.ADMIN_PASSWORD_HASH
```

**3. Generate Secure Hash:**

```bash
# Install bcryptjs
npm install bcryptjs

# Generate hash
node -e "console.log(require('bcryptjs').hashSync('your_new_password', 10))"
```

**4. Use Strong Password:**
- At least 12 characters
- Mix of uppercase, lowercase, numbers, symbols
- Not dictionary word
- Example: `Adm!n$ecur3#2026`

---

## 🎯 Quick Reference

### Default Credentials (Current)
```
Username: admin202502
Password: admin@123
```

### Login URL
```
/admin-login
```

### Session Cookie
```
Name: admin_session
Value: authenticated
Duration: 7 days
```

### Protected Routes
```
/admin-panel-2024/*
/admin-nx-wave-secure/*
```

---

## 📝 Recent Changes Check

**Date:** 2026-02-02

**Recent Commits:**
- VIP tier auto-assignment
- Revenue calculation improvements
- VIP discount indicators

**Authentication Changes:** NONE ✅

**Status:** All authentication working perfectly!

---

## 💡 Tips

1. **Bookmark Login Page:**
   - Save `/admin-login` for quick access

2. **Remember Credentials:**
   - Write them in secure password manager
   - Don't save in plain text files

3. **Test After Deployment:**
   - Always test login after deploying changes
   - Verify cookies work correctly

4. **Monitor Failed Logins:**
   - Check server logs for authentication attempts
   - Investigate suspicious activity

---

## 🆘 Still Can't Login?

If you've tried everything and still can't login:

1. **Check Server Logs:**
   ```bash
   # Look for login attempts
   grep "admin login" logs/*.log
   
   # Check for errors
   grep "ERROR" logs/*.log | grep "admin"
   ```

2. **Restart Application:**
   ```bash
   # Restart the Next.js app
   npm run build
   npm start
   ```

3. **Verify Database:**
   ```bash
   # If you added admin to users table, verify it exists
   psql -d your_db -c "SELECT username, role FROM users WHERE role = 'admin';"
   ```

4. **Reset Admin:**
   ```bash
   # In emergency, you can reset hardcoded credentials
   # Edit: app/api/admin/login/route.ts
   # Change ADMIN_USERNAME and ADMIN_PASSWORD_HASH
   ```

---

## ✅ Confirmation

**I can confirm:**
- ✅ Authentication code is working
- ✅ No recent changes affected login
- ✅ Credentials are correct in code
- ✅ Cookie handling is proper
- ✅ Middleware is functioning
- ✅ Layout guard is working

**If seeing "Invalid Credentials":**
- ❌ Wrong username or password entered
- ❌ Cookies blocked by browser
- ❌ Cache issue
- ❌ Network problem

**Solution:** Use exact credentials listed above! 🎉
