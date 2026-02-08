# 🔔 Real-Time Notification System - Complete Setup Guide

## Overview

A comprehensive real-time notification system has been implemented for NextWave SMM Panel. Users will receive instant notifications for all important events.

## Features Implemented ✅

### Notification Types
1. **Order Events**
   - Order placed
   - Order processing
   - Order completed
   - Order partial
   - Order canceled

2. **Ticket Events**
   - Ticket created
   - Admin replied to ticket
   - Ticket closed

3. **Financial Events**
   - Deposit approved
   - Deposit rejected
   - Referral earned

### Real-time Features
- ✅ Instant notifications via WebSocket
- ✅ Database triggers for automatic creation
- ✅ Persistent notification history
- ✅ Mark as read functionality
- ✅ Unread count badges
- ✅ Click to navigate to related items
- ✅ Mobile and desktop support

## Setup Instructions

### Step 1: Run Database Migration

Connect to your Supabase project and run the SQL file:

```bash
# File location: scripts/008_create_notifications_table.sql
```

This will create:
- `notifications` table
- Database triggers for automatic notifications
- Helper functions
- RLS policies for security
- Performance indexes

### Step 2: Verify Table Creation

Check that the table was created:

```sql
SELECT * FROM notifications LIMIT 1;
```

### Step 3: Test Notifications

After deployment, test each notification type:

1. **Test Order Notifications:**
   - Place a test order → Should get "Order Placed" notification
   - Admin changes order status → Should get status update notification

2. **Test Ticket Notifications:**
   - Create a support ticket → Should get "Ticket Created" notification
   - Admin replies to ticket → Should get "Admin Replied" notification

3. **Test Deposit Notifications:**
   - Submit deposit request
   - Admin approves → Should get "Deposit Approved" notification
   - Admin rejects → Should get "Deposit Rejected" notification

## How It Works

### Automatic Notification Creation

Notifications are created automatically using database triggers:

```sql
-- Example: When order status changes
UPDATE orders SET status = 'completed' WHERE id = 'xxx';
-- Trigger automatically creates notification for the user
```

### Real-time Updates

The system uses Supabase Realtime subscriptions:

1. User opens dashboard
2. WebSocket connection established
3. New notifications pushed instantly
4. UI updates automatically

### Notification Flow

```
Event Occurs (Order, Ticket, etc.)
    ↓
Database Trigger Fires
    ↓
Notification Created in DB
    ↓
Realtime Subscription Detects Change
    ↓
WebSocket Pushes to Client
    ↓
UI Updates Instantly
```

## User Interface

### Desktop Header
- Bell icon with unread count badge
- Dropdown showing recent 10 notifications
- Click notification to mark as read and navigate
- "View All Notifications" button

### Mobile Bottom Nav
- Notifications tab with badge
- Unread count indicator
- Direct access to all notifications

### Notifications Page
- Full list of all notifications
- Filter by read/unread
- Mark all as read button
- Pagination for large lists
- Click to navigate to related items

## Database Schema

### Notifications Table

```sql
CREATE TABLE notifications (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  link TEXT,
  read BOOLEAN DEFAULT false,
  related_order_id UUID,
  related_ticket_id UUID,
  related_transaction_id UUID,
  metadata JSONB,
  created_at TIMESTAMP
);
```

### Notification Types

- `order_placed`
- `order_processing`
- `order_completed`
- `order_partial`
- `order_canceled`
- `ticket_created`
- `ticket_replied`
- `ticket_closed`
- `deposit_approved`
- `deposit_rejected`
- `system_announcement`
- `referral_earned`

## API Functions

### Create Notification (Programmatic)

```sql
SELECT create_notification(
  user_id,
  'order_completed',
  'Order Completed',
  'Your order has been completed',
  '/dashboard/orders',
  order_id,
  NULL,
  NULL
);
```

### Mark as Read

```sql
SELECT mark_notification_read(notification_id);
```

