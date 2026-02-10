"use server"

import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"
import { revalidatePath } from "next/cache"
import { COMPANY_NAME, EMAIL_CONFIG } from "@/lib/constants/company"
import { randomBytes } from "crypto"

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

    // Generate referral code using cryptographically secure random bytes
    const referralCode = "REF" + randomBytes(4).toString("hex").toUpperCase()
    console.log("[v0] Generated referral code:", referralCode)

    // Check for referrer if referral code provided
    let referredById = null
    if (formData.referralCode && formData.referralCode.trim()) {
      console.log("[v0] Looking up referrer for code:", formData.referralCode)
      const { data: referrerData, error: referrerError } = await supabaseAdmin
        .from("users")
        .select("id, email")
        .eq("referral_code", formData.referralCode.toUpperCase().trim())
        .single()

      if (referrerData) {
        // Prevent self-referral: check if email matches
        if (referrerData.email.toLowerCase() === formData.email.toLowerCase()) {
          return {
            success: false,
            error: "You cannot use your own referral code.",
          }
        }
        referredById = referrerData.id
        console.log("[v0] Found referrer:", referredById)
      } else {
        // If code not found or error (other than not found), show clear error
        return {
          success: false,
          error: "Invalid referral code. Please check and try again.",
        }
      }
    }

    // User profile creation is now handled by the handle_new_user trigger in the database.
    // No manual insert into users table here.

    // If referredById is set, update the referred_by field for this user
    if (referredById) {
      await supabaseAdmin.from("users").update({ referred_by: referredById }).eq("id", authData.user.id)
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

    // User profile creation is now handled by the handle_new_user trigger in the database for OAuth users as well.
    // No manual insert into users table here.

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

    const referralCode = "ADMIN" + randomBytes(4).toString("hex").toUpperCase()

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
