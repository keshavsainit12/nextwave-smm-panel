"use server"

import { createAdminClient } from "@/lib/supabase/admin"
import { revalidatePath } from "next/cache"
import { SMMApiClient } from "@/lib/smm-api-client"

export async function updateOrderStatus(orderId: string, status: string, adminNotes?: string) {
  try {
    const supabase = createAdminClient()

    const updateData: any = {
      status,
      updated_at: new Date().toISOString(),
    }

    if (adminNotes) {
      updateData.admin_notes = adminNotes
    }

    const { error } = await supabase.from("orders").update(updateData).eq("id", orderId)

    if (error) {
      console.error("[v0] Update order status error:", error)
      return { error: error.message }
    }

    revalidatePath("/admin-panel-2024")
    revalidatePath("/admin-panel-2024/orders")

    return { success: true }
  } catch (error: any) {
    console.error("[v0] Update order status error:", error)
    return { error: error.message || "Failed to update order status" }
  }
}

export async function cancelOrder(orderId: string, reason: string) {
  try {
    if (!orderId || orderId.trim() === "") {
      console.error("[v0] Invalid order ID provided:", orderId)
      return { error: "Invalid order ID" }
    }

    const supabase = createAdminClient()

    console.log("[v0] Attempting to cancel order with ID:", orderId)

    // Get order details for refund with error handling
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .select("id, user_id, price, status")
      .eq("id", orderId)
      .single()

    if (orderError) {
      console.error("[v0] Order fetch error:", {
        code: orderError.code,
        message: orderError.message,
        details: orderError.details,
        orderId,
      })
      
      if (orderError.code === "PGRST116") {
        return { error: "Order not found - please refresh the page and try again" }
      }
      
      return { error: "Failed to fetch order: " + orderError.message }
    }

    if (!order) {
      console.error("[v0] Order data is null for ID:", orderId)
      return { error: "Order not found - order data is empty" }
    }

    console.log("[v0] Order found successfully:", { orderId, userId: order.user_id, amount: order.price, status: order.status })

    // Check if order is already cancelled
    if (order.status === "cancelled" || order.status === "canceled") {
      return { error: "Order is already cancelled" }
    }

    // Get current user balance
    const { data: userData, error: getUserError } = await supabase
      .from("users")
      .select("balance")
      .eq("id", order.user_id)
      .single()

    if (getUserError || !userData) {
      console.error("[v0] Failed to fetch user balance:", getUserError)
      return { error: "Failed to fetch user for refund" }
    }

    // Calculate new balance
    const newBalance = (userData.balance || 0) + order.price

    // Update user balance
    const { error: updateBalanceError } = await supabase
      .from("users")
      .update({ balance: newBalance })
      .eq("id", order.user_id)

    if (updateBalanceError) {
      console.error("[v0] Balance update error:", updateBalanceError)
      return { error: "Failed to process refund: " + updateBalanceError.message }
    }

    console.log("[v0] Balance refunded successfully for user:", order.user_id, "new balance:", newBalance)

    // Create transaction record for refund
    const { error: transactionError } = await supabase.from("transactions").insert({
      user_id: order.user_id,
      order_id: orderId,
      type: "refund",
      amount: order.price,
      balance_before: userData.balance || 0,
      balance_after: newBalance,
      status: "completed",
    })

    if (transactionError) {
      console.error("[v0] Transaction record error (non-critical):", transactionError)
      // Don't fail the whole operation if transaction log fails
    } else {
      console.log("[v0] Transaction record created for refund")
    }

    // Update order status
    const { error: updateError } = await supabase
      .from("orders")
      .update({
        status: "canceled",  // Use US spelling to match database constraint
        admin_notes: reason || "Cancelled by admin",
        updated_at: new Date().toISOString(),
      })
      .eq("id", orderId)

    if (updateError) {
      console.error("[v0] Order update error:", updateError)
      return { error: "Failed to update order status: " + updateError.message }
    }

    console.log("[v0] Order cancelled successfully:", orderId)

    // Log activity
    await supabase.from("activity_logs").insert({
      user_id: order.user_id,
      action: "order_cancelled",
      entity_type: "order",
      entity_id: orderId,
      details: {
        reason,
        refund_amount: order.price,
      },
      ip_address: "admin",
    }).catch((err) => console.log("[v0] Activity log error (non-critical):", err))

    revalidatePath("/admin-panel-2024")
    revalidatePath("/admin-panel-2024/orders")

    return { success: true }
  } catch (error: any) {
    console.error("[v0] Cancel order exception:", error)
    return { error: error.message || "Failed to cancel order" }
  }
}

