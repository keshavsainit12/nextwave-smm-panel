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
    <div className="space-y-3 sm:space-y-4 md:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 bg-white dark:bg-slate-900 rounded-lg sm:rounded-xl p-3 sm:p-4 md:p-6 shadow-sm border border-gray-200 dark:border-gray-800">
        <div className="min-w-0">
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold tracking-tight bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Crypto Payment Settings</h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">Manage cryptocurrency wallet addresses for user deposits</p>
        </div>
        <div className="flex-shrink-0 w-full sm:w-auto">
          <AddCryptoDialog />
        </div>
      </div>

      <Card className="bg-white dark:bg-slate-900 border-gray-200 dark:border-gray-800">
        <CardHeader className="p-3 sm:p-4 md:p-6">
          <CardTitle className="text-lg sm:text-xl">Active Cryptocurrencies</CardTitle>
          <CardDescription className="text-xs sm:text-sm">
            Wallet addresses are displayed instantly to users. Changes reflect immediately on the client panel.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-3 sm:p-4 md:p-6 overflow-x-auto">
          <CryptoList currencies={cryptoCurrencies || []} />
        </CardContent>
      </Card>
    </div>
  )
}
