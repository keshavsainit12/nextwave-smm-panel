"use server"

import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { revalidatePath } from "next/cache"

export async function submitCryptoDeposit(data: {
  cryptoCurrencyId: string
  amount: number
  cryptoAmount: string
  screenshotBase64: string
}) {
  try {
    const supabase = await createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
      console.error("[v0] Unauthorized: No user found")
      return { success: false, error: "Unauthorized" }
    }

    console.log("[v0] Creating deposit for user:", user.id)

    const { data: transaction, error: transactionError } = await supabase
      .from("transactions")
      .insert({
        user_id: user.id,
        type: "deposit",
        amount: data.amount,
        balance_before: 0,
        balance_after: 0,
        crypto_currency_id: data.cryptoCurrencyId,
        status: "pending",
      })
      .select()
      .single()

    if (transactionError) {
      console.error("[v0] Transaction creation error:", transactionError)
      return { success: false, error: "Failed to create transaction" }
    }

    const { error: depositError } = await supabase.from("crypto_deposits").insert({
      user_id: user.id,
      transaction_id: transaction.id,
      crypto_currency_id: data.cryptoCurrencyId,
      amount: data.amount,
      crypto_amount: data.cryptoAmount,
      screenshot_url: data.screenshotBase64,
      status: "pending",
    })

    if (depositError) {
      console.error("[v0] Deposit creation error:", depositError)
      return { success: false, error: "Failed to create deposit record" }
    }

    console.log("[v0] Deposit submitted successfully")
    revalidatePath("/dashboard/deposit")
    revalidatePath("/dashboard")

    return { success: true }
  } catch (error) {
    console.error("[v0] Submit deposit error:", error)
    return { success: false, error: "An unexpected error occurred" }
  }
}

export async function approveDeposit(depositId: string) {
  try {
    console.log("[v0] Starting approve deposit:", depositId)
    
    const adminSupabase = createAdminClient()

    // Validate depositId format
    if (!depositId || typeof depositId !== "string" || depositId.trim() === "") {
      console.error("[v0] Invalid deposit ID provided")
      return { success: false, error: "Invalid deposit ID" }
    }

    // Get deposit details
    const { data: deposit, error: fetchError } = await adminSupabase
      .from("crypto_deposits")
      .select("id, transaction_id, user_id, amount, status")
      .eq("id", depositId.trim())
      .single()

    if (fetchError) {
      console.error("[v0] Fetch error:", fetchError.message, "Code:", fetchError.code)
      return { success: false, error: "Deposit not found" }
    }

    if (!deposit) {
      console.error("[v0] Deposit is null")
      return { success: false, error: "Deposit not found" }
    }

    // Check if already approved/rejected
    if (deposit.status !== "pending") {
      console.error("[v0] Deposit status is not pending:", deposit.status)
      return { success: false, error: `Deposit already ${deposit.status}` }
    }

    const userId = deposit.user_id
    const amount = Number(deposit.amount)

    // Validate amount
    if (isNaN(amount) || amount <= 0) {
      console.error("[v0] Invalid amount:", amount)
      return { success: false, error: "Invalid deposit amount" }
    }

    // Get current user balance
    const { data: userData, error: userError } = await adminSupabase
      .from("users")
      .select("balance")
      .eq("id", userId)
      .single()

    if (userError || !userData) {
      console.error("[v0] User not found:", userError?.message)
      return { success: false, error: "User not found" }
    }

    const balanceBefore = Number(userData.balance) || 0
    const balanceAfter = balanceBefore + amount

    // Update deposit status FIRST
    const { error: depositUpdateError } = await adminSupabase
      .from("crypto_deposits")
      .update({
        status: "approved",
        reviewed_by: "admin",
        reviewed_at: new Date().toISOString(),
      })
      .eq("id", depositId.trim())

    if (depositUpdateError) {
      console.error("[v0] Deposit update error:", depositUpdateError.message, "Code:", depositUpdateError.code)
      return { success: false, error: "Failed to update deposit" }
    }

    // Update user balance (critical update)
    const { error: balanceUpdateError } = await adminSupabase
      .from("users")
      .update({ balance: balanceAfter })
      .eq("id", userId)

    if (balanceUpdateError) {
      console.error("[v0] Balance update error:", balanceUpdateError.message, "Code:", balanceUpdateError.code)
      // Rollback deposit status if balance update fails
      await adminSupabase
        .from("crypto_deposits")
        .update({ status: "pending" })
        .eq("id", depositId.trim())
      return { success: false, error: "Failed to update user balance" }
    }

    // Update transaction status (non-critical)
    const { error: txUpdateError } = await adminSupabase
      .from("transactions")
      .update({
        status: "completed",
        balance_before: balanceBefore,
        balance_after: balanceAfter,
      })
      .eq("id", deposit.transaction_id)

    if (txUpdateError) {
      console.warn("[v0] Transaction update warning:", txUpdateError.message)
    }

    console.log("[v0] Deposit approved successfully for user:", userId, "Amount:", amount)
    revalidatePath("/admin-panel-2024/deposits")
    return { success: true }
  } catch (error: any) {
    console.error("[v0] Approve deposit catch error:", error?.message || error)
    return { success: false, error: error?.message || "Unknown error occurred" }
  }
}

