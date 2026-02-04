"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export async function addService(formData: FormData) {
  const supabase = await createClient()

  const providerId = formData.get("provider_id") as string
  const finalProviderId = providerId === "none" ? null : providerId

  const { error } = await supabase.from("services").insert({
    name: formData.get("name") as string,
    description: formData.get("description") as string,
    category_id: formData.get("category_id") as string,
    provider_id: finalProviderId,
    base_price: Number(formData.get("base_price")),
    provider_price: Number(formData.get("base_price")),
    min_quantity: Number(formData.get("min_quantity")),
    max_quantity: Number(formData.get("max_quantity")),
    has_refill: formData.get("has_refill") === "on",
    is_active: formData.get("is_active") === "on",
  })

  if (error) {
    console.error("[v0] Add service error:", error)
    throw new Error(error.message || "Failed to add service")
  }

  revalidatePath("/admin-panel-2024/services")
  revalidatePath("/dashboard/new-order")
  return { success: true }
}

export async function deleteService(id: string) {
  const supabase = await createClient()

  const { error } = await supabase.from("services").delete().eq("id", id)

  if (error) throw error

  revalidatePath("/admin-panel-2024/services")
}

export async function updateServicePrice(serviceId: string, newPrice: number) {
  const supabase = await createClient()

  // Update both price and base_price to keep them in sync
  const { error } = await supabase.from("services").update({ 
    price: newPrice,
    base_price: newPrice
  }).eq("id", serviceId)

  if (error) throw error

  revalidatePath("/admin-panel-2024/services")
  revalidatePath("/dashboard")
  revalidatePath("/dashboard/new-order")
  return { success: true }
}

export async function toggleServiceStatus(serviceId: string, isActive: boolean) {
  const supabase = await createClient()

  const { error } = await supabase.from("services").update({ is_active: isActive }).eq("id", serviceId)

  if (error) throw error

  revalidatePath("/admin-panel-2024/services")
  return { success: true }
}

export async function updateService(serviceId: string, data: any) {
  const supabase = await createClient()

  const updateData: any = {}
  
  if (data.name !== undefined) updateData.name = data.name
  if (data.description !== undefined) updateData.description = data.description
  if (data.price !== undefined) updateData.price = Number(data.price)
  if (data.min_quantity !== undefined) updateData.min_quantity = Number(data.min_quantity)
  if (data.max_quantity !== undefined) updateData.max_quantity = Number(data.max_quantity)

  const { error } = await supabase.from("services").update(updateData).eq("id", serviceId)

  if (error) {
    throw error
  }

  revalidatePath("/admin-panel-2024/services")
  revalidatePath("/dashboard")
  return { success: true }
}

export async function updateAllServicesPricing(percentage: number) {
  const supabase = await createClient()

  const { data: services, error: fetchError } = await supabase.from("services").select("id, price, provider_price")

  if (fetchError) throw fetchError

  let updated = 0
  for (const service of services || []) {
    const currentPrice = service.price || service.provider_price * 3
    const newPrice = currentPrice * (1 + percentage / 100)
    const { error } = await supabase.from("services").update({ price: newPrice }).eq("id", service.id)
    if (!error) updated++
  }

  revalidatePath("/admin-panel-2024/services")
  return { success: true, updated }
}

export async function setAllServicesMultiplier(multiplier: number) {
  try {
    const supabase = await createClient()

    console.log(`[v0] Fetching all services for ${multiplier}x multiplier update`)

    const { data: services, error: fetchError } = await supabase
      .from("services")
      .select("id, provider_price, base_price")

    if (fetchError) {
      console.error("[v0] Fetch services error:", fetchError)
      throw new Error("Failed to fetch services")
    }

    if (!services || services.length === 0) {
      throw new Error("No services found to update")
    }

    console.log(`[v0] Updating ${services.length} services with ${multiplier}x multiplier`)

    let updated = 0
    const errors: string[] = []

    // Update all services in parallel
    const updatePromises = services.map(async (service) => {
      const basePrice = service.provider_price || service.base_price || 0
      if (basePrice <= 0) {
        console.warn(`[v0] Skipping service ${service.id} - no valid base price`)
        return
      }

      const newPrice = Number((basePrice * multiplier).toFixed(4))

      const { error } = await supabase
        .from("services")
        .update({
          price: newPrice,
          base_price: newPrice,
        })
        .eq("id", service.id)

      if (error) {
        console.error(`[v0] Failed to update service ${service.id}:`, error)
        errors.push(service.id)
      } else {
        updated++
        console.log(`[v0] ✓ Service ${service.id}: $${basePrice.toFixed(4)} × ${multiplier} = $${newPrice.toFixed(4)}`)
      }
    })

    await Promise.all(updatePromises)

    console.log(`[v0] Successfully updated ${updated}/${services.length} services`)

    if (errors.length > 0) {
      console.error(`[v0] Failed to update ${errors.length} services:`, errors)
    }

    revalidatePath("/admin-panel-2024/services")
    revalidatePath("/dashboard/new-order")

    return { success: true, updated, total: services.length, errors: errors.length }
  } catch (error) {
    console.error("[v0] Set multiplier error:", error)
    throw error
  }
}

export async function setVIPPricing(userId: string, serviceId: string, customPrice: number) {
  const supabase = await createClient()

  const { error } = await supabase.from("vip_service_pricing").upsert({
    user_id: userId,
    service_id: serviceId,
    custom_price: customPrice,
    updated_at: new Date().toISOString(),
  })

  if (error) throw error

  revalidatePath("/admin-panel-2024/users")
  return { success: true }
}

export async function updateUserTier(userId: string, tierId: number, customMultiplier?: number) {
  const supabase = await createClient()

  const updateData: any = { tier: tierId }
  if (customMultiplier) {
    updateData.price_multiplier = customMultiplier
  }

  const { error } = await supabase.from("users").update(updateData).eq("id", userId)

  if (error) throw error

  revalidatePath("/admin-panel-2024/users")
  return { success: true }
}
