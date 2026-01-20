import { createClient } from "@/lib/supabase/server"
import { NextRequest, NextResponse } from "next/server"
import crypto from "crypto"
import { revalidatePath } from "next/cache"

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()

    console.log("[v0] Instant payment webhook received:", {
      transactionId: body.transactionId || body.transaction_id,
      status: body.status,
      amount: body.amount,
      allBody: JSON.stringify(body),
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

    // Verify webhook signature if present
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

    // Get the transaction ID from webhook payload (try multiple field names)
    const webhookTransactionId = body.transactionId || body.transaction_id || body.id

    // Try to find transaction by payment_id first (original transaction ID we sent)
    let transaction = null
    let searchField = "payment_id"
    
    if (webhookTransactionId) {
      const { data } = await supabase
        .from("transactions")
        .select("*")
        .eq("payment_id", webhookTransactionId)
        .single()
      
      if (data) {
        transaction = data
        console.log("[v0] Transaction found by payment_id:", transaction.id)
      }
    }

    // If not found by payment_id, try by notes (fallback)
    if (!transaction && webhookTransactionId) {
      const { data } = await supabase
        .from("transactions")
        .select("*")
        .eq("id", webhookTransactionId)
        .single()
      
      if (data) {
        transaction = data
        searchField = "transaction_id (direct)"
        console.log("[v0] Transaction found by direct ID:", transaction.id)
      }
    }

    if (!transaction) {
      console.error("[v0] Transaction not found:", {
        webhookTransactionId,
        searchedBy: searchField,
      })
      return NextResponse.json({ success: false, error: "Transaction not found" }, { status: 404 })
    }

    if (body.status === 1 || body.status === "1" || body.status === "success") {
      // CRITICAL: Check if already completed to prevent double charge
      if (transaction.status === "completed") {
        console.log("[v0] DUPLICATE WEBHOOK - Transaction already completed, skipping to prevent double charge:", {
          transactionId: transaction.id,
          userId: transaction.user_id,
          amount: transaction.amount,
        })
        return NextResponse.json({ success: true, message: "Already processed - duplicate webhook ignored" })
      }

      // Payment successful - NOW update status
      console.log("[v0] Payment successful, updating wallet:", {
        userId: transaction.user_id,
        amount: transaction.amount,
        transactionId: transaction.id,
      })

      // Update transaction status FIRST with atomic check
      const { data: updateResult, error: txError } = await supabase
        .from("transactions")
        .update({ status: "completed", updated_at: new Date().toISOString() })
        .eq("id", transaction.id)
        .eq("status", "pending")  // ATOMIC: Only update if still pending
        .select()
        .single()

      if (txError || !updateResult) {
        console.error("[v0] Transaction status update failed (may already be completed):", txError)
        // If update failed, check if it's already completed
        const { data: checkTx } = await supabase
          .from("transactions")
          .select("status")
          .eq("id", transaction.id)
          .single()

        if (checkTx?.status === "completed") {
          console.log("[v0] Transaction already completed by another webhook call")
          return NextResponse.json({ success: true, message: "Already completed" })
        }

        return NextResponse.json({ success: false, error: "Failed to update transaction" }, { status: 500 })
      }

      // THEN update user balance
      const { data: user, error: userError } = await supabase
        .from("users")
        .select("balance")
        .eq("id", transaction.user_id)
        .single()

      if (userError) {
        console.error("[v0] User fetch error:", userError.message)
        return NextResponse.json({ success: false, error: "User not found" }, { status: 404 })
      }

      if (user) {
        const currentBalance = Number(user.balance) || 0
        const amountToAdd = Number(transaction.amount) || 0
        const newBalance = currentBalance + amountToAdd

        console.log("[v0] Crediting wallet:", {
          userId: transaction.user_id,
          currentBalance,
          amountToAdd,
          newBalance,
        })

        const { error: balanceError } = await supabase
          .from("users")
          .update({ balance: newBalance, updated_at: new Date().toISOString() })
          .eq("id", transaction.user_id)

        if (balanceError) {
          console.error("[v0] Balance update error:", balanceError.message)
          // Revert transaction status if balance update fails
          await supabase
            .from("transactions")
            .update({ status: "pending" })
            .eq("id", transaction.id)
            .catch((err) => console.log("[v0] Revert failed:", err))
          return NextResponse.json({ success: false, error: "Balance update failed" }, { status: 500 })
        }

        console.log("[v0] Wallet credited successfully:", {
          userId: transaction.user_id,
          amountAdded: amountToAdd,
          balanceBefore: currentBalance,
          balanceAfter: newBalance,
        })
      }

      // Log activity
      try {
        await supabase.from("activity_logs").insert({
          user_id: transaction.user_id,
          action: "deposit",
          entity_type: "transaction",
          entity_id: transaction.id,
          details: {
            amount: transaction.amount,
            method: "instant_payment",
            status: "completed",
            transactionId: webhookTransactionId,
          },
          ip_address: req.ip || "unknown",
        })
      } catch (logErr) {
        console.warn("[v0] Activity log error:", logErr)
      }

      // Revalidate admin dashboard and deposits page
      try {
        revalidatePath("/admin-panel-2024")
        revalidatePath("/admin-panel-2024/deposits")
        revalidatePath("/admin-panel-2024/transaction-history")
        revalidatePath("/dashboard/deposit")
        revalidatePath("/dashboard")
        revalidatePath("/dashboard/transaction-history")
        console.log("[v0] All pages revalidated after deposit completion")
      } catch (err) {
        console.log("[v0] Note: Could not revalidate pages:", err)
      }

      return NextResponse.json({ success: true, message: "Payment processed successfully" })
    } else if (body.status === -1 || body.status === "-1" || body.status === "failed") {
      // FAILED: Do NOT credit wallet
      console.log("[v0] Payment failed - NOT crediting wallet:", transaction.id)

      const { error } = await supabase
        .from("transactions")
        .update({ status: "failed", updated_at: new Date().toISOString() })
        .eq("id", transaction.id)

      if (error) {
        console.error("[v0] Transaction update error:", error.message)
      }

      try {
        revalidatePath("/dashboard/deposit")
        revalidatePath("/dashboard/transaction-history")
        revalidatePath("/admin-panel-2024/transaction-history")
        console.log("[v0] Pages revalidated after deposit failure")
      } catch (err) {
        console.log("[v0] Note: Could not revalidate pages:", err)
      }

      return NextResponse.json({ success: true, message: "Payment failed" })
    } else {
      // Payment pending
      console.log("[v0] Payment pending:", transaction.id)

      const { error } = await supabase
        .from("transactions")
        .update({ status: "pending", updated_at: new Date().toISOString() })
        .eq("id", transaction.id)

      if (error) {
        console.error("[v0] Transaction update error:", error.message)
      }

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
