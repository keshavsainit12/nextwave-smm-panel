import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Info } from "lucide-react"
import { MobileAddFunds } from "@/components/dashboard/mobile-add-funds"

export default async function DepositPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  const { data: userData } = await supabase.from("users").select("balance").eq("id", user?.id).single()

  const { data: cryptoCurrencies } = await supabase
    .from("crypto_currencies")
    .select("*")
    .eq("is_active", true)
    .order("display_order", { ascending: true })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Add Balance</h1>
        <p className="text-muted-foreground">Deposit funds using cryptocurrency</p>
      </div>

      <Alert>
        <Info className="h-4 w-4" />
        <AlertTitle>How it works</AlertTitle>
        <AlertDescription>
          Select your preferred cryptocurrency, send the exact amount to the provided wallet address, and submit your
          transaction details. Your balance will be credited after admin approval.
        </AlertDescription>
      </Alert>

      <Card>
        <CardHeader>
          <CardTitle>Crypto Deposit</CardTitle>
          <CardDescription>Select a cryptocurrency and submit your payment details</CardDescription>
        </CardHeader>
        <CardContent>
          <MobileAddFunds currencies={cryptoCurrencies || []} currentBalance={userData?.balance || 0} />
        </CardContent>
      </Card>
    </div>
  )
}
