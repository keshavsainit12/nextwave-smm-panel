"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { formatDistance } from "date-fns"
import { DollarSign, TrendingUp, ShoppingCart, Zap } from "lucide-react"
import { useCurrency } from "@/lib/currency-context"

interface TransactionHistoryDisplayProps {
  totalRevenue: number
  totalProfit: number
  totalInstantPaymentAmount: number
  totalCryptoDepositAmount: number
  orders: any[]
  cryptoDeposits: any[]
  instantPayments: any[]
}

export function TransactionHistoryDisplay({
  totalRevenue,
  totalProfit,
  totalInstantPaymentAmount,
  totalCryptoDepositAmount,
  orders,
  cryptoDeposits,
  instantPayments,
}: TransactionHistoryDisplayProps) {
  const { displayAmount } = useCurrency()

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
            <div className="text-2xl font-bold">{displayAmount(totalRevenue)}</div>
            <p className="text-xs text-muted-foreground">Orders + All Deposits</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Profit</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{displayAmount(totalProfit)}</div>
            <p className="text-xs text-muted-foreground">After service costs</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Instant Payments</CardTitle>
            <Zap className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{displayAmount(totalInstantPaymentAmount)}</div>
            <p className="text-xs text-muted-foreground">{instantPayments.length} completed</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Crypto Deposits</CardTitle>
            <ShoppingCart className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{displayAmount(totalCryptoDepositAmount)}</div>
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
                        <TableCell className="font-semibold text-green-600">{displayAmount(revenue)}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">{displayAmount(cost)}</TableCell>
                        <TableCell className={`font-semibold ${profit >= 0 ? "text-green-600" : "text-red-600"}`}>
                          {displayAmount(profit)}
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
                  cryptoDeposits.map((deposit: any) => (
                    <TableRow key={`crypto-${deposit.id}`}>
                      <TableCell className="font-medium">{deposit.users?.full_name || deposit.users?.email}</TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          Crypto - {deposit.crypto_currency_id?.symbol}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-semibold text-green-600">
                        {displayAmount(Number(deposit.amount || 0))}
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
                  instantPayments.map((payment: any) => (
                    <TableRow key={`instant-${payment.id}`}>
                      <TableCell className="font-medium">{payment.users?.full_name || payment.users?.email}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="bg-yellow-50">
                          Instant Payment (XAF)
                        </Badge>
                      </TableCell>
                      <TableCell className="font-semibold text-green-600">
                        {displayAmount(Number(payment.amount || 0))}
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
