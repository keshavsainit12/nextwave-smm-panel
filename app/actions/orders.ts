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
        .select("id, discount_type, discount_value, is_active, expires_at, max_uses, used_count, min_order_amount")
        .ilike("code", couponCode.trim())
        .single()

      if (couponError || !coupon) {
        return { error: "Invalid coupon code" }
      }

      if (!coupon.is_active) {
        return { error: "This coupon is not active" }
      }

      if (coupon.expires_at && new Date(coupon.expires_at) < new Date()) {
        return { error: "This coupon has expired" }
      }

      if (coupon.max_uses && coupon.used_count >= coupon.max_uses) {
        return { error: "This coupon has reached its usage limit" }
      }

      // Check minimum order amount
      if (coupon.min_order_amount && price < coupon.min_order_amount) {
        return { error: `Minimum order amount for this coupon is $${coupon.min_order_amount}` }
      }

      couponId = coupon.id
      
      // Calculate discount based on type
      if (coupon.discount_type === "percentage") {
        discountPercentage = Number(coupon.discount_value) || 0
        price = price * (1 - discountPercentage / 100)
      } else {
        // Fixed discount
        price = Math.max(0, price - Number(coupon.discount_value))
      }

      console.log(`[v0] Coupon applied: ${coupon.discount_type} discount of ${coupon.discount_value}, new price: $${price.toFixed(2)}`)
    }

    if (isBulkBuy && quantity < 10000) {
      return { error: "Bulk orders require a minimum quantity of 10,000" }
    }

    if (userData.balance < price) {
      console.log(`[v0] Insufficient balance: need $${price.toFixed(2)}, have $${userData.balance.toFixed(2)}`)
      return { error: `Insufficient balance. You need $${price.toFixed(2)} but have $${userData.balance.toFixed(2)}` }
    }

    const balanceBefore = userData.balance
    const balanceAfter = balanceBefore - price

    console.log(`[v0] Creating order in database...`)
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
      })
      .select()
      .single()
    const order = orderResponse.data
    const orderError = orderResponse.error

    if (orderError || !order) {
      console.error("[v0] Order creation error:", orderError?.message)
      return { error: "Failed to create order in database" }
    }

    console.log("[v0] Order created with ID:", order.id, "- Now deducting balance...")

    // CRITICAL: Deduct balance FIRST before any other operations
    const { error: balanceUpdateError } = await supabase
      .from("users")
      .update({
        balance: balanceAfter,
        total_orders: (userData.total_orders || 0) + 1,
        total_spent: (userData.total_spent || 0) + price,
      })
      .eq("id", user.id)

    if (balanceUpdateError) {
      console.error("[v0] Balance update error:", balanceUpdateError.message)
      // Rollback order if balance update fails
      await supabase.from("orders").delete().eq("id", order.id)
      return { error: "Failed to deduct balance. Order cancelled." }
    }

    console.log(`[v0] Balance deducted successfully: $${balanceBefore.toFixed(2)} → $${balanceAfter.toFixed(2)}`)

    // Record transaction
    console.log("[v0] Recording transaction...")
    const { error: transactionError } = await supabase.from("transactions").insert({
      user_id: user.id,
      order_id: order.id,
      type: "order",
      amount: -price,
      balance_before: balanceBefore,
      balance_after: balanceAfter,
      status: "completed",
    })

    if (transactionError) {
      console.warn("[v0] Transaction record failed (non-critical):", transactionError.message)
    }

    // Record coupon usage if coupon was used
    if (couponId) {
      console.log("[v0] Recording coupon usage...")
      const { error: couponUsageError } = await supabase.from("coupon_usage").insert({
        coupon_id: couponId,
        user_id: user.id,
        order_id: order.id,
        discount_amount: (quantity / 1000) * finalServicePrice * (discountPercentage / 100),
      })

      if (couponUsageError) {
        console.warn("[v0] Coupon usage record failed (non-critical):", couponUsageError.message)
      }

      // Increment coupon usage count
      const { error: couponIncrementError } = await supabase.rpc("increment_coupon_usage", { coupon_id: couponId })
      if (couponIncrementError) {
        console.warn("[v0] Coupon increment failed (non-critical):", couponIncrementError.message)
      }
    }

    // Send to API provider
    if (service.provider && service.provider.is_active && service.external_service_id) {
      try {
        console.log("[v0] ===== SENDING ORDER TO PROVIDER =====")
        console.log("[v0] Provider Details:", {
          provider_id: service.provider.id,
          provider_name: service.provider.name,
          api_url: service.provider.api_url,
          is_active: service.provider.is_active,
          auth_mode: (service.provider as any).auth_mode || "key (default)",
          masked_api_key: service.provider.api_key
            ? `${service.provider.api_key.slice(0, 4)}...${service.provider.api_key.slice(-4)}`
            : "MISSING",
        })
        console.log("[v0] Order Details:", {
          order_id: order.id,
          external_service_id: service.external_service_id,
          link: link,
          quantity: quantity,
        })

        const apiClient = new SMMApiClient(service.provider.api_url, service.provider.api_key)
        
        // Determine auth mode from provider settings
        const authMode = (service.provider as any).auth_mode === "bearer" ? "bearer" : "key"
        console.log("[v0] Using auth mode:", authMode)
        
        const apiResponse = await apiClient.createOrder(
          Number.parseInt(service.external_service_id),
          link,
          quantity,
          { authMode },
        )

        console.log("[v0] ✅ SUCCESS! API order created with external ID:", apiResponse.order)
        console.log("[v0] Full API Response:", apiResponse)

        const { error: apiUpdateError } = await supabase
          .from("orders")
          .update({
            external_order_id: String(apiResponse.order),
            status: "processing",
          })
          .eq("id", order.id)

        if (apiUpdateError) {
          console.warn("[v0] Failed to update order with external ID (non-critical):", apiUpdateError.message)
        } else {
          console.log("[v0] ✅ Order updated in database with external_order_id:", apiResponse.order)
        }
      } catch (error: any) {
        // Log comprehensive error details for diagnostics
        const errorResponse = error.response || {}
        console.error("[v0] ❌ FAILED to send order to API provider")
        console.error("[v0] Error Details:", {
          order_id: order.id,
          provider_id: service.provider.id,
          provider_name: service.provider.name,
          provider_api_url: service.provider.api_url,
          masked_api_key: service.provider.api_key
            ? `${service.provider.api_key.slice(0, 4)}...${service.provider.api_key.slice(-4)}`
            : "none",
          service_external_id: service.external_service_id,
          auth_mode: (service.provider as any).auth_mode || "key",
          error_message: error.message,
          provider_http_status: errorResponse.status,
          provider_response_body: errorResponse.body,
        })
        console.error("[v0] Full Error Stack:", error.stack)
        console.error("[v0] ===================================")
        // Order stays in pending status if API fails - user still got charged and order is recorded
        // Admin can use the resend utility to retry with updated credentials
      }
    } else {
      // Log why order is not being sent to provider
      console.log("[v0] Order NOT sent to provider. Reason:", {
        has_provider: !!service.provider,
        provider_is_active: service.provider?.is_active,
        has_external_service_id: !!service.external_service_id,
      })
    }

    revalidatePath("/dashboard")
    revalidatePath("/dashboard/orders")

    console.log("[v0] Order placement completed successfully!")
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
    const authMode = (provider as any).auth_mode === "bearer" ? "bearer" : "key"
    const status = await apiClient.getOrderStatus(Number.parseInt(order.external_order_id), {
      authMode,
    })

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
  } catch (error: any) {
    const errorResponse = error.response || {}
    console.error("[v0] Failed to sync order status:", {
      order_id: orderId,
      external_order_id: order.external_order_id,
      provider_id: provider.id,
      provider_api_url: provider.api_url,
      masked_api_key: provider.api_key ? `${provider.api_key.slice(0, 4)}...${provider.api_key.slice(-4)}` : "none",
      error_message: error.message,
      provider_response_status: errorResponse.status,
      provider_response_body: errorResponse.body,
    })
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
