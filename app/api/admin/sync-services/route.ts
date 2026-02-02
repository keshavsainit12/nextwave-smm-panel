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
    console.log('[v0] Service sync API called')
    const { providerId, multiplier = 3.0 } = await request.json()

    if (!providerId) {
      console.error('[v0] No provider ID provided')
      return NextResponse.json({ error: "Provider ID is required" }, { status: 400 })
    }

    console.log('[v0] Syncing services for provider:', providerId, 'with multiplier:', multiplier)

    const supabase = await createClient()

    const { data: provider, error: providerError } = await supabase
      .from("api_providers")
      .select("*")
      .eq("id", providerId)
      .single()

    if (providerError || !provider) {
      console.error('[v0] Provider not found:', providerError)
      return NextResponse.json({ error: "Provider not found" }, { status: 404 })
    }

    console.log('[v0] Found provider:', provider.name)

    const apiClient = new SMMApiClient(provider.api_url, provider.api_key)
    
    console.log('[v0] Fetching services from API...')
    const services = await apiClient.getServices()

    if (!Array.isArray(services) || services.length === 0) {
      console.error('[v0] No services received from API')
      return NextResponse.json({ error: "No services received from API" }, { status: 400 })
    }

    console.log('[v0] Received', services.length, 'services from API')

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

    console.log('[v0] Creating standard categories...')
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

    console.log('[v0] Creating', newCategories.size, 'new categories from API...')
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
    const errorDetails: string[] = []

    console.log('[v0] Processing', services.length, 'services...')
    for (const service of services) {
      try {
        let categoryId = null

        // Try to use category from API
        if (service.category) {
          categoryId = categoryMap.get(service.category.toLowerCase()) || null
        }

        // If no category from API, determine from service name automatically
        if (!categoryId) {
          const determinedCategory = determineCategoryFromName(service.name)
          categoryId = categoryMap.get(determinedCategory.toLowerCase()) || null
        }

        const providerPrice = Number.parseFloat(service.rate) || 0
        const sellingPrice = providerPrice * multiplier

        const serviceData = {
          name: service.name,
          category_id: categoryId,
          provider_id: providerId,
          external_service_id: String(service.service),
          provider_price: providerPrice,
          base_price: sellingPrice,
          min_quantity: Number.parseInt(service.min) || 1,
          max_quantity: Number.parseInt(service.max) || 10000,
          description: service.name,
          is_active: true,
          has_refill: service.refill === true || service.refill === "true",
          cancel: service.cancel === true || service.cancel === "true",
          dripfeed: service.dripfeed === true || service.dripfeed === "true",
        }

        const { error: upsertError } = await supabase.from("services").upsert(serviceData, {
          onConflict: "external_service_id,provider_id",
        })

        if (upsertError) {
          errorCount++
          errorDetails.push(`${service.name}: ${upsertError.message}`)
        } else {
          syncedCount++
        }
      } catch (err) {
        errorCount++
        errorDetails.push(`${service.name}: ${err instanceof Error ? err.message : 'Unknown error'}`)
      }
    }

    console.log('[v0] Sync complete -', syncedCount, 'synced,', errorCount, 'errors')
    if (errorDetails.length > 0) {
      console.error('[v0] First 5 errors:', errorDetails.slice(0, 5))
    }

    await supabase.from("api_providers").update({ last_sync: new Date().toISOString() }).eq("id", providerId)

    return NextResponse.json({
      success: true,
      message: `Successfully synced ${syncedCount} of ${services.length} services with ${multiplier}x pricing`,
      synced: syncedCount,
      errors: errorCount,
      total: services.length,
      errorDetails: errorCount > 0 ? errorDetails.slice(0, 3).join('; ') : undefined
    })
  } catch (error: any) {
    console.error('[v0] Service sync failed:', error)
    return NextResponse.json({ 
      error: error.message || "Failed to sync services",
      details: error.toString()
    }, { status: 500 })
  }
}
