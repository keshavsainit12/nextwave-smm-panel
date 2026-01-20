import { createAdminClient } from "@/lib/supabase/admin"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { formatDistance } from "date-fns"
import { DollarSign, TrendingUp, ShoppingCart, Zap } from "lucide-react"

export default async function AdminTransactionHistoryPage() {
  const supabase = createAdminClient()

  // Fetch all orders with details
  const { data: orders } = await supabase
    .from("orders")
    .select("*, services(name, category), users(email, full_name, balance)")
    .order("created_at", { ascending: false })
    .limit(100)

  // Fetch all crypto deposits
  const { data: cryptoDeposits } = await supabase
    .from("crypto_deposits")
    .select("*, crypto_currency_id(symbol, name), users(email, full_name)")
    .order("created_at", { ascending: false })
    .limit(100)

  // Fetch all instant payment transactions
  const { data: instantPayments } = await supabase
    .from("transactions")
    .select("*, users(email, full_name)")
    .eq("type", "deposit")
    .eq("payment_method", "instant_xaf")
    .order("created_at", { ascending: false })
    .limit(100)

  // Calculate summary stats
  const completedOrders = orders?.filter((o) => o.status === "completed") || []
  const totalOrderRevenue = completedOrders.reduce((sum, o) => sum + Number(o.total_price || 0), 0)
  const totalOrderCost = completedOrders.reduce((sum, o) => sum + Number(o.base_price || 0), 0)
  const totalOrderProfit = totalOrderRevenue - totalOrderCost

  const approvedCryptoDeposits = cryptoDeposits?.filter((d) => d.status === "approved") || []
  const totalCryptoDepositAmount = approvedCryptoDeposits.reduce((sum, d) => sum + Number(d.amount || 0), 0)

  const completedInstantPayments = instantPayments?.filter((t) => t.status === "completed") || []
  const totalInstantPaymentAmount = completedInstantPayments.reduce((sum, t) => sum + Number(t.amount || 0), 0)

  const totalDepositAmount = totalCryptoDepositAmount + totalInstantPaymentAmount
  const totalRevenue = totalOrderRevenue + totalDepositAmount
  const totalProfit = totalOrderProfit

  // Fetch all deposits
  const { data: deposits } = await supabase
    .from("deposits")
    .select("*, crypto_currency_id(symbol, name), users(email, full_name)")
    .order("created_at", { ascending: false })
    .limit(100)

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
            <p className="text-xs text-muted-foreground">{approvedCryptoDeposits.length} approved</p>
          </CardContent>
        </Card>
      </div>

      {/* Orders Table */}
      <Card>
        <CardHeader>
          <CardTitle>Order Transactions</CardTitle>
          <CardDescription>All user service orders with revenue and profit breakdown</CardDescription>
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
                    const revenue = Number(order.total_price || 0)
                    const cost = Number(order.base_price || 0)
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
                                : order.status === "cancelled"
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

      {/* Deposits Table - Combined Crypto + Instant Payments */}
      <Card>
        <CardHeader>
          <CardTitle>All Deposit Transactions</CardTitle>
          <CardDescription>Cryptocurrency deposits and instant payment transactions combined</CardDescription>
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
                          Crypto - {deposit.crypto_currency_id?.symbol}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-semibold text-green-600">
                        ${Number(deposit.amount || 0).toFixed(2)}
                      </TableCell>
                      <TableCell className="text-sm">{deposit.crypto_amount} {deposit.crypto_currency_id?.symbol}</TableCell>
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
