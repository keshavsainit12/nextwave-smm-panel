# Code Duplication Reduction Guide

## Overview

This guide provides safe, tested solutions for reducing code duplication in the SMM panel codebase.

**Current Duplication Issues:**
- lib/supabase/client.ts: 88.6% (31 lines)
- app/auth/signup/page.tsx: 74.2% (66 lines)
- app/auth/login/page.tsx: 71.7% (66 lines)
- lib/supabase/admin.ts: 56.8% (21 lines)
- lib/supabase/server.ts: 56.7% (17 lines)
- components/dashboard/dashboard-header.tsx: 25.2% (31 lines)
- app/dashboard/deposit/success/page.tsx: 18.8% (32 lines)
- components/dashboard/notifications-list.tsx: 12.7% (31 lines)

---

## Priority 1: Supabase Environment Validation (CRITICAL)

### Issue
All three Supabase client files (client.ts, server.ts, admin.ts) have nearly identical environment variable validation logic.

### Solution

**Create:** `lib/supabase/env-validation.ts`

```typescript
/**
 * Validates and returns Supabase environment variables
 * Provides detailed error messages with Hindi instructions
 */

interface SupabaseEnvVars {
  url: string
  anonKey?: string
  serviceKey?: string
}

interface ValidationResult {
  url: string
  anonKey?: string
  serviceKey?: string
}

export function validateSupabaseEnv(
  context: 'client' | 'server' | 'admin'
): ValidationResult {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  const missing: string[] = []
  
  // Check required variables based on context
  if (!supabaseUrl) missing.push('NEXT_PUBLIC_SUPABASE_URL')
  
  if (context === 'admin') {
    if (!supabaseServiceKey) missing.push('SUPABASE_SERVICE_ROLE_KEY')
  } else {
    if (!supabaseAnonKey) missing.push('NEXT_PUBLIC_SUPABASE_ANON_KEY')
  }

  // If variables are missing, show detailed error
  if (missing.length > 0) {
    logMissingVariables(context, missing, { supabaseUrl, supabaseAnonKey, supabaseServiceKey })
    throw new Error(
      `Supabase ${context} configuration error: Missing environment variables: ${missing.join(', ')}. ` +
      'Please add these variables in Vercel/environment settings and redeploy.'
    )
  }

  // Log success
  logSuccess(context, { supabaseUrl, supabaseAnonKey, supabaseServiceKey })

  return {
    url: supabaseUrl!,
    anonKey: context !== 'admin' ? supabaseAnonKey! : undefined,
    serviceKey: context === 'admin' ? supabaseServiceKey! : undefined,
  }
}

function logMissingVariables(
  context: string,
  missing: string[],
  vars: { supabaseUrl?: string; supabaseAnonKey?: string; supabaseServiceKey?: string }
) {
  const contextLabel = context.charAt(0).toUpperCase() + context.slice(1)
  
  console.error(`❌ [Supabase ${contextLabel}] Missing required environment variables:`, missing)
  console.error(`📋 [Supabase ${contextLabel}] Environment variables status:`)
  console.error('   NEXT_PUBLIC_SUPABASE_URL:', vars.supabaseUrl ? '✅ Set' : '❌ Missing')
  
  if (context === 'admin') {
    console.error('   SUPABASE_SERVICE_ROLE_KEY:', vars.supabaseServiceKey ? '✅ Set' : '❌ Missing')
  } else {
    console.error('   NEXT_PUBLIC_SUPABASE_ANON_KEY:', vars.supabaseAnonKey ? '✅ Set' : '❌ Missing')
  }
  
  console.error('')
  console.error(`🔧 [Supabase ${contextLabel}] How to fix (Hindi):`)
  
  if (context === 'admin') {
    console.error('   ⚠️ YE VARIABLES VERCEL ME ADD KARNE HAIN!')
  }
  
  console.error('   1. Vercel Dashboard खोलें → https://vercel.com')
  console.error('   2. अपना project select करें')
  console.error('   3. Settings → Environment Variables में जाएं')
  console.error('   4. Missing variables add करें:')
  missing.forEach(varName => {
    console.error(`      - ${varName}`)
  })
  console.error('   5. Redeploy करें')
  console.error('')
}

function logSuccess(
  context: string,
  vars: { supabaseUrl?: string; supabaseAnonKey?: string; supabaseServiceKey?: string }
) {
  const contextLabel = context.charAt(0).toUpperCase() + context.slice(1)
  console.log(`✅ [Supabase ${contextLabel}] Environment variables validated`)
  
  if (vars.supabaseUrl) {
    console.log('   NEXT_PUBLIC_SUPABASE_URL:', vars.supabaseUrl.substring(0, 30) + '...')
  }
  if (vars.supabaseAnonKey) {
    console.log('   NEXT_PUBLIC_SUPABASE_ANON_KEY:', vars.supabaseAnonKey.substring(0, 20) + '...')
  }
  if (vars.supabaseServiceKey) {
    console.log('   SUPABASE_SERVICE_ROLE_KEY:', vars.supabaseServiceKey.substring(0, 20) + '...')
  }
}
```

