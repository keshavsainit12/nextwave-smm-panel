"use server"

import { createAdminClient } from "@/lib/supabase/admin"
import { cookies } from "next/headers"
import { revalidatePath } from "next/cache"
import * as bcrypt from "bcryptjs"

export async function changeAdminPassword(params: {
  userId: string
  currentPassword: string
  newPassword: string
  confirmPassword: string
}) {
  try {
    // Validate inputs
    if (!params.currentPassword || !params.newPassword || !params.confirmPassword) {
      return { success: false, error: "All fields are required" }
    }

    if (params.newPassword !== params.confirmPassword) {
      return { success: false, error: "New passwords do not match" }
    }

    if (params.newPassword.length < 6) {
      return { success: false, error: "Password must be at least 6 characters" }
    }

    if (params.currentPassword === params.newPassword) {
      return { success: false, error: "New password must be different from current password" }
    }

    const supabase = createAdminClient()
    
    // Get current admin credentials from database
    const { data: adminCreds, error: fetchError } = await supabase
      .from("admin_credentials")
      .select("password_hash, username")
      .eq("user_id", params.userId)
      .single()

    if (fetchError || !adminCreds) {
      console.error("[v0] Fetch admin credentials error:", fetchError)
      return { success: false, error: "Failed to retrieve admin credentials" }
    }

    // Verify current password
    if (!bcrypt.compareSync(params.currentPassword, adminCreds.password_hash)) {
      return { success: false, error: "Current password is incorrect" }
    }

    // Hash new password
    const newPasswordHash = bcrypt.hashSync(params.newPassword, 10)
    
    // Update password in database
    const { error: updateError } = await supabase
      .from("admin_credentials")
      .update({ 
        password_hash: newPasswordHash,
        updated_at: new Date().toISOString()
      })
      .eq("user_id", params.userId)

    if (updateError) {
      console.error("[v0] Update password error:", updateError)
      return { success: false, error: "Failed to update password" }
    }

    console.log("[v0] Admin password updated successfully for user:", params.userId)
    revalidatePath("/admin-panel-2024/settings")
    return { 
      success: true, 
      message: "Password changed successfully" 
    }
  } catch (error) {
    console.error("[v0] Change password error:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to change password",
    }
  }
}

export async function changeAdminUsername(params: {
  userId: string
  newUsername: string
}) {
  try {
    if (!params.newUsername || params.newUsername.length < 3) {
      return { success: false, error: "Username must be at least 3 characters" }
    }

    const supabase = createAdminClient()
    
    // Check if username already exists (for future multi-admin support)
    const { data: existing, error: checkError } = await supabase
      .from("admin_credentials")
      .select("id")
      .eq("username", params.newUsername)
      .neq("user_id", params.userId)
      .single()

    if (existing) {
      return { success: false, error: "Username already taken" }
    }

    // Update username in database
    const { error: updateError } = await supabase
      .from("admin_credentials")
      .update({ 
        username: params.newUsername,
        updated_at: new Date().toISOString()
      })
      .eq("user_id", params.userId)

    if (updateError) {
      console.error("[v0] Update username error:", updateError)
      return { success: false, error: "Failed to update username" }
    }

    // Update username cookie so it's immediately reflected
    const cookieStore = await cookies()
    cookieStore.set("admin_username", params.newUsername, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7,
      path: "/",
    })

    console.log("[v0] Admin username updated successfully to:", params.newUsername)
    revalidatePath("/admin-panel-2024/settings")
    return { 
      success: true, 
      message: "Username changed successfully. Please use your new username on next login." 
    }
  } catch (error) {
    console.error("[v0] Change username error:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to change username",
    }
  }
}

export async function enableAdmin2FA(userId: string) {
  try {
    const supabase = createAdminClient()

    const { error } = await supabase.auth.admin.updateUserById(userId, {
      user_metadata: {
        admin_2fa_enabled: true,
      },
    })

    if (error) {
      return { success: false, error: error.message }
    }

    revalidatePath("/admin-panel-2024/settings")
    return { success: true, message: "Two-factor authentication has been enabled" }
  } catch (error) {
    console.error("[v0] Enable 2FA error:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to enable 2FA",
    }
  }
}

export async function disableAdmin2FA(userId: string) {
  try {
    const supabase = createAdminClient()

    const { error } = await supabase.auth.admin.updateUserById(userId, {
      user_metadata: {
        admin_2fa_enabled: false,
      },
    })

    if (error) {
      return { success: false, error: error.message }
    }

    revalidatePath("/admin-panel-2024/settings")
    return { success: true, message: "Two-factor authentication has been disabled" }
  } catch (error) {
    console.error("[v0] Disable 2FA error:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to disable 2FA",
    }
  }
}

export async function updateSystemSettings(settings: {
  site_name?: string
  currency_symbol?: string
  min_deposit?: string
  global_markup?: string
  referral_commission?: string
}) {
  try {
    const supabase = createAdminClient()
    
    console.log("[v0] Updating system settings:", settings)

    // Validate inputs
    if (settings.min_deposit) {
      const minDeposit = parseFloat(settings.min_deposit)
      if (isNaN(minDeposit) || minDeposit < 0) {
        return { success: false, error: "Minimum deposit must be a valid positive number" }
      }
    }

    if (settings.global_markup) {
      const markup = parseFloat(settings.global_markup)
      if (isNaN(markup) || markup < 0) {
        return { success: false, error: "Global markup must be a valid positive number" }
      }
    }

    if (settings.referral_commission) {
      const commission = parseFloat(settings.referral_commission)
      if (isNaN(commission) || commission < 0 || commission > 100) {
        return { success: false, error: "Referral commission must be between 0 and 100" }
      }
    }

    // Update each setting in the system_settings table
    const updates = []
    
    for (const [key, value] of Object.entries(settings)) {
      if (value !== undefined && value !== null) {
        updates.push(
          supabase
            .from("system_settings")
            .upsert({ key, value: String(value) }, { onConflict: "key" })
        )
      }
    }

    // Execute all updates
    const results = await Promise.all(updates)
    
    // Check for errors
    const errors = results.filter(r => r.error)
    if (errors.length > 0) {
      console.error("[v0] System settings update errors:", errors)
      return { 
        success: false, 
        error: errors[0].error?.message || "Failed to update some settings" 
      }
    }

    console.log("[v0] System settings updated successfully")
    revalidatePath("/admin-panel-2024/settings")
    return { success: true, message: "System settings updated successfully" }
  } catch (error) {
    console.error("[v0] Update system settings error:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to update system settings",
    }
  }
}
