import { createAdminClient } from "@/lib/supabase/admin"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { CryptoDepositList } from "@/components/admin/crypto-deposit-list"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertTriangle } from "lucide-react"
import { revalidatePath } from "next/cache"

export const revalidate = 0 // Always fetch fresh data (no caching)

export default async function AdminDepositsPage() {
  const supabase = createAdminClient()
  
  // Fetch deposits - get user and crypto data separately to avoid object nesting
  const { data: deposits, error } = await supabase
    .from("crypto_deposits")
    .select("*")
    .order("created_at", { ascending: false })

  console.log("[v0] Admin deposits query result:", { depositsCount: deposits?.length, error })

  if (error) {
    return (
      <div className="space-y-3 sm:space-y-4 md:space-y-6">
        <div className="bg-white dark:bg-slate-900 rounded-lg sm:rounded-xl p-3 sm:p-4 md:p-6 shadow-sm border border-gray-200 dark:border-gray-800">
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold tracking-tight bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Crypto Deposits</h1>
        </div>
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>Failed to load deposits: {error.message}</AlertDescription>
        </Alert>
      </div>
    )
  }

  // Fetch user and crypto data separately and enrich deposits
  const userIds = [...new Set(deposits?.map((d) => d.user_id) || [])]
  const cryptoIds = [...new Set(deposits?.map((d) => d.crypto_currency_id) || [])]

  let usersMap: Record<string, any> = {}
  let cryptoMap: Record<string, any> = {}

  if (userIds.length > 0) {
    const { data: users } = await supabase
      .from("users")
      .select("id, email, full_name")
      .in("id", userIds)
    
    users?.forEach((user) => {
      usersMap[user.id] = user
    })
  }

  if (cryptoIds.length > 0) {
    const { data: cryptos } = await supabase
      .from("crypto_currencies")
      .select("id, name, symbol")
      .in("id", cryptoIds)
    
    cryptos?.forEach((crypto) => {
      cryptoMap[crypto.id] = crypto
    })
  }

  // Enrich deposits with user and crypto data
  const enrichedDeposits = deposits?.map((d) => ({
    ...d,
    user_id: d.user_id, // Keep as string for the action
    user_data: usersMap[d.user_id], // Add user data
    crypto_currency_id: d.crypto_currency_id, // Keep as string for the action
    crypto_data: cryptoMap[d.crypto_currency_id], // Add crypto data
  })) || []

  const pendingCount = enrichedDeposits?.filter((d) => d.status === "pending").length || 0

  return (
    <div className="space-y-3 sm:space-y-4 md:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 bg-white dark:bg-slate-900 rounded-lg sm:rounded-xl p-3 sm:p-4 md:p-6 shadow-sm border border-gray-200 dark:border-gray-800">
        <div className="min-w-0">
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold tracking-tight bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Crypto Deposits</h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">Review and approve user crypto deposits</p>
        </div>
        {pendingCount > 0 && (
          <div className="bg-yellow-100 dark:bg-yellow-900/20 px-3 py-2 rounded-lg flex-shrink-0">
            <span className="text-xs sm:text-sm font-medium">{pendingCount} pending approval</span>
          </div>
        )}
      </div>

      <Card className="bg-white dark:bg-slate-900 border-gray-200 dark:border-gray-800">
        <CardHeader className="p-3 sm:p-4 md:p-6">
          <CardTitle className="text-lg sm:text-xl">All Deposits ({enrichedDeposits?.length || 0})</CardTitle>
          <CardDescription className="text-xs sm:text-sm">Review crypto payment submissions from users</CardDescription>
        </CardHeader>
        <CardContent className="p-3 sm:p-4 md:p-6 overflow-x-auto">
          <CryptoDepositList deposits={enrichedDeposits || []} />
        </CardContent>
      </Card>
    </div>
  )
}