export async function rejectDeposit(depositId: string, reason: string) {
  try {
    console.log("[v0] Starting reject deposit:", depositId, "Reason:", reason)
    
    const adminSupabase = createAdminClient()

    // Validate inputs
    if (!depositId || typeof depositId !== "string" || depositId.trim() === "") {
      console.error("[v0] Invalid deposit ID provided")
      return { success: false, error: "Invalid deposit ID" }
    }

    if (!reason || typeof reason !== "string" || reason.trim() === "") {
      console.error("[v0] Invalid rejection reason provided")
      return { success: false, error: "Rejection reason is required" }
    }

    // Get deposit details using admin client
    const { data: deposit, error: fetchError } = await adminSupabase
      .from("crypto_deposits")
      .select("id, transaction_id, user_id, status")
      .eq("id", depositId.trim())
      .single()

    if (fetchError) {
      console.error("[v0] Fetch error:", fetchError.message, "Code:", fetchError.code)
      return { success: false, error: "Deposit not found" }
    }

    if (!deposit) {
      console.error("[v0] Deposit is null")
      return { success: false, error: "Deposit not found" }
    }

    if (deposit.status !== "pending") {
      console.error("[v0] Deposit status is not pending:", deposit.status)
      return { success: false, error: `Cannot reject - deposit status is ${deposit.status}` }
    }

    // Update deposit status
    const { error: updateError } = await adminSupabase
      .from("crypto_deposits")
      .update({
        status: "rejected",
        admin_notes: reason.trim(),
        reviewed_by: "admin",
        reviewed_at: new Date().toISOString(),
      })
      .eq("id", depositId.trim())

    if (updateError) {
      console.error("[v0] Update error:", updateError.message, "Code:", updateError.code)
      return { success: false, error: `Update failed: ${updateError.message}` }
    }

    // Update transaction if exists (non-critical)
    if (deposit.transaction_id) {
      const { error: txError } = await adminSupabase
        .from("transactions")
        .update({
          status: "failed",
          notes: `Rejected: ${reason.trim()}`,
        })
        .eq("id", deposit.transaction_id)

      if (txError) {
        console.warn("[v0] Transaction update warning:", txError.message)
      }
    }

    console.log("[v0] Deposit rejected successfully for user:", deposit.user_id)
    revalidatePath("/admin-panel-2024/deposits")
    return { success: true }
  } catch (error: any) {
    console.error("[v0] Reject catch error:", error?.message || error)
    return { success: false, error: error?.message || "Unknown error occurred" }
  }
}
