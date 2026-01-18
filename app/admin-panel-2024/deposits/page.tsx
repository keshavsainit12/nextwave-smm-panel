import { createAdminClient } from "@/lib/supabase/admin"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { CryptoDepositList } from "@/components/admin/crypto-deposit-list"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertTriangle } from "lucide-react"

export default async function AdminDepositsPage() {
  const supabase = createAdminClient()
  
  // Fetch deposits with all related data
  const { data: deposits, error } = await supabase
    .from("crypto_deposits")
    .select("*, users(id, email, full_name), crypto_currencies(id, name, symbol)")
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

  const pendingCount = deposits?.filter((d) => d.status === "pending").length || 0

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
          <CardTitle>All Deposits ({deposits?.length || 0})</CardTitle>
          <CardDescription>Review crypto payment submissions from users</CardDescription>
        </CardHeader>
        <CardContent>
          <CryptoDepositList deposits={deposits || []} />
        </CardContent>
      </Card>
    </div>
  )
}
