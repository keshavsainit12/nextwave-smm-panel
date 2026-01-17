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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">API Providers</h1>
          <p className="text-muted-foreground">Manage external SMM API providers for automated order fulfillment</p>
        </div>
        <AddApiProviderDialog />
      </div>

      {needsSync && (
        <Alert>
          <Info className="h-4 w-4" />
          <AlertTitle>Services Not Synced</AlertTitle>
          <AlertDescription>
            You have API providers configured but no services. Click the sync button (refresh icon) on any provider to
            import services automatically with 2% markup.
          </AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Connected Providers</CardTitle>
          <CardDescription>
            Configure multiple providers with failover support. Orders automatically route to the highest priority
            active provider.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ApiProviderList providers={providers || []} />
        </CardContent>
      </Card>
    </div>
  )
}
