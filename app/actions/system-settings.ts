"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export async function updateSystemSettings(data: {
  site_name: string
  currency: string
  currency_symbol: string
  min_deposit: string
  global_markup: string
  referral_commission: string
}) {
  try {
    const supabase = await createClient()

    // Check if user is authenticated
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return { success: false, error: "Unauthorized - Please log in" }
    }

    // Check if user is admin
    const { data: userData, error: userError } = await supabase
      .from("users")
      .select("role")
      .eq("id", user.id)
      .single()

    if (userError || !userData) {
      console.error("[v0] Failed to fetch user role:", userError)
      return { success: false, error: "Unauthorized - Could not verify admin role" }
    }

    if (userData.role !== "admin") {
      console.warn("[v0] Non-admin user attempted to update system settings:", user.id)
      return { success: false, error: "Unauthorized - Admin access required" }
    }

    // Update each setting
    const settings = [
      { key: "site_name", value: data.site_name },
      { key: "currency", value: data.currency },
      { key: "currency_symbol", value: data.currency_symbol },
      { key: "min_deposit", value: data.min_deposit },
      { key: "global_markup", value: data.global_markup },
      { key: "referral_commission", value: data.referral_commission },
    ]

    for (const setting of settings) {
      const { error } = await supabase
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
