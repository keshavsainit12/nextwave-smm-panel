import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET(request: Request) {
  try {
    const supabase = await createClient()
    const authHeader = request.headers.get("authorization")
    
    let priceMultiplier = 3.0
    
    if (authHeader && authHeader.startsWith("Bearer ")) {
      const apiKey = authHeader.replace("Bearer ", "")
      const { data: user } = await supabase.from("users").select("id, price_multiplier").eq("api_key", apiKey).single()
      if (user) {
        priceMultiplier = user.price_multiplier || 3.0
      }
    }

    // Get active services WITH category information
    const { data: services } = await supabase
      .from("services")
      .select("id, name, base_price, min_quantity, max_quantity, platform, description, category_id")
      .eq("is_active", true)

    // Get all categories from service_categories table
    const { data: categories } = await supabase
      .from("service_categories")
      .select("id, name")

    // Create category map
    const categoryMap: Record<string, string> = {}
    categories?.forEach((cat: any) => {
      categoryMap[cat.id] = cat.name
    })

    // Get unique category names
    const uniqueCategories = Array.from(new Set(
      services?.map((s: any) => categoryMap[s.category_id] || "Other") || []
    ))

    const formattedServices = services?.map((service: any) => ({
      id: service.id,
      name: service.name,
      price: (Number(service.base_price) * priceMultiplier).toFixed(4),
      min: service.min_quantity,
      max: service.max_quantity,
      platform: service.platform,
      description: service.description,
      category: categoryMap[service.category_id] || "Other",
      categories: [categoryMap[service.category_id] || "Other"],
    }))

    console.log('[v0] Services API - categories:', uniqueCategories, 'services:', formattedServices?.length)

    return NextResponse.json({
      status: "success",
      services: formattedServices || [],
      categories: uniqueCategories,
    })
  } catch (error) {
    console.error("[v0] Services API error:", error)
    return NextResponse.json({ status: "error", message: "Internal server error" }, { status: 500 })
  }
}
