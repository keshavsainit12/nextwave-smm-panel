"use server"

import { createAdminClient } from "@/lib/supabase/admin"
import { revalidatePath } from "next/cache"

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

    // Check if order is already canceled
    if (order.status === "cancelled" || order.status === "canceled") {
      return { error: "Order is already canceled" }
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

    // Update order status
    const { error: updateError } = await supabase
      .from("orders")
      .update({
        status: "canceled",
        admin_notes: reason || "Canceled by admin",
        updated_at: new Date().toISOString(),
      })
      .eq("id", orderId)

    if (updateError) {
      console.error("[v0] Order update error:", updateError)
      return { error: "Failed to update order status: " + updateError.message }
    }

    console.log("[v0] Order canceled successfully:", orderId)

    // Log activity
    await supabase.from("activity_logs").insert({
      user_id: order.user_id,
      action: "order_canceled",
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