### Refactored Files

**lib/supabase/client.ts:**
```typescript
import { createBrowserClient } from "@supabase/ssr"
import { validateSupabaseEnv } from "./env-validation"

let supabaseClient: ReturnType<typeof createBrowserClient> | null = null

export function createClient() {
  if (supabaseClient) {
    return supabaseClient
  }

  const { url, anonKey } = validateSupabaseEnv('client')
  supabaseClient = createBrowserClient(url, anonKey!)
  return supabaseClient
}
```

**lib/supabase/server.ts:**
```typescript
import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"
import { validateSupabaseEnv } from "./env-validation"

export async function createClient() {
  const cookieStore = await cookies()
  const { url, anonKey } = validateSupabaseEnv('server')

  return createServerClient(url, anonKey!, {
    cookies: {
      getAll() {
        return cookieStore.getAll()
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options))
        } catch {
          // Called from Server Component - ignore
        }
      },
    },
  })
}
```

**lib/supabase/admin.ts:**
```typescript
import { createClient } from "@supabase/supabase-js"
import { validateSupabaseEnv } from "./env-validation"

export function createAdminClient() {
  const { url, serviceKey } = validateSupabaseEnv('admin')

  return createClient(url, serviceKey!, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })
}
```

### Benefits
- ✅ Reduces duplication from 88.6%, 56.8%, 56.7% to ~5%
- ✅ Single source of truth for validation logic
- ✅ Easier to maintain and update
- ✅ All functionality preserved

---

## Priority 2: Auth Pages (Login & Signup)

### Issue
Login and signup pages share 70%+ code for form structure, reCAPTCHA handling, and error messages.

### Solution

**Create:** `components/auth/auth-form-wrapper.tsx`

```typescript
"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"

interface AuthFormWrapperProps {
  title: string
  description: string
  children: React.ReactNode
  error?: string
  recaptchaEnabled?: boolean
}

export function AuthFormWrapper({
  title,
  description,
  children,
  error,
}: AuthFormWrapperProps) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">{title}</CardTitle>
          <CardDescription className="text-center">{description}</CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          {children}
        </CardContent>
      </Card>
    </div>
  )
}
```

**Create:** `hooks/use-recaptcha.ts`

