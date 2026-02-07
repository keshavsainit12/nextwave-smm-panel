# 🔧 Resend Email Configuration Guide

## आपका Email Test Fail क्यों हो रहा है?

जब आप `/api/test-email` call करते हैं और यह error आता है:
```json
{
  "success": false,
  "message": "Failed to send test email",
  "error": {}
}
```

**कारण:** RESEND_API_KEY environment variable set नहीं है।

---

## ✅ Solution: Email कहाँ Add करें?

### Step 1: Vercel Dashboard खोलें

1. जाओ: https://vercel.com
2. अपना project खोलें: `nextwave-smm-panel`
3. Click करें: **Settings** (top navigation)

### Step 2: Environment Variables में जाओ

1. Left sidebar में scroll करें
2. Click करें: **Environment Variables**
3. यहाँ आपको सारे environment variables दिखेंगे

### Step 3: नया Variable Add करें

1. **Key** field में डालें:
   ```
   RESEND_API_KEY
   ```

2. **Value** field में डालें:
   ```
   re_MsciK1E1_AzghPuCc8R8tE3vznMjp2nLv
   ```

3. **Environment** select करें:
   - ✅ Production
   - ✅ Preview
   - ✅ Development

4. Click करें: **Save**

### Step 4: Deployment को Restart करें

Option A - Automatic (Recommended):
1. Variables save करने के बाद
2. Vercel automatically redeploy करेगा
3. Wait करें 2-3 minutes

Option B - Manual:
1. अपने project के **Deployments** tab में जाएं
2. Latest deployment के dots (...) पर click करें
3. Select करें: **Redeploy**
4. Click करें: **Redeploy**

---

## 🧪 Testing: Email Test कैसे करें?

### Method 1: Browser में
```
https://yourdomain.com/api/test-email
```
Browser में यह URL खोलें।

### Method 2: Command Line से
```bash
curl https://yourdomain.com/api/test-email
```

### सफल होने पर (Success):
```json
{
  "success": true,
  "message": "Test email sent successfully! Check keshavsainit1@gmail.com inbox.",
  "recipient": "keshavsainit1@gmail.com",
  "emailId": "abc123xyz"
}
```

### फिर भी Fail हो रहा है?

Check करें:
1. API key correctly copy किया है?
2. Spaces या extra characters नहीं हैं?
3. Deployment restart हो गया है?
4. 2-3 minutes wait किया?

---

## 📧 Email Configuration Details

### Resend Account Information:
- **Dashboard:** https://resend.com/login
- **API Key:** `re_MsciK1E1_AzghPuCc8R8tE3vznMjp2nLv`

### Current Settings:
- **From Email:** `NextWave SMM Panel <noreply@yourdomain.com>`
- **Test Email To:** `keshavsainit1@gmail.com`

### Free Plan Limits:
- 100 emails/day
- 3,000 emails/month
- ✅ Enough for testing

---

## 🔍 Troubleshooting

### Error: "RESEND_API_KEY is undefined"
**Solution:** Environment variable add नहीं किया है। ऊपर के steps follow करें।

### Error: "API key is invalid"
**Solution:** 
1. Check करें API key correctly copy किया है
2. Spaces नहीं होना चाहिए starting या ending में
3. Try करें: Key को copy करके फिर से paste करें

### Email नहीं आ रहा है inbox में?
**Check करें:**
1. Spam folder देखें
2. keshavsainit1@gmail.com correct है?
3. 1-2 minutes wait करें
4. Resend dashboard में check करें: https://resend.com/emails

### "Failed to send" but API key is set
**Possible Reasons:**
1. Sender email (`noreply@yourdomain.com`) verify नहीं है
2. Daily limit (100 emails) exceed हो गया
3. Resend account में कोई issue है

**Solution:**
- Resend dashboard में login करके check करें
- Sender domain verify करें (optional for testing)
- Check करें email sending logs

---

## 🎯 Quick Checklist

Environment Variable Setup:
- [ ] Vercel dashboard खोला
- [ ] Settings → Environment Variables गया
- [ ] RESEND_API_KEY add किया
- [ ] Value: `re_MsciK1E1_AzghPuCc8R8tE3vznMjp2nLv`
- [ ] All environments select किया (Production, Preview, Development)
- [ ] Save किया
- [ ] Deployment restart हुआ
- [ ] 2-3 minutes wait किया
- [ ] `/api/test-email` test किया
- [ ] keshavsainit1@gmail.com में email check किया

---

## 📞 Still Having Issues?

अगर फिर भी problem है:

1. **Screenshot लें:**
   - Vercel environment variables page का
   - Test email error response का
   - Resend dashboard logs का

2. **Check करें Vercel Logs:**
   - Go to: Deployments → Latest → Runtime Logs
   - देखें कोई RESEND related error है?

3. **Verify API Key:**
   - Login करें: https://resend.com/login
   - Check करें API key still valid है

---

## ✅ Summary

**EMAIL KAHA DALNI HAI?**

➡️ **Vercel Dashboard → Settings → Environment Variables**

**Key:** `RESEND_API_KEY`  
**Value:** `re_MsciK1E1_AzghPuCc8R8tE3vznMjp2nLv`

फिर deployment restart करें और test करें! 🚀
