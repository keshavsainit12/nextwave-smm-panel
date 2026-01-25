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
    console.log("[v0] ===== APPROVE DEPOSIT START =====")
    console.log("[v0] Deposit ID:", depositId, "Type:", typeof depositId)
    
    const adminSupabase = createAdminClient()
    console.log("[v0] Admin client created")

    if (!depositId || typeof depositId !== "string" || depositId.trim() === "") {
      console.error("[v0] Invalid deposit ID - failing validation")
      return { success: false, error: "Invalid deposit ID" }
    }

    const cleanId = depositId.trim()
    console.log("[v0] Clean ID:", cleanId)

    // Step 1: Get deposit details
    console.log("[v0] STEP 1: Fetching deposit with ID:", cleanId)
    const { data: deposit, error: fetchError } = await adminSupabase
      .from("crypto_deposits")
      .select("id, user_id, amount, status")
      .eq("id", cleanId)
      .single()

    console.log("[v0] Fetch result - Error:", fetchError?.message, "Deposit found:", !!deposit)
    
    if (fetchError) {
      console.error("[v0] Fetch error details:", fetchError)
      return { success: false, error: `Fetch failed: ${fetchError.message}` }
    }
    
    if (!deposit) {
      console.error("[v0] Deposit is null after fetch")
      return { success: false, error: "Deposit not found" }
    }

    console.log("[v0] Deposit data:", { id: deposit.id, user_id: deposit.user_id, amount: deposit.amount, status: deposit.status })

    if (deposit.status !== "pending") {
      console.warn("[v0] Deposit is not pending, status:", deposit.status)
      return { success: false, error: `Cannot approve - deposit is already ${deposit.status}` }
    }

    const userId = deposit.user_id
    const amount = Number(deposit.amount) || 0

    console.log("[v0] Extracted - UserID:", userId, "Amount:", amount)

    if (amount <= 0) {
      console.error("[v0] Invalid amount:", amount)
      return { success: false, error: "Invalid deposit amount" }
    }

    // Step 2: Get current user balance
    console.log("[v0] STEP 2: Fetching user balance for ID:", userId)
    const { data: userData, error: userError } = await adminSupabase
      .from("users")
      .select("balance")
      .eq("id", userId)
      .single()

    console.log("[v0] User fetch - Error:", userError?.message, "User found:", !!userData, "Balance:", userData?.balance)

    if (userError) {
      console.error("[v0] User fetch error details:", userError)
      return { success: false, error: `User not found: ${userError.message}` }
    }
    
    if (!userData) {
      console.error("[v0] User data is null")
      return { success: false, error: "User not found" }
    }

    const balanceBefore = Number(userData.balance) || 0
    const balanceAfter = balanceBefore + amount

    console.log("[v0] Balance calculation - Before:", balanceBefore, "Amount:", amount, "After:", balanceAfter)

    // Step 3: Update user balance FIRST (critical)
    console.log("[v0] STEP 3: Updating user balance to:", balanceAfter)
    const { error: balanceError } = await adminSupabase
      .from("users")
      .update({ balance: balanceAfter })
      .eq("id", userId)

    if (balanceError) {
      console.error("[v0] Balance update error:", balanceError.message, "Code:", balanceError.code)
      return { success: false, error: `Balance update failed: ${balanceError.message}` }
    }

    console.log("[v0] Balance updated successfully")

    // Step 4: Update deposit status
    console.log("[v0] STEP 4: Updating deposit status to approved for ID:', cleanId)
    const { error: depositError } = await adminSupabase
      .from("crypto_deposits")
      .update({
        status: "approved",
        reviewed_at: new Date().toISOString(),
      })
      .eq("id", cleanId)

    if (depositError) {
      console.error("[v0] Deposit update error:", depositError.message, "Code:", depositError.code)
      // Rollback balance
      console.log("[v0] ROLLING BACK balance to:", balanceBefore)
      await adminSupabase
        .from("users")
        .update({ balance: balanceBefore })
        .eq("id", userId)
      return { success: false, error: `Deposit update failed: ${depositError.message}` }
    }

    console.log("[v0] ===== APPROVE DEPOSIT SUCCESS =====")
    revalidatePath("/admin-panel-2024/deposits")
    return { success: true }
  } catch (error: any) {
    console.error("[v0] ===== APPROVE DEPOSIT EXCEPTION =====")
    console.error("[v0] Error message:", error?.message)
    console.error("[v0] Error stack:", error?.stack)
    return { success: false, error: error?.message || "Unknown error" }
  }
}

export async function rejectDeposit(depositId: string, reason: string) {
  try {
    console.log("[v0] Starting reject deposit:", depositId)
    
    const adminSupabase = createAdminClient()

    if (!depositId || !reason || !depositId.trim() || !reason.trim()) {
      console.error("[v0] Invalid input")
      return { success: false, error: "Invalid input" }
    }

    const cleanId = depositId.trim()
    const cleanReason = reason.trim()

    // Step 1: Get deposit details
    console.log("[v0] Fetching deposit:", cleanId)
    const { data: deposit, error: fetchError } = await adminSupabase
      .from("crypto_deposits")
      .select("id, status")
      .eq("id", cleanId)
      .single()

    if (fetchError || !deposit) {
      console.error("[v0] Failed to fetch deposit:", fetchError?.message)
      return { success: false, error: "Deposit not found" }
    }

    if (deposit.status !== "pending") {
      return { success: false, error: `Cannot reject - deposit is already ${deposit.status}` }
    }

    // Step 2: Update deposit status
    console.log("[v0] Updating deposit status to rejected...")
    const { error: updateError } = await adminSupabase
      .from("crypto_deposits")
      .update({
        status: "rejected",
        admin_notes: cleanReason,
        reviewed_at: new Date().toISOString(),
      })
      .eq("id", cleanId)

    if (updateError) {
      console.error("[v0] Update failed:", updateError.message)
      return { success: false, error: "Failed to reject deposit" }
    }

    console.log("[v0] Deposit rejected successfully")
    revalidatePath("/admin-panel-2024/deposits")
    return { success: true }
  } catch (error: any) {
    console.error("[v0] Reject error:", error?.message)
    return { success: false, error: error?.message || "Unknown error" }
  }
}
