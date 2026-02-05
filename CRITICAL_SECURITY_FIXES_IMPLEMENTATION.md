# Critical Security Fixes Implementation Guide

## Overview
This document provides safe, tested implementations for the 4 critical security issues:
1. Webhook replay protection
2. Atomic balance updates
3. Atomic refunds
4. Order deduplication

## ⚠️ IMPORTANT: READ BEFORE IMPLEMENTING

These fixes involve critical financial operations. Follow these steps:
1. Test on staging environment first
2. Back up database before deployment
3. Implement one fix at a time
4. Monitor logs after each deployment
5. Have rollback plan ready

---

## Fix 1: Webhook Replay Protection

### Problem
- Webhooks can be replayed to credit balance multiple times
- No tracking of processed webhooks
- No timestamp validation

### Solution: Add processed webhooks tracking

#### Step 1: Create Database Migration

```sql
-- File: scripts/009_webhook_replay_protection.sql

-- Create processed webhooks table
CREATE TABLE IF NOT EXISTS processed_webhooks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  webhook_id TEXT NOT NULL UNIQUE,
  transaction_id UUID REFERENCES transactions(id),
  signature TEXT NOT NULL,
  payload JSONB NOT NULL,
  processed_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for faster lookups
CREATE INDEX idx_processed_webhooks_webhook_id ON processed_webhooks(webhook_id);
CREATE INDEX idx_processed_webhooks_processed_at ON processed_webhooks(processed_at);

-- RLS policies
ALTER TABLE processed_webhooks ENABLE ROW LEVEL SECURITY;

-- Only backend can access
CREATE POLICY "Service role can manage processed webhooks"
  ON processed_webhooks
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Function to clean old webhook records (keep 30 days)
CREATE OR REPLACE FUNCTION cleanup_old_webhooks()
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  DELETE FROM processed_webhooks 
  WHERE processed_at < NOW() - INTERVAL '30 days';
END;
$$;

-- Optional: Create a cron job to clean old webhooks
-- (Requires pg_cron extension)
-- SELECT cron.schedule('cleanup-old-webhooks', '0 2 * * *', 'SELECT cleanup_old_webhooks()');
```

#### Step 2: Update Webhook Handler

Add to: `app/api/webhooks/instant-payment/route.ts`

```typescript
// Add at the top with imports
interface ProcessedWebhook {
  id: string;
  webhook_id: string;
  transaction_id: string | null;
  signature: string;
  payload: any;
  processed_at: string;
}

// Add this function before POST handler
async function checkAndRecordWebhook(
  webhookId: string,
  transactionId: string,
  signature: string,
  payload: any
): Promise<boolean> {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  // Check if webhook already processed
  const { data: existing } = await supabase
    .from("processed_webhooks")
    .select("id")
    .eq("webhook_id", webhookId)
    .single();

  if (existing) {
    console.log("[Webhook] Already processed:", webhookId);
    return false; // Already processed
  }

  // Record webhook as processed
  const { error } = await supabase
    .from("processed_webhooks")
    .insert({
      webhook_id: webhookId,
      transaction_id: transactionId,
      signature: signature,
      payload: payload,
    });

  if (error) {
    console.error("[Webhook] Failed to record:", error);
    throw error;
  }

  return true; // New webhook
}

// Modify POST handler to include this check
export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // Verify signature (existing code)
    const signature = request.headers.get("x-accountpe-signature");
    if (!verifySignature(body, signature)) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }

    // Generate unique webhook ID from transaction data
    const webhookId = `${body.transactionId}_${body.status}_${body.timestamp || Date.now()}`;
    
    // Check if webhook already processed
    const isNew = await checkAndRecordWebhook(
      webhookId,
      body.transactionId,
      signature || "",
      body
    );

    if (!isNew) {
      console.log("[Webhook] Duplicate webhook detected, ignoring");
      return NextResponse.json({ 
        status: "already_processed",
        message: "Webhook already processed" 
      }, { status: 200 });
    }

    // Continue with existing webhook processing...
    // (rest of existing code)
  } catch (error) {
    console.error("[Webhook] Error:", error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
```

---

## Fix 2: Atomic Balance Updates

### Problem
- Balance updates are not atomic
- Race conditions in concurrent operations
- Can lose money in simultaneous transactions

### Solution: Use database-level atomic operations

