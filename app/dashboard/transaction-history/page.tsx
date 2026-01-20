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

  // Fetch all deposits for current user with pagination
  const { data: depositHistory } = await supabase
    .from("crypto_deposits")
    .select("*, crypto_currency_id(symbol, name), transactions(id, status, notes)")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })

  // Calculate stats
  const totalDeposits = depositHistory?.length || 0
  const approvedDeposits = depositHistory?.filter((d) => d.status === "approved") || []
  const totalApproved = approvedDeposits.reduce((sum, d) => sum + Number(d.amount || 0), 0)
  const pendingDeposits = depositHistory?.filter((d) => d.status === "pending") || []
  const rejectedDeposits = depositHistory?.filter((d) => d.status === "rejected") || []

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
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Deposits</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalDeposits}</div>
            <p className="text-xs text-muted-foreground mt-1">All time</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Approved</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">${totalApproved.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground mt-1">{approvedDeposits.length} transactions</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Pending</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{pendingDeposits.length}</div>
            <p className="text-xs text-muted-foreground mt-1">Awaiting approval</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Rejected</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{rejectedDeposits.length}</div>
            <p className="text-xs text-muted-foreground mt-1">Declined deposits</p>
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
          <CardDescription>Complete list of all your deposit transactions</CardDescription>
        </CardHeader>
        <CardContent>
          {depositHistory && depositHistory.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Transaction ID</TableHead>
                    <TableHead>Cryptocurrency</TableHead>
                    <TableHead>Amount (USD)</TableHead>
                    <TableHead>Crypto Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Submitted</TableHead>
                    <TableHead>Details</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {depositHistory.map((deposit) => (
                    <TableRow key={deposit.id} className="hover:bg-muted/50">
                      <TableCell>
                        <div className="font-mono text-xs font-semibold">{deposit.id.substring(0, 12)}...</div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div>
                            <div className="font-medium">{deposit.crypto_currency_id?.symbol}</div>
                            <div className="text-xs text-muted-foreground">
                              {deposit.crypto_currency_id?.name}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="font-mono font-semibold">
                        <span className="text-green-600">+${Number(deposit.amount).toFixed(2)}</span>
                      </TableCell>
                      <TableCell className="font-mono text-sm text-muted-foreground">
                        {deposit.crypto_amount}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {deposit.status === "approved" && (
                            <>
                              <CheckCircle className="h-4 w-4 text-green-600" />
                              <Badge variant="default">Approved</Badge>
                            </>
                          )}
                          {deposit.status === "rejected" && (
                            <>
                              <XCircle className="h-4 w-4 text-red-600" />
                              <Badge variant="destructive">Rejected</Badge>
                            </>
                          )}
                          {deposit.status === "pending" && (
                            <>
                              <Clock className="h-4 w-4 text-yellow-600" />
                              <Badge variant="secondary">Pending</Badge>
                            </>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-sm">
                        {formatDistance(new Date(deposit.created_at), new Date(), { addSuffix: true })}
                      </TableCell>
                      <TableCell className="text-xs">
                        <div className="space-y-1">
                          {deposit.status === "approved" && deposit.reviewed_at && (
                            <div className="text-green-600 dark:text-green-400 font-medium">
                              Approved {formatDistance(new Date(deposit.reviewed_at), new Date(), { addSuffix: true })}
                            </div>
                          )}
                          {deposit.status === "rejected" && deposit.admin_notes && (
                            <div className="text-red-600 dark:text-red-400">
                              <div className="font-medium">Reason:</div>
                              <div>{deposit.admin_notes}</div>
                            </div>
                          )}
                          {deposit.status === "pending" && (
                            <div className="text-yellow-600 dark:text-yellow-400 font-medium">
                              Your deposit is being reviewed by our team
                            </div>
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
              <p className="text-sm text-muted-foreground">Start by making your first deposit</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
