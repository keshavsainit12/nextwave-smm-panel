import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ServiceList } from "@/components/admin/service-list"
import { AddServiceDialog } from "@/components/admin/add-service-dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BulkPricingControl } from "@/components/admin/bulk-pricing-control"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Info } from "lucide-react"

export default async function AdminServicesPage() {
  const supabase = await createClient()
  const [{ data: services }, { data: categories }, { data: providers }] = await Promise.all([
    supabase
      .from("services")
      .select("*, service_categories(name), api_providers(name)")
      .order("created_at", { ascending: false }),
    supabase.from("service_categories").select("*").order("display_order"),
    supabase.from("api_providers").select("id, name").eq("is_active", true),
  ])

  return (
    <div className="space-y-3 sm:space-y-4 md:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
        <div className="min-w-0">
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold tracking-tight">Services</h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">Manage SMM services and pricing</p>
        </div>
        <div className="flex-shrink-0 w-full sm:w-auto">
          <AddServiceDialog categories={categories || []} providers={providers || []} />
        </div>
      </div>

      {/* Info Alert */}
      <Alert className="bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800">
        <Info className="h-4 w-4 text-blue-600 dark:text-blue-400" />
        <AlertDescription className="text-xs sm:text-sm text-blue-700 dark:text-blue-300">
          Base prices: Normal users (×3 cost). Bulk (×2.5), Resellers (×2), VIP (custom).
        </AlertDescription>
      </Alert>

      <BulkPricingControl />

      <Tabs defaultValue="all" className="w-full">
        <TabsList className="grid grid-cols-3 gap-1 w-full h-auto">
          <TabsTrigger value="all" className="text-xs sm:text-sm">
            All ({services?.length || 0})
          </TabsTrigger>
          <TabsTrigger value="active" className="text-xs sm:text-sm">
            Active
          </TabsTrigger>
          <TabsTrigger value="inactive" className="text-xs sm:text-sm">
            Inactive
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="mt-4 sm:mt-6">
          <Card>
            <CardHeader className="p-3 sm:p-4 md:p-6">
              <CardTitle className="text-lg sm:text-xl">All Services</CardTitle>
              <CardDescription className="text-xs sm:text-sm">Complete list of available services</CardDescription>
            </CardHeader>
            <CardContent className="p-3 sm:p-4 md:p-6 overflow-x-auto">
              <ServiceList services={services || []} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="active" className="mt-4 sm:mt-6">
          <Card>
            <CardHeader className="p-3 sm:p-4 md:p-6">
              <CardTitle className="text-lg sm:text-xl">Active Services</CardTitle>
              <CardDescription className="text-xs sm:text-sm">Services available to users</CardDescription>
            </CardHeader>
            <CardContent className="p-3 sm:p-4 md:p-6 overflow-x-auto">
              <ServiceList services={services?.filter((s) => s.is_active) || []} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="inactive" className="mt-4 sm:mt-6">
          <Card>
            <CardHeader className="p-3 sm:p-4 md:p-6">
              <CardTitle className="text-lg sm:text-xl">Inactive Services</CardTitle>
              <CardDescription className="text-xs sm:text-sm">Disabled services</CardDescription>
            </CardHeader>
            <CardContent className="p-3 sm:p-4 md:p-6 overflow-x-auto">
              <ServiceList services={services?.filter((s) => !s.is_active) || []} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
