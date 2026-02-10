import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

// GET /api/user/payment-status?userId=xxx
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("userId")
    if (!userId) {
      return NextResponse.json({ error: "Missing userId" }, { status: 400 })
    }

    const supabase = createClient()

    // Get latest instant payment for user
    const { data: payment, error } = await supabase
      .from("instant_payments")
      .select("status, amount, id")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(1)
      .single()

    if (error || !payment) {
      return NextResponse.json({ status: "NOT_FOUND" })
    }

    // status: pending, completed, failed
    if (payment.status === "completed") {
      return NextResponse.json({ status: "SUCCESS", paymentId: payment.id, amount: payment.amount })
    } else if (payment.status === "failed") {
      return NextResponse.json({ status: "FAILED", paymentId: payment.id })
    } else {
      return NextResponse.json({ status: "PENDING", paymentId: payment.id })
    }
  } catch (error) {
    return NextResponse.json({ error: "Internal error", details: error instanceof Error ? error.message : String(error) }, { status: 500 })
  }
}
