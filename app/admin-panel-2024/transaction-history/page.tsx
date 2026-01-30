import { createAdminClient } from "@/lib/supabase/admin"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { formatDistance } from "date-fns"
import { DollarSign, TrendingUp, ShoppingCart, Zap } from "lucide-react"

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
      <div className="space-y-3 sm:space-y-4 md:space-y-6">
        <div className="bg-white dark:bg-slate-900 rounded-lg sm:rounded-xl p-3 sm:p-4 md:p-6 shadow-sm border border-gray-200 dark:border-gray-800">
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold tracking-tight bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Transaction History</h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">Error loading transaction data</p>
        </div>
        <Card className="bg-white dark:bg-slate-900 border-gray-200 dark:border-gray-800">
          <CardContent className="p-3 sm:p-4 md:p-6">
            <div className="text-center py-8 text-red-600">
              <p className="text-sm sm:text-base">Failed to load transaction history. Please refresh the page.</p>
              <p className="text-xs sm:text-sm text-muted-foreground mt-2">{error instanceof Error ? error.message : "Unknown error"}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-3 sm:space-y-4 md:space-y-6">
      <div className="bg-white dark:bg-slate-900 rounded-lg sm:rounded-xl p-3 sm:p-4 md:p-6 shadow-sm border border-gray-200 dark:border-gray-800">
        <h1 className="text-xl sm:text-2xl md:text-3xl font-bold tracking-tight bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Transaction History</h1>
        <p className="text-xs sm:text-sm text-muted-foreground mt-1">Complete record of all orders and deposits (Crypto + Instant Payments)</p>
      </div>

      {/* Summary Stats */}
      <div className="grid gap-3 sm:gap-4 grid-cols-2 lg:grid-cols-4">
        <Card className="bg-white dark:bg-slate-900 border-gray-200 dark:border-gray-800">
          <CardHeader className="flex flex-row items-center justify-between pb-2 p-3 sm:p-4">
            <CardTitle className="text-xs sm:text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-3 w-3 sm:h-4 sm:w-4 text-blue-600" />
          </CardHeader>
          <CardContent className="p-3 sm:p-4 pt-0">
            <div className="text-lg sm:text-2xl font-bold">${totalRevenue.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">Orders + All Deposits</p>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-slate-900 border-gray-200 dark:border-gray-800">
          <CardHeader className="flex flex-row items-center justify-between pb-2 p-3 sm:p-4">
            <CardTitle className="text-xs sm:text-sm font-medium">Total Profit</CardTitle>
            <TrendingUp className="h-3 w-3 sm:h-4 sm:w-4 text-green-600" />
          </CardHeader>
          <CardContent className="p-3 sm:p-4 pt-0">
            <div className="text-lg sm:text-2xl font-bold text-green-600">${totalProfit.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">After service costs</p>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-slate-900 border-gray-200 dark:border-gray-800">
          <CardHeader className="flex flex-row items-center justify-between pb-2 p-3 sm:p-4">
            <CardTitle className="text-xs sm:text-sm font-medium">Instant Payments</CardTitle>
            <Zap className="h-3 w-3 sm:h-4 sm:w-4 text-yellow-600" />
          </CardHeader>
          <CardContent className="p-3 sm:p-4 pt-0">
            <div className="text-lg sm:text-2xl font-bold">${totalInstantPaymentAmount.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">{completedInstantPayments.length} completed</p>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-slate-900 border-gray-200 dark:border-gray-800">
          <CardHeader className="flex flex-row items-center justify-between pb-2 p-3 sm:p-4">
            <CardTitle className="text-xs sm:text-sm font-medium">Crypto Deposits</CardTitle>
            <ShoppingCart className="h-3 w-3 sm:h-4 sm:w-4 text-purple-600" />
          </CardHeader>
          <CardContent className="p-3 sm:p-4 pt-0">
            <div className="text-lg sm:text-2xl font-bold">${totalCryptoDepositAmount.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">{cryptoDeposits?.length || 0} approved</p>
          </CardContent>
        </Card>
      </div>

      {/* Orders Table - ONLY COMPLETED */}
      <Card className="bg-white dark:bg-slate-900 border-gray-200 dark:border-gray-800">
        <CardHeader className="p-3 sm:p-4 md:p-6">
          <CardTitle className="text-lg sm:text-xl">Completed Order Transactions</CardTitle>
          <CardDescription className="text-xs sm:text-sm">All completed user service orders with revenue and profit breakdown</CardDescription>
        </CardHeader>
        <CardContent className="p-3 sm:p-4 md:p-6">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="min-w-[150px]">Service</TableHead>
                  <TableHead className="min-w-[120px]">User</TableHead>
                  <TableHead className="min-w-[80px]">Revenue</TableHead>
                  <TableHead className="min-w-[80px]">Cost</TableHead>
                  <TableHead className="min-w-[80px]">Profit</TableHead>
                  <TableHead className="min-w-[80px]">Status</TableHead>
                  <TableHead className="min-w-[100px]">Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orders && orders.length > 0 ? (
                  orders.map((order) => {
                    const revenue = Number(order.price || 0)
                    const providerPrice = Number(order.services?.provider_price || 0)
                    const quantity = Number(order.quantity || 0)
                    const cost = (quantity / 1000) * providerPrice
                    const profit = revenue - cost

                    return (
                      <TableRow key={order.id}>
                        <TableCell className="font-medium text-xs sm:text-sm">{order.services?.name || "Unknown"}</TableCell>
                        <TableCell className="text-xs sm:text-sm">{order.users?.full_name || order.users?.email}</TableCell>
                        <TableCell className="font-semibold text-green-600 text-xs sm:text-sm">${revenue.toFixed(2)}</TableCell>
                        <TableCell className="text-xs sm:text-sm text-muted-foreground">${cost.toFixed(2)}</TableCell>
                        <TableCell className={`font-semibold text-xs sm:text-sm ${profit >= 0 ? "text-green-600" : "text-red-600"}`}>
                          ${profit.toFixed(2)}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              order.status === "completed"
                                ? "default"
                                : order.status === "cancelled"
                                  ? "destructive"
                                  : "secondary"
                            }
                            className="capitalize text-xs"
                          >
                            {order.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-xs sm:text-sm text-muted-foreground">
                          {formatDistance(new Date(order.created_at), new Date(), { addSuffix: true })}
                        </TableCell>
                      </TableRow>
                    )
                  })
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground text-xs sm:text-sm">
                      No orders found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Deposits Table - Combined Crypto + Instant Payments - ONLY APPROVED/COMPLETED */}
      <Card className="bg-white dark:bg-slate-900 border-gray-200 dark:border-gray-800">
        <CardHeader className="p-3 sm:p-4 md:p-6">
          <CardTitle className="text-lg sm:text-xl">Approved Deposit Transactions</CardTitle>
          <CardDescription className="text-xs sm:text-sm">All approved cryptocurrency and completed instant payment deposits</CardDescription>
        </CardHeader>
        <CardContent className="p-3 sm:p-4 md:p-6">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="min-w-[120px]">User</TableHead>
                  <TableHead className="min-w-[150px]">Payment Method</TableHead>
                  <TableHead className="min-w-[100px]">Amount (USD)</TableHead>
                  <TableHead className="min-w-[100px]">Details</TableHead>
                  <TableHead className="min-w-[80px]">Status</TableHead>
                  <TableHead className="min-w-[100px]">Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {cryptoDeposits && cryptoDeposits.length > 0 ? (
                  cryptoDeposits.map((deposit) => (
                    <TableRow key={`crypto-${deposit.id}`}>
                      <TableCell className="font-medium text-xs sm:text-sm">{deposit.users?.full_name || deposit.users?.email}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-xs">
                          Crypto - {deposit.crypto_currency_id?.symbol}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-semibold text-green-600 text-xs sm:text-sm">
                        ${Number(deposit.amount || 0).toFixed(2)}
                      </TableCell>
                      <TableCell className="text-xs sm:text-sm">{deposit.crypto_amount} {deposit.crypto_currency_id?.symbol}</TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            deposit.status === "approved"
                              ? "default"
                              : deposit.status === "rejected"
                                ? "destructive"
                                : "secondary"
                          }
                          className="capitalize text-xs"
                        >
                          {deposit.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-xs sm:text-sm text-muted-foreground">
                        {formatDistance(new Date(deposit.created_at), new Date(), { addSuffix: true })}
                      </TableCell>
                    </TableRow>
                  ))
                ) : null}
                {instantPayments && instantPayments.length > 0 ? (
                  instantPayments.map((payment) => (
                    <TableRow key={`instant-${payment.id}`}>
                      <TableCell className="font-medium text-xs sm:text-sm">{payment.users?.full_name || payment.users?.email}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="bg-yellow-50 text-xs">
                          Instant Payment (XAF)
                        </Badge>
                      </TableCell>
                      <TableCell className="font-semibold text-green-600 text-xs sm:text-sm">
                        ${Number(payment.amount || 0).toFixed(2)}
                      </TableCell>
                      <TableCell className="text-xs sm:text-sm">{payment.notes}</TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            payment.status === "completed"
                              ? "default"
                              : payment.status === "failed"
                                ? "destructive"
                                : "secondary"
                          }
                          className="capitalize text-xs"
                        >
                          {payment.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-xs sm:text-sm text-muted-foreground">
                        {formatDistance(new Date(payment.created_at), new Date(), { addSuffix: true })}
                      </TableCell>
                    </TableRow>
                  ))
                ) : null}
                {(!cryptoDeposits || cryptoDeposits.length === 0) && (!instantPayments || instantPayments.length === 0) ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground text-xs sm:text-sm">
                      No deposits found
                    </TableCell>
                  </TableRow>
                ) : null}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
