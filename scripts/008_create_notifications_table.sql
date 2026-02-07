-- Create notifications table for real-time user notifications
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  type TEXT NOT NULL CHECK (type IN (
    'order_placed',
    'order_completed', 
    'order_canceled',
    'order_partial',
    'order_processing',
    'deposit_approved',
    'deposit_rejected',
    'ticket_created',
    'ticket_replied',
    'ticket_closed',
    'system_announcement',
    'referral_earned'
  )),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  link TEXT,
  read BOOLEAN DEFAULT false,
  related_order_id UUID REFERENCES orders(id) ON DELETE SET NULL,
  related_ticket_id UUID REFERENCES support_tickets(id) ON DELETE SET NULL,
  related_transaction_id UUID REFERENCES transactions(id) ON DELETE SET NULL,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_read ON notifications(user_id, read);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_type ON notifications(type);

-- Enable RLS
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- RLS Policies for notifications
-- Users can only see their own notifications
CREATE POLICY "Users can view their own notifications"
  ON notifications FOR SELECT
  USING (auth.uid() = user_id);

-- Users can update their own notifications (mark as read)
CREATE POLICY "Users can update their own notifications"
  ON notifications FOR UPDATE
  USING (auth.uid() = user_id);

-- Admins can insert notifications for any user
CREATE POLICY "Admins can insert notifications"
  ON notifications FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- System can insert notifications (for triggers)
CREATE POLICY "System can insert notifications"
  ON notifications FOR INSERT
  WITH CHECK (true);

