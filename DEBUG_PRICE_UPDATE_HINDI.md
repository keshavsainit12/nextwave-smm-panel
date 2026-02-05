# Service Price Update - Debugging (Hindi)

## समस्या / Problem
Individual service की price update नहीं हो रही है।

## हमने क्या किया / What We Did

### 1. Code में Fix (पहले)
- Database में `price` column नहीं था, इसलिए `base_price` column use करने लगे
- सभी 4 functions fix किए जो price update करते हैं

### 2. Debugging Features (अभी)
- Console में logs add किए ताकि पता चले कहाँ problem है
- Error messages को improve किया
- Step-by-step debugging guide बनाई

## अब क्या करें / What to Do Now

### Step 1: Admin Panel खोलें
1. https://nextwavesmm.com/admin-panel-2024/services पर जाएं
2. Browser console खोलें (F12 दबाएं)
3. "Console" tab पर click करें

### Step 2: Price Update करने की कोशिश करें
1. किसी भी service की **green price number** पर click करें
2. Input field में नई price डालें
3. **Green checkmark (✓)** पर click करें

### Step 3: Console में Messages देखें

**अगर काम कर रहा है तो:**
```
[v0] Saving price: { id: "...", price: 15 }
[v0] Updating service price: { serviceId: "...", newPrice: 15 }
[v0] Service price updated successfully: [...]
```
और आपको "Price updated successfully" notification दिखेगा।

**अगर काम नहीं कर रहा तो:**
```
[v0] Update service price error: { message: "...", ... }
[v0] Failed to update price: { ... }
```
Error message screen पर भी दिखेगा।

## Common Problems और Solutions

### Problem 1: Permission Error
**Error**: "permission denied" या "insufficient privileges"

**क्या करें:**
Database में permission missing है। Supabase dashboard में SQL editor में यह run करें:
```sql
GRANT UPDATE ON services TO authenticated;
GRANT UPDATE ON services TO service_role;
```

### Problem 2: Column Doesn't Exist
**Error**: "column base_price does not exist"

**क्या करें:**
Column add करना होगा:
```sql
ALTER TABLE services ADD COLUMN base_price DECIMAL DEFAULT 0;
```

### Problem 3: RLS (Row Level Security) Issue
**Error**: "new row violates row-level security policy"

**क्या करें:**
Policy add करें:
```sql
CREATE POLICY "Allow admin to update services"
ON services FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);
```

### Problem 4: Authentication Issue
**Error**: "Invalid JWT" या "User not authenticated"

**क्या करें:**
1. Admin panel से logout करें
2. Browser cookies clear करें
3. फिर से login करें
4. Price update try करें

## Direct Database Test

Supabase SQL Editor में यह try करें:

```sql
-- एक service देखें
SELECT id, name, base_price FROM services LIMIT 1;

-- उसकी price update करें (ID को actual ID से replace करें)
UPDATE services 
SET base_price = 99.99 
WHERE id = 'actual-service-id-यहाँ-डालें';

-- Check करें कि update हुई या नहीं
SELECT id, name, base_price FROM services WHERE id = 'actual-service-id-यहाँ-डालें';
```

**अगर यह काम करता है:** Problem application code में है
**अगर यह fail होता है:** Problem database/permissions में है

## Admin Panel की Checking

### Verify करें कि सब कुछ वैसा ही है
✅ Layout वही है जो production में है
✅ सभी pages accessible हैं
✅ कोई visual change नहीं है
✅ सिर्फ error messages improve हुए हैं

### दूसरे Features Test करें
यह try करें:
1. Service को on/off करना (toggle switch)
2. Edit button से service edit करना
3. New service add करना
4. Service delete करना

अगर ये सब काम करते हैं लेकिन inline price edit नहीं, तो specific issue है `updateServicePrice` function में।

## क्या Share करें / What to Share

अगर console में error आता है तो share करें:
1. **Error message** (console से copy करें)
2. **Screenshot** of the error
3. कौनसी service update करने की कोशिश कर रहे हैं
4. क्या price set करने की कोशिश कर रहे हैं

इससे exact problem identify हो जाएगी।

## Expected Behavior

### पहले (Broken)
- Price पर click → input आता है
- Value change → ✓ click
- **कोई error नहीं दिखता लेकिन price change नहीं होती**
- Page refresh → पुरानी price ही दिखती है

### अब (Should Work)
- Price पर click → input आता है
- Value change → ✓ click
- **"Price updated successfully" notification दिखता है**
- Price तुरंत update हो जाती है list में
- Page refresh → नई price persist होती है

---

## Summary

✅ Code fix किया (base_price column use करने लगे)
✅ Logging add की (console में details दिखेंगी)
✅ Error handling improve की (actual error message दिखेगा)
✅ Debugging guide बनाई (troubleshooting के लिए)

**अब करें:**
1. F12 press करें
2. Price update try करें
3. Console messages देखें
4. अगर error है तो screenshot share करें

**Admin panel वैसा ही है** जैसा production में था। सिर्फ debugging features add हुए हैं जो problem identify करने में help करेंगे।

---

**Created**: 2026-02-05
**Status**: Debugging version ready
**Action**: Test करें और console errors share करें
