# 🔑 HOW TO GET SWACHERCONNECT_TOKEN

## Quick Answer (Hindi/Hinglish)

**प्रश्न:** "ye kaha milenge mujhe" (ये कहाँ मिलेंगे मुझे)

**उत्तर:** ✅ Token पहले ही मिल चुका है! Client ने दिया था:

```
eyJhbGciOiJIUzI1NiJ9.eyJhZG1pbl9pZCI6MTM5LCJtYWluX2FkbWluX2lkIjoxMzksInVzZXJfaWQiOjEzOSwiZXhwIjoxNzcwNTA5MTYyfQ.ggSfI9-dSATneGbJ5eN1v-idB_scdd5qNv6HHzKH5a8
```

**बस इतना करो:**
1. Vercel खोलो → https://vercel.com
2. अपना project select करो (nextwave-smm-panel)
3. Settings → Environment Variables
4. "Add New" पे click करो
5. Name: `SWACHERCONNECT_TOKEN`
6. Value: ऊपर दिया हुआ token paste करो
7. Save करो
8. Redeploy करो

**हो गया! ✅**

---

## English Version

### Question: "Where will I find this token?"

### Answer: ✅ You already have it!

The client provided this token earlier:

```
eyJhbGciOiJIUzI1NiJ9.eyJhZG1pbl9pZCI6MTM5LCJtYWluX2FkbWluX2lkIjoxMzksInVzZXJfaWQiOjEzOSwiZXhwIjoxNzcwNTA5MTYyfQ.ggSfI9-dSATneGbJ5eN1v-idB_scdd5qNv6HHzKH5a8
```

**Steps to Add:**
1. Go to Vercel.com
2. Select your project
3. Settings → Environment Variables
4. Click "Add New"
5. Name: `SWACHERCONNECT_TOKEN`
6. Value: Paste the token above
7. Save
8. Redeploy

**Done!** ✅

---

## Token Details

### Current Token Information
- **Token:** `eyJhbGciOiJIUzI1NiJ9.eyJhZG1pbl9pZCI6MTM5LCJtYWluX2FkbWluX2lkIjoxMzksInVzZXJfaWQiOjEzOSwiZXhwIjoxNzcwNTA5MTYyfQ.ggSfI9-dSATneGbJ5eN1v-idB_scdd5qNv6HHzKH5a8`
- **Admin ID:** 139
- **Valid Until:** February 8, 2026
- **Status:** ✅ Currently Valid
- **Source:** Client's SwacherConnect dashboard

### Decoded Information
```json
{
  "alg": "HS256",
  "admin_id": 139,
  "main_admin_id": 139,
  "user_id": 139,
  "exp": 1770509162
}
```

---

## Step-by-Step Vercel Setup (Detailed)

### Step 1: Login to Vercel
```
URL: https://vercel.com/login
Login with your account
```

### Step 2: Go to Dashboard
```
After login, you'll see all your projects
Find: nextwave-smm-panel (or your project name)
Click on it
```

### Step 3: Open Settings
```
At the top menu, you'll see:
[Overview] [Deployments] [Analytics] [Settings] [...]

Click: Settings
```

### Step 4: Navigate to Environment Variables
```
In the left sidebar, you'll see:
- General
- Domains
- Environment Variables ← Click this
- Git
- Functions
- ...
```

### Step 5: Add New Variable
```
You'll see existing variables (if any)

Click: "Add New" button (top right)

A form will appear:
┌─────────────────────────────────┐
│ Name: [________________]        │
│                                 │
│ Value: [________________]       │
│                                 │
│ Environments:                   │
│ ☑ Production                    │
│ ☑ Preview                       │
│ ☑ Development                   │
│                                 │
│ [Cancel]  [Save]                │
└─────────────────────────────────┘
```

### Step 6: Fill in Details
```
Name: SWACHERCONNECT_TOKEN

Value: eyJhbGciOiJIUzI1NiJ9.eyJhZG1pbl9pZCI6MTM5LCJtYWluX2FkbWluX2lkIjoxMzksInVzZXJfaWQiOjEzOSwiZXhwIjoxNzcwNTA5MTYyfQ.ggSfI9-dSATneGbJ5eN1v-idB_scdd5qNv6HHzKH5a8

Check all environments:
✓ Production
✓ Preview
✓ Development
```

### Step 7: Save
```
Click: "Save" button

You'll see a confirmation:
"Environment variable added successfully"
```

### Step 8: Redeploy
```
Go to: Deployments tab (top menu)

You'll see your recent deployments

On the latest deployment, click the "..." menu
Select: "Redeploy"

Confirm: "Redeploy"

Wait for deployment to complete (~1-2 minutes)
```

### Step 9: Verify
```
After deployment completes:
1. Go to your live website
2. Try creating an instant payment
3. Check if redirect works
4. Payment should process correctly
```

---

## Visual Guide

### Vercel Dashboard Structure
```
┌────────────────────────────────────────────────────┐
│ 🔵 Vercel    [Search]           [User] [Help]     │
├────────────────────────────────────────────────────┤
│                                                     │
│  Your Projects                                      │
│  ┌──────────────────────────────────────────────┐  │
│  │ 📦 nextwave-smm-panel                        │  │
│  │    Production: nextwave-smm-panel.vercel.app │  │
│  │    [Visit] [Settings]                        │  │
│  └──────────────────────────────────────────────┘  │
│                                                     │
└────────────────────────────────────────────────────┘

When you click Settings:

┌────────────────────────────────────────────────────┐
│ nextwave-smm-panel                                  │
│ [Overview] [Deployments] [Settings] [Logs]         │
├────────────────────────────────────────────────────┤
│                                                     │
│ ┌─────────────────┬─────────────────────────────┐  │
│ │ General         │ Environment Variables       │  │
│ │ Domains         │                             │  │
│ │ → Environment ← │ ┌─────────────────────────┐ │  │
│ │   Variables     │ │ Name: SWACHERCONNECT_   │ │  │
│ │ Git             │ │       TOKEN             │ │  │
│ │ Functions       │ │                         │ │  │
│ │ Advanced        │ │ Value: eyJh...          │ │  │
│ └─────────────────┤ │                         │ │  │
│                   │ │ [Add New] [Edit] [Del]  │ │  │
│                   │ └─────────────────────────┘ │  │
│                   └─────────────────────────────┘  │
└────────────────────────────────────────────────────┘
```

