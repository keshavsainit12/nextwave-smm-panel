# Testing & Deployment Guide: E-Commerce Fixes

## Summary of Implementations

### 1. Order Pages - Fixed Responsiveness & Performance
- ✅ **Pagination**: Orders now load 20 per page instead of all at once
- ✅ **Loading States**: Suspense boundaries with skeleton loaders
- ✅ **Error Handling**: Try-catch blocks for API failures
- ✅ **User Feedback**: Clear pagination controls and counts

### 2. Settings - Currency & Language Support
- ✅ **Currency Field**: Full currency selector with 6 options (USD, EUR, GBP, INR, PKR, AED)
- ✅ **Change Tracking**: Only modified fields are sent to server
- ✅ **Confirmation**: Warning for critical changes like currency
- ✅ **Validation**: Server-side validation for allowed currencies
- ✅ **Audit Trail**: Timestamp tracking for currency changes

### 3. Coupon Validation - Timeout & Error Recovery
- ✅ **Request Timeout**: 8-second timeout with proper error handling
- ✅ **Retry Logic**: Graceful error messages for different failure types
- ✅ **Error Differentiation**: 
  - 404: Coupon not found
  - 410: Coupon expired
  - 429: Rate limited
  - 5xx: Server error
- ✅ **User Feedback**: Clear messages for each error scenario

---

## Testing Checklist

### Order Page Testing

#### Load Testing
- [ ] Load orders page with slow network (3G throttle)
- [ ] Verify pagination loads 20 orders correctly
- [ ] Check "Next" and "Previous" buttons work
- [ ] Verify page numbers calculate correctly
- [ ] Test jumping to last page shows correct count

#### Performance Testing
```javascript
// In browser console:
performance.mark('orders-start')
// ... navigate to orders
performance.mark('orders-end')
performance.measure('orders-load', 'orders-start', 'orders-end')
performance.getEntriesByName('orders-load')[0].duration // should be < 2000ms
```

#### Error Scenarios
- [ ] Network offline - verify error message shows
- [ ] 500 error from API - verify graceful handling
- [ ] No orders - verify empty state message
- [ ] Very large order count (1000+) - verify pagination works

### Settings Form Testing

#### Currency Changes
```typescript
// Test Steps:
1. Open Settings
2. Change Language to "Spanish"
3. Change Currency to "EUR"
4. Verify warning shows: "Changing currency from USD to EUR will affect all future pricing"
5. Click Cancel - verify changes revert
6. Click Save - verify saves successfully
7. Refresh page - verify currency persists
8. Check database: SELECT currency FROM users WHERE id = 'test_user'
```

#### Field Tracking
- [ ] Change one field - verify only that field sends to server
- [ ] Change multiple fields - verify all changed fields send
- [ ] Make no changes - verify "No changes" error shows
- [ ] Change field, revert - verify field removed from changed set

#### Validation
- [ ] Enter invalid currency value directly - verify fails
- [ ] Try to change email - verify disabled (read-only)
- [ ] Long usernames (100+ chars) - verify validation
- [ ] Special characters in full name - verify handling

### Coupon Validation Testing

#### Happy Path
```typescript
// Test Steps:
1. Open order dialog
2. Enter valid coupon code: "SAVE10"
3. Click "Apply"
4. Verify shows "10% discount applied"
5. Check order total updated
6. Place order - verify coupon applied
```

#### Error Scenarios
```typescript
// Timeout Test (simulate slow server)
1. Open DevTools > Network > Slow 3G
2. Enter coupon code
3. Click "Apply"
4. Verify times out after 8 seconds
5. Shows: "Validation timed out. Please try again"

// Invalid Coupon Test
1. Enter "INVALIDCODE"
2. Click "Apply"
3. Verify shows: "Coupon code not found"

// Expired Coupon Test
1. Create test coupon with past date
2. Enter code
3. Click "Apply"
4. Verify shows: "This coupon has expired"

// Rate Limit Test
1. Click "Apply" 10 times rapidly
2. Verify shows: "Too many validation attempts"
3. Wait and retry - should work
```

### Performance Metrics

#### Acceptable Ranges
```
Order Page Load Time:     < 2 seconds
Coupon Validation Time:   < 1 second
Settings Save Time:       < 500ms
Pagination Response Time: < 500ms
```

---

## Deployment Steps

### Pre-Deployment Checklist
- [ ] All tests passing
- [ ] No console errors
- [ ] Database migrations run (add currency column)
- [ ] Environment variables set
- [ ] Code review completed
- [ ] Feature flags configured

### Database Migration

