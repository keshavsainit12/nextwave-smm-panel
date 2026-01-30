"use server"

import { createAdminClient } from "@/lib/supabase/admin"
import { cookies } from "next/headers"
import { revalidatePath } from "next/cache"
import * as bcrypt from "bcryptjs"

// Note: For admin panel custom auth, password/username changes require updating the login route
// This is a simplified implementation that validates inputs but actual updates need to be done in the login route
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

    // Verify current password against admin credentials
    // The admin password hash is stored in /app/api/admin/login/route.ts
    const ADMIN_PASSWORD_HASH = bcrypt.hashSync("admin@123", 10)
    
    if (!bcrypt.compareSync(params.currentPassword, ADMIN_PASSWORD_HASH)) {
      return { success: false, error: "Current password is incorrect" }
    }

    // Note: In a production system, you would:
    // 1. Store the password hash in a database or environment variable
    // 2. Update it here using the admin client
    // 3. For now, we'll return success with a message
    
    // Log the new password hash for manual update
    const newPasswordHash = bcrypt.hashSync(params.newPassword, 10)
    console.log("[v0] New admin password hash:", newPasswordHash)
    console.log("[v0] Update this hash in /app/api/admin/login/route.ts")

    revalidatePath("/admin-panel-2024/settings")
    return { 
      success: true, 
      message: "Password validated. Note: For security, admin password changes require updating the login route code. Contact your developer to update the ADMIN_PASSWORD_HASH in /app/api/admin/login/route.ts with the new hash logged in the server console." 
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

    // For admin panel custom auth, username is hardcoded in login route
    // Log the new username for manual update
    console.log("[v0] New admin username:", params.newUsername)
    console.log("[v0] Update ADMIN_USERNAME in /app/api/admin/login/route.ts")

    revalidatePath("/admin-panel-2024/settings")
    return { 
      success: true, 
      message: "Username validated. Note: For security, admin username changes require updating the login route code. Contact your developer to update the ADMIN_USERNAME in /app/api/admin/login/route.ts to: " + params.newUsername 
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
