import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

// Disable caching for this API route
export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  try {
    const supabase = await createClient()
    const authHeader = request.headers.get("authorization")
    
    let priceMultiplier = 3.0
    
    if (authHeader && authHeader.startsWith("Bearer ")) {
      try {
        const apiKey = authHeader.replace("Bearer ", "")
        const { data: user, error: userError } = await supabase
          .from("users")
          .select("id, price_multiplier")
          .eq("api_key", apiKey)
          .single()
        
        if (user && !userError) {
          priceMultiplier = user.price_multiplier || 3.0
        }
      } catch (e) {
        console.warn("[v0] Error fetching user multiplier, using default")
      }
    }

    // Get active services WITH category information
    const { data: services, error: servicesError } = await supabase
      .from("services")
      .select("id, name, base_price, min_quantity, max_quantity, platform, description, category_id")
      .eq("is_active", true)

    if (servicesError) {
      console.error("[v0] Services fetch error:", servicesError)
      return NextResponse.json({
        status: "success",
        services: [],
        categories: [],
      })
    }

    // Get all categories from service_categories table
    const { data: categories, error: categoriesError } = await supabase
      .from("service_categories")
      .select("id, name")

    if (categoriesError) {
      console.error("[v0] Categories fetch error:", categoriesError)
    }

    // Create category map
    const categoryMap: Record<string, string> = {}
    categories?.forEach((cat: any) => {
      categoryMap[cat.id] = cat.name
    })

    // Get unique category names
    const uniqueCategories = Array.from(new Set(
      services?.map((s: any) => categoryMap[s.category_id] || "Other") || []
    ))

    const formattedServices = services?.map((service: any) => {
      const basePrice = Number(service.base_price) || 0
      const finalPrice = basePrice > 0 ? (basePrice * priceMultiplier).toFixed(4) : "0"
      
      return {
        id: service.id,
        name: service.name,
        price: finalPrice,
        min: service.min_quantity || 1,
        max: service.max_quantity || 10000,
        platform: service.platform || "General",
        description: service.description || service.name,
        category: categoryMap[service.category_id] || "Other",
        categories: [categoryMap[service.category_id] || "Other"],
      }
    })

    console.log('[v0] Services API - categories:', uniqueCategories, 'services:', formattedServices?.length)

    return NextResponse.json({
      status: "success",
      services: formattedServices || [],
      categories: uniqueCategories,
    })
  } catch (error) {
    console.error("[v0] Services API error:", error)
    return NextResponse.json({
      status: "success",
      services: [],
      categories: [],
    }, { status: 200 })
  }
}
