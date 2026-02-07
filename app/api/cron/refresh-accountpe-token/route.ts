import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

/**
 * Cron job to refresh AccountPe JWT token
 * Run every 6 hours to keep token fresh
 */
export async function GET(request: Request) {
  try {
    // Verify this is a cron job request
    const authHeader = request.headers.get("authorization")
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const supabase = createClient()

    // Get AccountPe credentials from environment
    const email = process.env.ACCOUNTPE_EMAIL
    const password = process.env.ACCOUNTPE_PASSWORD

    if (!email || !password) {
      console.error("[Cron] AccountPe credentials not configured")
      return NextResponse.json(
        { error: "AccountPe credentials not configured" },
        { status: 500 }
      )
    }

    console.log("[Cron] Refreshing AccountPe token...")

    // Call AccountPe auth API
    const response = await fetch(
      "https://api.accountpe.com/api/payin/admin/auth",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email,
          password: password,
        }),
      }
    )

    if (!response.ok) {
      console.error(
        "[Cron] AccountPe auth failed:",
        response.status,
        response.statusText
      )
      return NextResponse.json(
        { error: "Failed to authenticate with AccountPe" },
        { status: response.status }
      )
    }

    const data = await response.json()
    const token = data.token

    if (!token) {
      console.error("[Cron] No token in AccountPe response:", data)
      return NextResponse.json(
        { error: "No token received from AccountPe" },
        { status: 500 }
      )
    }

    // Update token in system_settings
    const { error } = await supabase
      .from("system_settings")
      .update({
        accountpe_token: token,
        updated_at: new Date().toISOString(),
      })
      .eq("id", 1)

    if (error) {
      console.error("[Cron] Failed to update token in database:", error)
      return NextResponse.json(
        { error: "Failed to update token in database" },
        { status: 500 }
      )
    }

    console.log("[Cron] AccountPe token refreshed successfully")

    return NextResponse.json({
      success: true,
      message: "Token refreshed successfully",
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("[Cron] Error refreshing AccountPe token:", error)
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    )
  }
}
