import { NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { SMMApiClient } from "@/lib/smm-api-client"
import { mapProviderStatus, validateOrderStatus } from "@/lib/order-status"

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
        
        // Determine auth mode from provider settings
        const authMode = (provider as any).auth_mode === "bearer" ? "bearer" : "key"

        // Get status from external API
        const status = await apiClient.getOrderStatus(Number.parseInt(order.external_order_id), {
          authMode,
        })

        // Map API status to our status using safe helper
        const providerStatus = status.status
        console.log(`[CRON] Order ${order.id} - Provider status: "${providerStatus}"`)
        
        const newStatus = mapProviderStatus(providerStatus)
        
        if (!newStatus) {
          // Unknown status from provider - keep current status and log warning
          console.warn(`[CRON] Unknown provider status "${providerStatus}" for order ${order.id}, keeping current status: ${order.status}`)
          continue
        }
        
        // Skip update if status unchanged
        if (newStatus === order.status) {
          console.log(`[CRON] Order ${order.id} status unchanged: ${order.status}`)
          continue
        }

        // Validate the new status before updating (extra safety)
        try {
          validateOrderStatus(newStatus)
        } catch (validationError) {
          console.error(`[CRON] Status validation failed for order ${order.id}:`, validationError)
          errorCount++
          continue
        }

        // Update order if status changed
        console.log(`[CRON] Updating order ${order.id}: ${order.status} → ${newStatus}`)
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
      } catch (error: any) {
        errorCount++
        const errorResponse = error.response || {}
        console.error(`[CRON] Failed to sync order ${order.id}:`, {
          order_id: order.id,
          external_order_id: order.external_order_id,
          provider_id: order.services?.provider?.id,
          provider_api_url: order.services?.provider?.api_url,
          error_message: error.message,
          provider_response_status: errorResponse.status,
          provider_response_body: errorResponse.body,
        })
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
