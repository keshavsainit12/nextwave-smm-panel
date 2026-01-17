import { createAdminClient } from "@/lib/supabase/admin"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { CryptoDepositList } from "@/components/admin/crypto-deposit-list"

export default async function AdminDepositsPage() {
  const supabase = createAdminClient()
  const { data: deposits } = await supabase
    .from("crypto_deposits")
    .select("*, users(email, full_name), crypto_currencies(name, symbol)")
    .order("created_at", { ascending: false })

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
          <CardTitle>All Deposits</CardTitle>
          <CardDescription>Review crypto payment submissions from users</CardDescription>
        </CardHeader>
        <CardContent>
          <CryptoDepositList deposits={deposits || []} />
        </CardContent>
      </Card>
    </div>
  )
}
