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
    const adminSupabase = createAdminClient()

    if (!depositId || typeof depositId !== "string" || depositId.trim() === "") {
      return { success: false, error: "Invalid deposit ID" }
    }

    const cleanId = depositId.trim()

    // Get deposit details
    const { data: deposit, error: fetchError } = await adminSupabase
      .from("crypto_deposits")
      .select("id, user_id, amount, status")
      .eq("id", cleanId)
      .single()

    if (fetchError || !deposit) {
      return { success: false, error: "Deposit not found" }
    }

    if (deposit.status !== "pending") {
      return { success: false, error: `Cannot approve - deposit is already ${deposit.status}` }
    }

    const userId = deposit.user_id
    const amount = Number(deposit.amount) || 0

    if (amount <= 0) {
      return { success: false, error: "Invalid deposit amount" }
    }

    // Get current user balance
    const { data: userData, error: userError } = await adminSupabase
      .from("users")
      .select("balance")
      .eq("id", userId)
      .single()

    if (userError || !userData) {
      return { success: false, error: "User not found" }
    }

    const balanceBefore = Number(userData.balance) || 0
    const balanceAfter = balanceBefore + amount

    // Update user balance FIRST (critical)
    const { error: balanceError } = await adminSupabase
      .from("users")
      .update({ balance: balanceAfter })
      .eq("id", userId)

    if (balanceError) {
      return { success: false, error: "Failed to update user balance" }
    }

    // Update deposit status
    const { error: depositError } = await adminSupabase
      .from("crypto_deposits")
      .update({
        status: "approved",
        reviewed_at: new Date().toISOString(),
      })
      .eq("id", cleanId)

    if (depositError) {
      // Rollback balance
      await adminSupabase
        .from("users")
        .update({ balance: balanceBefore })
        .eq("id", userId)
      return { success: false, error: "Failed to update deposit" }
    }

    revalidatePath("/admin-panel-2024/deposits")
    return { success: true }
  } catch (error: any) {
    return { success: false, error: error?.message || "Unknown error" }
  }
}

export async function rejectDeposit(depositId: string, reason: string) {
  try {
    const adminSupabase = createAdminClient()

    if (!depositId || !reason || !depositId.trim() || !reason.trim()) {
      return { success: false, error: "Invalid input" }
    }

    const cleanId = depositId.trim()
    const cleanReason = reason.trim()

    // Get deposit details
    const { data: deposit, error: fetchError } = await adminSupabase
      .from("crypto_deposits")
      .select("id, status")
      .eq("id", cleanId)
      .single()

    if (fetchError || !deposit) {
      return { success: false, error: "Deposit not found" }
    }

    if (deposit.status !== "pending") {
      return { success: false, error: `Cannot reject - deposit is already ${deposit.status}` }
    }

    // Update deposit status
    const { error: updateError } = await adminSupabase
      .from("crypto_deposits")
      .update({
        status: "rejected",
        admin_notes: cleanReason,
        reviewed_at: new Date().toISOString(),
      })
      .eq("id", cleanId)

    if (updateError) {
      return { success: false, error: "Failed to reject deposit" }
    }

    revalidatePath("/admin-panel-2024/deposits")
    return { success: true }
  } catch (error: any) {
    return { success: false, error: error?.message || "Unknown error" }
  }
}