### Mark All as Read

```sql
SELECT mark_all_notifications_read();
```

## Performance Optimization

### Indexes Created
- `user_id` - Fast user notification queries
- `user_id, read` - Fast unread count queries
- `created_at DESC` - Fast recent notifications
- `type` - Fast type filtering

### RLS Policies
- Users can only see their own notifications
- Users can update their own notifications
- Admins can create notifications for any user

## Security Features

1. **Row Level Security**
   - Users isolated to their own data
   - No cross-user data leakage

2. **Type Validation**
   - Only allowed notification types
   - Database constraint enforcement

3. **Audit Trail**
   - All notifications timestamped
   - Full history preserved
   - No automatic deletion

## Troubleshooting

### Notifications Not Appearing

1. **Check Database Migration**
   ```sql
   SELECT * FROM notifications LIMIT 1;
   ```

2. **Check RLS Policies**
   ```sql
   SELECT * FROM pg_policies WHERE tablename = 'notifications';
   ```

3. **Check Triggers**
   ```sql
   SELECT * FROM pg_trigger WHERE tgname LIKE '%notification%';
   ```

### Real-time Not Working

1. **Check Supabase Realtime**
   - Ensure Realtime is enabled for `notifications` table
   - Check Supabase dashboard → Database → Replication

2. **Check Browser Console**
   - Look for WebSocket connection errors
   - Check for subscription errors

### Unread Count Wrong

1. **Refresh Query**
   ```sql
   SELECT COUNT(*) FROM notifications 
   WHERE user_id = 'xxx' AND read = false;
   ```

2. **Check Subscription**
   - Ensure UPDATE events are subscribed
   - Check channel status in browser console

## Maintenance

### Cleaning Old Notifications

Optional: Create a cron job to clean old read notifications:

```sql
DELETE FROM notifications 
WHERE read = true 
  AND created_at < NOW() - INTERVAL '90 days';
```

### Monitoring

Check notification statistics:

```sql
-- Unread by user
SELECT user_id, COUNT(*) as unread
FROM notifications
WHERE read = false
GROUP BY user_id
ORDER BY unread DESC;

-- Notifications by type
SELECT type, COUNT(*) as total
FROM notifications
GROUP BY type
ORDER BY total DESC;

-- Recent activity
SELECT DATE(created_at) as date, COUNT(*) as total
FROM notifications
WHERE created_at > NOW() - INTERVAL '7 days'
GROUP BY DATE(created_at)
ORDER BY date DESC;
```

## Future Enhancements

Potential additions:
- Email notifications for important events
- Push notifications (web push)
- Notification preferences per user
- Notification categories/filters
- Bulk actions (delete, archive)
- Notification sounds
- Desktop notifications API

## Testing Checklist

- [ ] Run database migration
- [ ] Verify table created
- [ ] Place test order → Check notification
- [ ] Create test ticket → Check notification
- [ ] Admin reply to ticket → Check notification
- [ ] Submit deposit → Check notification
- [ ] Admin approve deposit → Check notification
- [ ] Click notification → Verify navigation
- [ ] Mark as read → Verify badge update
- [ ] Open notifications page → Verify all show
- [ ] Test on mobile → Verify mobile nav badge
- [ ] Test real-time → Open two browsers
- [ ] Check performance → Query speed

## Support

If issues persist:
1. Check Supabase logs
2. Check browser console
3. Verify migration ran successfully
4. Check RLS policies are active
5. Verify Realtime is enabled

## Summary

The notification system is:
- ✅ Fully automated (database triggers)
- ✅ Real-time (WebSocket subscriptions)
- ✅ Secure (RLS policies)
- ✅ Fast (indexed queries)
- ✅ Scalable (efficient design)
- ✅ User-friendly (intuitive UI)

All notifications are created automatically when events occur. No additional code changes needed to add new notifications - just insert into the table or call the helper function.
