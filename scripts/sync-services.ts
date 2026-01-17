import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseServiceKey)

interface SMMService {
  service: number
  name: string
  type: string
  rate: string
  min: string
  max: string
  category: string
  refill?: boolean
  cancel?: boolean
}

async function syncServices() {
  console.log("[v0] Starting service sync...")

  // Get API provider
  const { data: provider } = await supabase.from("api_providers").select("*").eq("name", "JustAnotherPanel").single()

  if (!provider) {
    console.error("[v0] API provider not found")
    return
  }

  console.log("[v0] Fetching services from API...")

  // Fetch services from external API
  const response = await fetch(provider.api_url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      key: provider.api_key,
      action: "services",
    }),
  })

  const services: SMMService[] = await response.json()
  console.log(`[v0] Found ${services.length} services from API`)

  let categoriesCreated = 0
  let servicesCreated = 0
  let servicesUpdated = 0

  for (const service of services) {
    try {
      // Create category if it doesn't exist
      const { data: existingCategory } = await supabase
        .from("service_categories")
        .select("id")
        .eq("name", service.category)
        .single()

      let categoryId = existingCategory?.id

      if (!categoryId) {
        const { data: newCategory } = await supabase
          .from("service_categories")
          .insert({ name: service.category, description: service.category })
          .select("id")
          .single()

        categoryId = newCategory?.id
        categoriesCreated++
        console.log(`[v0] Created category: ${service.category}`)
      }

      // Calculate price with 2% markup
      const originalPrice = Number.parseFloat(service.rate)
      const markup = 1.02 // 2% markup
      const finalPrice = (originalPrice * markup).toFixed(4)

      // Check if service exists
      const { data: existingService } = await supabase
        .from("services")
        .select("id")
        .eq("external_service_id", service.service.toString())
        .eq("api_provider_id", provider.id)
        .single()

      if (existingService) {
        // Update existing service
        await supabase
          .from("services")
          .update({
            name: service.name,
            price: finalPrice,
            min_quantity: Number.parseInt(service.min),
            max_quantity: Number.parseInt(service.max),
            category_id: categoryId,
            is_active: true,
            refill_enabled: service.refill || false,
            cancel_enabled: service.cancel || false,
          })
          .eq("id", existingService.id)

        servicesUpdated++
      } else {
        // Create service-provider link
        const { data: serviceProvider } = await supabase
          .from("service_providers")
          .insert({
            service_id: null, // Will be updated after service creation
            api_provider_id: provider.id,
            external_service_id: service.service.toString(),
            cost_per_1000: service.rate,
          })
          .select("id")
          .single()

        // Create new service
        const { data: newService } = await supabase
          .from("services")
          .insert({
            name: service.name,
            description: `${service.type} service for ${service.name}`,
            category_id: categoryId,
            price: finalPrice,
            min_quantity: Number.parseInt(service.min),
            max_quantity: Number.parseInt(service.max),
            is_active: true,
            refill_enabled: service.refill || false,
            cancel_enabled: service.cancel || false,
            external_service_id: service.service.toString(),
            api_provider_id: provider.id,
          })
          .select("id")
          .single()

        // Update service_provider with service_id
        if (newService && serviceProvider) {
          await supabase.from("service_providers").update({ service_id: newService.id }).eq("id", serviceProvider.id)
        }

        servicesCreated++
      }
    } catch (error) {
      console.error(`[v0] Error syncing service ${service.service}:`, error)
    }
  }

  console.log("[v0] Sync complete!")
  console.log(`[v0] Categories created: ${categoriesCreated}`)
  console.log(`[v0] Services created: ${servicesCreated}`)
  console.log(`[v0] Services updated: ${servicesUpdated}`)
  console.log(`[v0] Total services in database: ${servicesCreated + servicesUpdated}`)
}

syncServices().catch(console.error)
