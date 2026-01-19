import { createClient } from "@/lib/supabase/server"
import { NextRequest, NextResponse } from "next/server"
import crypto from "crypto"
import { revalidatePath } from "next/cache"

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()

    console.log("[v0] Instant payment webhook received:", {
      transactionId: body.transactionId,
      status: body.status,
      amount: body.amount,
    })

    const supabase = await createClient()

    // Get API credentials from environment
    const credentials = process.env.ACCOUNTPE_API_KEY
    if (!credentials) {
      console.error("[v0] ACCOUNTPE_API_KEY not configured")
      return NextResponse.json({ success: false, error: "Configuration missing" }, { status: 500 })
    }

    // Parse credentials to get password for signature verification
    let secret = credentials
    if (credentials.includes(":")) {
      const [, password] = credentials.split(":")
      secret = password
    }

    // Verify webhook signature
    const receivedSignature = req.headers.get("x-accountpe-signature")
    if (receivedSignature) {
      const bodyString = JSON.stringify(body)
      const expectedSignature = crypto.createHmac("sha256", secret).update(bodyString).digest("hex")
      
      if (receivedSignature !== expectedSignature) {
        console.error("[v0] Webhook signature verification failed")
        return NextResponse.json({ success: false, error: "Invalid signature" }, { status: 401 })
      }
      console.log("[v0] Webhook signature verified successfully")
    }

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
      console.log("[v0] Payment successful, updating wallet:", {
        userId: transaction.user_id,
        amount: transaction.amount,
      })

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

        console.log("[v0] Wallet credited successfully:", {
          userId: transaction.user_id,
          amount: transaction.amount,
          newBalance: newBalance,
        })
      }

      // Log activity
      await supabase.from("activity_logs").insert({
        user_id: transaction.user_id,
        action: "deposit",
        entity_type: "transaction",
        entity_id: transaction.id,
        details: {
          amount: transaction.amount,
          method: "instant_payment",
          status: "completed",
          transactionId: body.transactionId,
        },
        ip_address: req.ip || "unknown",
      })

      // Revalidate admin dashboard and deposits page
      try {
        revalidatePath("/admin-panel-2024")
        revalidatePath("/admin-panel-2024/deposits")
        console.log("[v0] Admin pages revalidated after deposit completion")
      } catch (err) {
        console.log("[v0] Note: Could not revalidate admin pages (expected in non-Next.js context):", err)
      }

      return NextResponse.json({ success: true, message: "Payment processed successfully" })
    } else if (body.status === -1) {
      // Payment failed
      console.log("[v0] Payment failed:", transaction.id)
      await supabase.from("transactions").update({ status: "failed" }).eq("id", transaction.id)

      // Revalidate pages on failure too
      try {
        revalidatePath("/admin-panel-2024/deposits")
        console.log("[v0] Admin pages revalidated after deposit failure")
      } catch (err) {
        console.log("[v0] Note: Could not revalidate admin pages (expected in non-Next.js context):", err)
      }

      return NextResponse.json({ success: true, message: "Payment failed" })
    } else {
      // Payment pending
      console.log("[v0] Payment pending:", transaction.id)
      await supabase.from("transactions").update({ status: "pending" }).eq("id", transaction.id)

      return NextResponse.json({ success: true, message: "Payment pending" })
    }
  } catch (error) {
    console.error("[v0] Webhook error:", error)
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Webhook processing failed" },
      { status: 500 }
    )
  }
}
