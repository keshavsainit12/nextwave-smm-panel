# SQL Migration Guide - Notifications Table

## Problem Encountered

User reported this error when trying to run the SQL migration:

```
ERROR: 42601: syntax error at or near "notifications"
LINE 1: Create notifications table for real-time user notifications
```

## Root Cause

The error message suggests the SQL was copied **incorrectly** or only the **comment line** was executed.

The SQL file `scripts/008_create_notifications_table.sql` is **CORRECT** and has proper syntax.

## ✅ Correct SQL File

The file starts with:
```sql
-- Create notifications table for real-time user notifications
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  ...
);
```

**This is correct!** The `--` is the proper SQL comment syntax.

## How to Run the Migration

### Option 1: Via Supabase Dashboard (Recommended)

1. **Open Supabase Dashboard:**
   ```
   https://app.supabase.com/project/hhtvvlzsjamprvxeayxm
   ```

2. **Go to SQL Editor:**
   - Click "SQL Editor" in left sidebar
   - Or go to: https://app.supabase.com/project/hhtvvlzsjamprvxeayxm/sql

3. **Create New Query:**
   - Click "+ New query" button

4. **Copy ENTIRE File:**
   - Open `scripts/008_create_notifications_table.sql`
   - Select ALL (Ctrl+A / Cmd+A)
   - Copy (Ctrl+C / Cmd+C)

5. **Paste in SQL Editor:**
   - Paste the ENTIRE content
   - Make sure you got ALL 367 lines

6. **Run Query:**
   - Click "Run" button (or Ctrl+Enter)
   - Wait for success message

7. **Verify:**
   ```sql
   SELECT COUNT(*) FROM notifications;
   ```
   Should return `0` (table exists but empty)

### Option 2: Via Supabase CLI

```bash
# If you have Supabase CLI installed
supabase db execute --file scripts/008_create_notifications_table.sql
```

### Option 3: Via psql

```bash
# Connect to your database
psql "postgresql://postgres:[YOUR-PASSWORD]@db.hhtvvlzsjamprvxeayxm.supabase.co:5432/postgres"

# Run the migration
\i scripts/008_create_notifications_table.sql
```

## Common Mistakes to Avoid

### ❌ Wrong: Running Only First Line

```sql
-- Create notifications table for real-time user notifications
```

This is just a comment! Nothing happens.

### ❌ Wrong: Missing Parts of SQL

If you only copy part of the file, it will fail.

### ✅ Correct: Copy Entire File

Copy ALL 367 lines from:
```sql
-- Create notifications table for real-time user notifications
```

To:
```sql
$$;
```

## What This Migration Does

### 1. Creates Notifications Table

Stores all user notifications with:
- Order updates
- Ticket replies
- Deposit confirmations
- System announcements

### 2. Sets Up Indexes

For fast queries:
- User ID index
- Read/unread status
- Created date
- Notification type

### 3. Enables Row Level Security (RLS)

Users can only see their own notifications.

### 4. Creates Database Triggers

Automatic notifications for:
- **Order placed** - When user creates order
- **Order status change** - Processing, completed, partial, canceled
- **Ticket created** - When user opens ticket
- **Admin reply** - When admin responds to ticket
- **Deposit approved** - When admin approves deposit
- **Deposit rejected** - When admin rejects deposit

### 5. Helper Functions

- `create_notification()` - Create notification manually
- `mark_notification_read()` - Mark one as read
- `mark_all_notifications_read()` - Mark all as read

## Verification Steps

### Check Table Exists

```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name = 'notifications';
```

Should return: `notifications`

### Check Triggers Exist

```sql
SELECT trigger_name, event_object_table
FROM information_schema.triggers
WHERE event_object_table IN ('orders', 'support_tickets', 'ticket_messages', 'crypto_deposits')
ORDER BY event_object_table, trigger_name;
```

Should return 5 triggers:
- `trigger_deposit_status_notification` on `crypto_deposits`
- `trigger_order_created_notification` on `orders`
- `trigger_order_status_notification` on `orders`
- `trigger_ticket_created_notification` on `support_tickets`
- `trigger_ticket_reply_notification` on `ticket_messages`

### Check Functions Exist

```sql
SELECT routine_name 
FROM information_schema.routines 
WHERE routine_schema = 'public'
  AND routine_name LIKE '%notification%'
ORDER BY routine_name;
```

Should return:
- `create_notification`
- `mark_all_notifications_read`
- `mark_notification_read`
- `notify_deposit_status`
- `notify_order_created`
- `notify_order_status_change`
- `notify_ticket_created`
- `notify_ticket_reply`

### Test Creating Notification

```sql
-- Create a test notification
SELECT create_notification(
  auth.uid(),                    -- Your user ID
  'system_announcement',         -- Type
  'Test Notification',           -- Title
  'This is a test notification', -- Message
  '/dashboard'                   -- Link
);

-- Check if created
SELECT * FROM notifications 
WHERE user_id = auth.uid()
ORDER BY created_at DESC 
LIMIT 5;
```

## Enable Realtime (Required!)

After running the migration, you MUST enable Realtime:

1. Go to: https://app.supabase.com/project/hhtvvlzsjamprvxeayxm/database/replication

2. Find `notifications` table

3. Toggle ON the switch

4. Save changes

This allows real-time updates in the app!

## Troubleshooting

### Error: "relation already exists"

**Cause:** Table already created
**Solution:** Table exists, you're good! Skip this migration.

### Error: "syntax error at or near..."

**Cause:** Incomplete SQL copied
**Solution:** Copy ENTIRE file, all 367 lines

### Error: "function already exists"

**Cause:** Function already created
**Solution:** The migration uses `CREATE OR REPLACE FUNCTION`, should work. If not, drop functions first:

```sql
DROP FUNCTION IF EXISTS create_notification CASCADE;
DROP FUNCTION IF EXISTS mark_notification_read CASCADE;
DROP FUNCTION IF EXISTS mark_all_notifications_read CASCADE;
DROP FUNCTION IF EXISTS notify_order_status_change CASCADE;
DROP FUNCTION IF EXISTS notify_order_created CASCADE;
DROP FUNCTION IF EXISTS notify_ticket_reply CASCADE;
DROP FUNCTION IF EXISTS notify_deposit_status CASCADE;
DROP FUNCTION IF EXISTS notify_ticket_created CASCADE;
```

Then run migration again.

### Notifications Not Appearing

1. **Check table exists:**
   ```sql
   SELECT * FROM notifications LIMIT 1;
   ```

2. **Check triggers exist:**
   ```sql
   SELECT * FROM information_schema.triggers 
   WHERE event_object_table = 'orders';
   ```

3. **Check Realtime enabled:**
   - Dashboard → Database → Replication
   - `notifications` should have toggle ON

4. **Test manually:**
   ```sql
   -- Place a test order (if you have services)
   -- Or create notification manually:
   SELECT create_notification(
     auth.uid(),
     'system_announcement',
     'Test',
     'Testing notifications',
     '/dashboard'
   );
   ```

## Summary

✅ **SQL file is correct** - No syntax errors
✅ **Copy entire file** - All 367 lines
✅ **Run in Supabase SQL Editor** - Easiest method
✅ **Enable Realtime** - Required for live updates
✅ **Verify with test query** - Check it works

After running successfully, notifications will work automatically! 🎉
