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

    // Get AccountPe token from system_settings
    const { data: settings, error: settingsError } = await supabase
      .from("system_settings")
      .select("accountpe_token")
      .eq("id", 1)
      .single()

    if (settingsError || !settings?.accountpe_token) {
      console.error("[Cron] AccountPe token not found in settings")
      return NextResponse.json(
        { error: "AccountPe token not configured" },
        { status: 500 }
      )
    }

    const token = settings.accountpe_token

    // Get all pending instant payments (status = pending)
    const { data: pendingPayments, error: fetchError } = await supabase
      .from("instant_payments")
      .select("*")
      .eq("status", "pending")
      .eq("payment_method", "instant_xaf")
      .not("external_transaction_id", "is", null)

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

    // Check each pending payment
    for (const payment of pendingPayments) {
      try {
        console.log(
          `[Cron] Checking payment ${payment.id} (${payment.external_transaction_id})`
        )

        // Call AccountPe status API
        const response = await fetch(
          "https://api.accountpe.com/api/payin/payment_link_status",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              transaction_id: payment.external_transaction_id,
            }),
          }
        )

        if (!response.ok) {
          console.error(
            `[Cron] AccountPe API error for ${payment.id}:`,
            response.status
          )
          failed++
          continue
        }

        const data = await response.json()
        const apiStatus = data?.data?.data?.attributes?.status

        console.log(
          `[Cron] Payment ${payment.id} status from API:`,
          apiStatus
        )

        // Update based on status
        // 1 = success, 2 = failed, 5/6 = other failure states
        if (apiStatus === 1) {
          // Payment successful - credit user balance
          const { data: userData, error: userError } = await supabase
            .from("users")
            .select("balance, total_recharge")
            .eq("id", payment.user_id)
            .single()

          if (userError || !userData) {
            console.error(`[Cron] User not found for payment ${payment.id}`)
            failed++
            continue
          }

          const newBalance = Number(userData.balance) + Number(payment.amount)
          const newTotalRecharge =
            Number(userData.total_recharge) + Number(payment.amount)

          // Update user balance
          const { error: balanceError } = await supabase
            .from("users")
            .update({
              balance: newBalance,
              total_recharge: newTotalRecharge,
            })
            .eq("id", payment.user_id)

          if (balanceError) {
            console.error(
              `[Cron] Failed to update balance for payment ${payment.id}:`,
              balanceError
            )
            failed++
            continue
          }

          // Update payment status
          const { error: paymentError } = await supabase
            .from("instant_payments")
            .update({
              status: "completed",
              completed_at: new Date().toISOString(),
            })
            .eq("id", payment.id)

          if (paymentError) {
            console.error(
              `[Cron] Failed to update payment ${payment.id}:`,
              paymentError
            )
            failed++
            continue
          }

          console.log(
            `[Cron] Payment ${payment.id} completed successfully - credited ${payment.amount}`
          )
          updated++
        } else if (apiStatus === 2 || apiStatus === 5 || apiStatus === 6) {
          // Payment failed
          const { error: paymentError } = await supabase
            .from("instant_payments")
            .update({
              status: "failed",
              failed_at: new Date().toISOString(),
            })
            .eq("id", payment.id)

          if (paymentError) {
            console.error(
              `[Cron] Failed to update failed payment ${payment.id}:`,
              paymentError
            )
            failed++
            continue
          }

          console.log(`[Cron] Payment ${payment.id} marked as failed`)
          updated++
        }
        // If status is still 4 (pending), leave it for next check
      } catch (error) {
        console.error(`[Cron] Error processing payment ${payment.id}:`, error)
        failed++
      }
    }

    console.log(
      `[Cron] Verification complete - Updated: ${updated}, Failed: ${failed}, Total: ${pendingPayments.length}`
    )

    return NextResponse.json({
      success: true,
      message: "Payment verification completed",
      checked: pendingPayments.length,
      updated: updated,
      failed: failed,
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
