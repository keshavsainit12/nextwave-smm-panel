import { type NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"
import * as bcrypt from "bcryptjs"

// Hardcoded admin credentials (no database needed)
const ADMIN_USERNAME = "admin202502"
const ADMIN_PASSWORD_HASH = "$2b$10$xAZfhfccemWZ.3qSG2Zpz.KJg15724ESXNnREOIwBNhkVXd9OGiVK" // admin@123
const ADMIN_EMAIL = "admin@nextwavesmm.com"
const ADMIN_USER_ID = "00000000-0000-0000-0000-000000000001"

export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json()

    console.log("[v0] Admin login attempt:", { username })

    // Verify username matches
    if (username !== ADMIN_USERNAME) {
      console.log("[v0] Invalid username")
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })
    }

    // Verify password with bcrypt
    if (bcrypt.compareSync(password, ADMIN_PASSWORD_HASH)) {
      console.log("[v0] Admin login successful")
      
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
      cookieStore.set("admin_user_id", ADMIN_USER_ID, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 60 * 60 * 24 * 7, // 7 days
        path: "/",
      })
      
      // Store admin email
      cookieStore.set("admin_email", ADMIN_EMAIL, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 60 * 60 * 24 * 7, // 7 days
        path: "/",
      })
      
      // Store admin username for display
      cookieStore.set("admin_username", ADMIN_USERNAME, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 60 * 60 * 24 * 7, // 7 days
        path: "/",
      })

      return NextResponse.json({ success: true })
    }

    console.log("[v0] Invalid password")
    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })
  } catch (error) {
    console.error("[v0] Login error:", error)
    return NextResponse.json({ error: "Login failed" }, { status: 500 })
  }
}
