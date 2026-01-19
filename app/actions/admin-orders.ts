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
    const supabase = createAdminClient()

    console.log("[v0] Attempting to cancel order:", orderId)

    // Get order details for refund - handle error properly
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .select("user_id, total_price, status")
      .eq("id", orderId)
      .single()

    if (orderError) {
      console.error("[v0] Order fetch error:", orderError)
      return { error: "Order not found" }
    }

    if (!order) {
      console.error("[v0] Order data is null for ID:", orderId)
      return { error: "Order not found" }
    }

    console.log("[v0] Order found:", { orderId, userId: order.user_id, amount: order.total_price })

    // Check if order is already cancelled
    if (order.status === "cancelled") {
      return { error: "Order is already cancelled" }
    }

    // Refund user balance
    const { error: refundError } = await supabase.rpc("increment_balance", {
      user_id: order.user_id,
      amount: order.total_price,
    })

    if (refundError) {
      console.error("[v0] Refund error:", refundError)
      return { error: "Failed to process refund: " + refundError.message }
    }

    console.log("[v0] Refund processed successfully for user:", order.user_id)

    // Update order status
    const { error: updateError } = await supabase
      .from("orders")
      .update({
        status: "cancelled",
        admin_notes: reason,
        updated_at: new Date().toISOString(),
      })
      .eq("id", orderId)

    if (updateError) {
      console.error("[v0] Order update error:", updateError)
      return { error: "Failed to update order status: " + updateError.message }
    }

    console.log("[v0] Order cancelled successfully:", orderId)

    revalidatePath("/admin-panel-2024")
    revalidatePath("/admin-panel-2024/orders")

    return { success: true }
  } catch (error: any) {
    console.error("[v0] Cancel order error:", error)
    return { error: error.message || "Failed to cancel order" }
  }
}
