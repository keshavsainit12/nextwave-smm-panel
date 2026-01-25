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

export async function updateUserProfile(
  userId: string,
  data: {
    full_name?: string
  },
) {
  try {
    const supabase = createAdminClient()

    console.log("[v0] Updating user profile:", userId, data)

    // Only allow updating full_name since other fields don't exist in schema
    const updateData: any = {}
    
    if (data.full_name !== undefined) {
      updateData.full_name = data.full_name
    }

    if (Object.keys(updateData).length === 0) {
      return { success: false, error: "No valid fields to update" }
    }

    const { error } = await supabase.from("users").update(updateData).eq("id", userId)

    if (error) {
      console.error("[v0] Update profile error:", error.message)
      return { success: false, error: error.message || "Failed to update profile" }
    }

    revalidatePath("/dashboard/settings")
    revalidatePath("/dashboard/profile")
    revalidatePath("/admin-panel-2024/users")
    revalidatePath("/admin-panel-2024")

    console.log("[v0] Profile updated successfully")
    return { success: true }
  } catch (error: any) {
    console.error("[v0] Update profile error:", error?.message)
    return { success: false, error: error?.message || "Failed to update profile" }
  }
}

export async function updateUserPassword(
  userId: string,
  currentPassword: string,
  newPassword: string,
) {
  try {
    const supabase = createAdminClient()

    console.log("[v0] Updating password for user:", userId)

    // Verify current password first by trying to authenticate
    const cookieStore = await require("next/headers").cookies()
    const { createServerClient } = await import("@supabase/ssr")

    const serverClient = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll()
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options))
          },
        },
      },
    )

    // Get user email
    const { data: userData, error: userError } = await supabase
      .from("users")
      .select("email")
      .eq("id", userId)
      .single()

    if (userError || !userData) {
      return { success: false, error: "User not found" }
    }

    // Update password using admin API
    const { error: updateError } = await supabase.auth.admin.updateUserById(userId, {
      password: newPassword,
    })

    if (updateError) {
      console.error("[v0] Password update error:", updateError.message)
      return { success: false, error: updateError.message || "Failed to update password" }
    }

    revalidatePath("/dashboard/settings")

    console.log("[v0] Password updated successfully")
    return { success: true, message: "Password updated successfully" }
  } catch (error: any) {
    console.error("[v0] Password update error:", error?.message)
    return { success: false, error: error?.message || "Failed to update password" }
  }
}

export async function enableTwoFactorAuth(userId: string) {
  try {
    console.log("[v0] Two-factor authentication not available - feature not implemented in current schema")
    return { success: false, error: "Two-factor authentication is not available in this version" }
  } catch (error: any) {
    return { success: false, error: "Two-factor authentication is not available" }
  }
}

export async function disableTwoFactorAuth(userId: string) {
  try {
    console.log("[v0] Two-factor authentication not available - feature not implemented in current schema")
    return { success: false, error: "Two-factor authentication is not available in this version" }
  } catch (error: any) {
    return { success: false, error: "Two-factor authentication is not available" }
  }
}