```sql
-- Add currency support to users table
BEGIN;

ALTER TABLE users ADD COLUMN IF NOT EXISTS currency TEXT DEFAULT 'USD';
ALTER TABLE users ADD COLUMN IF NOT EXISTS currency_updated_at TIMESTAMP DEFAULT NOW();

-- Add audit table for currency changes
CREATE TABLE IF NOT EXISTS currency_changes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  old_currency TEXT NOT NULL,
  new_currency TEXT NOT NULL,
  changed_at TIMESTAMP DEFAULT NOW(),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Add index for faster queries
CREATE INDEX IF NOT EXISTS idx_currency_changes_user_id ON currency_changes(user_id);
CREATE INDEX IF NOT EXISTS idx_users_currency ON users(currency);

COMMIT;
```

### Deployment Process

#### Stage 1: Pre-Production Testing (1-2 hours)
```bash
# 1. Deploy to staging environment
git push origin staging

# 2. Run smoke tests
npm run test:smoke

# 3. Test database migrations
npm run migrate:staging

# 4. Run manual QA checklist
# (See Testing Checklist above)
```

#### Stage 2: Production Deployment (2-3 hours)
```bash
# 1. Create backup
# (Handled by deployment system)

# 2. Deploy code
git push origin main

# 3. Run migrations (with confirmation)
npm run migrate:prod

# 4. Deploy API changes
npm run deploy:api

# 5. Monitor logs
npm run logs:prod -- --follow

# 6. Run smoke tests on production
npm run test:smoke --env=prod
```

#### Stage 3: Validation (30 minutes)
```bash
# 1. Test key flows
- [ ] Create order
- [ ] Apply coupon
- [ ] Change currency in settings
- [ ] View orders with pagination

# 2. Monitor error rates
- [ ] Check monitoring dashboard
- [ ] No spike in 5xx errors
- [ ] No spike in API response times

# 3. Monitor performance
- [ ] Page load times normal
- [ ] Database query times acceptable
- [ ] CPU/Memory usage stable
```

### Rollback Plan

If issues occur:

```bash
# Quick rollback (< 5 minutes)
git revert HEAD

# Database rollback
BEGIN;
ALTER TABLE users DROP COLUMN IF EXISTS currency;
ALTER TABLE users DROP COLUMN IF EXISTS currency_updated_at;
DROP TABLE IF EXISTS currency_changes;
COMMIT;

# Clear caches
npm run cache:clear

# Restart services
npm run restart
```

---

## Monitoring After Deployment

### Key Metrics to Watch

```javascript
// 1. Error Rate
✓ Target: < 0.1%
✗ Alert: > 0.5%

// 2. Order Page Load
✓ Target: < 2s (p95)
✗ Alert: > 5s

// 3. Coupon Validation
✓ Target: < 1s
✗ Alert: > 3s

// 4. Settings Save Success
✓ Target: > 99.5%
✗ Alert: < 95%
```

### Alert Configurations

```yaml
alerts:
  - name: High Error Rate
    threshold: 0.5%
    window: 5 minutes
    action: Alert DevOps
    
  - name: Slow Order Loading
    threshold: 5000ms (p95)
    window: 10 minutes
    action: Alert Backend Team
    
  - name: Coupon Failures
    threshold: 5% failure rate
    window: 5 minutes
    action: Alert API Team
```

---

## Logging Strategy

### Add Request Logging

```typescript
// /lib/logging.ts
export const logEvent = (
  eventName: string,
  data: any,
  level: 'info' | 'error' | 'warn' = 'info'
) => {
  const timestamp = new Date().toISOString()
  const logEntry = {
    timestamp,
    level: level.toUpperCase(),
    event: eventName,
    data,
    userAgent: typeof window !== 'undefined' ? navigator.userAgent : 'server',
  }
  
  console.log(`[${timestamp}] [${level.toUpperCase()}] ${eventName}`, data)
  
  // Send to monitoring service
  if (level === 'error') {
    fetch('/api/v1/logs', { method: 'POST', body: JSON.stringify(logEntry) })
  }
}
```

### Log Usage Examples

```typescript
// Order pagination
logEvent('order-page-loaded', { page, totalPages, count })

// Currency change
logEvent('currency-changed', { oldCurrency, newCurrency, userId })

// Coupon validation
logEvent('coupon-validation', { code, status, discount, duration })

// Errors
logEvent('coupon-validation-error', { error, code, retries }, 'error')
```

---

## Rollout Strategy

### Option 1: Feature Flags (Recommended)
```typescript
// Enable gradually
- Day 1: 10% of users
- Day 2: 25% of users
- Day 3: 50% of users
- Day 4: 100% of users

// Configuration
const isNewOrdersPaginationEnabled = 
  isFeatureFlagEnabled('orders-pagination', userId)
```

### Option 2: Gradual Deployment
```bash
# Deploy to specific region first
# Monitor for 24 hours
# Then deploy globally
```

---

## Success Criteria

- ✅ Orders page loads in < 2 seconds
- ✅ Pagination works smoothly
- ✅ Currency selector functions correctly
- ✅ Coupon validation completes in < 1 second
- ✅ Error messages are clear and actionable
- ✅ No increase in error rates
- ✅ User satisfaction surveys > 4.5/5
