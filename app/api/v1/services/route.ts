import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET(request: Request) {
  try {
    const authHeader = request.headers.get("authorization")
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ status: "error", message: "Missing API key" }, { status: 401 })
    }

    const apiKey = authHeader.replace("Bearer ", "")
    const supabase = await createClient()

    // Find user by API key
    const { data: user } = await supabase.from("users").select("id, price_multiplier").eq("api_key", apiKey).single()

    if (!user) {
      return NextResponse.json({ status: "error", message: "Invalid API key" }, { status: 401 })
    }

    const priceMultiplier = user.price_multiplier || 3.0

    // Get active services
    const { data: services } = await supabase
      .from("services")
      .select("id, name, base_price, min_quantity, max_quantity, platform, description")
      .eq("is_active", true)

    const formattedServices = services?.map((service) => ({
      id: service.id,
      name: service.name,
      price: (Number(service.base_price) * priceMultiplier).toFixed(4),
      min: service.min_quantity,
      max: service.max_quantity,
      platform: service.platform,
      description: service.description,
    }))

    return NextResponse.json({
      status: "success",
      services: formattedServices || [],
    })
  } catch (error) {
    return NextResponse.json({ status: "error", message: "Internal server error" }, { status: 500 })
  }
}
