# Quick Reference - Copy & Paste इन Variables को Vercel में

## 📋 Copy These Exact Values to Vercel

### Variable 1: NEXT_PUBLIC_SUPABASE_URL
```
https://hhtvvlzsjamprvxeayxm.supabase.co
```

### Variable 2: NEXT_PUBLIC_SUPABASE_ANON_KEY
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhodHZ2bHpzamFtcHJ2eGVheXhtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc5NTA2MjYsImV4cCI6MjA4MzUyNjYyNn0.NQrVwM_En7QzziyeSZvjofp-A3rC1_LAocCKC5Wfu2k
```

### Variable 3: SUPABASE_SERVICE_ROLE_KEY
⚠️ **GET THIS FROM SUPABASE:**
1. Visit: https://app.supabase.com/project/hhtvvlzsjamprvxeayxm/settings/api
2. Find "service_role" key
3. Click "Reveal" or "Show"
4. Copy the full key (starts with `eyJ...`)
5. Paste below

```
[PASTE SERVICE_ROLE KEY HERE]
```

---

## 🔧 Vercel में Add Karne Ka Tarika

### Step-by-Step:

1. **Vercel Dashboard खोलो:**
   - https://vercel.com/dashboard
   - अपना project select करो

2. **Settings → Environment Variables**

3. **पहला Variable Add करो:**
   - Click "Add New"
   - Name: `NEXT_PUBLIC_SUPABASE_URL`
   - Value: `https://hhtvvlzsjamprvxeayxm.supabase.co`
   - Environments: ✅ Production, ✅ Preview, ✅ Development
   - Click "Save"

4. **दूसरा Variable Add करो:**
   - Click "Add New"
   - Name: `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - Value: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhodHZ2bHpzamFtcHJ2eGVheXhtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc5NTA2MjYsImV4cCI6MjA4MzUyNjYyNn0.NQrVwM_En7QzziyeSZvjofp-A3rC1_LAocCKC5Wfu2k`
   - Environments: ✅ Production, ✅ Preview, ✅ Development
   - Click "Save"

5. **तीसरा Variable Add करो:**
   - पहले Supabase से service_role key copy करो
   - Click "Add New"
   - Name: `SUPABASE_SERVICE_ROLE_KEY`
   - Value: [Paste the service_role key from Supabase]
   - Environments: ✅ Production, ✅ Preview, ✅ Development
   - Click "Save"

6. **Wait करो:**
   - 2-3 minutes
   - Automatic redeploy होगा

7. **Test करो:**
   - Visit: https://www.nextwavesmm.com/api/check-env
   - Should show: `"success": true`

---

## ⚠️ Service Role Key Kahan Hai?

### Location:
```
https://app.supabase.com/project/hhtvvlzsjamprvxeayxm/settings/api
```

### Kya Dekhna Hai:
1. Page पर "Project API keys" section
2. तीन keys दिखेंगे:
   - ✅ **anon** / **public** - Already have this ✅
   - ⚠️ **service_role** - THIS ONE YOU NEED ⚠️
   - ❌ publishable - NOT this one

3. "service_role" के सामने:
   - "Reveal" या "Show" button click करो
   - Full key copy करो
   - Vercel में paste करो

---

## 📊 Visual Guide

### In Supabase Dashboard:
```
Project API keys
├─ anon / public
│  └─ eyJhbGc... ← ALREADY HAVE THIS ✅
│
├─ service_role
│  └─ eyJhbGc... ← GET THIS ONE ⚠️
│
└─ publishable
   └─ sb_publish... ← NOT THIS ONE ❌
```

### In Vercel:
```
Environment Variables
├─ NEXT_PUBLIC_SUPABASE_URL
│  └─ https://hhtvvlzsjamprvxeayxm.supabase.co ✅
│
├─ NEXT_PUBLIC_SUPABASE_ANON_KEY
│  └─ eyJhbGc... (anon key) ✅
│
└─ SUPABASE_SERVICE_ROLE_KEY
   └─ eyJhbGc... (service_role key) ⚠️ NEEDED
```

---

## ✅ Checklist

- [ ] Vercel Dashboard खोला
- [ ] Project select किया
- [ ] Settings → Environment Variables में गया
- [ ] NEXT_PUBLIC_SUPABASE_URL add किया
- [ ] NEXT_PUBLIC_SUPABASE_ANON_KEY add किया
- [ ] Supabase से service_role key copy किया
- [ ] SUPABASE_SERVICE_ROLE_KEY add किया
- [ ] सभी variables में "All environments" select किया
- [ ] Save किया
- [ ] 2-3 minutes wait किया
- [ ] `/api/check-env` test किया
- [ ] ✅ Success दिखा!

---

## 🎯 Final Test

### After Adding All Variables:

```bash
curl https://www.nextwavesmm.com/api/check-env
```

### Should Return:
```json
{
  "success": true,
  "supabase": {
    "valid": true,
    "message": "✅ Supabase environment variables are properly configured"
  },
  "variables": [
    {
      "name": "NEXT_PUBLIC_SUPABASE_URL",
      "isSet": true
    },
    {
      "name": "NEXT_PUBLIC_SUPABASE_ANON_KEY",
      "isSet": true
    },
    {
      "name": "SUPABASE_SERVICE_ROLE_KEY",
      "isSet": true
    }
  ]
}
```

---

**Copy करो → Vercel में paste करो → Test करो!** 🚀
