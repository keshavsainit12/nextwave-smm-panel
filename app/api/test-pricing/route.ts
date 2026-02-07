import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function GET() {
  try {
    const supabase = await createClient()
    
    // Fetch first 5 services directly from database
    const { data: services, error } = await supabase
      .from("services")
      .select("*")
      .limit(5)
    
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
    
    // Show raw data and calculations
    const result = services?.map(service => {
      const basePrice = parseFloat(service.base_price || "0")
      const providerPrice = parseFloat(service.provider_price || "0")
      const profitMargin = providerPrice > 0 ? ((basePrice - providerPrice) / providerPrice * 100) : 0
      
      return {
        id: service.id,
        name: service.name,
        // Raw database values
        base_price_raw: service.base_price,
        provider_price_raw: service.provider_price,
        // Parsed values
        base_price_parsed: basePrice,
        provider_price_parsed: providerPrice,
        profit_margin_percent: profitMargin.toFixed(2),
        // Calculated selling prices
        admin_selling_price: basePrice, // Admin sees base_price
        normal_user_price: basePrice * 3, // Normal users see 3x multiplier
        vip_user_price: basePrice * 2, // VIP users see 2x multiplier
        // Status
        is_active: service.is_active,
        category: service.category
      }
    })
    
    return NextResponse.json({
      timestamp: new Date().toISOString(),
      message: "Raw database values (NO cache)",
      total_services_shown: result?.length || 0,
      services: result
    })
    
  } catch (error: any) {
    return NextResponse.json({
      error: "Failed to fetch",
      details: error.message
    }, { status: 500 })
  }
}
