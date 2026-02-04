import { createAdminClient } from "@/lib/supabase/admin"
import { Card, CardContent } from "@/components/ui/card"
import { TransactionHistoryDisplay } from "@/components/admin/transaction-history-display"

export default async function AdminTransactionHistoryPage() {
  let orders = null
  let cryptoDeposits = null
  let instantPayments = null
  let totalRevenue = 0
  let totalProfit = 0
  let totalOrderRevenue = 0
  let totalOrderCost = 0
  let totalCryptoDepositAmount = 0
  let totalInstantPaymentAmount = 0
  let totalDepositAmount = 0
  let completedInstantPayments: any[] = []
  let approvedCryptoDeposits: any[] = []

  try {
    const supabase = createAdminClient()

    console.log("[v0] Fetching admin transaction history...")

    // Fetch all orders - ONLY COMPLETED ONES
    const { data: ordersData, error: ordersError } = await supabase
      .from("orders")
      .select("*, services(name, category, provider_price), users(email, full_name, balance)")
      .eq("status", "completed")
      .order("created_at", { ascending: false })
      .limit(100)

    if (ordersError) {
      console.error("[v0] Orders fetch error:", ordersError)
    } else {
      console.log("[v0] Orders fetched:", ordersData?.length || 0)
      orders = ordersData
    }

    // Fetch all crypto deposits - ONLY APPROVED ONES
    const { data: cryptoDepositsData, error: cryptoError } = await supabase
      .from("crypto_deposits")
      .select("*, crypto_currency_id(symbol, name), users(email, full_name)")
      .eq("status", "approved")
      .order("created_at", { ascending: false })
      .limit(100)

    if (cryptoError) {
      console.error("[v0] Crypto deposits fetch error:", cryptoError)
    } else {
      console.log("[v0] Crypto deposits fetched:", cryptoDepositsData?.length || 0)
      cryptoDeposits = cryptoDepositsData
    }

    // Fetch all instant payment transactions - ONLY COMPLETED ONES
    const { data: instantPaymentsData, error: instantError } = await supabase
      .from("transactions")
      .select("*, users(email, full_name)")
      .eq("type", "deposit")
      .eq("payment_method", "instant_xaf")
      .eq("status", "completed")
      .order("created_at", { ascending: false })
      .limit(100)

    if (instantError) {
      console.error("[v0] Instant payments fetch error:", instantError)
    } else {
      console.log("[v0] Instant payments fetched:", instantPaymentsData?.length || 0)
      instantPayments = instantPaymentsData
    }

    // Calculate summary stats - ALL FROM COMPLETED/APPROVED ONLY
    totalOrderRevenue = orders?.reduce((sum, o) => {
      return sum + Number(o.price || 0)
    }, 0) || 0

    totalOrderCost = orders?.reduce((sum, o) => {
      const providerPrice = Number(o.services?.provider_price || 0)
      const quantity = Number(o.quantity || 0)
      return sum + ((quantity / 1000) * providerPrice)
    }, 0) || 0

    totalProfit = totalOrderRevenue - totalOrderCost

    totalCryptoDepositAmount = cryptoDeposits?.reduce((sum, d) => sum + Number(d.amount || 0), 0) || 0

    totalInstantPaymentAmount = instantPayments?.reduce((sum, t) => sum + Number(t.amount || 0), 0) || 0

    totalDepositAmount = totalCryptoDepositAmount + totalInstantPaymentAmount
    totalRevenue = totalOrderRevenue + totalDepositAmount

    completedInstantPayments = instantPayments || []
    approvedCryptoDeposits = cryptoDeposits || []

    console.log("[v0] Transaction history summary:", {
      orders: orders?.length || 0,
      crypto: cryptoDeposits?.length || 0,
      instant: instantPayments?.length || 0,
      totalRevenue: totalRevenue.toFixed(2),
    })
  } catch (error) {
    console.error("[v0] Error fetching transaction history:", error)

    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Transaction History</h1>
          <p className="text-muted-foreground">Error loading transaction data</p>
        </div>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-8 text-red-600">
              <p>Failed to load transaction history. Please refresh the page.</p>
              <p className="text-sm text-muted-foreground mt-2">{error instanceof Error ? error.message : "Unknown error"}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <TransactionHistoryDisplay
      totalRevenue={totalRevenue}
      totalProfit={totalProfit}
      totalInstantPaymentAmount={totalInstantPaymentAmount}
      totalCryptoDepositAmount={totalCryptoDepositAmount}
      orders={orders || []}
      cryptoDeposits={cryptoDeposits || []}
      instantPayments={instantPayments || []}
    />
  )
}
