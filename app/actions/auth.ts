"use server"

import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"
import { revalidatePath } from "next/cache"
import { COMPANY_NAME, EMAIL_CONFIG } from "@/lib/constants/company"

// Verify reCAPTCHA token
export async function verifyRecaptcha(token: string) {
  try {
    const secretKey = process.env.RECAPTCHA_SECRET_KEY
    if (!secretKey) {
      console.error("[v0] RECAPTCHA_SECRET_KEY not configured")
      return { success: false, error: "reCAPTCHA not configured" }
    }

    console.log("[v0] Verifying reCAPTCHA token with Google API...")
    const response = await fetch("https://www.google.com/recaptcha/api/siteverify", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: `secret=${secretKey}&response=${token}`,
    })

    const data = await response.json()
    console.log("[v0] reCAPTCHA API response:", { success: data.success, score: data.score, action: data.action })

    // For reCAPTCHA v2 (checkbox), just check success flag
    // For reCAPTCHA v3, also check score > 0.5
    if (data.success) {
      console.log("[v0] reCAPTCHA verification successful")
      return { success: true }
    }

    console.error("[v0] reCAPTCHA verification failed:", data)
    return { success: false, error: "reCAPTCHA verification failed" }
  } catch (error) {
    console.error("[v0] reCAPTCHA verification error:", error)
    return { success: false, error: "reCAPTCHA verification failed" }
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
    const { data: existingProfile } = await supabaseAdmin
      .from("users")
      .select("id, email")
      .eq("email", formData.email)
      .single()

    if (existingProfile) {
      return {
        success: false,
        error: "An account with this email already exists. Please login instead.",
      }
    }

    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: formData.email,
      password: formData.password,
      email_confirm: true, // Skip email verification - user can login immediately
      user_metadata: {
        full_name: formData.fullName,
        company: COMPANY_NAME,
        signup_source: "email",
      },
    })

    if (authError) {
      return {
        success: false,
        error: authError.message,
      }
    }

    if (!authData.user) {
      return {
        success: false,
        error: "User creation failed",
      }
    }

    const { data: profileCheck } = await supabaseAdmin.from("users").select("id").eq("id", authData.user.id).single()

    if (profileCheck) {
      return { success: true, userId: authData.user.id }
    }

    const referralCode = "REF" + Math.random().toString(36).substring(2, 10).toUpperCase()

    let referredById = null
    if (formData.referralCode) {
      const { data: referrerData } = await supabaseAdmin
        .from("users")
        .select("id")
        .eq("referral_code", formData.referralCode.toUpperCase())
        .single()

      if (referrerData) {
        referredById = referrerData.id
      }
    }

    const { error: profileError } = await supabaseAdmin.from("users").insert({
      id: authData.user.id,
      email: formData.email,
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
      return {
        success: false,
        error: `Failed to create user profile: ${profileError.message}`,
      }
    }

    revalidatePath("/auth")

    return { success: true, userId: authData.user.id, message: "Account created successfully! You can now login." }
  } catch (error) {
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
