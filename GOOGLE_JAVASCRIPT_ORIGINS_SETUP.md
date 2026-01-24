# Google Cloud Console - JavaScript Origins Setup

## Kya Hai "Authorised JavaScript Origins"?

Yeh field bata ta hai ki kis websites se Google OAuth requests aa sakti hain.
Basically origin = protocol + domain (without path)

## Tere App Ke Liye JavaScript Origins:

### Development (Local Testing):
```
http://localhost:3000
```

### Production (Live Website):
```
https://nextwavesmm.com
```

## Google Cloud Console mein Add Kaise Karo:

1. **Google Cloud Console open karo** → https://console.cloud.google.com

2. **Credentials section mein jao**
   - Left sidebar → "Credentials"

3. **Apne OAuth 2.0 Client ID ko edit karo**
   - Created client ID ko click karo

4. **"Authorized JavaScript origins" section milega**

5. **Add karo dono origins:**
   ```
   http://localhost:3000
   https://nextwavesmm.com
   ```

6. **"Authorized redirect URIs" section mein ye add karo:**
   ```
   http://localhost:3000/auth/callback
   https://nextwavesmm.com/auth/callback
   ```

7. **SAVE button click karo** (very important!)

## Important Points:

✅ **Protocol zaroori hai** - http:// ya https://
✅ **Port zaroori hai local ke liye** - :3000
❌ **Path nahi hota** - `http://localhost:3000/auth` - WRONG
✅ **Domain alag, Redirect URI alag** - Dono different hote hain

## Quick Reference:

| Field | Local | Production |
|-------|-------|-----------|
| JavaScript Origins | `http://localhost:3000` | `https://nextwavesmm.com` |
| Redirect URIs | `http://localhost:3000/auth/callback` | `https://nextwavesmm.com/auth/callback` |

## Agar Still Not Working:

1. **Save kara hai na?** - Double check karo Save button click kiya ho
2. **URL exactly match karo** - Typo check karo
3. **Wait 5 minutes** - Google ko time lagta hai update hone mein
4. **Browser cache clear karo** - Ctrl+Shift+Delete
5. **Naya tab mein test karo** - Incognito mode mein try karo

---

Ek baar ye complete kar dega to Google OAuth bilkul kaam karega! 🚀
