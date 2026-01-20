"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export async function deleteUserTransaction(transactionId: string, userId: string) {
  try {
    const supabase = await createClient()

    // Verify user owns this transaction
    const { data: transaction, error: fetchError } = await supabase
      .from("transactions")
      .select("user_id, amount, status, type")
      .eq("id", transactionId)
      .single()

    if (fetchError || !transaction) {
      return { error: "Transaction not found" }
    }

    if (transaction.user_id !== userId) {
      return { error: "Unauthorized" }
    }

    // Only allow deleting pending or failed transactions (not completed ones)
    if (transaction.status === "completed") {
      return { error: "Cannot delete completed transactions. Contact support." }
    }

    // Delete the transaction
    const { error: deleteError } = await supabase
      .from("transactions")
      .delete()
      .eq("id", transactionId)

    if (deleteError) {
      return { error: "Failed to delete transaction" }
    }

    revalidatePath("/dashboard/transaction-history")
    return { success: true }
  } catch (error: any) {
    console.error("[v0] Error deleting transaction:", error)
    return { error: error.message || "Failed to delete transaction" }
  }
}
