"use server"

import { createAdminClient } from "@/lib/supabase/admin"
import { revalidatePath } from "next/cache"

export async function updateUser(
  userId: string,
  data: {
    balance?: number
    tier?: number
    status?: string
    full_name?: string | null
  },
) {
  try {
    const supabase = createAdminClient()

    console.log("[v0] Updating user:", userId, data)

    const { error } = await supabase.from("users").update(data).eq("id", userId)

    if (error) {
      console.error("[v0] Update user error:", error.message)
      return { success: false, error: error.message || "Failed to update user" }
    }

    revalidatePath("/admin-panel-2024/users")
    revalidatePath("/admin-panel-2024")

    console.log("[v0] User updated successfully")
    return { success: true }
  } catch (error: any) {
    console.error("[v0] Update user error:", error?.message)
    return { success: false, error: error?.message || "Failed to update user" }
  }
}

export async function deleteUser(userId: string) {
  try {
    const supabase = createAdminClient()

    console.log("[v0] Deleting user:", userId)

    // Delete user's API key first
    const { error: apiKeyError } = await supabase
      .from("users")
      .update({ api_key: null })
      .eq("id", userId)

    // Delete user's orders
    const { error: ordersError } = await supabase
      .from("orders")
      .delete()
      .eq("user_id", userId)

    if (ordersError) console.warn("[v0] Could not delete orders:", ordersError)

    // Delete user's crypto deposits
    const { error: depositsError } = await supabase
      .from("crypto_deposits")
      .delete()
      .eq("user_id", userId)

    if (depositsError) console.warn("[v0] Could not delete deposits:", depositsError)

    // Delete user's transactions
    const { error: txError } = await supabase
      .from("transactions")
      .delete()
      .eq("user_id", userId)

    if (txError) console.warn("[v0] Could not delete transactions:", txError)

    // Delete user auth account
    const { error: delError } = await supabase.auth.admin.deleteUser(userId)

    if (delError) {
      console.error("[v0] Auth delete error:", delError.message)
      return { success: false, error: "Failed to delete user account" }
    }

    revalidatePath("/admin-panel-2024/users")
    revalidatePath("/admin-panel-2024")

    console.log("[v0] User deleted successfully")
    return { success: true }
  } catch (error: any) {
    console.error("[v0] Delete user error:", error?.message)
    return { success: false, error: error?.message || "Failed to delete user" }
  }
}

export async function banUser(userId: string) {
  try {
    const supabase = createAdminClient()

    console.log("[v0] Banning user:", userId)

    const { error } = await supabase.from("users").update({ status: "banned" }).eq("id", userId)

    if (error) {
      console.error("[v0] Ban user error:", error.message)
      return { success: false, error: error.message || "Failed to ban user" }
    }

    revalidatePath("/admin-panel-2024/users")
    revalidatePath("/admin-panel-2024")

    console.log("[v0] User banned successfully")
    return { success: true }
  } catch (error: any) {
    console.error("[v0] Ban user error:", error?.message)
    return { success: false, error: error?.message || "Failed to ban user" }
  }
}
