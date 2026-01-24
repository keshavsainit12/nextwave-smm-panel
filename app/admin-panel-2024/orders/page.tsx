import { createAdminClient } from "@/lib/supabase/admin"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { OrderList } from "@/components/admin/order-list"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ExportCsvButton } from "@/components/admin/export-csv-button"

export default async function AdminOrdersPage() {
  const supabase = createAdminClient()
  const { data: orders } = await supabase
    .from("orders")
    .select("*, users(email, full_name), services(name, icon, platform, service_categories(name, icon))")
    .order("created_at", { ascending: false })
    .limit(100)

  // Transform orders to use category icon if service icon is missing
  const transformedOrders = orders?.map((order: any) => ({
    ...order,
    services: {
      ...order.services,
      icon: order.services?.icon || order.services?.service_categories?.icon,
    },
  })) || []

  const statusCounts = {
    pending: orders?.filter((o) => o.status === "pending").length || 0,
    processing: orders?.filter((o) => o.status === "processing").length || 0,
    completed: orders?.filter((o) => o.status === "completed").length || 0,
    partial: orders?.filter((o) => o.status === "partial").length || 0,
  }

  const exportData = transformedOrders?.map((order) => ({
    order_id: order.id,
    user_email: order.users?.email,
    service: order.services?.name,
    platform: order.services?.platform,
    link: order.link,
    quantity: order.quantity,
    price: order.total_price || order.price,
    status: order.status,
    created_at: order.created_at,
  }))

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header - Mobile responsive */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Orders</h1>
          <p className="text-muted-foreground text-sm sm:text-base">Monitor and manage all user orders</p>
        </div>
        <ExportCsvButton data={exportData || []} filename="orders" />
      </div>

      {/* Tabs - Mobile scrollable */}
      <Tabs defaultValue="all" className="w-full">
        <TabsList className="grid grid-cols-2 sm:grid-cols-5 gap-1 sm:gap-0 w-full h-auto sm:h-10">
          <TabsTrigger value="all" className="text-xs sm:text-sm">All ({transformedOrders?.length || 0})</TabsTrigger>
          <TabsTrigger value="pending" className="text-xs sm:text-sm">Pending ({statusCounts.pending})</TabsTrigger>
          <TabsTrigger value="processing" className="text-xs sm:text-sm hidden sm:inline-flex">Processing ({statusCounts.processing})</TabsTrigger>
          <TabsTrigger value="completed" className="text-xs sm:text-sm hidden sm:inline-flex">Completed ({statusCounts.completed})</TabsTrigger>
          <TabsTrigger value="partial" className="text-xs sm:text-sm">Partial ({statusCounts.partial})</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="mt-4 sm:mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg sm:text-xl">All Orders</CardTitle>
              <CardDescription className="text-xs sm:text-sm">Complete order history</CardDescription>
            </CardHeader>
            <CardContent className="overflow-x-auto">
              <OrderList orders={transformedOrders || []} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="pending" className="mt-4 sm:mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg sm:text-xl">Pending Orders</CardTitle>
              <CardDescription className="text-xs sm:text-sm">Orders awaiting processing</CardDescription>
            </CardHeader>
            <CardContent className="overflow-x-auto">
              <OrderList orders={transformedOrders?.filter((o) => o.status === "pending") || []} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="processing" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Processing Orders</CardTitle>
              <CardDescription>Orders currently being fulfilled</CardDescription>
            </CardHeader>
            <CardContent>
              <OrderList orders={transformedOrders?.filter((o) => o.status === "processing") || []} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="completed" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Completed Orders</CardTitle>
              <CardDescription>Successfully fulfilled orders</CardDescription>
            </CardHeader>
            <CardContent>
              <OrderList orders={transformedOrders?.filter((o) => o.status === "completed") || []} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="partial" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Partial Orders</CardTitle>
              <CardDescription>Orders partially completed</CardDescription>
            </CardHeader>
            <CardContent>
              <OrderList orders={transformedOrders?.filter((o) => o.status === "partial") || []} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
