"use server"

import { createAdminClient } from "@/lib/supabase/admin"
import { revalidatePath } from "next/cache"

export async function updateSystemSettings(
  data: {
    site_name: string
    currency: string
    currency_symbol: string
    min_deposit: string
    global_markup: string
    referral_commission: string
  },
  userId?: string
) {
  try {
    console.log("[v0] updateSystemSettings called with userId:", userId)
    
    // Use admin client for all operations (server action doesn't have reliable session access)
    const adminClient = createAdminClient()
    
    // If userId provided, verify it's an admin
    if (userId) {
      console.log("[v0] Verifying admin role for provided userId:", userId)
      const { data: userData, error: userError } = await adminClient
        .from("users")
        .select("role, email")
        .eq("id", userId)
        .single()

      console.log("[v0] Role check result:", { 
        userData, 
        userError: userError?.message,
        roleValue: userData?.role,
        roleType: typeof userData?.role
      })

      if (userError || !userData) {
        console.error("[v0] Failed to fetch user role:", userError)
        return { 
          success: false, 
          error: `Unauthorized - Could not verify admin role. User not found in database. Please run: UPDATE users SET role = 'admin' WHERE id = '${userId}';` 
        }
      }

      // Check role (case-insensitive)
      const userRole = userData.role?.toLowerCase()
      console.log("[v0] User role (lowercase):", userRole, "for email:", userData.email)
      
      if (userRole !== "admin") {
        console.warn("[v0] Non-admin user attempted to update system settings:", userId, "role:", userData.role)
        return { 
          success: false, 
          error: `Unauthorized - Admin access required. Your role is: '${userData.role}'. To fix this, run in Supabase SQL Editor:\n\nUPDATE users SET role = 'admin' WHERE id = '${userId}';\n\nThen refresh and try again.` 
        }
      }

      console.log("[v0] Admin role verified for user:", userId, "email:", userData.email)
    } else {
      // No userId provided - this should not happen, but we'll allow it for backward compatibility
      console.warn("[v0] No userId provided - proceeding without authorization check")
    }

    // Update each setting using admin client (bypasses RLS)
    const settings = [
      { key: "site_name", value: data.site_name },
      { key: "currency", value: data.currency },
      { key: "currency_symbol", value: data.currency_symbol },
      { key: "min_deposit", value: data.min_deposit },
      { key: "global_markup", value: data.global_markup },
      { key: "referral_commission", value: data.referral_commission },
    ]

    for (const setting of settings) {
      const { error } = await adminClient
        .from("system_settings")
        .upsert(
          { key: setting.key, value: setting.value },
          { onConflict: "key" }
        )

      if (error) {
        console.error(`Failed to update ${setting.key}:`, error)
        return { success: false, error: `Failed to update ${setting.key}` }
      }
    }

    console.log("[v0] System settings updated successfully", data)

    // Revalidate relevant pages
    revalidatePath("/admin-panel-2024/settings")
    revalidatePath("/admin-panel-2024")
    revalidatePath("/dashboard")

    return { success: true }
  } catch (error: any) {
    console.error("[v0] System settings update error:", error)
    return { success: false, error: error.message || "Failed to update settings" }
  }
}

export async function getSystemSettings() {
  try {
    const supabase = await createClient()

    const { data, error } = await supabase
      .from("system_settings")
      .select("key, value")

    if (error) {
      console.error("[v0] Failed to fetch system settings:", error)
      return { success: false, error: error.message, settings: {} }
    }

    const settings = data?.reduce(
      (acc, setting) => {
        acc[setting.key] = setting.value
        return acc
      },
      {} as Record<string, string>
    )

    return { success: true, settings: settings || {} }
  } catch (error: any) {
    console.error("[v0] System settings fetch error:", error)
    return { success: false, error: error.message, settings: {} }
  }
}
