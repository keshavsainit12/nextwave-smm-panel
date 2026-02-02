"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { SMMApiClient } from "@/lib/smm-api-client"

export async function addApiProvider(formData: FormData) {
  try {
    console.log('[v0] Adding API provider - start')
    const supabase = await createClient()

    const name = formData.get("name") as string
    const api_url = formData.get("api_url") as string
    const api_key = formData.get("api_key") as string

    console.log('[v0] Testing connection to:', api_url)
    
    const client = new SMMApiClient(api_url, api_key)
    const isValid = await client.testConnection()

    if (!isValid) {
      console.error('[v0] API connection test failed')
      return { error: "Failed to connect to API. Please check URL and API key." }
    }

    console.log('[v0] API connection successful, saving to database')

    // Add provider to database
    const { data, error } = await supabase
      .from("api_providers")
      .insert({
        name,
        api_url,
        api_key,
        priority: Number(formData.get("priority")),
        is_active: formData.get("is_active") === "on",
      })
      .select("id")
      .single()

    if (error) {
      console.error('[v0] Database error:', error)
      return { error: `Database error: ${error.message}` }
    }

    console.log('[v0] API provider added successfully:', data.id)
    revalidatePath("/admin-panel-2024/api-providers")
    return { success: true, providerId: data.id }
  } catch (error) {
    console.error('[v0] Unexpected error adding provider:', error)
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
    console.log('[v0] Starting service sync for provider:', providerId)
    const supabase = await createClient()

    const { data: provider, error: providerError } = await supabase
      .from("api_providers")
      .select("*")
      .eq("id", providerId)
      .single()

    if (providerError || !provider) {
      console.error('[v0] Provider not found:', providerError)
      return { error: "Provider not found", synced: 0, failed: 0, total: 0 }
    }

    console.log('[v0] Fetching services from:', provider.api_url)
    const client = new SMMApiClient(provider.api_url, provider.api_key)
    const services = await client.getServices()

    if (!services || services.length === 0) {
      console.error('[v0] No services received from API')
      return { error: "No services received from API", synced: 0, failed: 0, total: 0 }
    }

    console.log('[v0] Received', services.length, 'services from API')

    let synced = 0
    let failed = 0
    const errors: string[] = []

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

        if (!category) {
          failed++
          errors.push(`No category for service: ${service.name}`)
          continue
        }

        const providerPrice = Number.parseFloat(service.rate)
        const basePrice = providerPrice * 3.0

        const { data: existing } = await supabase
          .from("services")
          .select("id")
          .eq("external_service_id", String(service.service))
          .eq("provider_id", providerId)
          .single()

        if (existing) {
          const { error: updateError } = await supabase
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
          
          if (updateError) {
            failed++
            errors.push(`Update failed for ${service.name}: ${updateError.message}`)
          } else {
            synced++
          }
        } else {
          const { error: insertError } = await supabase.from("services").insert({
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
          
          if (insertError) {
            failed++
            errors.push(`Insert failed for ${service.name}: ${insertError.message}`)
          } else {
            synced++
          }
        }
      } catch (error) {
        failed++
        errors.push(`Error processing ${service.name}: ${error instanceof Error ? error.message : 'Unknown error'}`)
      }
    }

    console.log('[v0] Sync complete:', { synced, failed, total: services.length })
    if (errors.length > 0) {
      console.error('[v0] Sync errors:', errors.slice(0, 5)) // Log first 5 errors
    }

    revalidatePath("/admin-panel-2024/services")
    revalidatePath("/admin-panel-2024/api-providers")
    revalidatePath("/dashboard/new-order")

    return { 
      synced, 
      failed, 
      total: services.length,
      errors: errors.length > 0 ? errors.slice(0, 3).join('; ') : undefined 
    }
  } catch (error) {
    console.error('[v0] Sync failed with exception:', error)
    return { 
      error: error instanceof Error ? error.message : "Failed to sync services",
      synced: 0,
      failed: 0,
      total: 0
    }
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
