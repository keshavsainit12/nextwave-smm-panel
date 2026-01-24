# Google Cloud Console Setup - Complete Guide

## Step 1: Create a New Project
1. Go to: https://console.cloud.google.com/
2. Click on "Select a Project" (top left)
3. Click "NEW PROJECT"
4. **Project name:** `NextWave SMM` (ya koi bhi naam)
5. Click "CREATE"
6. Wait 2-3 minutes for project to be created

---

## Step 2: Enable Google+ API
1. In the same console, go to top search bar
2. Search for: `Google+ API` or `Google People API`
3. Click on it and select "ENABLE"
4. Wait for it to enable (blue checkmark aayega)

---

## Step 3: Create OAuth 2.0 Credentials
1. Left sidebar mein "Credentials" click karo
2. Top mein "Create Credentials" button click karo
3. Select: "OAuth client ID"
4. Agar puche "Configure OAuth consent screen first" toh:
   - "External" select karo
   - "Create" click karo
   - Fill karo ye details:
     - **App name:** NextWave SMM
     - **User support email:** nextwavesmm07@gmail.com
     - **Developer contact:** nextwavesmm07@gmail.com
   - Save aur Continue click karo

---

## Step 4: Add Scopes
1. "Add or Remove Scopes" click karo
2. Search aur select karo:
   - `email`
   - `profile`
   - `openid`
3. Update button click karo
4. Save aur Continue

---

## Step 5: Create OAuth Client ID
1. Application type: "Web application" select karo
2. **Name:** `NextWave NextJS App`
3. "Authorized JavaScript origins" section mein click "Add URI":
   \`\`\`
   http://localhost:3000
   https://nextwavesmm.com
   \`\`\`
4. "Authorized redirect URIs" section mein click "Add URI":
   \`\`\`
   http://localhost:3000/auth/callback
   https://nextwavesmm.com/auth/callback
   \`\`\`
5. "CREATE" button click karo

---

## Step 6: Copy Your Credentials
Ek popup aayega jisme:
- **Client ID** dikhega (copy karo)
- **Client Secret** dikhega (copy karo)

**Example format:**
\`\`\`
Client ID: 123456789-abc123def456.apps.googleusercontent.com
Client Secret: GOCSPX-xyz123abc456
\`\`\`

---

## Step 7: Add to Supabase
1. Go to: https://supabase.com/dashboard
2. Select your project
3. Left sidebar → Authentication → Providers
4. Search for "Google" aur click enable
5. Paste karo:
   - **Client ID** (jaha likha hai)
   - **Client Secret** (jaha likha hai)
6. "SAVE" click karo

---

## Step 8: Test Karo
1. Go to: `http://localhost:3000/auth/signup`
2. Click "Google" button
3. Aapka Google account select karo
4. Account create ho jayega automatically!

---

## Important Notes

**NEVER share these:**
- Client Secret (secret key)
- API Keys

**Always use in:**
- Client ID: Frontend mein use kar sakte ho
- Client Secret: ONLY backend mein (Supabase handle karega)

**Agar error aaye:**
1. Check karo dono redirect URIs exactly match hain
2. Google+ API enable ho gaya hai?
3. Client ID aur Secret sahi paste hue hain?

---

## Complete Checklist

- [ ] New Google Cloud Project banaya
- [ ] Google+ API enabled kiya
- [ ] OAuth consent screen configure kiya
- [ ] Web application credentials created
- [ ] Redirect URIs add kiye:
  - [ ] http://localhost:3000/auth/callback
  - [ ] https://nextwavesmm.com/auth/callback
- [ ] Client ID copied
- [ ] Client Secret copied
- [ ] Supabase mein Google provider enabled
- [ ] Client ID paste kiya Supabase mein
- [ ] Client Secret paste kiya Supabase mein
- [ ] Test kiya signup page par

---

## Your App's Callback Route
Already configured at: `/app/auth/callback/route.ts`
This automatically handles:
- Google login token verification
- User session creation
- Database user record creation
- Redirect to dashboard

No changes needed here! ✓
