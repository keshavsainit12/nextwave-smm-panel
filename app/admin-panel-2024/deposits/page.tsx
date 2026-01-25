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
      <div className="space-y-6">
        <h1 className="text-3xl font-bold tracking-tight">Crypto Deposits</h1>
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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Crypto Deposits</h1>
          <p className="text-muted-foreground">Review and approve user crypto deposits</p>
        </div>
        {pendingCount > 0 && (
          <div className="bg-yellow-100 dark:bg-yellow-900/20 px-4 py-2 rounded-lg">
            <span className="text-sm font-medium">{pendingCount} pending approval</span>
          </div>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Deposits ({enrichedDeposits?.length || 0})</CardTitle>
          <CardDescription>Review crypto payment submissions from users</CardDescription>
        </CardHeader>
        <CardContent>
          <CryptoDepositList deposits={enrichedDeposits || []} />
        </CardContent>
      </Card>
    </div>
  )
}
