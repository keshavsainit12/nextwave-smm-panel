import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { resendOrderToProvider } from "@/app/actions/admin-orders"

/**
 * Admin-only endpoint to resend a failed order to the external SMM provider
 * POST /api/admin/resend-order
 * Body: { order_id: string }
 */
export async function POST(request: Request) {
  try {
    // Check authentication
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Check if user is admin
    const { data: userData } = await supabase.from("users").select("role, is_admin").eq("id", user.id).single()

    if (!userData?.is_admin && userData?.role !== "admin") {
      return NextResponse.json({ error: "Forbidden - Admin access required" }, { status: 403 })
    }

    // Parse request body
    const body = await request.json()
    const { order_id } = body

    if (!order_id) {
      return NextResponse.json({ error: "Missing order_id" }, { status: 400 })
    }

    // Resend order using admin action
    const result = await resendOrderToProvider(order_id)

    if (result.error) {
      return NextResponse.json(
        {
          success: false,
          error: result.error,
          details: result.details,
        },
        { status: 400 },
      )
    }

    return NextResponse.json({
      success: true,
      message: result.message,
      external_order_id: result.external_order_id,
      warning: result.warning,
    })
  } catch (error: any) {
    console.error("[API] Resend order error:", error)
    return NextResponse.json({ error: "Internal server error", message: error.message }, { status: 500 })
  }
}
