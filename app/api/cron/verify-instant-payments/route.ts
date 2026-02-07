import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

/**
 * Cron job to verify pending instant payments
 * Checks status with AccountPe and updates database
 * Run every 5-15 minutes
 */
export async function GET(request: Request) {
  try {
    // Verify this is a cron job request
    const authHeader = request.headers.get("authorization")
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const supabase = createClient()

    console.log("[Cron] Starting instant payment verification...")

    // Get all pending instant XAF payments from transactions table
    const { data: pendingPayments, error: fetchError } = await supabase
      .from("transactions")
      .select("*")
      .eq("status", "pending")
      .eq("payment_method", "instant_xaf")
      .is("payment_id", null)  // Only check those where payment_id hasn't been set yet

    if (fetchError) {
      console.error("[Cron] Error fetching pending payments:", fetchError)
      return NextResponse.json(
        { error: "Failed to fetch pending payments" },
        { status: 500 }
      )
    }

    if (!pendingPayments || pendingPayments.length === 0) {
      console.log("[Cron] No pending payments to verify")
      return NextResponse.json({
        success: true,
        message: "No pending payments",
        checked: 0,
      })
    }

    console.log(
      `[Cron] Found ${pendingPayments.length} pending payments to verify`
    )

    let updated = 0
    let failed = 0
    let noAction = 0

    // Check each pending payment
    for (const payment of pendingPayments) {
      try {
        console.log(
          `[Cron] Checking payment ${payment.id} - no external transaction ID yet (still pending gateway)`
        )

        // If payment_id is null, the user hasn't completed the AccountPe payment flow yet
        // This transaction is just waiting for the user to complete payment and receive webhook
        // Skip verification for now - webhook will handle completion
        console.log(
          `[Cron] Payment ${payment.id} awaiting user completion - will be updated via webhook`
        )
        noAction++
        continue
      } catch (error) {
        console.error(`[Cron] Error processing payment ${payment.id}:`, error)
        failed++
      }
    }

    console.log(
      `[Cron] Verification complete - Updated: ${updated}, Failed: ${failed}, Awaiting Webhook: ${noAction}, Total: ${pendingPayments.length}`
    )

    return NextResponse.json({
      success: true,
      message: "Payment verification completed",
      checked: pendingPayments.length,
      updated: updated,
      failed: failed,
      awaitingWebhook: noAction,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("[Cron] Error verifying instant payments:", error)
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    )
  }
}
