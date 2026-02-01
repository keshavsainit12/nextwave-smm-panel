import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export async function GET(request: NextRequest) {
  try {
    const requestUrl = new URL(request.url)
    const code = requestUrl.searchParams.get("code")
    const error = requestUrl.searchParams.get("error")
    const errorDescription = requestUrl.searchParams.get("error_description")
    const next = requestUrl.searchParams.get("next") || "/dashboard"

    console.log("[v0] OAuth callback received:", { 
      code: code ? code.substring(0, 10) + "..." : null, 
      error, 
      errorDescription,
      next,
      fullUrl: request.url 
    })

    // Handle OAuth errors
    if (error) {
      console.error("[v0] OAuth error:", { error, errorDescription })
      return NextResponse.redirect(
        new URL(`/auth/login?error=${encodeURIComponent(errorDescription || error)}`, requestUrl.origin)
      )
    }

    if (!code) {
      console.error("[v0] No code provided in OAuth callback")
      return NextResponse.redirect(new URL("/auth/login?error=No authorization code", requestUrl.origin))
    }

    const cookieStore = await cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
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

    console.log("[v0] Exchanging code for session...")
    const { data: sessionData, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)

    if (exchangeError) {
      console.error("[v0] Exchange error:", exchangeError)
      console.error("[v0] Exchange error details:", {
        message: exchangeError.message,
        status: exchangeError.status,
        name: exchangeError.name
      })
      return NextResponse.redirect(
        new URL(`/auth/login?error=${encodeURIComponent(exchangeError.message || "Authentication failed")}`, requestUrl.origin)
      )
    }

    if (!sessionData?.session) {
      console.error("[v0] No session returned after code exchange")
      return NextResponse.redirect(
        new URL("/auth/login?error=No session created", requestUrl.origin)
      )
    }

    console.log("[v0] Session created successfully for user:", sessionData.user?.email)

    // Get user data
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError || !user) {
      console.error("[v0] Failed to get user:", userError)
      return NextResponse.redirect(new URL("/auth/login?error=Failed to get user", request.url))
    }

    console.log("[v0] User authenticated:", { userId: user.id, email: user.email })

    // Check if user profile exists, if not create it
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

    const { data: existingUser, error: userCheckError } = await supabaseAdmin
      .from("users")
      .select("id, role")
      .eq("id", user.id)
      .single()

    if (userCheckError && userCheckError.code !== "PGRST116") {
      console.error("[v0] User check error:", userCheckError)
      return NextResponse.redirect(new URL("/auth/login?error=Database error", request.url))
    }

    if (!existingUser) {
      console.log("[v0] Creating new user profile for OAuth user")
      
      const referralCode = "REF" + Math.random().toString(36).substring(2, 10).toUpperCase()

      // Create user with minimal required fields for faster insert
      const { error: insertError } = await supabaseAdmin.from("users").insert({
        id: user.id,
        email: user.email!,
        full_name: user.user_metadata?.full_name || user.user_metadata?.name || user.email!.split("@")[0],
        avatar_url: user.user_metadata?.avatar_url || null,
        tier: 1,
        referral_code: referralCode,
        role: "user",
        balance: 0,
        total_spent: 0,
        total_orders: 0,
      })

      if (insertError) {
        console.error("[v0] Failed to create user profile:", insertError)
        console.error("[v0] Insert error details:", {
          message: insertError.message,
          code: insertError.code,
          details: insertError.details
        })
        return NextResponse.redirect(
          new URL(`/auth/login?error=${encodeURIComponent(insertError.message || "Failed to create profile")}`, request.url)
        )
      }

      console.log("[v0] User profile created successfully")
      return NextResponse.redirect(new URL("/dashboard", request.url))
    }

    console.log("[v0] User already exists, redirecting based on role:", existingUser.role)

    if (existingUser.role === "admin") {
      return NextResponse.redirect(new URL("/admin-panel-2024", request.url))
    }

    return NextResponse.redirect(new URL("/dashboard", request.url))
  } catch (error) {
    console.error("[v0] OAuth callback exception:", error)
    const errorMessage = error instanceof Error ? error.message : "Unknown error"
    return NextResponse.redirect(
      new URL(`/auth/login?error=${encodeURIComponent(errorMessage)}`, request.url)
    )
  }
}
