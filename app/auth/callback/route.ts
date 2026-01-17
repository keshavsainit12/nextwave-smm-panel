import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get("code")

  if (code) {
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

    await supabase.auth.exchangeCodeForSession(code)

    // Get user data
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (user) {
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

      const { data: existingUser } = await supabaseAdmin.from("users").select("id, role").eq("id", user.id).single()

      if (!existingUser) {
        // Create user profile for OAuth user
        const { data: tierData } = await supabaseAdmin.from("user_tiers").select("id").eq("name", "Regular").single()

        const referralCode = "REF" + Math.random().toString(36).substring(2, 10).toUpperCase()

        await supabaseAdmin.from("users").insert({
          id: user.id,
          email: user.email!,
          full_name: user.user_metadata.full_name || user.user_metadata.name || user.email!.split("@")[0],
          tier_id: tierData?.id || null,
          referral_code: referralCode,
          role: "user",
          balance: 0,
          total_spent: 0,
          total_orders: 0,
        })

        return NextResponse.redirect(new URL("/dashboard", request.url))
      }

      if (existingUser.role === "admin") {
        return NextResponse.redirect(new URL("/admin-panel-2024", request.url))
      }
    }
  }

  // Default redirect to dashboard for regular users
  return NextResponse.redirect(new URL("/dashboard", request.url))
}
