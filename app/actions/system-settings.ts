"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export async function updateSystemSettings(settings: Record<string, string>) {
  try {
    const supabase = await createClient()

    // Update each setting
    const updates = Object.entries(settings).map(([key, value]) => ({
      key,
      value,
    }))

    // Upsert all settings
    for (const setting of updates) {
      const { error } = await supabase
        .from("system_settings")
        .upsert(
          {
            key: setting.key,
            value: setting.value,
            updated_at: new Date().toISOString(),
          },
          {
            onConflict: "key",
          }
        )

      if (error) {
        console.error(`[System Settings] Error updating ${setting.key}:`, error)
        return { success: false, error: error.message }
      }
    }

    // Revalidate relevant pages
    revalidatePath("/admin-panel-2024/settings")
    revalidatePath("/dashboard")
    revalidatePath("/api/currency-settings")

    console.log("[System Settings] Successfully updated settings:", Object.keys(settings))

    return { success: true, message: "Settings updated successfully" }
  } catch (error) {
    console.error("[System Settings] Unexpected error:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to update settings",
    }
  }
}

export async function getSystemSettings() {
  try {
    const supabase = await createClient()

    const { data: settings, error } = await supabase.from("system_settings").select("*")

    if (error) {
      console.error("[System Settings] Error fetching settings:", error)
      return { success: false, error: error.message, settings: {} }
    }

    const settingsMap = settings?.reduce(
      (acc, setting) => {
        acc[setting.key] = setting.value
        return acc
      },
      {} as Record<string, string>
    )

    return { success: true, settings: settingsMap || {} }
  } catch (error) {
    console.error("[System Settings] Unexpected error:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to fetch settings",
      settings: {},
    }
  }
}
