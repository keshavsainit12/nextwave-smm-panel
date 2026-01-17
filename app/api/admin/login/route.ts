import { type NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"
import * as bcrypt from "bcryptjs"

// Admin credentials
const ADMIN_USERNAME = "admin202502"
const ADMIN_PASSWORD_HASH = bcrypt.hashSync("admin@123", 10)

export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json()

    // Verify credentials
    if (username === ADMIN_USERNAME && bcrypt.compareSync(password, ADMIN_PASSWORD_HASH)) {
      // Set admin session cookie
      const cookieStore = await cookies()
      cookieStore.set("admin_session", "authenticated", {
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
