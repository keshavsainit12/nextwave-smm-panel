import { type NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"
import * as bcrypt from "bcryptjs"

// Admin credentials
const ADMIN_USERNAME = "admin202502"
const ADMIN_PASSWORD_HASH = bcrypt.hashSync("admin@123", 10)
const ADMIN_EMAIL = "admin@nextwavesmm.com" // Admin email for settings
const ADMIN_USER_ID = "00000000-0000-0000-0000-000000000001" // Fixed admin user ID

export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json()

    // Verify credentials
    if (username === ADMIN_USERNAME && bcrypt.compareSync(password, ADMIN_PASSWORD_HASH)) {
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

      return NextResponse.json({ success: true })
    }

    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })
  } catch (error) {
    return NextResponse.json({ error: "Login failed" }, { status: 500 })
  }
}
