# Testing Guide - Nextwave SMM Panel

## Post-Deployment Verification Checklist

### Prerequisites:
- ✅ Code deployed to production
- ✅ SQL executed (RLS disabled on services table)
- ✅ Admin login credentials ready

---

## Critical Tests (Must Pass)

### Test 1: Admin Login ✅
**Steps:**
1. Navigate to `/auth/login`
2. Enter email: `nextwavedigitalsolutions1@gmail.com`
3. Enter password
4. Click "Login"

**Expected Result:**
- ✅ Login successful
- ✅ Redirects to dashboard
- ✅ No error messages

**If Fails:**
- Check credentials
- Verify Supabase auth is working
- Check browser console for errors

---

### Test 2: Access Admin Panel ✅
**Steps:**
1. From dashboard, click "Admin Panel" link in sidebar
2. OR navigate directly to `/admin-panel-2024`

**Expected Result:**
- ✅ Admin panel loads
- ✅ Email `nextwavedigitalsolutions1@gmail.com` shows at top
- ✅ Sidebar visible with all sections
- ✅ Services, Users, Orders, etc. all accessible

**If Fails:**
- Check if user has `role = 'admin'` in database
- Verify layout.tsx auth check
- Check browser console

---

### Test 3: Service Add (CRITICAL) 🔴
**Steps:**
1. Go to Services page
2. Click "Add Service" button
3. Fill the form:
   - Name: `Test Service`
   - Category: Select any
   - Base Price: `5.00`
   - Provider Price: `2.00`
   - Min Quantity: `100`
   - Max Quantity: `10000`
   - Description: `Test description`
4. Click "Save"

**Expected Result:**
- ✅ Success toast appears: "Service added successfully"
- ✅ New service appears in services list
- ✅ Price shows as $5.00
- ✅ Profit margin calculated and shown
- ✅ No console errors

**If Fails:**
- **Most likely:** RLS still enabled
- **Verify SQL:** Run verification query (see below)
- **Check console:** Look for database errors
- **Check logs:** Look for [AddService] logs

**SQL Verification:**
```sql
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE tablename = 'services';
-- Should return: rowsecurity = false
```

---

### Test 4: Service Edit (CRITICAL) 🔴
**Steps:**
1. In services list, find any service
2. Click edit icon (✏️)
3. Modal opens

**Expected Result:**
- ✅ Edit modal opens
- ✅ **All fields populated** (NOT EMPTY!):
  - Name field shows service name
  - Base Price shows (e.g., `5.00`)
  - Provider Price shows
  - Profit Margin shows and is calculated
  - Description shows
  - Category selected
- ✅ Can change values
- ✅ Click "Save"
- ✅ Success message appears
- ✅ Changes reflect in list immediately

**If Fields Are Empty:**
- Clear browser cache
- Hard refresh (Ctrl+Shift+R or Cmd+Shift+R)
- Verify latest deployment
- Check if service data exists in database

---

### Test 5: Individual Price Update 🔴
**Steps:**
1. In services list
2. Click directly on any price (e.g., $5.00)
3. Input field should appear
4. Change price to `6.00`
5. Press Enter or click checkmark (✓)

**Expected Result:**
- ✅ Input field appears on click
- ✅ Can type new value
- ✅ Price updates immediately
- ✅ Shows new price (e.g., $6.00)
- ✅ Refresh page - new price persists
- ✅ Console shows: `[UpdatePrice] Price updated successfully`
- ✅ No errors

**If Fails:**
- Check RLS is disabled
- Look for errors in console
- Verify `updateServicePrice()` function
- Check database permissions

---

### Test 6: Bulk Pricing (CRITICAL) 🔴
**Steps:**
1. Find "Bulk Pricing Control" card on Services page
2. Enter `10` in percentage field (for 10%)
3. Click "Increase +10%" button
4. Wait 2-3 seconds

**Expected Result:**
- ✅ Success message: "Successfully increased prices for X services by 10%"
- ✅ **Console logs appear:**
  ```
  [BulkPricing] Fetching all services for 10% price adjustment
  [BulkPricing] Updating 50 services with 10% adjustment
  [BulkPricing] Service abc123: 5.0000 → 5.5000 (+10%)
  [BulkPricing] Service def456: 3.0000 → 3.3000 (+10%)
  ...
  [BulkPricing] Successfully updated 50/50 services
  ```
- ✅ **All prices increased by 10%** in list
- ✅ Service that was $5.00 now shows $5.50
- ✅ Page auto-refreshes with new prices

**Test Decrease:**
1. Enter `10` again
2. Click "Decrease -10%"
3. ✅ Prices should go back down
4. ✅ Service back to original price

**If Fails:**
- **Most critical test!**
- Check console for [BulkPricing] logs
- If no logs: function not executing
- If logs but no update: RLS blocking
- Verify SQL was run correctly
- Check `updateAllServicesPricing()` function

---

### Test 7: Mobile Admin Panel 📱
**Steps:**
1. Open admin panel on mobile browser (or resize to <1024px)
2. Should see hamburger menu (☰) at top
3. Click hamburger menu
4. Sidebar should slide in

