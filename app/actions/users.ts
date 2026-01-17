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
  const supabase = createAdminClient()

  console.log("[v0] Updating user:", userId, data)

  const { error } = await supabase.from("users").update(data).eq("id", userId)

  if (error) {
    console.error("[v0] Update user error:", error)
    throw new Error(error.message || "Failed to update user")
  }

  revalidatePath("/admin-panel-2024/users")
  revalidatePath("/admin-panel-2024")

  return { success: true }
}

export async function deleteUser(userId: string) {
  const supabase = createAdminClient()

  console.log("[v0] Deleting user:", userId)

  const { error } = await supabase.from("users").update({ status: "deleted" }).eq("id", userId)

  if (error) {
    console.error("[v0] Delete user error:", error)
    throw new Error(error.message || "Failed to delete user")
  }

  revalidatePath("/admin-panel-2024/users")
  revalidatePath("/admin-panel-2024")

  return { success: true }
}

export async function banUser(userId: string) {
  const supabase = createAdminClient()

  console.log("[v0] Banning user:", userId)

  const { error } = await supabase.from("users").update({ status: "banned" }).eq("id", userId)

  if (error) {
    console.error("[v0] Ban user error:", error)
    throw new Error(error.message || "Failed to ban user")
  }

  revalidatePath("/admin-panel-2024/users")
  revalidatePath("/admin-panel-2024")

  return { success: true }
}