/**
 * Resend a failed order to the external SMM provider
 * This uses the current provider API key from the database
 * Useful when provider credentials were rotated
 */
export async function resendOrderToProvider(orderId: string) {
  try {
    if (!orderId || orderId.trim() === "") {
      return { error: "Invalid order ID" }
    }

    const supabase = createAdminClient()

    // Get order with provider details
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .select(
        `
        id,
        user_id,
        link,
        quantity,
        status,
        external_order_id,
        service:services(
          id,
          external_service_id,
          provider:api_providers(*)
        )
      `,
      )
      .eq("id", orderId)
      .single()

    if (orderError || !order) {
      console.error("[ADMIN] Failed to fetch order for resend:", orderError)
      return { error: "Order not found" }
    }

    // Validate order can be resent
    if (order.status === "completed") {
      return { error: "Cannot resend completed order" }
    }

    if (!order.service?.provider || !order.service.external_service_id) {
      return { error: "Order has no provider or external service ID configured" }
    }

    const provider = order.service.provider
    const service = order.service

    console.log("[ADMIN] Attempting to resend order to provider:", {
      order_id: orderId,
      provider_id: provider.id,
      provider_api_url: provider.api_url,
      masked_api_key: provider.api_key ? `${provider.api_key.slice(0, 4)}...${provider.api_key.slice(-4)}` : "none",
      service_external_id: service.external_service_id,
      link: order.link,
      quantity: order.quantity,
    })

    try {
      const apiClient = new SMMApiClient(provider.api_url, provider.api_key)
      const authMode = (provider as any).auth_mode === "bearer" ? "bearer" : "key"

      const apiResponse = await apiClient.createOrder(
        Number.parseInt(service.external_service_id),
        order.link,
        order.quantity,
        { authMode },
      )

      console.log("[ADMIN] Order successfully sent to provider, external order ID:", apiResponse.order)

      // Update order with new external ID and status
      const { error: updateError } = await supabase
        .from("orders")
        .update({
          external_order_id: String(apiResponse.order),
          status: "processing",
          admin_notes: `Resent to provider at ${new Date().toISOString()}`,
          updated_at: new Date().toISOString(),
        })
        .eq("id", orderId)

      if (updateError) {
        console.error("[ADMIN] Failed to update order after successful resend:", updateError)
        return {
          success: true,
          warning: "Order sent to provider but failed to update database. External order ID: " + apiResponse.order,
          external_order_id: apiResponse.order,
        }
      }

      // Log activity
      await supabase
        .from("activity_logs")
        .insert({
          user_id: order.user_id,
          action: "order_resent",
          entity_type: "order",
          entity_id: orderId,
          details: {
            provider_id: provider.id,
            external_order_id: String(apiResponse.order),
            previous_external_order_id: order.external_order_id,
          },
          ip_address: "admin",
        })
        .catch((err) => console.error("[ADMIN] Activity log error (non-critical):", err))

      revalidatePath("/admin-panel-2024")
      revalidatePath("/admin-panel-2024/orders")

      return {
        success: true,
        message: "Order successfully sent to provider",
        external_order_id: apiResponse.order,
      }
    } catch (providerError: any) {
      const errorResponse = providerError.response || {}
      console.error("[ADMIN] Failed to send order to provider:", {
        order_id: orderId,
        provider_id: provider.id,
        provider_api_url: provider.api_url,
        masked_api_key: provider.api_key ? `${provider.api_key.slice(0, 4)}...${provider.api_key.slice(-4)}` : "none",
        service_external_id: service.external_service_id,
        error_message: providerError.message,
        provider_response_status: errorResponse.status,
        provider_response_body: errorResponse.body,
      })

      return {
        error: `Provider API error: ${providerError.message}`,
        details: errorResponse.body,
      }
    }
  } catch (error: any) {
    console.error("[ADMIN] Resend order exception:", error)
    return { error: error.message || "Failed to resend order" }
  }
}
