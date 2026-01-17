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

    // Get order details for refund
    const { data: order } = await supabase.from("orders").select("user_id, total_price").eq("id", orderId).single()

    if (!order) {
      return { error: "Order not found" }
    }

    // Refund user balance
    await supabase.rpc("increment_balance", {
      user_id: order.user_id,
      amount: order.total_price,
    })

    // Update order status
    await supabase
      .from("orders")
      .update({
        status: "cancelled",
        admin_notes: reason,
        updated_at: new Date().toISOString(),
      })
      .eq("id", orderId)

    revalidatePath("/admin-panel-2024")
    revalidatePath("/admin-panel-2024/orders")

    return { success: true }
  } catch (error: any) {
    console.error("[v0] Cancel order error:", error)
    return { error: error.message || "Failed to cancel order" }
  }
}
