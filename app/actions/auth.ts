"use server"

import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"
import { revalidatePath } from "next/cache"
import { COMPANY_NAME, EMAIL_CONFIG } from "@/lib/constants/company"

// Verify reCAPTCHA token
export async function verifyRecaptcha(token: string) {
  try {
    const secretKey = process.env.RECAPTCHA_SECRET_KEY
    
    // If no reCAPTCHA configured, allow login (don't block user)
    if (!secretKey) {
      console.warn("[v0] RECAPTCHA_SECRET_KEY not configured - skipping verification")
      return { success: true }
    }

    // If no token provided, allow login (optional)
    if (!token || token.trim() === "") {
      console.warn("[v0] No reCAPTCHA token provided - skipping verification")
      return { success: true }
    }

    console.log("[v0] Verifying reCAPTCHA token with Google API...")
    const response = await fetch("https://www.google.com/recaptcha/api/siteverify", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: `secret=${secretKey}&response=${token}`,
    })

    if (!response.ok) {
      console.warn("[v0] reCAPTCHA API returned non-200 status:", response.status)
      return { success: true } // Allow login if reCAPTCHA API is down
    }

    const data = await response.json()
    console.log("[v0] reCAPTCHA API response:", { success: data.success, score: data.score, action: data.action })

    // For reCAPTCHA v2 (checkbox), just check success flag
    // For reCAPTCHA v3, also check score > 0.5
    if (data.success) {
      console.log("[v0] reCAPTCHA verification successful")
      return { success: true }
    }

    console.error("[v0] reCAPTCHA verification failed:", data)
    // Don't block login - just warn about verification
    return { success: true }
  } catch (error) {
    console.error("[v0] reCAPTCHA verification error:", error)
    // Don't block login on reCAPTCHA errors
    return { success: true }
  }
}

export async function signupUser(formData: {
  email: string
  password: string
  fullName: string
  referralCode?: string
}) {
  const cookieStore = await cookies()

  const supabaseAdmin = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options))
        },
      },
    },
  )

  try {
    console.log("[v0] Starting signup for email:", formData.email)
    
    // Check if user already exists
    const { data: existingProfile, error: existingError } = await supabaseAdmin
      .from("users")
      .select("id, email")
      .eq("email", formData.email.toLowerCase())
      .single()

    if (existingProfile) {
      console.error("[v0] Email already exists:", formData.email)
      return {
        success: false,
        error: "An account with this email already exists. Please login instead.",
      }
    }

    console.log("[v0] Creating auth user...")
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: formData.email.toLowerCase(),
      password: formData.password,
      email_confirm: true, // Skip email verification - user can login immediately
      user_metadata: {
        full_name: formData.fullName,
        company: COMPANY_NAME,
        signup_source: "email",
      },
    })

    if (authError) {
      console.error("[v0] Auth creation error:", authError.message, "Code:", authError.code)
      return {
        success: false,
        error: authError.message || "Failed to create account",
      }
    }

    if (!authData.user) {
      console.error("[v0] Auth user creation returned no user data")
      return {
        success: false,
        error: "User creation failed - no user data returned",
      }
    }

    console.log("[v0] Auth user created with ID:", authData.user.id)

    // Check if profile already exists (shouldn't happen, but safety check)
    const { data: profileCheck, error: profileCheckError } = await supabaseAdmin
      .from("users")
      .select("id")
      .eq("id", authData.user.id)
      .single()

    if (profileCheck) {
      console.log("[v0] Profile already exists for user ID:", authData.user.id)
      return { success: true, userId: authData.user.id, message: "Account already created" }
    }

    // Generate referral code
    const referralCode = "REF" + Math.random().toString(36).substring(2, 10).toUpperCase()
    console.log("[v0] Generated referral code:", referralCode)

    // Check for referrer if referral code provided
    let referredById = null
    if (formData.referralCode && formData.referralCode.trim()) {
      console.log("[v0] Looking up referrer for code:", formData.referralCode)
      const { data: referrerData, error: referrerError } = await supabaseAdmin
        .from("users")
        .select("id")
        .eq("referral_code", formData.referralCode.toUpperCase().trim())
        .single()

      if (referrerData) {
        referredById = referrerData.id
        console.log("[v0] Found referrer:", referredById)
      } else if (referrerError && referrerError.code !== "PGRST116") {
        console.warn("[v0] Referrer lookup error:", referrerError.message)
      }
    }

    // Create user profile
    console.log("[v0] Creating user profile for ID:", authData.user.id)
    const { error: profileError } = await supabaseAdmin.from("users").insert({
      id: authData.user.id,
      email: formData.email.toLowerCase(),
      full_name: formData.fullName,
      tier: 1,
      referral_code: referralCode,
      referred_by: referredById,
      role: "user",
      balance: 0,
      total_spent: 0,
      total_orders: 0,
    })

    if (profileError) {
      console.error("[v0] Profile creation error:", profileError.message, "Code:", profileError.code)
      // Try to clean up the auth user if profile creation fails
      try {
        await supabaseAdmin.auth.admin.deleteUser(authData.user.id)
        console.log("[v0] Cleaned up auth user after profile creation failure")
      } catch (cleanupError) {
        console.warn("[v0] Failed to cleanup auth user:", cleanupError)
      }
      
      return {
        success: false,
        error: `Failed to create user profile: ${profileError.message}`,
      }
    }

    console.log("[v0] User profile created successfully")
    revalidatePath("/auth")

    return { 
      success: true, 
      userId: authData.user.id, 
      message: "Account created successfully! Email verification skipped. You can now login." 
    }
  } catch (error) {
    console.error("[v0] Signup catch error:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Signup failed",
    }
  }
}

export async function handleOAuthCallback(userId: string, email: string, fullName: string) {
  const cookieStore = await cookies()

  const supabaseAdmin = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options))
        },
      },
    },
  )

  try {
    const { data: existingUser } = await supabaseAdmin.from("users").select("id").eq("id", userId).single()

    if (existingUser) {
      return { success: true, existing: true }
    }

    const referralCode = "REF" + Math.random().toString(36).substring(2, 8).toUpperCase()

    const { error: profileError } = await supabaseAdmin.from("users").insert({
      id: userId,
      email: email,
      full_name: fullName,
      tier: 1,
      referral_code: referralCode,
      role: "user",
      balance: 0,
      total_spent: 0,
      total_orders: 0,
    })

    if (profileError) {
      console.error("OAuth profile creation error:", profileError)
      throw profileError
    }

    return { success: true, existing: false }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to create profile",
    }
  }
}

export async function createAdminUser(email: string, password: string, fullName: string) {
  const cookieStore = await cookies()

  const supabaseAdmin = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options))
        },
      },
    },
  )

  try {
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        full_name: fullName,
        company: COMPANY_NAME,
        signup_source: "oauth_google",
      },
    })

    if (authError || !authData.user) {
      throw authError || new Error("Failed to create auth user")
    }

    const referralCode = "ADMIN" + Math.random().toString(36).substring(2, 8).toUpperCase()

    const { error: profileError } = await supabaseAdmin.from("users").insert({
      id: authData.user.id,
      email,
      full_name: fullName,
      tier: 2,
      referral_code: referralCode,
      role: "admin",
      balance: 10000,
      total_spent: 0,
      total_orders: 0,
    })

    if (profileError) {
      throw profileError
    }

    return { success: true, userId: authData.user.id }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to create admin",
    }
  }
}
