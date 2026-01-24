"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { SMMApiClient } from "@/lib/smm-api-client"

export async function placeOrder(serviceId: string, link: string, quantity: number, couponCode?: string, isBulkBuy = false) {
  try {
    const supabase = await createClient()
    const userResponse = await supabase.auth.getUser()
    const user = userResponse.data.user

    if (!user) {
      return { error: "Unauthorized" }
    }

    console.log("[v0] Placing order for user:", user.id, "service:", serviceId, "coupon:", couponCode, "bulk:", isBulkBuy)

    const serviceResponse = await supabase
      .from("services")
      .select(`
        *,
        provider:api_providers(*)
      `)
      .eq("id", serviceId)
      .single()
    const service = serviceResponse.data

    if (!service) {
      return { error: "Service not found" }
    }

    const servicePrice = Number(service.base_price || 0)
    if (servicePrice === 0) {
      return { error: "Service price not set. Please contact admin." }
    }

    const userResponseData = await supabase
      .from("users")
      .select("balance, total_orders, total_spent, tier, price_multiplier")
      .eq("id", user.id)
      .single()
    const userData = userResponseData.data

    if (!userData) {
      return { error: "User not found" }
    }

    const baseMultiplier = userData.price_multiplier || 3.0
    const priceMultiplier = isBulkBuy ? 2.5 : baseMultiplier
    const finalServicePrice = servicePrice * priceMultiplier
    let price = (quantity / 1000) * finalServicePrice

    console.log(
      `[v0] Order calculation: ${quantity} units × $${servicePrice}/1K × ${priceMultiplier}x (${isBulkBuy ? "BULK" : "REGULAR"}) = $${price.toFixed(4)}`,
    )

    // Apply coupon discount if provided
    let couponId: string | null = null
    let discountPercentage = 0

    if (couponCode) {
      const { data: coupon, error: couponError } = await supabase
        .from("coupons")
        .select("id, discount_percentage, active, expires_at, max_uses, used_count, per_user_limit")
        .ilike("code", couponCode.trim())
        .single()

      if (couponError || !coupon) {
        return { error: "Invalid coupon code" }
      }

      if (!coupon.active) {
        return { error: "This coupon is not active" }
      }

      if (coupon.expires_at && new Date(coupon.expires_at) < new Date()) {
        return { error: "This coupon has expired" }
      }

      if (coupon.max_uses && coupon.used_count >= coupon.max_uses) {
        return { error: "This coupon has reached its usage limit" }
      }

      // Check per-user limit
      if (coupon.per_user_limit && coupon.per_user_limit > 0) {
        const { data: userUsages } = await supabase
          .from("coupon_usages")
          .select("id")
          .eq("coupon_id", coupon.id)
          .eq("user_id", user.id)

        if (userUsages && userUsages.length >= coupon.per_user_limit) {
          return { error: `You have already used this coupon ${coupon.per_user_limit} time(s)` }
        }
      }

      couponId = coupon.id
      discountPercentage = coupon.discount_percentage || 0
      price = price * (1 - discountPercentage / 100)

      console.log(`[v0] Coupon applied: ${discountPercentage}% discount, new price: $${price.toFixed(2)}`)
    }

    if (isBulkBuy && quantity < 10000) {
      return { error: "Bulk orders require a minimum quantity of 10,000" }
    }

    if (userData.balance < price) {
      return { error: `Insufficient balance. You need $${price.toFixed(2)} but have $${userData.balance.toFixed(2)}` }
    }

    const balanceBefore = userData.balance
    const balanceAfter = balanceBefore - price

    const orderResponse = await supabase
      .from("orders")
      .insert({
        user_id: user.id,
        service_id: serviceId,
        link,
        quantity,
        price,
        status: "pending",
        can_refill: service.has_refill || service.refill,
        coupon_id: couponId,
        discount_percentage: discountPercentage,
      })
      .select()
      .single()
    const order = orderResponse.data
    const orderError = orderResponse.error

    if (orderError) {
      console.error("[v0] Order creation error:", orderError)
      return { error: orderError.message }
    }

    // Deduct balance and update user stats
    await supabase
      .from("users")
      .update({
        balance: balanceAfter,
        total_orders: (userData.total_orders || 0) + 1,
        total_spent: (userData.total_spent || 0) + price,
      })
      .eq("id", user.id)

    // Record coupon usage if coupon was used
    if (couponId) {
      await supabase.from("coupon_usages").insert({
        coupon_id: couponId,
        user_id: user.id,
        order_id: order.id,
        discount_amount: (quantity / 1000) * finalServicePrice * (discountPercentage / 100),
      })

      // Increment coupon usage count
      await supabase.rpc("increment_coupon_usage", { coupon_id: couponId })
    }

    // Create transaction record
    await supabase.from("transactions").insert({
      user_id: user.id,
      order_id: order.id,
      type: "order",
      amount: -price,
      balance_before: balanceBefore,
      balance_after: balanceAfter,
      status: "completed",
    })

    console.log(`[v0] Balance deducted: $${balanceBefore.toFixed(2)} → $${balanceAfter.toFixed(2)}`)

    // Send to API provider
    if (service.provider && service.provider.is_active && service.external_service_id) {
      try {
        const apiClient = new SMMApiClient(service.provider.api_url, service.provider.api_key)

        const apiResponse = await apiClient.createOrder(Number.parseInt(service.external_service_id), link, quantity)

        console.log("[v0] API order created:", apiResponse.order)

        await supabase
          .from("orders")
          .update({
            external_order_id: String(apiResponse.order),
            status: "processing",
          })
          .eq("id", order.id)
      } catch (error) {
        console.error("[v0] Failed to send order to API:", error)
        // Order stays in pending status if API fails
      }
    }

    revalidatePath("/dashboard")
    revalidatePath("/dashboard/orders")

    return { success: true, orderId: order.id }
  } catch (error) {
    console.error("[v0] Place order error:", error)
    return { error: "Failed to place order. Please try again." }
  }
}