#### Step 1: Create Database Functions

```sql
-- File: scripts/010_atomic_balance_operations.sql

-- Function to atomically update user balance
CREATE OR REPLACE FUNCTION atomic_update_balance(
  p_user_id UUID,
  p_amount DECIMAL(10,2),
  p_operation TEXT, -- 'add' or 'deduct'
  p_transaction_id UUID DEFAULT NULL,
  p_description TEXT DEFAULT NULL
)
RETURNS TABLE(
  success BOOLEAN,
  new_balance DECIMAL(10,2),
  error_message TEXT
)
LANGUAGE plpgsql
AS $$
DECLARE
  v_current_balance DECIMAL(10,2);
  v_new_balance DECIMAL(10,2);
BEGIN
  -- Lock the user row for update
  SELECT balance INTO v_current_balance
  FROM users
  WHERE id = p_user_id
  FOR UPDATE;

  -- Calculate new balance
  IF p_operation = 'add' THEN
    v_new_balance := v_current_balance + p_amount;
  ELSIF p_operation = 'deduct' THEN
    -- Check if sufficient balance
    IF v_current_balance < p_amount THEN
      RETURN QUERY SELECT FALSE, v_current_balance, 'Insufficient balance';
      RETURN;
    END IF;
    v_new_balance := v_current_balance - p_amount;
  ELSE
    RETURN QUERY SELECT FALSE, v_current_balance, 'Invalid operation';
    RETURN;
  END IF;

  -- Prevent negative balance
  IF v_new_balance < 0 THEN
    RETURN QUERY SELECT FALSE, v_current_balance, 'Operation would result in negative balance';
    RETURN;
  END IF;

  -- Update balance
  UPDATE users
  SET 
    balance = v_new_balance,
    updated_at = NOW()
  WHERE id = p_user_id;

  -- Log balance change
  INSERT INTO balance_logs (
    user_id,
    amount,
    operation,
    old_balance,
    new_balance,
    transaction_id,
    description,
    created_at
  ) VALUES (
    p_user_id,
    p_amount,
    p_operation,
    v_current_balance,
    v_new_balance,
    p_transaction_id,
    p_description,
    NOW()
  );

  RETURN QUERY SELECT TRUE, v_new_balance, NULL::TEXT;
END;
$$;

-- Create balance_logs table if not exists
CREATE TABLE IF NOT EXISTS balance_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  amount DECIMAL(10,2) NOT NULL,
  operation TEXT NOT NULL CHECK (operation IN ('add', 'deduct')),
  old_balance DECIMAL(10,2) NOT NULL,
  new_balance DECIMAL(10,2) NOT NULL,
  transaction_id UUID REFERENCES transactions(id),
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_balance_logs_user_id ON balance_logs(user_id);
CREATE INDEX idx_balance_logs_created_at ON balance_logs(created_at);

-- RLS policies for balance_logs
ALTER TABLE balance_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own balance logs"
  ON balance_logs
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Service role can manage balance logs"
  ON balance_logs
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);
```

#### Step 2: Update Balance Operations

Create helper function: `lib/balance-operations.ts`

```typescript
import { createClient } from "@/lib/supabase/server";

export async function atomicUpdateBalance(
  userId: string,
  amount: number,
  operation: "add" | "deduct",
  transactionId?: string,
  description?: string
): Promise<{
  success: boolean;
  newBalance?: number;
  errorMessage?: string;
}> {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  try {
    const { data, error } = await supabase.rpc("atomic_update_balance", {
      p_user_id: userId,
      p_amount: amount,
      p_operation: operation,
      p_transaction_id: transactionId || null,
      p_description: description || null,
    });

    if (error) {
      console.error("[Balance] Atomic update error:", error);
      return {
        success: false,
        errorMessage: error.message,
      };
    }

    if (!data || data.length === 0) {
      return {
        success: false,
        errorMessage: "No data returned from balance update",
      };
    }

    const result = data[0];
    return {
      success: result.success,
      newBalance: result.new_balance,
      errorMessage: result.error_message,
    };
  } catch (error: any) {
    console.error("[Balance] Atomic update exception:", error);
    return {
      success: false,
      errorMessage: error.message || "Unknown error",
    };
  }
}
```

#### Step 3: Replace Balance Updates in Webhook

Update `app/api/webhooks/instant-payment/route.ts`:

