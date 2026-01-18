import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Info, Zap } from "lucide-react"
import { MobileAddFunds } from "@/components/dashboard/mobile-add-funds"
import { InstantPaymentForm } from "@/components/dashboard/instant-payment-form"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default async function DepositPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  const { data: userData } = await supabase.from("users").select("balance, full_name").eq("id", user?.id).single()

  const { data: cryptoCurrencies } = await supabase
    .from("crypto_currencies")
    .select("*")
    .eq("is_active", true)
    .order("display_order", { ascending: true })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Add Balance</h1>
        <p className="text-muted-foreground">Choose your preferred deposit method</p>
      </div>

      <Tabs defaultValue="instant" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="instant" className="flex items-center gap-2">
            <Zap className="h-4 w-4" />
            <span>Instant Payment</span>
          </TabsTrigger>
          <TabsTrigger value="crypto">Cryptocurrency</TabsTrigger>
        </TabsList>

        {/* Instant Payment Tab */}
        <TabsContent value="instant" className="space-y-6">
          <Alert className="border-purple-200 bg-purple-50 dark:border-purple-900 dark:bg-purple-950/20">
            <Zap className="h-4 w-4 text-purple-600 dark:text-purple-400" />
            <AlertTitle className="text-purple-900 dark:text-purple-100">Instant Global Payment</AlertTitle>
            <AlertDescription className="text-purple-800 dark:text-purple-200">
              Pay instantly using AccountPe. Balance will be credited within seconds!
            </AlertDescription>
          </Alert>

          <Card>
            <CardHeader>
              <CardTitle>Global Instant Payment</CardTitle>
              <CardDescription>Fast, secure, and instant balance top-up</CardDescription>
            </CardHeader>
            <CardContent>
              {user && userData ? (
                <InstantPaymentForm
                  userId={user.id}
                  userEmail={user.email || ""}
                  userName={userData.full_name || "User"}
                  currentBalance={userData.balance || 0}
                />
              ) : (
                <p className="text-muted-foreground">Please log in to make a deposit</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

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

          <Card>
            <CardHeader>
              <CardTitle>Crypto Deposit</CardTitle>
              <CardDescription>Select a cryptocurrency and submit your payment details</CardDescription>
            </CardHeader>
            <CardContent>
              <MobileAddFunds currencies={cryptoCurrencies || []} currentBalance={userData?.balance || 0} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