**Expected Result:**
- ✅ Hamburger menu visible on mobile
- ✅ Click opens sidebar from left
- ✅ **SINGLE sidebar** (not double!)
- ✅ Email shows at top
- ✅ All navigation items visible
- ✅ Click any item → sidebar closes
- ✅ Navigates to that page

**If Double Sidebar:**
- This should be fixed already
- Clear cache and hard refresh
- Verify latest deployment
- Check `AdminSidebar` and `MobileAdminMenu` components

---

### Test 8: Currency Display 💱
**Steps:**
1. Admin Panel → Settings → System tab
2. Find "Currency" field
3. Change from USD to XAF (or any other)
4. Click "Save"
5. Go to Services page

**Expected Result:**
- ✅ All prices now show XAF symbol (FCFA)
- ✅ If price was $5.00, now shows 3,100 FCFA (5 × 620)
- ✅ Conversion calculated correctly

**Test User View:**
1. Open incognito window
2. Login as regular user (not admin)
3. Go to dashboard
4. ✅ Prices show in XAF
5. ✅ Match admin panel prices
6. ✅ Can place orders with XAF prices

**If Currency Not Updating:**
- Check CurrencyProvider is in layout
- Verify system_settings table has currency
- Check displayAmount() function usage
- Clear cache and refresh

---

### Test 9: User Dashboard View 👥
**Steps:**
1. Logout from admin
2. Login as regular user (non-admin)
3. View dashboard

**Expected Result:**
- ✅ Dashboard loads
- ✅ Services visible
- ✅ Prices correct (match admin)
- ✅ Can place orders
- ✅ NO admin features visible
- ✅ NO "Admin Panel" link
- ✅ Clean user experience

**If User Sees Admin Features:**
- Check role in users table
- Verify conditional rendering
- Check dashboard layout auth

---

### Test 10: Logout & Security ✅
**Steps:**
1. In admin panel
2. Click "Logout" button
3. Should redirect to login

**Expected Result:**
- ✅ Redirects to `/auth/login`
- ✅ Session cleared
- ✅ Cannot access `/admin-panel-2024` without login
- ✅ Redirected back to login if try to access

**If Can Access After Logout:**
- Session not cleared properly
- Check auth logic
- Clear cookies manually

---

## Troubleshooting Guide

### Service Operations Still Not Working?

#### 1. Verify RLS Is Disabled
```sql
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE tablename = 'services';
```

**If shows `rowsecurity = true`:**
```sql
-- RLS is still enabled! Run this again:
DROP POLICY IF EXISTS "services_all_admin" ON services;
DROP POLICY IF EXISTS "services_read_public" ON services;
DROP POLICY IF EXISTS "services_read_active" ON services;
DROP POLICY IF EXISTS "Allow admins full access" ON services;
DROP POLICY IF EXISTS "Allow users to read active services" ON services;

ALTER TABLE services DISABLE ROW LEVEL SECURITY;
```

#### 2. Check Console Logs
- Open browser console (F12)
- Try the operation again
- Look for errors (red text)
- Look for [BulkPricing] or [UpdatePrice] logs
- Share error messages if any

#### 3. Verify Deployment
- Ensure latest code is deployed
- Check deployment timestamp
- Verify no deployment errors
- Try hard refresh (Ctrl+Shift+R)

#### 4. Database Connection
- Verify Supabase connection
- Check environment variables
- Test with simple query
- Verify credentials

---

## Success Criteria

### ✅ All Tests Pass If:
- Can add services
- Can edit services (fields show data)
- Can update individual prices
- Bulk pricing works (increase & decrease)
- Mobile sidebar is single (not double)
- Currency displays correctly
- Users see correct prices
- No console errors
- All operations persist (refresh shows changes)

### 🎉 System is Operational When:
```
✅ Test 1: Login - PASS
✅ Test 2: Admin Panel - PASS
✅ Test 3: Service Add - PASS
✅ Test 4: Service Edit - PASS
✅ Test 5: Price Update - PASS
✅ Test 6: Bulk Pricing - PASS
✅ Test 7: Mobile Sidebar - PASS
✅ Test 8: Currency - PASS
✅ Test 9: User View - PASS
✅ Test 10: Logout - PASS
```

**Result:** 🚀 **SYSTEM FULLY OPERATIONAL!**

---

## Quick Test Script

For quick verification, run these 3 critical tests:

### 1. Add Service (1 minute)
- Click Add → Fill → Save
- ✅ Should work

### 2. Edit Service (1 minute)
- Click Edit → See fields populated → Change → Save
- ✅ Should work

### 3. Bulk Pricing (1 minute)
- Enter 10% → Click Increase → Check console → See prices update
- ✅ Should work

**If all 3 pass: System is working!** ✅

---

## Contact Information

### If Tests Fail:
1. Note which test failed
2. Copy error from console
3. Take screenshot
4. Share details

### If All Tests Pass:
🎉 **Congratulations!**
- System operational
- Ready for production
- All features working

---

**SAB TEST KARO! (Test Everything!)**
**AGAR SAB PASS HO JAYE TO SAB THEEK HAI! (If all pass, everything is good!)**

**GOOD LUCK!** ✅🚀