---

## Common Questions

### Q: Kaha se mila ye token? (Where did this token come from?)
**A:** Client ne SwacherConnect dashboard se generate kiya aur tumhe diya. (Client generated it from SwacherConnect dashboard and gave to you.)

### Q: Kya main khud token generate kar sakta hu? (Can I generate token myself?)
**A:** Nahi, sirf client ke SwacherConnect account se generate ho sakta hai. (No, only from client's SwacherConnect account.)

### Q: Token expire hone ke bad kya karu? (What to do when token expires?)
**A:** Client se naya token mangna padega. Ye Feb 8, 2026 tak valid hai. (You'll need to ask client for new token. This is valid until Feb 8, 2026.)

### Q: Agar token galat hai to? (What if token is wrong?)
**A:** Payment creation fail hoga. Console logs check karo. (Payment creation will fail. Check console logs.)

### Q: Vercel me add karne ke bad kya? (What after adding to Vercel?)
**A:** Bas redeploy karo. Phir automatic kaam karega. (Just redeploy. Then it works automatically.)

---

## Future: Token Renewal (When Expires)

### Current Token Expires: February 8, 2026

### How to Get New Token

**Method 1: Ask Client**
```
Message to client:
"Token Feb 8, 2026 ko expire hoga. Kya aap naya token bhej sakte hain?"

Client will:
1. Login to SwacherConnect dashboard
2. Generate new token
3. Send to you
4. You update in Vercel
```

**Method 2: Client Gets It Himself**
```
Client should:
1. Login to swacherconnect.com
2. Go to Settings/API section
3. Generate new API token
4. Copy the JWT token
5. Send to you or add directly to Vercel (if has access)
```

### Updating Token in Vercel
```
When you get new token:

1. Go to Vercel → Settings → Environment Variables
2. Find: SWACHERCONNECT_TOKEN
3. Click: Edit (pencil icon)
4. Replace old token with new token
5. Save
6. Redeploy

Done! New token active.
```

---

## Troubleshooting

### Problem: "Token kaha hai?" (Where is token?)
**Solution:** 
Scroll up in this file. Token is at the top:
```
eyJhbGciOiJIUzI1NiJ9.eyJhZG1pbl9pZCI6MTM5LCJtYWluX2FkbWluX2lkIjoxMzksInVzZXJfaWQiOjEzOSwiZXhwIjoxNzcwNTA5MTYyfQ.ggSfI9-dSATneGbJ5eN1v-idB_scdd5qNv6HHzKH5a8
```

### Problem: "Vercel me add kaise karu?" (How to add in Vercel?)
**Solution:**
Follow Step-by-Step guide above (Step 1 to Step 9)

### Problem: "Token kam nahi kar raha" (Token not working)
**Check:**
1. ✓ Complete token copied (no spaces at start/end)
2. ✓ Variable name is exactly: `SWACHERCONNECT_TOKEN`
3. ✓ Saved to Production environment
4. ✓ Redeployed after adding
5. ✓ Token not expired (valid until Feb 2026)

### Problem: "Payment link nahi ban raha" (Payment link not creating)
**Check:**
1. Token added correctly in Vercel
2. Check Vercel logs for errors
3. Look for "SWACHERCONNECT_TOKEN not configured" error
4. Verify redeployment happened

### Problem: "Balance credit nahi ho raha" (Balance not crediting)
**Check:**
1. Wait 10 minutes (cron runs every 10 min)
2. Check Vercel cron logs
3. Verify token is correct
4. Check if payment status API is responding

---

## Summary

### तुम्हारा Token (Your Token):
```
eyJhbGciOiJIUzI1NiJ9.eyJhZG1pbl9pZCI6MTM5LCJtYWluX2FkbWluX2lkIjoxMzksInVzZXJfaWQiOjEzOSwiZXhwIjoxNzcwNTA5MTYyfQ.ggSfI9-dSATneGbJ5eN1v-idB_scdd5qNv6HHzKH5a8
```

### Kaha Add Karna Hai (Where to Add):
```
Vercel Dashboard
→ Project Settings
→ Environment Variables
→ Add New
→ Name: SWACHERCONNECT_TOKEN
→ Value: (token paste karo)
→ Save & Redeploy
```

### Token Validity:
```
✅ Valid until: February 8, 2026
✅ Admin ID: 139
✅ Currently working
```

### बस! आसान है! (That's it! Easy!)

कोई problem हो तो CLIENT_INSTRUCTIONS.md file भी dekho. 🎉

---

## Quick Copy-Paste

### Token (Copy This):
```
eyJhbGciOiJIUzI1NiJ9.eyJhZG1pbl9pZCI6MTM5LCJtYWluX2FkbWluX2lkIjoxMzksInVzZXJfaWQiOjEzOSwiZXhwIjoxNzcwNTA5MTYyfQ.ggSfI9-dSATneGbJ5eN1v-idB_scdd5qNv6HHzKH5a8
```

### Variable Name (Copy This):
```
SWACHERCONNECT_TOKEN
```

### Vercel URL:
```
https://vercel.com/dashboard
```

---

**That's all you need! सब information यहाँ है! ✅**