```typescript
import { atomicUpdateBalance } from "@/lib/balance-operations";

// In the webhook handler, replace the balance update:

// OLD CODE (NON-ATOMIC):
// const { error: balanceError } = await supabase
//   .from("users")
//   .update({ balance: (userData.balance || 0) + amountUSD })
//   .eq("id", transaction.user_id);

// NEW CODE (ATOMIC):
const balanceResult = await atomicUpdateBalance(
  transaction.user_id,
  amountUSD,
  "add",
  transaction.id,
  `Instant payment deposit - Transaction ${transaction.id}`
);

if (!balanceResult.success) {
  console.error("[Webhook] Failed to update balance:", balanceResult.errorMessage);
  await logActivity(transaction.user_id, "deposit_balance_update_failed", {
    transaction_id: transaction.id,
    error: balanceResult.errorMessage,
  });
  return NextResponse.json(
    { error: "Failed to update balance" },
    { status: 500 }
  );
}

console.log("[Webhook] Balance updated atomically:", balanceResult.newBalance);
```

---

## Fix 3: Atomic Refunds

### Problem
- Refund operations not atomic
- Order can be active while balance refunded
- Money lost in edge cases

### Solution: Create atomic refund function

#### Step 1: Database Function

Add to: `scripts/010_atomic_balance_operations.sql`

```sql
-- Atomic refund function
CREATE OR REPLACE FUNCTION atomic_refund_order(
  p_order_id UUID,
  p_refund_amount DECIMAL(10,2),
  p_reason TEXT DEFAULT NULL
)
RETURNS TABLE(
  success BOOLEAN,
  new_balance DECIMAL(10,2),
  error_message TEXT
)
LANGUAGE plpgsql
AS $$
DECLARE
  v_user_id UUID;
  v_order_status TEXT;
  v_current_balance DECIMAL(10,2);
  v_new_balance DECIMAL(10,2);
BEGIN
  -- Lock order and get details
  SELECT user_id, status INTO v_user_id, v_order_status
  FROM orders
  WHERE id = p_order_id
  FOR UPDATE;

  -- Check if order exists
  IF v_user_id IS NULL THEN
    RETURN QUERY SELECT FALSE, 0::DECIMAL(10,2), 'Order not found';
    RETURN;
  END IF;

  -- Check if already refunded
  IF v_order_status = 'refunded' THEN
    RETURN QUERY SELECT FALSE, 0::DECIMAL(10,2), 'Order already refunded';
    RETURN;
  END IF;

  -- Lock user balance
  SELECT balance INTO v_current_balance
  FROM users
  WHERE id = v_user_id
  FOR UPDATE;

  -- Calculate new balance
  v_new_balance := v_current_balance + p_refund_amount;

  -- Update order status
  UPDATE orders
  SET 
    status = 'refunded',
    refund_amount = p_refund_amount,
    refund_reason = p_reason,
    refunded_at = NOW(),
    updated_at = NOW()
  WHERE id = p_order_id;

  -- Update user balance
  UPDATE users
  SET 
    balance = v_new_balance,
    updated_at = NOW()
  WHERE id = v_user_id;

  -- Log balance change
  INSERT INTO balance_logs (
    user_id,
    amount,
    operation,
    old_balance,
    new_balance,
    description
  ) VALUES (
    v_user_id,
    p_refund_amount,
    'add',
    v_current_balance,
    v_new_balance,
    'Order refund - Order ID: ' || p_order_id::TEXT || COALESCE(' - Reason: ' || p_reason, '')
  );

  RETURN QUERY SELECT TRUE, v_new_balance, NULL::TEXT;
END;
$$;
```

#### Step 2: Create Refund Helper

Create: `lib/refund-operations.ts`

```typescript
import { createClient } from "@/lib/supabase/server";

export async function atomicRefundOrder(
  orderId: string,
  refundAmount: number,
  reason?: string
): Promise<{
  success: boolean;
  newBalance?: number;
  errorMessage?: string;
}> {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  try {
    const { data, error } = await supabase.rpc("atomic_refund_order", {
      p_order_id: orderId,
      p_refund_amount: refundAmount,
      p_reason: reason || null,
    });

    if (error) {
      console.error("[Refund] Atomic refund error:", error);
      return {
        success: false,
        errorMessage: error.message,
      };
    }

    if (!data || data.length === 0) {
      return {
        success: false,
        errorMessage: "No data returned from refund",
      };
    }

    const result = data[0];
    return {
      success: result.success,
      newBalance: result.new_balance,
      errorMessage: result.error_message,
    };
  } catch (error: any) {
    console.error("[Refund] Atomic refund exception:", error);
    return {
      success: false,
      errorMessage: error.message || "Unknown error",
    };
  }
}
```

