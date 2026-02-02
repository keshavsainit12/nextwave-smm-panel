import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"
import { SMMApiClient } from "@/lib/smm-api-client"

function determineCategoryFromName(serviceName: string): string {
  const name = serviceName.toLowerCase()

  if (name.includes("instagram")) return "Instagram"
  if (name.includes("youtube") || name.includes("yt")) return "YouTube"
  if (name.includes("tiktok")) return "TikTok"
  if (name.includes("twitter") || name.includes("x.com")) return "Twitter"
  if (name.includes("facebook") || name.includes("fb")) return "Facebook"
  if (name.includes("telegram")) return "Telegram"
  if (name.includes("discord")) return "Discord"
  if (name.includes("spotify")) return "Spotify"
  if (name.includes("snapchat")) return "Snapchat"
  if (name.includes("linkedin")) return "LinkedIn"
  if (name.includes("twitch")) return "Twitch"

  return "Others"
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const providerId = body?.providerId
    const multiplier = body?.multiplier || 3.0

    if (!providerId) {
      return NextResponse.json({ error: "providerId is required" }, { status: 400 })
    }

    const supabase = await createClient()

    const { data: provider, error: providerError } = await supabase
      .from("api_providers")
      .select("*")
      .eq("id", providerId)
      .single()

    if (providerError || !provider) {
      console.error("[v0] Provider not found:", providerId, providerError)
      return NextResponse.json({ 
        error: "Provider not found",
        providerId: providerId,
        details: providerError?.message
      }, { status: 404 })
    }

    const apiClient = new SMMApiClient(provider.api_url, provider.api_key)
    
    let services
    try {
      services = await apiClient.getServices()
    } catch (apiError: any) {
      console.error("[v0] Error fetching services from API:", apiError)
      return NextResponse.json({ 
        error: "Failed to fetch services from provider",
        details: apiError?.message
      }, { status: 500 })
    }

    if (!Array.isArray(services)) {
      console.error("[v0] Services is not an array:", typeof services)
      return NextResponse.json({ 
        error: "Invalid response from provider - services should be an array",
        received: typeof services
      }, { status: 400 })
    }

    if (services.length === 0) {
      console.warn("[v0] No services received from API for provider:", providerId)
      return NextResponse.json({ 
        error: "No services received from API",
        synced: 0,
        total: 0
      }, { status: 200 })
    }

    const { data: existingCategories } = await supabase.from("service_categories").select("id, name")

    const categoryMap = new Map(existingCategories?.map((c) => [c.name.toLowerCase(), c.id]) || [])

    const standardCategories = [
      "Instagram",
      "YouTube",
      "TikTok",
      "Twitter",
      "Facebook",
      "Telegram",
      "Discord",
      "Spotify",
      "Snapchat",
      "LinkedIn",
      "Twitch",
      "Others",
    ]

    for (const categoryName of standardCategories) {
      if (!categoryMap.has(categoryName.toLowerCase())) {
        const { data: newCat } = await supabase
          .from("service_categories")
          .insert({ name: categoryName, icon: "📱" })
          .select("id")
          .single()

        if (newCat) {
          categoryMap.set(categoryName.toLowerCase(), newCat.id)
        }
      }
    }

    const newCategories = new Set<string>()
    services.forEach((service: any) => {
      if (service.category && !categoryMap.has(service.category.toLowerCase())) {
        newCategories.add(service.category)
      }
    })

    for (const categoryName of newCategories) {
      const { data: newCat } = await supabase
        .from("service_categories")
        .insert({ name: categoryName, icon: "📱" })
        .select("id")
        .single()

      if (newCat) {
        categoryMap.set(categoryName.toLowerCase(), newCat.id)
      }
    }

    let syncedCount = 0
    let errorCount = 0
    const failedServices: string[] = []

    console.log(`[v0] Starting service sync for provider ${providerId} with ${services.length} services`)

    for (const service of services) {
      try {
        let categoryId = null

        // Try to use category from API
        if (service.category) {
          categoryId = categoryMap.get(service.category.toLowerCase()) || null
        }

        // If no category from API, determine from service name automatically
        if (!categoryId && service.name) {
          const determinedCategory = determineCategoryFromName(service.name)
          categoryId = categoryMap.get(determinedCategory.toLowerCase()) || null
        }

        const providerPrice = Number.parseFloat(service.rate) || 0
        const sellingPrice = providerPrice > 0 ? providerPrice * multiplier : 0

        const serviceData = {
          name: service.name || "Unknown Service",
          category_id: categoryId,
          provider_id: providerId,
          external_service_id: String(service.service || service.id),
          provider_price: providerPrice,
          base_price: sellingPrice,
          min_quantity: Number.parseInt(service.min) || 1,
          max_quantity: Number.parseInt(service.max) || 10000,
          description: service.description || service.name || "Service",
          is_active: true,
          has_refill: service.refill === true || service.refill === "true",
          cancel: service.cancel === true || service.cancel === "true",
          can_cancel: service.cancel === true || service.cancel === "true",
          dripfeed: service.dripfeed === true || service.dripfeed === "true",
        }

        // Check if service already exists
        const { data: existingService } = await supabase
          .from("services")
          .select("id")
          .eq("provider_id", providerId)
          .eq("external_service_id", String(service.service || service.id))
          .single()

        let upsertError
        if (existingService) {
          // Update existing service
          const { error } = await supabase
            .from("services")
            .update(serviceData)
            .eq("id", existingService.id)
          upsertError = error
        } else {
          // Insert new service
          const { error } = await supabase
            .from("services")
            .insert(serviceData)
          upsertError = error
        }

        if (upsertError) {
          console.error(`[v0] Failed to sync service ${service.service}:`, upsertError)
          errorCount++
          failedServices.push(String(service.service))
        } else {
          syncedCount++
        }
      } catch (serviceError: any) {
        console.error(`[v0] Error processing service:`, serviceError)
        errorCount++
      }
    }

    // Update last sync time
    try {
      await supabase.from("api_providers").update({ last_sync: new Date().toISOString() }).eq("id", providerId)
    } catch (e) {
      console.warn("[v0] Failed to update last_sync time:", e)
    }

    console.log(`[v0] Service sync complete: ${syncedCount} synced, ${errorCount} errors out of ${services.length}`)

    return NextResponse.json({
      success: errorCount === 0,
      message: `Synced ${syncedCount} services with ${multiplier}x pricing`,
      synced: syncedCount,
      errors: errorCount,
      total: services.length,
      failedServices: failedServices.length > 0 ? failedServices : undefined,
    })
  } catch (error: any) {
    console.error("[v0] Sync services error:", error)
    return NextResponse.json({ 
      error: error?.message || "Failed to sync services",
      success: false
    }, { status: 500 })
  }
}
