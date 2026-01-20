"use server"

import { createAdminClient } from "@/lib/supabase/admin"
import { revalidatePath } from "next/cache"

export async function updateTransactionStatus(
  transactionId: string,
  newStatus: "pending" | "completed" | "failed",
  adminNotes?: string
) {
  try {
    const supabase = createAdminClient()

    console.log("[v0] Admin updating transaction status:", { transactionId, newStatus })

    const { error } = await supabase
      .from("transactions")
      .update({
        status: newStatus,
        admin_notes: adminNotes || "",
        updated_at: new Date().toISOString(),
      })
      .eq("id", transactionId)

    if (error) {
      console.error("[v0] Update transaction error:", error)
      return { error: error.message }
    }

    revalidatePath("/admin-panel-2024/transaction-history")
    revalidatePath("/dashboard/transaction-history")
    return { success: true }
  } catch (error: any) {
    console.error("[v0] Error updating transaction:", error)
    return { error: error.message || "Failed to update transaction" }
  }
}

export async function deleteTransaction(transactionId: string) {
  try {
    const supabase = createAdminClient()

    // Get transaction details first
    const { data: transaction, error: fetchError } = await supabase
      .from("transactions")
      .select("user_id, amount, status, type")
      .eq("id", transactionId)
      .single()

    if (fetchError || !transaction) {
      return { error: "Transaction not found" }
    }

    console.log("[v0] Deleting transaction:", { transactionId, type: transaction.type })

    // If it's a completed deposit, refund the user
    if (transaction.type === "deposit" && transaction.status === "completed") {
      const { data: user, error: userError } = await supabase
        .from("users")
        .select("balance")
        .eq("id", transaction.user_id)
        .single()

      if (user) {
        const newBalance = (user.balance || 0) - Number(transaction.amount)
        await supabase
          .from("users")
          .update({ balance: Math.max(0, newBalance) })
          .eq("id", transaction.user_id)
          .catch((err) => console.log("[v0] Balance update error:", err))
      }
    }

    // Delete the transaction
    const { error: deleteError } = await supabase
      .from("transactions")
      .delete()
      .eq("id", transactionId)

    if (deleteError) {
      return { error: "Failed to delete transaction" }
    }

    // Log activity
    await supabase.from("activity_logs").insert({
      user_id: transaction.user_id,
      action: "transaction_deleted",
      entity_type: "transaction",
      entity_id: transactionId,
      details: { amount: transaction.amount, type: transaction.type },
      ip_address: "admin",
    }).catch((err) => console.log("[v0] Activity log error:", err))

    revalidatePath("/admin-panel-2024/transaction-history")
    revalidatePath("/dashboard/transaction-history")

    return { success: true }
  } catch (error: any) {
    console.error("[v0] Error deleting transaction:", error)
    return { error: error.message || "Failed to delete transaction" }
  }
}

export async function getUserTransactions(userId: string) {
  try {
    const supabase = createAdminClient()

    const { data, error } = await supabase
      .from("transactions")
      .select("*, orders(id, service_id, services(name), quantity, price, status), users(email, full_name)")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })

    if (error) {
      return { error: error.message }
    }

    return { data }
  } catch (error: any) {
    console.error("[v0] Error fetching user transactions:", error)
    return { error: error.message || "Failed to fetch transactions" }
  }
}

export async function searchUserByEmail(email: string) {
  try {
    const supabase = createAdminClient()

    const { data, error } = await supabase
      .from("users")
      .select("id, email, full_name, balance, status")
      .ilike("email", `%${email}%`)
      .limit(10)

    if (error) {
      return { error: error.message }
    }

    return { data }
  } catch (error: any) {
    console.error("[v0] Error searching users:", error)
    return { error: error.message || "Failed to search users" }
  }
}
