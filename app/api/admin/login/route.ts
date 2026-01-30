import { type NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"
import * as bcrypt from "bcryptjs"
import { createAdminClient } from "@/lib/supabase/admin"

const ADMIN_EMAIL = "admin@nextwavesmm.com" // Admin email for settings
const ADMIN_USER_ID = "00000000-0000-0000-0000-000000000001" // Fixed admin user ID

export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json()

    // Get admin credentials from database
    const supabase = createAdminClient()
    const { data: adminCreds, error } = await supabase
      .from("admin_credentials")
      .select("username, password_hash, email, user_id")
      .eq("username", username)
      .single()

    if (error || !adminCreds) {
      console.error("[v0] Admin credentials fetch error:", error)
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })
    }

    // Verify password
    if (bcrypt.compareSync(password, adminCreds.password_hash)) {
      // Set admin session cookie with user info
      const cookieStore = await cookies()
      
      // Store admin session
      cookieStore.set("admin_session", "authenticated", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 60 * 60 * 24 * 7, // 7 days
        path: "/",
      })
      
      // Store admin user ID
      cookieStore.set("admin_user_id", adminCreds.user_id || ADMIN_USER_ID, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 60 * 60 * 24 * 7, // 7 days
        path: "/",
      })
      
      // Store admin email
      cookieStore.set("admin_email", adminCreds.email || ADMIN_EMAIL, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 60 * 60 * 24 * 7, // 7 days
        path: "/",
      })
      
      // Store admin username for display
      cookieStore.set("admin_username", adminCreds.username, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 60 * 60 * 24 * 7, // 7 days
        path: "/",
      })

      return NextResponse.json({ success: true })
    }

    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })
  } catch (error) {
    console.error("[v0] Login error:", error)
    return NextResponse.json({ error: "Login failed" }, { status: 500 })
  }
}
