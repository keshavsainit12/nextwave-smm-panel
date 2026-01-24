import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { couponCode } = body

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
      .single()

    if (error || !coupon) {
      return NextResponse.json({ valid: false, error: 'Invalid coupon code' }, { status: 200 })
    }

    // Check if coupon is active
    if (!coupon.active) {
      return NextResponse.json({ valid: false, error: 'This coupon is not active' }, { status: 200 })
    }

    // Check if coupon has expired
    if (coupon.expires_at && new Date(coupon.expires_at) < new Date()) {
      return NextResponse.json({ valid: false, error: 'This coupon has expired' }, { status: 200 })
    }

    // Check if coupon has usage limit
    if (coupon.max_uses && coupon.used_count >= coupon.max_uses) {
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
        return NextResponse.json(
          { valid: false, error: `You can only use this coupon ${coupon.per_user_limit} time(s)` },
          { status: 200 }
        )
      }
    }

    // Coupon is valid
    return NextResponse.json({
      valid: true,
      discount: coupon.discount_percentage || 0,
      code: coupon.code,
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
