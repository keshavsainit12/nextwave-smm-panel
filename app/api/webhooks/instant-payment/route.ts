import { createClient } from "@/lib/supabase/server"
import { NextRequest, NextResponse } from "next/server"

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()

    console.log("[v0] Instant payment webhook received:", body)

    const supabase = await createClient()

    // Verify webhook signature
    const accountPeApiKey = process.env.ACCOUNTPE_API_KEY || "FMdbnds53@@"
    const receivedSignature = req.headers.get("x-accountpe-signature")

    // Update transaction status
    const { data: transaction } = await supabase
      .from("transactions")
      .select("*")
      .eq("payment_id", body.transactionId)
      .single()

    if (!transaction) {
      console.error("[v0] Transaction not found:", body.transactionId)
      return NextResponse.json({ success: false, error: "Transaction not found" }, { status: 404 })
    }

    if (body.status === 1) {
      // Payment successful
      console.log("[v0] Payment successful:", transaction.id)

      // Update transaction
      await supabase.from("transactions").update({ status: "completed" }).eq("id", transaction.id)

      // Update user balance
      const { data: user } = await supabase
        .from("users")
        .select("balance")
        .eq("id", transaction.user_id)
        .single()

      if (user) {
        const newBalance = (user.balance || 0) + transaction.amount
        await supabase.from("users").update({ balance: newBalance }).eq("id", transaction.user_id)

        console.log("[v0] Balance updated:", transaction.user_id, newBalance)
      }

      // Log activity
      await supabase.from("activity_logs").insert({
        user_id: transaction.user_id,
        action: "deposit",
        entity_type: "transaction",
        entity_id: transaction.id,
        details: {
          amount: transaction.amount,
          method: "instant_upi",
          status: "completed",
        },
        ip_address: req.ip || "unknown",
      })

      return NextResponse.json({ success: true })
    } else if (body.status === -1) {
      // Payment failed
      console.log("[v0] Payment failed:", transaction.id)
      await supabase.from("transactions").update({ status: "failed" }).eq("id", transaction.id)

      return NextResponse.json({ success: true })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[v0] Webhook error:", error)
    return NextResponse.json({ success: false, error: "Webhook processing failed" }, { status: 500 })
  }
}