-- Create function to create notification
CREATE OR REPLACE FUNCTION create_notification(
  p_user_id UUID,
  p_type TEXT,
  p_title TEXT,
  p_message TEXT,
  p_link TEXT DEFAULT NULL,
  p_related_order_id UUID DEFAULT NULL,
  p_related_ticket_id UUID DEFAULT NULL,
  p_related_transaction_id UUID DEFAULT NULL,
  p_metadata JSONB DEFAULT '{}'::jsonb
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_notification_id UUID;
BEGIN
  INSERT INTO notifications (
    user_id,
    type,
    title,
    message,
    link,
    related_order_id,
    related_ticket_id,
    related_transaction_id,
    metadata
  ) VALUES (
    p_user_id,
    p_type,
    p_title,
    p_message,
    p_link,
    p_related_order_id,
    p_related_ticket_id,
    p_related_transaction_id,
    p_metadata
  )
  RETURNING id INTO v_notification_id;
  
  RETURN v_notification_id;
END;
$$;

-- Create trigger function for order status changes
CREATE OR REPLACE FUNCTION notify_order_status_change()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_title TEXT;
  v_message TEXT;
  v_type TEXT;
BEGIN
  -- Only create notification if status actually changed
  IF OLD.status IS DISTINCT FROM NEW.status THEN
    
    -- Determine notification type and content based on status
    CASE NEW.status
      WHEN 'completed' THEN
        v_type := 'order_completed';
        v_title := 'Order Completed';
        v_message := 'Your order #' || NEW.id || ' has been completed successfully!';
      
      WHEN 'canceled' THEN
        v_type := 'order_canceled';
        v_title := 'Order Canceled';
        v_message := 'Your order #' || NEW.id || ' has been canceled.';
      
      WHEN 'partial' THEN
        v_type := 'order_partial';
        v_title := 'Order Partially Completed';
        v_message := 'Your order #' || NEW.id || ' has been partially completed.';
      
      WHEN 'processing' THEN
        v_type := 'order_processing';
        v_title := 'Order Processing';
        v_message := 'Your order #' || NEW.id || ' is now being processed.';
      
      ELSE
        -- Don't create notification for other statuses
        RETURN NEW;
    END CASE;
    
    -- Create the notification
    PERFORM create_notification(
      NEW.user_id,
      v_type,
      v_title,
      v_message,
      '/dashboard/orders',
      NEW.id,
      NULL,
      NULL,
      jsonb_build_object('order_id', NEW.id, 'status', NEW.status)
    );
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger for order status changes
DROP TRIGGER IF EXISTS trigger_order_status_notification ON orders;
CREATE TRIGGER trigger_order_status_notification
  AFTER UPDATE ON orders
  FOR EACH ROW
  EXECUTE FUNCTION notify_order_status_change();

-- Create trigger function for new orders
CREATE OR REPLACE FUNCTION notify_order_created()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Create notification for new order
  PERFORM create_notification(
    NEW.user_id,
    'order_placed',
    'Order Placed',
    'Your order #' || NEW.id || ' has been placed successfully and is being processed.',
    '/dashboard/orders',
    NEW.id,
    NULL,
    NULL,
    jsonb_build_object('order_id', NEW.id, 'quantity', NEW.quantity, 'price', NEW.price)
  );
  
  RETURN NEW;
END;
$$;

-- Create trigger for new orders
DROP TRIGGER IF EXISTS trigger_order_created_notification ON orders;
CREATE TRIGGER trigger_order_created_notification
  AFTER INSERT ON orders
  FOR EACH ROW
  EXECUTE FUNCTION notify_order_created();

-- Create trigger function for ticket replies
CREATE OR REPLACE FUNCTION notify_ticket_reply()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_ticket RECORD;
BEGIN
  -- Get ticket information
  SELECT * INTO v_ticket FROM support_tickets WHERE id = NEW.ticket_id;
  
  -- Only notify user if admin replied (not when user replies)
  IF NEW.is_admin = true AND v_ticket.user_id IS NOT NULL THEN
    PERFORM create_notification(
      v_ticket.user_id,
      'ticket_replied',
      'Admin Replied to Your Ticket',
      'Admin has replied to your support ticket: ' || v_ticket.subject,
      '/dashboard/tickets/' || v_ticket.id,
      NULL,
      v_ticket.id,
      NULL,
      jsonb_build_object('ticket_id', v_ticket.id)
    );
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger for ticket replies
DROP TRIGGER IF EXISTS trigger_ticket_reply_notification ON ticket_messages;
CREATE TRIGGER trigger_ticket_reply_notification
  AFTER INSERT ON ticket_messages
  FOR EACH ROW
  EXECUTE FUNCTION notify_ticket_reply();

-- Create trigger function for deposit approval
CREATE OR REPLACE FUNCTION notify_deposit_status()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_title TEXT;
  v_message TEXT;
  v_type TEXT;
BEGIN
  -- Only create notification if status actually changed
  IF OLD.status IS DISTINCT FROM NEW.status THEN
    
    CASE NEW.status
      WHEN 'approved' THEN
        v_type := 'deposit_approved';
        v_title := 'Deposit Approved';
        v_message := 'Your deposit of $' || NEW.amount || ' has been approved and added to your balance!';
      
      WHEN 'rejected' THEN
        v_type := 'deposit_rejected';
        v_title := 'Deposit Rejected';
        v_message := 'Your deposit of $' || NEW.amount || ' has been rejected. ' || 
                    COALESCE('Reason: ' || NEW.admin_notes, 'Please contact support for more information.');
      
      ELSE
        -- Don't create notification for other statuses
        RETURN NEW;
    END CASE;
    
    -- Create the notification
    PERFORM create_notification(
      NEW.user_id,
      v_type,
      v_title,
      v_message,
      '/dashboard/wallet',
      NULL,
      NULL,
      NEW.transaction_id,
      jsonb_build_object('amount', NEW.amount, 'status', NEW.status)
    );
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger for deposit status changes
DROP TRIGGER IF EXISTS trigger_deposit_status_notification ON crypto_deposits;
CREATE TRIGGER trigger_deposit_status_notification
  AFTER UPDATE ON crypto_deposits
  FOR EACH ROW
  EXECUTE FUNCTION notify_deposit_status();

-- Create trigger function for new ticket
CREATE OR REPLACE FUNCTION notify_ticket_created()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Create notification for new ticket
  PERFORM create_notification(
    NEW.user_id,
    'ticket_created',
    'Support Ticket Created',
    'Your support ticket "' || NEW.subject || '" has been created. We will respond shortly.',
    '/dashboard/tickets/' || NEW.id,
    NULL,
    NEW.id,
    NULL,
    jsonb_build_object('ticket_id', NEW.id, 'subject', NEW.subject)
  );
  
  RETURN NEW;
END;
$$;

-- Create trigger for new tickets
DROP TRIGGER IF EXISTS trigger_ticket_created_notification ON support_tickets;
CREATE TRIGGER trigger_ticket_created_notification
  AFTER INSERT ON support_tickets
  FOR EACH ROW
  EXECUTE FUNCTION notify_ticket_created();

-- Create function to mark notification as read
CREATE OR REPLACE FUNCTION mark_notification_read(p_notification_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE notifications
  SET read = true
  WHERE id = p_notification_id
    AND user_id = auth.uid();
  
  RETURN FOUND;
END;
$$;

-- Create function to mark all notifications as read
CREATE OR REPLACE FUNCTION mark_all_notifications_read()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_count INTEGER;
BEGIN
  UPDATE notifications
  SET read = true
  WHERE user_id = auth.uid()
    AND read = false;
  
  GET DIAGNOSTICS v_count = ROW_COUNT;
  RETURN v_count;
END;
$$;
