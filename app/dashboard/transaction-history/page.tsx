import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { CheckCircle, XCircle, Clock, ArrowUpRight, Info } from "lucide-react"
import { formatDistance } from "date-fns"

export default async function TransactionHistoryPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Early return if no user - prevents build-time errors
  if (!user) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold tracking-tight">Transaction History</h1>
        <Alert variant="destructive">
          <AlertTitle>Not Logged In</AlertTitle>
          <AlertDescription>Please log in to view your transaction history</AlertDescription>
        </Alert>
      </div>
    )
  }

  // Only fetch data if user exists - prevents build-time errors
  let cryptoDeposits = null
  let cryptoCurrencyMap = null

  try {
    // Fetch crypto deposits
    const { data: cryptoDepositsData, error: cryptoError } = await supabase
      .from("crypto_deposits")
      .select("id, user_id, crypto_currency_id, amount, crypto_amount, transaction_hash, screenshot_url, status, admin_notes, created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })

    if (cryptoError) {
      console.error("[v0] Crypto deposits fetch error:", cryptoError)
    } else {
      cryptoDeposits = cryptoDepositsData
    }

    // Fetch related crypto currencies
    const cryptoCurrencyIds = cryptoDeposits?.map((d: any) => d.crypto_currency_id).filter(Boolean) || []
    if (cryptoCurrencyIds.length > 0) {
      const { data: cryptoCurrencyData, error: currencyError } = await supabase
        .from("crypto_currencies")
        .select("id, symbol, name")
        .in("id", cryptoCurrencyIds)

      if (currencyError) {
        console.error("[v0] Crypto currencies fetch error:", currencyError)
      } else {
        cryptoCurrencyMap = cryptoCurrencyData
      }
    }
  } catch (error) {
    console.error("[v0] Error fetching crypto data:", error)
  }

  // Map crypto currencies by ID
  const cryptoCurrencyByIdMap = (cryptoCurrencyMap || []).reduce((map: any, curr: any) => {
    map[curr.id] = curr
    return map
  }, {})

  // Fetch instant payment transactions (deposits)
  let instantPayments = null
  try {
    const { data: instantPaymentsData, error: instantError } = await supabase
      .from("transactions")
      .select("*")
      .eq("user_id", user.id)
      .eq("type", "deposit")
      .eq("payment_method", "instant_xaf")
      .order("created_at", { ascending: false })

    if (instantError) {
      console.error("[v0] Instant payments fetch error:", instantError)
    } else {
      instantPayments = instantPaymentsData
    }
  } catch (error) {
    console.error("[v0] Error fetching instant payments:", error)
  }

  // Fetch order transactions (debits/charges)
  let orderTransactions = null
  try {
    const { data: orderTransactionsData, error: orderError } = await supabase
      .from("transactions")
      .select("*, orders(id, service_id, services(name), quantity, price, status)")
      .eq("user_id", user.id)
      .eq("type", "order")
      .order("created_at", { ascending: false })

    if (orderError) {
      console.error("[v0] Order transactions fetch error:", orderError)
    } else {
      orderTransactions = orderTransactionsData
    }
  } catch (error) {
    console.error("[v0] Error fetching order transactions:", error)
  }

  // Fetch refund transactions
  const { data: refundTransactions, error: refundError } = await supabase
    .from("transactions")
    .select("*, orders(id)")
    .eq("user_id", user.id)
    .eq("type", "refund")
    .order("created_at", { ascending: false })

  if (refundError) {
    console.error("[v0] Refund transactions fetch error:", refundError)
  }

  // Combine all transaction types
  const allTransactions = [
    ...(cryptoDeposits || []).map((d) => ({
      ...d,
      transaction_type: "crypto_deposit",
      id: d.id,
      created_at: d.created_at,
      status: d.status,
      amount: Number(d.amount),
      crypto_currencies: cryptoCurrencyByIdMap[d.crypto_currency_id],
    })),
    ...(instantPayments || []).map((t) => ({
      ...t,
      transaction_type: "instant_payment",
      id: t.id,
      created_at: t.created_at,
      status: t.status,
      amount: Number(t.amount),
    })),
    ...(orderTransactions || []).map((t) => ({
      ...t,
      transaction_type: "order_debit",
      id: t.id,
      created_at: t.created_at,
      status: t.status,
      amount: Number(t.amount), // This will be negative
    })),
    ...(refundTransactions || []).map((t) => ({
      ...t,
      transaction_type: "refund",
      id: t.id,
      created_at: t.created_at,
      status: t.status,
      amount: Number(t.amount),
    })),
  ].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())

  // Calculate stats
  const totalTransactions = allTransactions.length
  const depositTransactions = allTransactions.filter((t) => t.transaction_type.includes("deposit") || t.transaction_type.includes("payment")) || []
  const totalDeposited = depositTransactions.reduce((sum, t) => sum + (t.amount > 0 ? t.amount : 0), 0)
  const orderTransactionsUsed = allTransactions.filter((t) => t.transaction_type === "order_debit") || []
  const totalSpent = orderTransactionsUsed.reduce((sum, t) => sum + Math.abs(t.amount), 0)
  const pendingTransactions = allTransactions.filter((t) => t.status === "pending") || []
  const rejectedTransactions = allTransactions.filter((t) => t.status === "rejected" || t.status === "failed") || []
  const approvedTransactions = allTransactions.filter((t) => t.status === "approved" || t.status === "completed") || []
  const totalApproved = approvedTransactions.reduce((sum, t) => sum + (t.amount > 0 ? t.amount : 0), 0)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Transaction History</h1>
        <p className="text-muted-foreground">View all your deposit transactions and their status</p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Transactions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalTransactions}</div>
            <p className="text-xs text-muted-foreground mt-1">All activity</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Deposited</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">+${totalDeposited.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground mt-1">{depositTransactions.length} deposits</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Spent</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">-${totalSpent.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground mt-1">{orderTransactionsUsed.length} orders</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Balance Change</CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${totalDeposited - totalSpent >= 0 ? "text-green-600" : "text-red-600"}`}>
              {totalDeposited - totalSpent >= 0 ? "+" : ""} ${(totalDeposited - totalSpent).toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Net change</p>
          </CardContent>
        </Card>
      </div>

      {/* Info Alert */}
      <Alert>
        <Info className="h-4 w-4" />
        <AlertTitle>Transaction ID Tracking</AlertTitle>
        <AlertDescription>
          Each deposit has a unique transaction ID. Use this ID to track your payment status and communicate with support if needed.
        </AlertDescription>
      </Alert>

      {/* Transaction Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Transactions</CardTitle>
          <CardDescription>Complete list of all your activity including deposits, orders, and refunds</CardDescription>
        </CardHeader>
        <CardContent>
          {allTransactions && allTransactions.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Details</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {allTransactions.map((transaction) => (
                    <TableRow key={`${transaction.transaction_type}-${transaction.id}`} className="hover:bg-muted/50">
                      <TableCell className="text-sm whitespace-nowrap">
                        {formatDistance(new Date(transaction.created_at), new Date(), { addSuffix: true })}
                      </TableCell>
                      <TableCell>
                        {transaction.transaction_type === "crypto_deposit" && (
                          <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100">
                            Crypto Deposit
                          </Badge>
                        )}
                        {transaction.transaction_type === "instant_payment" && (
                          <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100">
                            Instant Payment
                          </Badge>
                        )}
                        {transaction.transaction_type === "order_debit" && (
                          <Badge className="bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-100">
                            Order Purchase
                          </Badge>
                        )}
                        {transaction.transaction_type === "refund" && (
                          <Badge className="bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-100">
                            Refund
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-sm">
                        {transaction.transaction_type === "crypto_deposit" && (
                          <div className="text-xs">
                            <div className="font-semibold">{transaction.crypto_currencies?.symbol}</div>
                            <div className="text-muted-foreground">{transaction.crypto_currencies?.name}</div>
                          </div>
                        )}
                        {transaction.transaction_type === "instant_payment" && (
                          <div className="text-xs">
                            <div className="font-semibold">XAF Instant</div>
                            <div className="text-muted-foreground">AccountPe</div>
                          </div>
                        )}
                        {transaction.transaction_type === "order_debit" && (
                          <div className="text-xs">
                            <div className="font-semibold">{transaction.orders?.services?.name}</div>
                            <div className="text-muted-foreground">{transaction.orders?.quantity?.toLocaleString()} units</div>
                            <div className="text-muted-foreground font-mono mt-1">Order ID: {transaction.orders?.id}</div>
                          </div>
                        )}
                        {transaction.transaction_type === "refund" && (
                          <div className="text-xs">
                            <div className="font-semibold">Order Refund</div>
                            <div className="text-muted-foreground font-mono">Order ID: {transaction.orders?.id}</div>
                          </div>
                        )}
                      </TableCell>
                      <TableCell className="font-mono font-semibold">
                        {transaction.transaction_type === "order_debit" ? (
                          <span className="text-red-600">-${Math.abs(transaction.amount).toFixed(2)}</span>
                        ) : (
                          <span className="text-green-600">+${transaction.amount.toFixed(2)}</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {(transaction.status === "approved" || transaction.status === "completed") && (
                            <>
                              <CheckCircle className="h-4 w-4 text-green-600" />
                              <Badge variant="default" className="text-xs">Completed</Badge>
                            </>
                          )}
                          {(transaction.status === "rejected" || transaction.status === "failed") && (
                            <>
                              <XCircle className="h-4 w-4 text-red-600" />
                              <Badge variant="destructive" className="text-xs">Failed</Badge>
                            </>
                          )}
                          {transaction.status === "pending" && (
                            <>
                              <Clock className="h-4 w-4 text-yellow-600" />
                              <Badge variant="secondary" className="text-xs">Pending</Badge>
                            </>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-12">
              <ArrowUpRight className="h-12 w-12 mx-auto text-muted-foreground opacity-50 mb-4" />
              <p className="text-lg font-medium text-muted-foreground">No transactions yet</p>
              <p className="text-sm text-muted-foreground">Start by making your first deposit or order</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
