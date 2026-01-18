# NextWave Panel - Complete Setup Guide

## Prerequisites
- Supabase account (free tier works)
- Vercel account (for deployment)

## Step 1: Supabase Setup

### 1.1 Create Supabase Project
1. Go to https://supabase.com
2. Create new project
3. Choose project name: `nextwavepanel`
4. Set database password (save it!)
5. Wait for project to initialize (2-3 minutes)

### 1.2 Run SQL Scripts (CRITICAL - Must do in order!)

Open SQL Editor in Supabase dashboard and run these scripts in order:

**Script 1: Create Tables**
\`\`\`
Copy all content from: scripts/001_create_tables.sql
Paste in SQL Editor
Click "Run"
\`\`\`

**Script 2: Create RLS Policies**
\`\`\`
Copy all content from: scripts/002_create_rls_policies.sql
Paste in SQL Editor
Click "Run"
\`\`\`

**Script 3: Create Functions & Triggers**
\`\`\`
Copy all content from: scripts/003_create_functions.sql
Paste in SQL Editor
Click "Run"
\`\`\`

### 1.3 Verify Database Setup

In Supabase dashboard, go to Table Editor and verify these tables exist:
- users
- crypto_currencies
- api_providers
- services
- orders
- transactions
- crypto_deposits
- support_tickets
- coupons
- referral_earnings
- system_settings

### 1.4 Create First Admin User

After running all scripts, you need to create your first admin user.

**Method 1: Manual (Recommended for first admin)**
1. Sign up normally through the app
2. Go to Supabase → Authentication → Users
3. Find your user
4. Copy the User ID
5. Go to SQL Editor and run:
\`\`\`sql
UPDATE users SET role = 'admin' WHERE id = 'YOUR_USER_ID_HERE';
\`\`\`

**Method 2: Direct SQL Insert**
\`\`\`sql
-- First, create auth user (replace with your details)
-- This must be done in the Supabase dashboard under Authentication → Users → Add User
-- Email: admin@yourdomain.com
-- Password: (set a secure password)

-- Then, after user is created, update their role:
UPDATE users SET role = 'admin' WHERE email = 'admin@yourdomain.com';
\`\`\`

## Step 2: Get Supabase Credentials

From your Supabase project:
1. Go to Project Settings → API
2. Copy these values:
   - **Project URL** (e.g., https://xxxxx.supabase.co)
   - **anon public** key
   - **service_role** key (keep this secret!)

## Step 3: Environment Variables

Set these in v0 (Vars section) or Vercel:

\`\`\`
NEXT_PUBLIC_SUPABASE_URL=your_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
ADMIN_SECRET_PATH=admin-nx-wave-secure
NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL=http://localhost:3000/dashboard
\`\`\`

## Step 4: Initial Configuration

### 4.1 Add Crypto Currencies
1. Login as admin
2. Go to: yourdomain.com/admin-nx-wave-secure/crypto
3. Click "Add Crypto Currency"
4. Add Bitcoin, USDT, etc. with your wallet addresses

### 4.2 Add API Providers (Optional)
1. Go to: /admin-nx-wave-secure/api-providers
2. Add your external SMM API provider
3. Enter API URL and API Key
4. Test connection

### 4.3 Add Services
1. Go to: /admin-nx-wave-secure/services
2. Option A: Click "Sync from API" (if you added provider)
3. Option B: Manually add services

### 4.4 Configure Settings
1. Go to: /admin-nx-wave-secure/settings
2. Set:
   - Referral commission %
   - Minimum deposit amount
   - Currency symbol

## Step 5: Testing

### Test User Flow:
1. Sign up new user
2. Login
3. Try to add balance (crypto deposit)
4. Place a test order
5. Create support ticket

### Test Admin Flow:
1. Login as admin
2. Go to admin panel (secret URL)
3. Approve deposit
4. View orders
5. Reply to ticket

## Common Issues & Fixes

### Error: "Database error saving new user"
**Fix:** You didn't run the SQL scripts! Go to Step 1.2

### Error: "Invalid API key"
**Fix:** Check environment variables are set correctly

### Admin panel not loading
**Fix:** Make sure ADMIN_SECRET_PATH is set and you're using correct URL

### Cannot login after signup
**Fix:** Check email for verification link (check spam folder)

### Orders not processing
**Fix:** Make sure API provider is added and active

## Deployment to Vercel

1. Push code to GitHub
2. Import to Vercel
3. Set environment variables in Vercel
4. Deploy
5. Add custom domain (optional)

## Security Checklist

✅ All SQL scripts run
✅ RLS policies enabled
✅ Service role key kept secret
✅ Admin secret path is secret
✅ Strong passwords for admin accounts
✅ Email verification enabled

## Default Admin Paths

Admin panel URL: `yourdomain.com/admin-nx-wave-secure`

Change this by updating ADMIN_SECRET_PATH environment variable.

## Support

If you encounter issues:
1. Check Supabase logs
2. Check browser console for errors
3. Verify all SQL scripts ran successfully
4. Ensure environment variables are correct
