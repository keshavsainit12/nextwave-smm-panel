"use server"

import { createAdminClient } from "@/lib/supabase/admin"
import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export async function updateUserTier(userId: string, tier: number, priceMultiplier: number) {
  const supabase = createAdminClient()

  console.log("[v0] Updating user tier:", userId, "tier:", tier, "multiplier:", priceMultiplier)

  const { error } = await supabase
    .from("users")
    .update({
      tier,
      price_multiplier: priceMultiplier,
    })
    .eq("id", userId)

  if (error) {
    console.error("[v0] Update tier error:", error)
    throw new Error(error.message || "Failed to update tier")
  }

  revalidatePath("/admin-panel-2024/users")

  return { success: true }
}

export async function setVipServicePricing(userId: string, serviceId: string, customPrice: number) {
  const supabase = createAdminClient()

  console.log("[v0] Setting VIP pricing:", { userId, serviceId, customPrice })

  // Check if pricing already exists
  const { data: existing } = await supabase
    .from("vip_service_pricing")
    .select("id")
    .eq("user_id", userId)
    .eq("service_id", serviceId)
    .single()

  if (existing) {
    // Update existing
    const { error } = await supabase
      .from("vip_service_pricing")
      .update({ custom_price: customPrice })
      .eq("id", existing.id)

    if (error) throw error
  } else {
    // Insert new
    const { error } = await supabase.from("vip_service_pricing").insert({
      user_id: userId,
      service_id: serviceId,
      custom_price: customPrice,
    })

    if (error) throw error
  }

  revalidatePath("/admin-panel-2024/users")

  return { success: true }
}

export async function getUserTierInfo() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    throw new Error("Not authenticated")
  }

  const { data } = await supabase
    .from("users")
    .select("tier, price_multiplier, total_orders, total_spent")
    .eq("id", user.id)
    .single()

  // Determine tier name based on multiplier
  let tierName = "Normal User"
  if (data?.price_multiplier) {
    if (data.price_multiplier <= 2) tierName = "Reseller"
    else if (data.price_multiplier <= 2.5) tierName = "Bulk Buyer"
    else if (data.price_multiplier < 3) tierName = "VIP"
  }

  return {
    tier: data?.tier || 1,
    multiplier: data?.price_multiplier || 3.0,
    tierName,
    totalOrders: data?.total_orders || 0,
    totalSpent: data?.total_spent || 0,
  }
}