#### Step 3: Use in Order Actions

Update any refund operations to use the atomic function:

```typescript
import { atomicRefundOrder } from "@/lib/refund-operations";

// Replace any refund code with:
const refundResult = await atomicRefundOrder(
  orderId,
  refundAmount,
  "Order cancelled by user"
);

if (!refundResult.success) {
  console.error("[Order] Refund failed:", refundResult.errorMessage);
  throw new Error(refundResult.errorMessage || "Refund failed");
}

console.log("[Order] Refund successful, new balance:", refundResult.newBalance);
```

---

## Fix 4: Order Deduplication

### Problem
- Double-click creates duplicate orders
- No idempotency key
- User charged multiple times

### Solution: Add idempotency key to order creation

#### Step 1: Update Orders Table

```sql
-- File: scripts/011_order_deduplication.sql

-- Add idempotency key to orders table
ALTER TABLE orders ADD COLUMN IF NOT EXISTS idempotency_key TEXT;

-- Create unique index to prevent duplicates
CREATE UNIQUE INDEX IF NOT EXISTS idx_orders_idempotency_key 
  ON orders(user_id, idempotency_key) 
  WHERE idempotency_key IS NOT NULL;

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_orders_user_idempotency 
  ON orders(user_id, idempotency_key);
```

#### Step 2: Update Order Creation Action

Update: `app/actions/orders.ts`

```typescript
// Add at the top
import { v4 as uuidv4 } from 'uuid';

// Modify createOrder function
export async function createOrder(formData: FormData) {
  const supabase = await createClient();

  try {
    // Get form data
    const serviceId = formData.get("serviceId") as string;
    const link = formData.get("link") as string;
    const quantity = parseInt(formData.get("quantity") as string);
    
    // Generate idempotency key from request data
    // This ensures same request = same key
    const idempotencyKey = formData.get("idempotencyKey") as string || 
      `${serviceId}_${link}_${quantity}_${Date.now()}`;

    // Check for existing order with same idempotency key
    const { data: existingOrder } = await supabase
      .from("orders")
      .select("id, status, created_at")
      .eq("user_id", user.id)
      .eq("idempotency_key", idempotencyKey)
      .single();

    if (existingOrder) {
      // Check if order is recent (within 5 minutes)
      const orderAge = Date.now() - new Date(existingOrder.created_at).getTime();
      if (orderAge < 5 * 60 * 1000) { // 5 minutes
        console.log("[Order] Duplicate order detected, returning existing:", existingOrder.id);
        return {
          success: true,
          orderId: existingOrder.id,
          message: "Order already exists",
          duplicate: true,
        };
      }
    }

    // Create order with idempotency key
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .insert({
        user_id: user.id,
        service_id: serviceId,
        link: link,
        quantity: quantity,
        price: totalPrice,
        status: "pending",
        idempotency_key: idempotencyKey,
        // ... other fields
      })
      .select()
      .single();

    if (orderError) {
      // Check if it's a duplicate key error
      if (orderError.code === "23505") { // Unique constraint violation
        console.log("[Order] Duplicate detected via unique constraint");
        // Fetch the existing order
        const { data: existingOrder } = await supabase
          .from("orders")
          .select("id")
          .eq("user_id", user.id)
          .eq("idempotency_key", idempotencyKey)
          .single();
        
        if (existingOrder) {
          return {
            success: true,
            orderId: existingOrder.id,
            message: "Order already exists",
            duplicate: true,
          };
        }
      }
      throw orderError;
    }

    // Deduct balance atomically
    const balanceResult = await atomicUpdateBalance(
      user.id,
      totalPrice,
      "deduct",
      order.id,
      `Order ${order.id} - ${service.name}`
    );

    if (!balanceResult.success) {
      // Rollback order
      await supabase.from("orders").delete().eq("id", order.id);
      throw new Error(balanceResult.errorMessage || "Failed to deduct balance");
    }

    return {
      success: true,
      orderId: order.id,
      message: "Order created successfully",
    };
  } catch (error: any) {
    console.error("[Order] Creation error:", error);
    return {
      success: false,
      error: error.message || "Failed to create order",
    };
  }
}
```