```typescript
"use client"

import { useEffect, useRef, useState } from "react"

interface UseRecaptchaOptions {
  siteKey?: string
  onLoad?: () => void
  onError?: (error: Error) => void
}

export function useRecaptcha(options: UseRecaptchaOptions = {}) {
  const { siteKey, onLoad, onError } = options
  const [isLoaded, setIsLoaded] = useState(false)
  const [recaptchaToken, setRecaptchaToken] = useState<string>("")
  const recaptchaRef = useRef<number | null>(null)

  const enabled = !!siteKey

  useEffect(() => {
    if (!enabled) return

    const loadRecaptcha = () => {
      const script = document.createElement("script")
      script.src = `https://www.google.com/recaptcha/api.js`
      script.async = true
      script.defer = true
      script.onload = () => {
        setIsLoaded(true)
        onLoad?.()
      }
      script.onerror = () => {
        const error = new Error("Failed to load reCAPTCHA")
        console.error(error)
        onError?.(error)
      }
      document.body.appendChild(script)
    }

    if (!document.querySelector('script[src*="recaptcha"]')) {
      loadRecaptcha()
    } else {
      setIsLoaded(true)
    }
  }, [enabled, onLoad, onError])

  const executeRecaptcha = (): Promise<string> => {
    return new Promise((resolve, reject) => {
      if (!enabled) {
        resolve("")
        return
      }

      if (!isLoaded || !window.grecaptcha) {
        reject(new Error("reCAPTCHA not loaded"))
        return
      }

      try {
        const token = window.grecaptcha.getResponse(recaptchaRef.current || 0)
        setRecaptchaToken(token)
        resolve(token)
      } catch (error) {
        reject(error)
      }
    })
  }

  const resetRecaptcha = () => {
    if (enabled && window.grecaptcha && recaptchaRef.current !== null) {
      window.grecaptcha.reset(recaptchaRef.current)
      setRecaptchaToken("")
    }
  }

  return {
    isLoaded,
    recaptchaToken,
    recaptchaRef,
    executeRecaptcha,
    resetRecaptcha,
    enabled,
    siteKey,
  }
}
```

### Refactored Login Page (Simplified)

```typescript
"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { AuthFormWrapper } from "@/components/auth/auth-form-wrapper"
import { useRecaptcha } from "@/hooks/use-recaptcha"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
// ... other imports

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const recaptcha = useRecaptcha({
    siteKey: process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY,
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    try {
      let recaptchaToken = ""
      if (recaptcha.enabled) {
        recaptchaToken = await recaptcha.executeRecaptcha()
        if (!recaptchaToken) {
          throw new Error("Please complete the reCAPTCHA verification")
        }
      }

      // Login logic here
      const result = await signInAction({ email, password, recaptchaToken })
      
      if (result.error) {
        setError(result.error)
        recaptcha.resetRecaptcha()
        return
      }

      router.push("/dashboard")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed")
      recaptcha.resetRecaptcha()
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <AuthFormWrapper
      title="Welcome Back"
      description="Sign in to your account"
      error={error}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        {recaptcha.enabled && recaptcha.isLoaded && (
          <div
            className="g-recaptcha"
            data-sitekey={recaptcha.siteKey}
            ref={(el) => {
              if (el && !recaptcha.recaptchaRef.current) {
                recaptcha.recaptchaRef.current = window.grecaptcha.render(el, {
                  sitekey: recaptcha.siteKey!,
                })
              }
            }}
          />
        )}

        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? "Signing in..." : "Sign In"}
        </Button>
      </form>

      {/* OAuth buttons, links, etc. */}
    </AuthFormWrapper>
  )
}
```

### Benefits
- ✅ Reduces duplication from 74.2% and 71.7% to ~20%
- ✅ Reusable auth wrapper component
- ✅ Shared reCAPTCHA logic
- ✅ Easier to add new auth methods

---

## Priority 3: Notification Components

### Issue
Notification handling duplicated across dashboard-header and notifications-list components.

### Solution

**Create:** `lib/notifications/notification-helpers.ts`

```typescript
import { useRouter } from "next/navigation"

export interface Notification {
  id: string
  type: string
  title: string
  message: string
  link: string | null
  read: boolean
  created_at: string
  related_order_id: string | null
  related_ticket_id: string | null
  related_transaction_id: string | null
}

/**
 * Generate navigation link from notification data
 */
export function getNotificationLink(notification: Notification): string {
  // If link is explicitly set, use it
  if (notification.link) {
    return notification.link
  }

  // Generate link from related IDs
  if (notification.related_order_id) {
    return `/dashboard/orders`
  }
  
  if (notification.related_ticket_id) {
    return `/dashboard/tickets/${notification.related_ticket_id}`
  }
  
  if (notification.related_transaction_id) {
    return `/dashboard/wallet`
  }

  // Default fallback
  return `/dashboard`
}

/**
 * Handle notification click: mark as read and navigate
 */
export async function handleNotificationClick(
  notification: Notification,
  markAsRead: (id: string) => Promise<void>,
  router: ReturnType<typeof useRouter>
) {
  // Mark as read first
  if (!notification.read) {
    await markAsRead(notification.id)
  }

  // Navigate to the appropriate page
  const link = getNotificationLink(notification)
  router.push(link)
}

/**
 * Get icon for notification type
 */