export async function syncOrderStatus(orderId: string) {
  const supabase = await createClient()

  const orderResponse = await supabase
    .from("orders")
    .select(`
      *,
      service:services(
        provider:api_providers(*)
      )
    `)
    .eq("id", orderId)
    .single()
  const order = orderResponse.data

  if (!order || !order.external_order_id || !order.service?.provider) {
    return { error: "Order or provider not found" }
  }

  const provider = order.service.provider

  try {
    const apiClient = new SMMApiClient(provider.api_url, provider.api_key)
    const status = await apiClient.getOrderStatus(Number.parseInt(order.external_order_id))

    // Map API status to our status
    let newStatus = order.status
    if (status.status === "Completed") newStatus = "completed"
    else if (status.status === "Partial") newStatus = "partial"
    else if (status.status === "In progress" || status.status === "Processing") newStatus = "processing"
    else if (status.status === "Canceled") newStatus = "canceled"

    // Update order
    await supabase
      .from("orders")
      .update({
        status: newStatus,
        start_count: Number.parseInt(status.start_count) || 0,
        remains: Number.parseInt(status.remains) || 0,
        updated_at: new Date().toISOString(),
      })
      .eq("id", orderId)

    revalidatePath("/dashboard/orders")
    revalidatePath("/admin-panel-2024/orders")

    return { success: true, status: newStatus }
  } catch (error) {
    return { error: String(error) }
  }
}

export async function requestRefill(orderId: string) {
  const supabase = await createClient()
  const userResponse = await supabase.auth.getUser()
  const user = userResponse.data.user

  if (!user) {
    return { error: "Unauthorized" }
  }

  const orderResponseData = await supabase
    .from("orders")
    .select(`
      *,
      service:services(
        provider:api_providers(*)
      )
    `)
    .eq("id", orderId)
    .eq("user_id", user.id)
    .single()
  const order = orderResponseData.data

  if (!order) {
    return { error: "Order not found" }
  }

  if (!order.can_refill) {
    return { error: "This order does not support refills" }
  }

  if (!order.external_order_id || !order.service?.provider) {
    return { error: "Cannot refill order without external order ID" }
  }

  const provider = order.service.provider

  try {
    const apiClient = new SMMApiClient(provider.api_url, provider.api_key)
    await apiClient.createRefill(Number.parseInt(order.external_order_id))

    // Update order
    await supabase
      .from("orders")
      .update({
        refill_count: (order.refill_count || 0) + 1,
        last_refill_at: new Date().toISOString(),
      })
      .eq("id", orderId)

    revalidatePath("/dashboard/orders")

    return { success: true, message: "Refill requested successfully" }
  } catch (error) {
    return { error: String(error) }
  }
}

export async function cancelOrder(orderId: string) {
  const supabase = await createClient()
  const userResponse = await supabase.auth.getUser()
  const user = userResponse.data.user

  if (!user) {
    return { error: "Unauthorized" }
  }

  const orderResponseData = await supabase
    .from("orders")
    .select(`
      *,
      service:services(
        provider:api_providers(*),
        can_cancel
      )
    `)
    .eq("id", orderId)
    .eq("user_id", user.id)
    .single()
  const order = orderResponseData.data

  if (!order) {
    return { error: "Order not found" }
  }

  if (order.status === "completed" || order.status === "canceled") {
    return { error: "Cannot cancel this order" }
  }

  if (!order.external_order_id || !order.service?.provider) {
    // Just mark as canceled if no external order
    await supabase.from("orders").update({ status: "canceled" }).eq("id", orderId)
    revalidatePath("/dashboard/orders")
    return { success: true }
  }

  const provider = order.service.provider

  try {
    const apiClient = new SMMApiClient(provider.api_url, provider.api_key)
    await apiClient.cancelOrder(Number.parseInt(order.external_order_id))

    // Update order and refund
    const refundAmount = order.price
    const userDataResponse = await supabase.from("users").select("balance").eq("id", user.id).single()
    const userData = userDataResponse.data

    if (userData) {
      const newBalance = userData.balance + refundAmount

      await supabase.from("users").update({ balance: newBalance }).eq("id", user.id)

      await supabase.from("transactions").insert({
        user_id: user.id,
        order_id: orderId,
        type: "refund",
        amount: refundAmount,
        balance_before: userData.balance,
        balance_after: newBalance,
        status: "completed",
      })
    }

    await supabase.from("orders").update({ status: "canceled" }).eq("id", orderId)

    revalidatePath("/dashboard/orders")
    revalidatePath("/dashboard")

    return { success: true, message: "Order canceled and refunded" }
  } catch (error) {
    return { error: String(error) }
  }
}
