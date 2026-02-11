import { NextRequest, NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase/admin"

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { code, discount_type, discount_value, max_uses, is_active } = body

    if (!code || code.trim().length === 0) {
      return NextResponse.json({ error: "Coupon code is required" }, { status: 400 })
    }

    if (!discount_value || discount_value <= 0 || discount_value > 100) {
      return NextResponse.json({ error: "Discount must be between 1 and 100%" }, { status: 400 })
    }

    const supabase = createAdminClient()

    // Check if code is already taken by another coupon
    const { data: existingCoupon } = await supabase
      .from("coupons")
      .select("id")
      .ilike("code", code.trim())
      .neq("id", id)
      .maybeSingle()

    if (existingCoupon) {
      return NextResponse.json({ error: "Coupon code already exists" }, { status: 409 })
    }

    // Update coupon
    const { data: coupon, error } = await supabase
      .from("coupons")
      .update({
        code: code.toUpperCase().trim(),
        discount_type: discount_type || 'percentage',
        discount_value: discount_value,
        max_uses: max_uses || null,
        is_active: is_active !== false,
      })
      .eq("id", id)
      .select()
      .single()

    if (error) {
      console.error("[v0] Supabase error updating coupon:", error.message, error.details)
      return NextResponse.json({ 
        error: error.message || "Failed to update coupon",
        details: error.details 
      }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      coupon: coupon,
      message: "Coupon updated successfully",
    })
  } catch (error: any) {
    console.error("[v0] API error:", error)
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = createAdminClient()

    // Delete coupon
    const { error } = await supabase
      .from("coupons")
      .delete()
      .eq("id", id)

    if (error) {
      console.error("[v0] Supabase error deleting coupon:", error.message, error.details)
      return NextResponse.json({ 
        error: error.message || "Failed to delete coupon",
        details: error.details 
      }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: "Coupon deleted successfully",
    })
  } catch (error: any) {
    console.error("[v0] API error:", error)
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 })
  }
}
