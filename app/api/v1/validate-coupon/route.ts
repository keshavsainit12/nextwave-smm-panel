import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { couponCode } = body

    console.log("[v0] Validating coupon:", couponCode)

    if (!couponCode) {
      return NextResponse.json({ valid: false, error: 'Coupon code required' }, { status: 400 })
    }

    const supabase = await createClient()

    // Get current user
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ valid: false, error: 'Please login first' }, { status: 401 })
    }

    // Find coupon in database
    const { data: coupon, error } = await supabase
      .from('coupons')
      .select('*')
      .ilike('code', couponCode.trim())
      .maybeSingle()

    console.log("[v0] Coupon found:", coupon)

    if (error || !coupon) {
      console.log("[v0] Coupon not found")
      return NextResponse.json({ valid: false, error: 'Invalid coupon code' }, { status: 200 })
    }

    // Check if coupon is active
    if (!coupon.active) {
      console.log("[v0] Coupon is not active")
      return NextResponse.json({ valid: false, error: 'This coupon is not active' }, { status: 200 })
    }

    // Check if coupon has expired
    if (coupon.expires_at && new Date(coupon.expires_at) < new Date()) {
      console.log("[v0] Coupon has expired")
      return NextResponse.json({ valid: false, error: 'This coupon has expired' }, { status: 200 })
    }

    // Check if coupon has usage limit
    const usedCount = coupon.used_count || 0
    if (coupon.max_uses && usedCount >= coupon.max_uses) {
      console.log("[v0] Coupon usage limit reached")
      return NextResponse.json({ valid: false, error: 'This coupon has reached its usage limit' }, { status: 200 })
    }

    // Check if user has already used this coupon (if per-user limit exists)
    if (coupon.per_user_limit && coupon.per_user_limit > 0) {
      const { data: userUsages } = await supabase
        .from('coupon_usages')
        .select('id')
        .eq('coupon_id', coupon.id)
        .eq('user_id', user.id)

      if (userUsages && userUsages.length >= coupon.per_user_limit) {
        console.log("[v0] User has reached per-user coupon limit")
        return NextResponse.json(
          { valid: false, error: `You can only use this coupon ${coupon.per_user_limit} time(s)` },
          { status: 200 }
        )
      }
    }

    // Coupon is valid
    const remainingUses = coupon.max_uses ? coupon.max_uses - usedCount : null
    
    console.log("[v0] Coupon is valid:", { discount: coupon.discount_percentage, remainingUses })

    return NextResponse.json({
      valid: true,
      discount: coupon.discount_percentage || 0,
      code: coupon.code,
      max_uses: coupon.max_uses,
      used_count: usedCount,
      remaining_uses: remainingUses,
      message: `${coupon.discount_percentage}% discount applied`,
    })
  } catch (error) {
    console.error('[v0] Validate coupon error:', error)
    return NextResponse.json(
      { valid: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
