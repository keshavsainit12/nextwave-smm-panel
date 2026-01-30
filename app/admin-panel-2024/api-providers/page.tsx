import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ApiProviderList } from "@/components/admin/api-provider-list"
import { AddApiProviderDialog } from "@/components/admin/add-api-provider-dialog"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Info } from "lucide-react"

export default async function AdminApiProvidersPage() {
  const supabase = await createClient()
  const [{ data: providers }, { data: services }] = await Promise.all([
    supabase.from("api_providers").select("*").order("priority", { ascending: true }),
    supabase.from("services").select("id"),
  ])

  const hasProviders = providers && providers.length > 0
  const hasServices = services && services.length > 0
  const needsSync = hasProviders && !hasServices

  return (
    <div className="space-y-3 sm:space-y-4 md:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 bg-white dark:bg-slate-900 rounded-lg sm:rounded-xl p-3 sm:p-4 md:p-6 shadow-sm border border-gray-200 dark:border-gray-800">
        <div className="min-w-0">
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold tracking-tight bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">API Providers</h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">Manage external SMM API providers for automated order fulfillment</p>
        </div>
        <div className="flex-shrink-0 w-full sm:w-auto">
          <AddApiProviderDialog />
        </div>
      </div>

      {needsSync && (
        <Alert className="bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800">
          <Info className="h-4 w-4 text-blue-600 dark:text-blue-400" />
          <AlertTitle className="text-blue-700 dark:text-blue-300">Services Not Synced</AlertTitle>
          <AlertDescription className="text-xs sm:text-sm text-blue-700 dark:text-blue-300">
            You have API providers configured but no services. Click the sync button (refresh icon) on any provider to
            import services automatically with 2% markup.
          </AlertDescription>
        </Alert>
      )}

      <Card className="bg-white dark:bg-slate-900 border-gray-200 dark:border-gray-800">
        <CardHeader className="p-3 sm:p-4 md:p-6">
          <CardTitle className="text-lg sm:text-xl">Connected Providers</CardTitle>
          <CardDescription className="text-xs sm:text-sm">
            Configure multiple providers with failover support. Orders automatically route to the highest priority
            active provider.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-3 sm:p-4 md:p-6 overflow-x-auto">
          <ApiProviderList providers={providers || []} />
        </CardContent>
      </Card>
    </div>
  )
}
