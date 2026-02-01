"use server"

import { createAdminClient } from "@/lib/supabase/admin"
import { revalidatePath } from "next/cache"

export async function updateServiceIcon(serviceId: string, iconUrl: string) {
  const supabase = createAdminClient()

  if (!serviceId || !iconUrl) {
    throw new Error("Service ID and icon URL are required")
  }

  // Validate URL
  try {
    new URL(iconUrl)
  } catch {
    throw new Error("Invalid URL format")
  }

  const { error } = await supabase.from("services").update({ icon: iconUrl }).eq("id", serviceId)

  if (error) {
    console.error("[v0] Update service icon error:", error)
    throw new Error("Failed to update service icon: " + (error.message || "Unknown error"))
  }

  console.log("[v0] Service icon updated:", serviceId)

  // Revalidate all service-related pages
  revalidatePath("/dashboard")
  revalidatePath("/dashboard/new-order")
  revalidatePath("/admin-panel-2024")
  revalidatePath("/admin-panel-2024/services")
  revalidatePath("/admin-panel-2024/icon-manager")
  revalidatePath("/admin-panel-2024/manage-icons")

  return { success: true, message: "Service icon updated successfully" }
}

export async function updateCategoryIcon(categoryId: string, iconUrl: string) {
  const supabase = createAdminClient()

  if (!categoryId || !iconUrl) {
    throw new Error("Category ID and icon URL are required")
  }

  // Validate URL
  try {
    new URL(iconUrl)
  } catch {
    throw new Error("Invalid URL format")
  }

  const { error } = await supabase.from("service_categories").update({ icon: iconUrl }).eq("id", categoryId)

  if (error) {
    console.error("[v0] Update category icon error:", error)
    throw new Error("Failed to update category icon: " + (error.message || "Unknown error"))
  }

  console.log("[v0] Category icon updated:", categoryId)

  // Revalidate all category-related pages
  revalidatePath("/dashboard")
  revalidatePath("/dashboard/new-order")
  revalidatePath("/admin-panel-2024")
  revalidatePath("/admin-panel-2024/services")
  revalidatePath("/admin-panel-2024/icon-manager")
  revalidatePath("/admin-panel-2024/manage-icons")

  return { success: true, message: "Category icon updated successfully" }
}
