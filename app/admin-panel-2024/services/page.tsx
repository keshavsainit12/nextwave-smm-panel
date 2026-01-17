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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Services Management</h1>
          <p className="text-muted-foreground">Manage SMM services, pricing, and availability</p>
        </div>
        <AddServiceDialog categories={categories || []} providers={providers || []} />
      </div>

      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          Base prices shown are for Normal users (×3 provider cost). Bulk Buyers get ×2.5, Resellers get ×2, VIP gets
          custom pricing.
        </AlertDescription>
      </Alert>

      <BulkPricingControl />

      <Tabs defaultValue="all">
        <TabsList>
          <TabsTrigger value="all">All Services ({services?.length || 0})</TabsTrigger>
          <TabsTrigger value="active">Active</TabsTrigger>
          <TabsTrigger value="inactive">Inactive</TabsTrigger>
        </TabsList>
        <TabsContent value="all" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>All Services</CardTitle>
              <CardDescription>Complete list of SMM services with pricing and status</CardDescription>
            </CardHeader>
            <CardContent>
              <ServiceList services={services || []} />
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="active" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Active Services</CardTitle>
              <CardDescription>Services available to users</CardDescription>
            </CardHeader>
            <CardContent>
              <ServiceList services={services?.filter((s) => s.is_active) || []} />
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="inactive" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Inactive Services</CardTitle>
              <CardDescription>Disabled services</CardDescription>
            </CardHeader>
            <CardContent>
              <ServiceList services={services?.filter((s) => !s.is_active) || []} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