#### Step 3: Update Order Form (Client-side)

Update order form to generate and send idempotency key:

```typescript
// In the order form component
import { v4 as uuidv4 } from 'uuid';

const [idempotencyKey] = useState(() => uuidv4());

// When submitting form
const formData = new FormData();
formData.append("serviceId", serviceId);
formData.append("link", link);
formData.append("quantity", quantity.toString());
formData.append("idempotencyKey", idempotencyKey);

// After successful order, generate new key for next order
setIdempotencyKey(uuidv4());
```

---

## Deployment Checklist

### Pre-deployment:
- [ ] Back up database
- [ ] Test on staging environment
- [ ] Review all changes
- [ ] Have rollback plan ready

### Deployment Order:
1. [ ] Deploy database migrations (009, 010, 011)
2. [ ] Deploy helper functions (lib/balance-operations.ts, lib/refund-operations.ts)
3. [ ] Deploy webhook updates
4. [ ] Deploy order creation updates
5. [ ] Monitor logs for 24 hours

### Post-deployment:
- [ ] Test webhook with replay attack
- [ ] Test concurrent balance updates
- [ ] Test order double-click
- [ ] Test refund operations
- [ ] Monitor error rates
- [ ] Check balance logs

### Rollback Plan:
If issues occur:
1. Revert code changes
2. Keep database tables (they're additive, not breaking)
3. Database functions can be dropped if needed:
   ```sql
   DROP FUNCTION IF EXISTS atomic_update_balance;
   DROP FUNCTION IF EXISTS atomic_refund_order;
   ```

---

## Testing

### Manual Tests:

**Test 1: Webhook Replay Protection**
```bash
# Send same webhook twice
curl -X POST https://your-domain/api/webhooks/instant-payment \
  -H "Content-Type: application/json" \
  -H "x-accountpe-signature: your-signature" \
  -d '{"transactionId": "test-123", "status": 1, "amount": 10000}'

# Second call should return "already_processed"
```

**Test 2: Atomic Balance Updates**
```sql
-- Create test scenario with concurrent updates
-- Should not lose money
```

**Test 3: Order Deduplication**
```
1. Create order form
2. Click submit button twice quickly
3. Should only create one order
4. Balance should only be deducted once
```

**Test 4: Atomic Refunds**
```sql
-- Test refund
SELECT * FROM atomic_refund_order(
  'order-uuid',
  10.00,
  'Test refund'
);
-- Check order status = 'refunded'
-- Check balance increased
```

---

## Monitoring

### Metrics to Watch:

1. **Duplicate Webhook Rate:**
   ```sql
   SELECT COUNT(*) FROM processed_webhooks 
   WHERE created_at > NOW() - INTERVAL '24 hours';
   ```

2. **Balance Operation Success Rate:**
   ```sql
   SELECT 
     operation,
     COUNT(*) as total,
     COUNT(*) FILTER (WHERE new_balance >= 0) as successful
   FROM balance_logs
   WHERE created_at > NOW() - INTERVAL '24 hours'
   GROUP BY operation;
   ```

3. **Duplicate Order Attempts:**
   ```sql
   SELECT COUNT(*) FROM orders
   WHERE idempotency_key IS NOT NULL
   GROUP BY idempotency_key
   HAVING COUNT(*) > 1;
   ```

---

## Security Notes

1. **Webhook Replay Protection:**
   - 30-day retention window
   - Automatic cleanup recommended
   - Signature still validated

2. **Atomic Operations:**
   - Database-level locking prevents race conditions
   - Balance logs provide audit trail
   - Negative balance prevented at database level

3. **Order Deduplication:**
   - 5-minute window for same-key orders
   - Unique constraint prevents DB-level duplicates
   - Client-side key generation for better UX

---

## Support

If you encounter issues:
1. Check error logs
2. Review balance_logs table
3. Check processed_webhooks table
4. Contact support with transaction IDs

---

**Status:** Implementation guide complete
**Risk Level:** HIGH - Test thoroughly before production
**Estimated Implementation Time:** 4-6 hours
**Testing Time:** 2-4 hours