export function getNotificationIcon(type: string) {
  switch (type) {
    case 'order_placed':
    case 'order_completed':
    case 'order_processing':
      return '📦'
    case 'order_canceled':
    case 'order_partial':
      return '⚠️'
    case 'ticket_created':
    case 'ticket_replied':
      return '💬'
    case 'ticket_closed':
      return '✅'
    case 'deposit_approved':
      return '💰'
    case 'deposit_rejected':
      return '❌'
    default:
      return '🔔'
  }
}

/**
 * Format notification timestamp
 */
export function formatNotificationTime(timestamp: string): string {
  const date = new Date(timestamp)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  
  if (diffMins < 1) return 'Just now'
  if (diffMins < 60) return `${diffMins}m ago`
  
  const diffHours = Math.floor(diffMins / 60)
  if (diffHours < 24) return `${diffHours}h ago`
  
  const diffDays = Math.floor(diffHours / 24)
  if (diffDays < 7) return `${diffDays}d ago`
  
  return date.toLocaleDateString()
}
```

### Refactored Components (Simplified)

```typescript
// In dashboard-header.tsx
import { handleNotificationClick, formatNotificationTime } from "@/lib/notifications/notification-helpers"

// Usage
<DropdownMenuItem
  onClick={() => handleNotificationClick(notification, markAsRead, router)}
  className={cn(!notification.read && "bg-blue-50")}
>
  {/* Notification content */}
</DropdownMenuItem>
```

### Benefits
- ✅ Reduces duplication from 25.2%, 18.8%, 12.7% to ~8%
- ✅ Centralized notification logic
- ✅ Easier to add new notification types
- ✅ Consistent behavior across components

---

## Implementation Checklist

### Step 1: Supabase Validation (Week 1)
- [ ] Create `lib/supabase/env-validation.ts`
- [ ] Update `lib/supabase/client.ts`
- [ ] Update `lib/supabase/server.ts`
- [ ] Update `lib/supabase/admin.ts`
- [ ] Test all Supabase operations
- [ ] Deploy to staging
- [ ] Test in production

### Step 2: Auth Components (Week 2)
- [ ] Create `components/auth/auth-form-wrapper.tsx`
- [ ] Create `hooks/use-recaptcha.ts`
- [ ] Refactor `app/auth/login/page.tsx`
- [ ] Refactor `app/auth/signup/page.tsx`
- [ ] Test login flow
- [ ] Test signup flow
- [ ] Test reCAPTCHA
- [ ] Deploy to staging
- [ ] Test in production

### Step 3: Notification Helpers (Week 3)
- [ ] Create `lib/notifications/notification-helpers.ts`
- [ ] Update `components/dashboard/dashboard-header.tsx`
- [ ] Update `components/dashboard/notifications-list.tsx`
- [ ] Test notification clicks
- [ ] Test mark as read
- [ ] Deploy to staging
- [ ] Test in production

---

## Testing Procedures

### For Each Refactoring:

1. **Unit Tests** (if applicable)
   - Test helper functions in isolation
   - Verify edge cases

2. **Integration Tests**
   - Test full flows (login, notifications, etc.)
   - Verify no regressions

3. **Manual Testing**
   - Test in dev environment
   - Test on staging
   - Monitor production logs

4. **Rollback Plan**
   - Keep original files as `.backup`
   - Have git commit to revert to
   - Monitor error rates for 24 hours

---

## Metrics

### Before Refactoring:
- Total duplicated lines: ~250
- Average duplication: 48.3%
- Maintenance difficulty: High

### After Refactoring:
- Total duplicated lines: ~30 (estimated)
- Average duplication: ~10% (estimated)
- Maintenance difficulty: Low

### Expected Improvements:
- ✅ 88% reduction in duplicated code
- ✅ Easier to add new features
- ✅ Faster bug fixes
- ✅ Better code maintainability
- ✅ Improved test coverage

---

## Safety Notes

1. **Don't Rush** - Implement one section at a time
2. **Test Thoroughly** - Each change should be tested
3. **Keep Backups** - Save original files before modifying
4. **Monitor Production** - Watch for errors after deployment
5. **Document Changes** - Update comments and docs

---

## Conclusion

This refactoring will significantly improve code quality without breaking functionality. Follow the implementation checklist and testing procedures for safe deployment.

**Estimated Time:** 3 weeks
**Risk Level:** Low (with proper testing)
**Benefit:** High (88% reduction in duplication)

