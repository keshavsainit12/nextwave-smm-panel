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
      .select("*, services(name, category_id, provider_price), users(email, full_name, balance)")
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
      .select("*, crypto_currencies(symbol, name), users(email, full_name)")
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
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Transaction History</h1>
        <p className="text-muted-foreground">Complete record of all orders and deposits (Crypto + Instant Payments)</p>
      </div>

      {/* Summary Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalRevenue.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">Orders + All Deposits</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Profit</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">${totalProfit.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">After service costs</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Instant Payments</CardTitle>
            <Zap className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalInstantPaymentAmount.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">{completedInstantPayments.length} completed</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Crypto Deposits</CardTitle>
            <ShoppingCart className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalCryptoDepositAmount.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">{cryptoDeposits?.length || 0} approved</p>
          </CardContent>
        </Card>
      </div>

      {/* Orders Table - ONLY COMPLETED */}
      <Card>
        <CardHeader>
          <CardTitle>Completed Order Transactions</CardTitle>
          <CardDescription>All completed user service orders with revenue and profit breakdown</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Service</TableHead>
                  <TableHead>User</TableHead>
                  <TableHead>Revenue</TableHead>
                  <TableHead>Cost</TableHead>
                  <TableHead>Profit</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
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
                        <TableCell className="font-medium">{order.services?.name || "Unknown"}</TableCell>
                        <TableCell className="text-sm">{order.users?.full_name || order.users?.email}</TableCell>
                        <TableCell className="font-semibold text-green-600">${revenue.toFixed(2)}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">${cost.toFixed(2)}</TableCell>
                        <TableCell className={`font-semibold ${profit >= 0 ? "text-green-600" : "text-red-600"}`}>
                          ${profit.toFixed(2)}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              order.status === "completed"
                                ? "default"
                                : order.status === "canceled"
                                  ? "destructive"
                                  : "secondary"
                            }
                            className="capitalize"
                          >
                            {order.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {formatDistance(new Date(order.created_at), new Date(), { addSuffix: true })}
                        </TableCell>
                      </TableRow>
                    )
                  })
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
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
      <Card>
        <CardHeader>
          <CardTitle>Approved Deposit Transactions</CardTitle>
          <CardDescription>All approved cryptocurrency and completed instant payment deposits</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Payment Method</TableHead>
                  <TableHead>Amount (USD)</TableHead>
                  <TableHead>Details</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {cryptoDeposits && cryptoDeposits.length > 0 ? (
                  cryptoDeposits.map((deposit) => (
                    <TableRow key={`crypto-${deposit.id}`}>
                      <TableCell className="font-medium">{deposit.users?.full_name || deposit.users?.email}</TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          Crypto - {deposit.crypto_currencies?.symbol}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-semibold text-green-600">
                        ${Number(deposit.amount || 0).toFixed(2)}
                      </TableCell>
                      <TableCell className="text-sm">{deposit.crypto_amount} {deposit.crypto_currencies?.symbol}</TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            deposit.status === "approved"
                              ? "default"
                              : deposit.status === "rejected"
                                ? "destructive"
                                : "secondary"
                          }
                          className="capitalize"
                        >
                          {deposit.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {formatDistance(new Date(deposit.created_at), new Date(), { addSuffix: true })}
                      </TableCell>
                    </TableRow>
                  ))
                ) : null}
                {instantPayments && instantPayments.length > 0 ? (
                  instantPayments.map((payment) => (
                    <TableRow key={`instant-${payment.id}`}>
                      <TableCell className="font-medium">{payment.users?.full_name || payment.users?.email}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="bg-yellow-50">
                          Instant Payment (XAF)
                        </Badge>
                      </TableCell>
                      <TableCell className="font-semibold text-green-600">
                        ${Number(payment.amount || 0).toFixed(2)}
                      </TableCell>
                      <TableCell className="text-sm">{payment.notes}</TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            payment.status === "completed"
                              ? "default"
                              : payment.status === "failed"
                                ? "destructive"
                                : "secondary"
                          }
                          className="capitalize"
                        >
                          {payment.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {formatDistance(new Date(payment.created_at), new Date(), { addSuffix: true })}
                      </TableCell>
                    </TableRow>
                  ))
                ) : null}
                {(!cryptoDeposits || cryptoDeposits.length === 0) && (!instantPayments || instantPayments.length === 0) ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
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
