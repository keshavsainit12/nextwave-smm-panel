import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Info, Zap, CheckCircle, XCircle, Clock } from "lucide-react"
import { MobileAddFunds } from "@/components/dashboard/mobile-add-funds"
import { InstantPaymentForm } from "@/components/dashboard/instant-payment-form"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { formatDistance } from "date-fns"
import Link from "next/link"

export default async function DepositPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Add Balance</h1>
          <p className="text-muted-foreground">Please log in to make a deposit</p>
        </div>
      </div>
    )
  }

  const { data: userData, error: userDataError } = await supabase
    .from("users")
    .select("balance, full_name")
    .eq("id", user.id)
    .single()

  if (userDataError) {
    console.error("[v0] User data fetch error:", userDataError)
  }

  const { data: cryptoCurrencies, error: cryptoCurrenciesError } = await supabase
    .from("crypto_currencies")
    .select("*")
    .eq("is_active", true)
    .order("display_order", { ascending: true })

  if (cryptoCurrenciesError) {
    console.error("[v0] Crypto currencies fetch error:", cryptoCurrenciesError)
  }

  // Fetch crypto deposits
  const { data: cryptoDeposits, error: cryptoDepositsError } = await supabase
    .from("crypto_deposits")
    .select("id, user_id, crypto_currency_id, amount, crypto_amount, transaction_hash, screenshot_url, status, admin_notes, created_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })

  if (cryptoDepositsError) {
    console.error("[v0] Crypto deposits fetch error:", cryptoDepositsError)
  }

  // Fetch related crypto currency data
  const cryptoCurrencyIds = cryptoDeposits?.map((d: any) => d.crypto_currency_id).filter(Boolean) || []
  const { data: cryptoCurrencyMap, error: currencyError } = cryptoCurrencyIds.length > 0
    ? await supabase
        .from("crypto_currencies")
        .select("id, symbol, name")
        .in("id", cryptoCurrencyIds)
    : { data: [], error: null }

  if (currencyError) {
    console.error("[v0] Crypto currency map fetch error:", currencyError)
  }

  // Create a map for easy lookup
  const cryptoCurrencyByIdMap = (cryptoCurrencyMap || []).reduce((map: any, curr: any) => {
    map[curr.id] = curr
    return map
  }, {})

  // Fetch instant payment transactions
  const { data: instantPayments, error: instantPaymentsError } = await supabase
    .from("transactions")
    .select("*")
    .eq("user_id", user.id)
    .eq("type", "deposit")
    .eq("payment_method", "instant_xaf")
    .order("created_at", { ascending: false })

  if (instantPaymentsError) {
    console.error("[v0] Instant payments fetch error:", instantPaymentsError)
  }

  // Combine and sort all deposits
  const allDeposits = [
    ...(cryptoDeposits || []).map((d: any) => ({
      ...d,
      deposit_type: "crypto",
      id: d.id,
      created_at: d.created_at,
      status: d.status,
      amount: d.amount,
      crypto_currencies: cryptoCurrencyByIdMap[d.crypto_currency_id],
    })),
    ...(instantPayments || []).map((t: any) => ({
      ...t,
      deposit_type: "instant",
      id: t.id,
      created_at: t.created_at,
      status: t.status,
      amount: t.amount,
    })),
  ].sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Add Balance</h1>
        <p className="text-muted-foreground">Choose your preferred deposit method</p>
      </div>

      <Tabs defaultValue="instant" className="w-full">
        <TabsList className="grid w-full grid-cols-1 sm:grid-cols-3 gap-2 h-auto">
          <TabsTrigger value="instant" className="flex items-center gap-2 py-2">
            <Zap className="h-4 w-4" />
            <span className="hidden sm:inline">Instant Payment</span>
            <span className="sm:hidden text-xs">Instant</span>
          </TabsTrigger>
          <TabsTrigger value="crypto" className="py-2">
            <span className="hidden sm:inline">Cryptocurrency</span>
            <span className="sm:hidden text-xs">Crypto</span>
          </TabsTrigger>
          <TabsTrigger value="history" className="py-2">
            <span className="hidden sm:inline">Deposit History</span>
            <span className="sm:hidden text-xs">History</span>
          </TabsTrigger>
        </TabsList>


        {/* Crypto Deposit Tab */}
        <TabsContent value="crypto" className="space-y-6">
          <Alert>
            <Info className="h-4 w-4" />
            <AlertTitle>Cryptocurrency Deposit</AlertTitle>
            <AlertDescription>
              Select your preferred cryptocurrency, send the exact amount to the provided wallet address, and submit your
              transaction details. Your balance will be credited after admin approval.
            </AlertDescription>
          </Alert>

          {/* Removed Card wrapper - MobileAddFunds has its own styling */}
          <MobileAddFunds currencies={cryptoCurrencies || []} currentBalance={userData?.balance || 0} />
        </TabsContent>

        {/* Deposit History Tab */}
        <TabsContent value="history" className="space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Deposit History</CardTitle>
                <CardDescription>Track all your deposit transactions and their status</CardDescription>
              </div>
              <Link href="/dashboard/transaction-history">
                <Button variant="outline" size="sm">
                  View Full History
                </Button>
              </Link>
            </CardHeader>
            <CardContent>
              {allDeposits && allDeposits.length > 0 ? (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Transaction ID</TableHead>
                        <TableHead>Payment Method</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Details</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {allDeposits.map((deposit: any) => (
                        <TableRow key={`${deposit.deposit_type}-${deposit.id}`}>
                          <TableCell className="font-mono text-xs">{deposit.id.substring(0, 8)}...</TableCell>
                          <TableCell>
                            <div className="font-medium">
                              {deposit.deposit_type === "instant"
                                ? "XAF"
                                : deposit.crypto_currencies?.symbol}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {deposit.deposit_type === "instant"
                                ? "Instant Payment"
                                : deposit.crypto_currencies?.name}
                            </div>
                          </TableCell>
                          <TableCell className="font-mono font-semibold text-green-600">
                            ${deposit.amount || 0}
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant={
                                deposit.status === "completed" || deposit.status === "approved"
                                  ? "default"
                                  : deposit.status === "rejected" || deposit.status === "failed"
                                    ? "destructive"
                                    : "secondary"
                              }
                              className="flex items-center gap-1 w-fit"
                            >
                              {(deposit.status === "completed" || deposit.status === "approved") && (
                                <CheckCircle className="h-3 w-3" />
                              )}
                              {(deposit.status === "rejected" || deposit.status === "failed") && (
                                <XCircle className="h-3 w-3" />
                              )}
                              {deposit.status === "pending" && <Clock className="h-3 w-3" />}
                              <span className="capitalize">{deposit.status}</span>
                            </Badge>
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {formatDistance(new Date(deposit.created_at), new Date(), { addSuffix: true })}
                          </TableCell>
                          <TableCell className="text-xs">
                            {(deposit.status === "rejected" || deposit.status === "failed") &&
                              deposit.admin_notes && (
                                <div className="text-red-600 dark:text-red-400">Reason: {deposit.admin_notes}</div>
                              )}
                            {(deposit.status === "completed" || deposit.status === "approved") &&
                              deposit.reviewed_at && (
                                <div className="text-green-600 dark:text-green-400">
                                  {deposit.deposit_type === "instant"
                                    ? "Instant Credit"
                                    : `Approved ${formatDistance(new Date(deposit.reviewed_at), new Date(), {
                                        addSuffix: true,
                                      })}`}
                                </div>
                              )}
                            {deposit.status === "pending" && (
                              <div className="text-yellow-600 dark:text-yellow-400">
                                {deposit.deposit_type === "instant" ? "Processing..." : "Awaiting approval"}
                              </div>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="text-center py-12">
                  <p className="text-muted-foreground">No deposit history yet</p>
                  <p className="text-sm text-muted-foreground">Start by making your first deposit</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
