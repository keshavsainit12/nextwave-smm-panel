"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { SMMApiClient } from "@/lib/smm-api-client"

export async function addApiProvider(formData: FormData) {
  try {
    const supabase = await createClient()

    const name = formData.get("name") as string
    const api_url = formData.get("api_url") as string
    const api_key = formData.get("api_key") as string

    if (!name || !api_url || !api_key) {
      return { error: "Missing required fields: name, api_url, or api_key" }
    }

    console.log("[v0] Testing API connection for:", name, api_url)

    const client = new SMMApiClient(api_url, api_key)
    
    let isValid = false
    try {
      isValid = await client.testConnection()
    } catch (testError: any) {
      console.error("[v0] API connection test failed:", testError)
      return { 
        error: `Failed to connect to API: ${testError?.message || "Connection failed"}. Please check URL and API key.` 
      }
    }

    if (!isValid) {
      return { error: "Failed to connect to API. Please check URL and API key." }
    }

    console.log("[v0] API connection successful, adding to database")

    // Add provider to database
    const { data, error } = await supabase
      .from("api_providers")
      .insert({
        name,
        api_url,
        api_key,
        priority: Number(formData.get("priority")) || 1,
        is_active: formData.get("is_active") === "on",
      })
      .select("id")
      .single()

    if (error) {
      console.error("[v0] Database error adding provider:", error)
      return { error: `Database error: ${error.message}` }
    }

    console.log("[v0] Provider added successfully:", data.id)

    revalidatePath("/admin-panel-2024/api-providers")
    return { success: true, providerId: data.id }
  } catch (error: any) {
    console.error("[v0] Exception in addApiProvider:", error)
    return { error: error instanceof Error ? error.message : "Failed to add provider" }
  }
}

export async function updateApiProvider(id: string, formData: FormData) {
  const supabase = await createClient()

  const api_url = formData.get("api_url") as string
  const api_key = formData.get("api_key") as string

  if (api_url && api_key) {
    const client = new SMMApiClient(api_url, api_key)
    const isValid = await client.testConnection()

    if (!isValid) {
      throw new Error("Failed to connect to API. Please check URL and API key.")
    }
  }

  const { error } = await supabase
    .from("api_providers")
    .update({
      name: formData.get("name") as string,
      api_url,
      api_key,
      priority: Number(formData.get("priority")),
      is_active: formData.get("is_active") === "on",
    })
    .eq("id", id)

  if (error) throw error

  revalidatePath("/admin-panel-2024/api-providers")
}

export async function deleteApiProvider(id: string) {
  const supabase = await createClient()

  await supabase.from("services").delete().eq("provider_id", id)

  const { error } = await supabase.from("api_providers").delete().eq("id", id)

  if (error) throw error

  revalidatePath("/admin-panel-2024/api-providers")
  revalidatePath("/admin-panel-2024/services")
  revalidatePath("/dashboard/new-order")
}

export async function syncServicesFromProvider(providerId: string) {
  try {
    const supabase = await createClient()

    const { data: provider, error: providerError } = await supabase
      .from("api_providers")
      .select("*")
      .eq("id", providerId)
      .single()

    if (providerError || !provider) {
      throw new Error("Provider not found")
    }

    const client = new SMMApiClient(provider.api_url, provider.api_key)
    const services = await client.getServices()

    let synced = 0
    let failed = 0

    for (const service of services) {
      try {
        let { data: category } = await supabase
          .from("service_categories")
          .select("id")
          .eq("name", service.category)
          .single()

        if (!category) {
          const { data: newCategory } = await supabase
            .from("service_categories")
            .insert({ name: service.category, description: service.category })
            .select("id")
            .single()
          category = newCategory
        }

        if (!category) continue

        const providerPrice = Number.parseFloat(service.rate)
        const basePrice = providerPrice * 3.0

        const { data: existing } = await supabase
          .from("services")
          .select("id")
          .eq("external_service_id", String(service.service))
          .eq("provider_id", providerId)
          .single()

        if (existing) {
          await supabase
            .from("services")
            .update({
              name: service.name,
              category_id: category.id,
              base_price: basePrice,
              provider_price: providerPrice,
              min_quantity: Number.parseInt(service.min),
              max_quantity: Number.parseInt(service.max),
              has_refill: service.refill,
              can_cancel: service.cancel,
            })
            .eq("id", existing.id)
        } else {
          await supabase.from("services").insert({
            name: service.name,
            description: `${service.type} - ${service.name}`,
            category_id: category.id,
            provider_id: providerId,
            external_service_id: String(service.service),
            base_price: basePrice,
            provider_price: providerPrice,
            min_quantity: Number.parseInt(service.min),
            max_quantity: Number.parseInt(service.max),
            has_refill: service.refill,
            can_cancel: service.cancel,
            is_active: true,
          })
        }

        synced++
      } catch (error) {
        failed++
      }
    }

    revalidatePath("/admin-panel-2024/services")
    revalidatePath("/admin-panel-2024/api-providers")
    revalidatePath("/dashboard/new-order")

    return { synced, failed, total: services.length }
  } catch (error) {
    throw error
  }
}

export async function testApiProvider(providerId: string) {
  const supabase = await createClient()

  const { data: provider } = await supabase.from("api_providers").select("*").eq("id", providerId).single()

  if (!provider) {
    throw new Error("Provider not found")
  }

  const client = new SMMApiClient(provider.api_url, provider.api_key)

  try {
    const balance = await client.getBalance()
    return { success: true, balance: balance.balance, currency: balance.currency }
  } catch (error) {
    return { success: false, error: String(error) }
  }
}

/**
 * Update provider's price multiplier and recalculate all service prices
 */
export async function updateApiProviderMultiplier(providerId: string, multiplier: number) {
  try {
    const supabase = await createClient()
    
    console.log(`[v0] Updating provider ${providerId} multiplier to ${multiplier}x`)
    
    // 1. Update provider multiplier
    const { error: providerError } = await supabase
      .from("api_providers")
      .update({ price_multiplier: multiplier })
      .eq("id", providerId)
    
    if (providerError) {
      console.error("[v0] Provider update failed:", providerError)
      throw providerError
    }
    
    // 2. Fetch all services for this provider
    const { data: services, error: servicesError } = await supabase
      .from("services")
      .select("id, provider_price")
      .eq("provider_id", providerId)
    
    if (servicesError) {
      console.error("[v0] Services fetch failed:", servicesError)
      throw servicesError
    }
    
    console.log(`[v0] Recalculating prices for ${services?.length || 0} services`)
    
    // 3. Update each service's selling price (provider_price × multiplier)
    let updated = 0
    for (const service of services || []) {
      const providerPrice = Number(service.provider_price || 0)
      if (providerPrice > 0) {
        const newPrice = providerPrice * multiplier
        const { error: updateError } = await supabase
          .from("services")
          .update({ base_price: newPrice })
          .eq("id", service.id)
        
        if (!updateError) {
          updated++
        }
      }
    }
    
    console.log(`[v0] Successfully updated ${updated} service prices`)
    
    revalidatePath("/admin-panel-2024/api-providers")
    revalidatePath("/admin-panel-2024/services")
    
    return { success: true, updated }
    
  } catch (error: any) {
    console.error("[v0] Multiplier update failed:", error)
    return { success: false, error: error.message || "Failed to update multiplier" }
  }
}
