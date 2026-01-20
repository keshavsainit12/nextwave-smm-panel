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
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error("Unauthorized")

  // Get deposit details
  const { data: deposit } = await supabase
    .from("crypto_deposits")
    .select("*, transactions(user_id)")
    .eq("id", depositId)
    .single()

  if (!deposit) throw new Error("Deposit not found")

  const userId = deposit.transactions.user_id
  const amount = Number(deposit.amount)

  // Get current user balance
  const { data: userData } = await supabase.from("users").select("balance").eq("id", userId).single()

  if (!userData) throw new Error("User not found")

  const balanceBefore = Number(userData.balance)
  const balanceAfter = balanceBefore + amount

  // Update deposit status
  await supabase
    .from("crypto_deposits")
    .update({
      status: "approved",
      reviewed_by: user.id,
      reviewed_at: new Date().toISOString(),
    })
    .eq("id", depositId)

  // Update transaction status
  await supabase
    .from("transactions")
    .update({
      status: "completed",
      balance_before: balanceBefore,
      balance_after: balanceAfter,
    })
    .eq("id", deposit.transaction_id)

  // Update user balance
  await supabase.from("users").update({ balance: balanceAfter }).eq("id", userId)

  revalidatePath("/admin-panel-2024/deposits")
  return { success: true }
}

export async function rejectDeposit(depositId: string, reason: string) {
  try {
    console.log("[v0] Starting reject deposit:", depositId, reason)
    
    const adminSupabase = createAdminClient()

    // Get deposit details using admin client
    const { data: deposit, error: fetchError } = await adminSupabase
      .from("crypto_deposits")
      .select("id, transaction_id, user_id, status")
      .eq("id", depositId)
      .single()

    if (fetchError) {
      console.error("[v0] Fetch error:", fetchError.message)
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
        admin_notes: reason,
        reviewed_at: new Date().toISOString(),
      })
      .eq("id", depositId)

    if (updateError) {
      console.error("[v0] Update error:", updateError.message)
      return { success: false, error: `Update failed: ${updateError.message}` }
    }

    // Update transaction if exists
    if (deposit.transaction_id) {
      const { error: txError } = await adminSupabase
        .from("transactions")
        .update({
          status: "failed",
          notes: `Rejected: ${reason}`,
        })
        .eq("id", deposit.transaction_id)

      if (txError) {
        console.warn("[v0] Transaction update warning:", txError.message)
      }
    }

    console.log("[v0] Deposit rejected successfully")
    revalidatePath("/admin-panel-2024/deposits")
    return { success: true }
  } catch (error: any) {
    console.error("[v0] Reject catch error:", error?.message || error)
    return { success: false, error: error?.message || "Unknown error occurred" }
  }
}
