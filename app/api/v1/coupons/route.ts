import { createAdminClient } from "@/lib/supabase/admin"
import { NextRequest, NextResponse } from "next/server"

export async function GET() {
  try {
    const supabase = createAdminClient()

    const { data: coupons, error } = await supabase
      .from("coupons")
      .select("*")
      .order("created_at", { ascending: false })

    if (error) {
      console.error("[v0] Supabase error fetching coupons:", error.message)
      return NextResponse.json({ 
        error: error.message || "Failed to fetch coupons" 
      }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      coupons: coupons || [],
    })
  } catch (error: any) {
    console.error("[v0] API error:", error)
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { code, discount_type = 'percentage', discount_value, discount_percentage, max_uses, is_active } = body

    // Support both discount_value and discount_percentage for backwards compatibility
    const finalDiscount = discount_value || discount_percentage

    if (!code || code.trim().length === 0) {
      return NextResponse.json({ error: "Coupon code is required" }, { status: 400 })
    }

    if (!finalDiscount || finalDiscount <= 0 || finalDiscount > 100) {
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

    // Create coupon with explicit column mapping
    const couponData = {
      code: code.toUpperCase().trim(),
      discount_type: discount_type || 'percentage',
      discount_value: finalDiscount,
      max_uses: max_uses || null,
      used_count: 0,
      is_active: is_active !== false,
      valid_for: 'all',
    }

    const { data: coupon, error } = await supabase
      .from("coupons")
      .insert(couponData)
      .select()
      .single()

    if (error) {
      console.error("[v0] Supabase error creating coupon:", error.message, error.details)
      return NextResponse.json({ 
        error: error.message || "Failed to create coupon",
        details: error.details 
      }, { status: 500 })
    }

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
