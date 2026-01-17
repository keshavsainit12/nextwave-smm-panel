import { NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { SMMApiClient } from "@/lib/smm-api-client"

export async function GET(request: Request) {
  try {
    const authHeader = request.headers.get("authorization")
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const supabase = await createAdminClient()

    // Get all orders that are in processing or pending status and have external_order_id
    const { data: orders } = await supabase
      .from("orders")
      .select(
        `
        id,
        external_order_id,
        status,
        services(
          provider:api_providers(*)
        )
      `,
      )
      .in("status", ["pending", "processing"])
      .not("external_order_id", "is", null)
      .limit(100)

    if (!orders || orders.length === 0) {
      return NextResponse.json({ message: "No orders to sync", synced: 0 })
    }

    let syncedCount = 0
    let errorCount = 0

    // Process each order
    for (const order of orders) {
      try {
        if (!order.services?.provider || !order.external_order_id) continue

        const provider = order.services.provider
        const apiClient = new SMMApiClient(provider.api_url, provider.api_key)

        // Get status from external API
        const status = await apiClient.getOrderStatus(Number.parseInt(order.external_order_id))

        // Map API status to our status
        let newStatus = order.status
        if (status.status === "Completed") newStatus = "completed"
        else if (status.status === "Partial") newStatus = "partial"
        else if (status.status === "In progress" || status.status === "Processing") newStatus = "processing"
        else if (status.status === "Canceled") newStatus = "canceled"

        // Update order if status changed
        if (newStatus !== order.status) {
          await supabase
            .from("orders")
            .update({
              status: newStatus,
              start_count: Number.parseInt(status.start_count) || 0,
              remains: Number.parseInt(status.remains) || 0,
              updated_at: new Date().toISOString(),
            })
            .eq("id", order.id)

          syncedCount++
          console.log(`[CRON] Order ${order.id} updated: ${order.status} → ${newStatus}`)
        }
      } catch (error) {
        errorCount++
        console.error(`[CRON] Failed to sync order ${order.id}:`, error)
      }
    }

    return NextResponse.json({
      message: "Order sync completed",
      totalProcessed: orders.length,
      synced: syncedCount,
      errors: errorCount,
    })
  } catch (error) {
    console.error("[CRON] Order sync failed:", error)
    return NextResponse.json({ error: "Sync failed" }, { status: 500 })
  }
}
