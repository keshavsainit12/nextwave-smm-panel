import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { CryptoList } from "@/components/admin/crypto-list"
import { AddCryptoDialog } from "@/components/admin/add-crypto-dialog"

export default async function AdminCryptoPage() {
  const supabase = await createClient()
  const { data: cryptoCurrencies } = await supabase
    .from("crypto_currencies")
    .select("*")
    .order("display_order", { ascending: true })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Crypto Payment Settings</h1>
          <p className="text-muted-foreground">Manage cryptocurrency wallet addresses for user deposits</p>
        </div>
        <AddCryptoDialog />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Active Cryptocurrencies</CardTitle>
          <CardDescription>
            Wallet addresses are displayed instantly to users. Changes reflect immediately on the client panel.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <CryptoList currencies={cryptoCurrencies || []} />
        </CardContent>
      </Card>
    </div>
  )
}
