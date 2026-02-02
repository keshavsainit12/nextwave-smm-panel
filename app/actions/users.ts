"use server"

import { createAdminClient } from "@/lib/supabase/admin"
import { revalidatePath } from "next/cache"

// Tier to price multiplier mapping
const TIER_MULTIPLIERS: Record<number, number> = {
  1: 3.0,  // Normal User
  2: 2.5,  // Bulk Buyer
  3: 2.0,  // Reseller
  4: 1.5,  // VIP
}

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

    // Prepare update data
    const updateData: Record<string, any> = { ...data }
    
    // Auto-set price_multiplier based on tier
    if (data.tier !== undefined) {
      updateData.price_multiplier = TIER_MULTIPLIERS[data.tier] || 3.0
      console.log("[v0] Setting price_multiplier:", updateData.price_multiplier, "for tier:", data.tier)
    }

    const { error } = await supabase.from("users").update(updateData).eq("id", userId)

    if (error) {
      console.error("[v0] Update user error:", error.message)
      return { success: false, error: error.message || "Failed to update user" }
    }

    revalidatePath("/admin-panel-2024/users")
    revalidatePath("/admin-panel-2024")
    revalidatePath("/dashboard")

    console.log("[v0] User updated successfully with tier and multiplier")
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
    currency?: string
  },
) {
  try {
    const supabase = createAdminClient()

    console.log("[v0] Updating user profile:", userId, data)

    // Validate currency if provided
    const ALLOWED_CURRENCIES = ['USD', 'EUR', 'GBP', 'INR', 'PKR', 'AED']
    if (data.currency && !ALLOWED_CURRENCIES.includes(data.currency)) {
      return { success: false, error: `Invalid currency. Allowed currencies: ${ALLOWED_CURRENCIES.join(', ')}` }
    }

    // Only allow updating full_name and currency
    const updateData: any = {}
    
    if (data.full_name !== undefined) {
      updateData.full_name = data.full_name
    }
    
    if (data.currency !== undefined) {
      updateData.currency = data.currency
      updateData.currency_updated_at = new Date().toISOString()
      console.log("[v0] Currency changed to:", data.currency)
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
  // Password changes disabled - users should use forgot password flow instead
  return { 
    success: false, 
    error: "Password changes are managed through the forgot password flow. Please use 'Forgot Password' to change your password securely." 
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
