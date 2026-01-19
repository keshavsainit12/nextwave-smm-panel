import { type NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"
import * as fs from "fs"
import * as path from "path"

export async function POST(request: NextRequest) {
  try {
    // Check if admin is authenticated
    const cookieStore = await cookies()
    const adminSession = cookieStore.get("admin_session")

    if (!adminSession || adminSession.value !== "authenticated") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { newUsername } = await request.json()

    // Validate username
    if (!newUsername || newUsername.trim().length < 3) {
      return NextResponse.json({ error: "Username must be at least 3 characters" }, { status: 400 })
    }

    // Update the API route with new username
    const routePath = path.join(process.cwd(), "app/api/admin/login/route.ts")
    let routeContent = fs.readFileSync(routePath, "utf-8")

    // Replace the old username with new one
    routeContent = routeContent.replace(
      /const ADMIN_USERNAME = ".*?"/,
      `const ADMIN_USERNAME = "${newUsername}"`
    )

    fs.writeFileSync(routePath, routeContent)

    console.log(`[v0] Admin username changed from old to: ${newUsername}`)

    return NextResponse.json({ success: true, message: "Username changed successfully" })
  } catch (error) {
    console.error("[v0] Change username error:", error)
    return NextResponse.json({ error: "Failed to change username" }, { status: 500 })
  }
}
