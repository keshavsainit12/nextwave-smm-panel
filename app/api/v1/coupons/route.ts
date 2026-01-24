import { createAdminClient } from "@/lib/supabase/admin"
import { NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { code, discount_percentage, max_uses, active } = body

    console.log("[v0] Creating coupon:", { code, discount_percentage, max_uses, active })

    // Validation
    if (!code || code.trim().length === 0) {
      return NextResponse.json({ error: "Coupon code is required" }, { status: 400 })
    }

    if (discount_percentage <= 0 || discount_percentage > 100) {
      return NextResponse.json({ error: "Discount must be between 1 and 100%" }, { status: 400 })
    }

    const supabase = createAdminClient()

    // Check if code already exists
    const { data: existingCoupon } = await supabase
      .from("coupons")
      .select("id")
      .ilike("code", code.trim())
      .maybeSingle()

    if (existingCoupon) {
      return NextResponse.json({ error: "Coupon code already exists" }, { status: 409 })
    }

    // Create coupon
    const { data: coupon, error } = await supabase
      .from("coupons")
      .insert({
        code: code.toUpperCase().trim(),
        discount_percentage: discount_percentage,
        max_uses: max_uses || null,
        used_count: 0,
        active: active !== false,
        created_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (error) {
      console.error("[v0] Coupon creation error:", error)
      return NextResponse.json({ error: error.message || "Failed to create coupon" }, { status: 500 })
    }

    console.log("[v0] Coupon created successfully:", coupon)

    return NextResponse.json({
      success: true,
      coupon: coupon,
      message: "Coupon created successfully",
    })
  } catch (error: any) {
    console.error("[v0] API error:", error)
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const supabase = createAdminClient()

    const { data: coupons, error } = await supabase
      .from("coupons")
      .select("*")
      .order("created_at", { ascending: false })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, coupons: coupons || [] })
  } catch (error: any) {
    console.error("[v0] API error:", error)
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 })
  }
}
