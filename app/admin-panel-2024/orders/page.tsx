import { createAdminClient } from "@/lib/supabase/admin"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { OrderList } from "@/components/admin/order-list"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ExportCsvButton } from "@/components/admin/export-csv-button"


export default async function AdminOrdersPage() {
  const supabase = createAdminClient()
  const { data: orders, error } = await supabase
    .from("orders")
    .select("*, users(email, full_name), services(name, icon, platform)")
    .order("created_at", { ascending: false })
    .limit(100)

  if (error) {
    console.error("[v0] Admin orders fetch error:", error)
  }

  // Transform orders - service icon fallback no longer needed
  const transformedOrders = orders?.map((order: any) => ({
    ...order,
    services: {
      ...order.services,
      icon: order.services?.icon,
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
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
        <div className="min-w-0">
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold tracking-tight">Orders</h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">Monitor and manage all user orders</p>
        </div>
        <div className="flex-shrink-0 w-full sm:w-auto">
          <ExportCsvButton data={exportData || []} filename="orders" />
        </div>
      </div>

      {/* Tabs - Mobile scrollable */}
      <Tabs defaultValue="all" className="w-full">
        <TabsList className="grid grid-cols-2 sm:grid-cols-5 gap-1 sm:gap-0 w-full h-auto">
          <TabsTrigger value="all" className="text-xs sm:text-sm py-2">All ({transformedOrders?.length || 0})</TabsTrigger>
          <TabsTrigger value="pending" className="text-xs sm:text-sm py-2">Pending ({statusCounts.pending})</TabsTrigger>
          <TabsTrigger value="processing" className="text-xs sm:text-sm py-2 hidden sm:inline-flex">Processing ({statusCounts.processing})</TabsTrigger>
          <TabsTrigger value="completed" className="text-xs sm:text-sm py-2 hidden sm:inline-flex">Completed ({statusCounts.completed})</TabsTrigger>
          <TabsTrigger value="partial" className="text-xs sm:text-sm py-2">Partial ({statusCounts.partial})</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="mt-3 sm:mt-4 md:mt-6">
          <Card className="bg-white dark:bg-slate-900 border-gray-200 dark:border-gray-800">
            <CardHeader className="p-3 sm:p-4 md:p-6">
              <CardTitle className="text-lg sm:text-xl">All Orders</CardTitle>
              <CardDescription className="text-xs sm:text-sm">Complete order history</CardDescription>
            </CardHeader>
            <CardContent className="p-3 sm:p-4 md:p-6 overflow-x-auto">
              <OrderList orders={transformedOrders || []} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="pending" className="mt-3 sm:mt-4 md:mt-6">
          <Card className="bg-white dark:bg-slate-900 border-gray-200 dark:border-gray-800">
            <CardHeader className="p-3 sm:p-4 md:p-6">
              <CardTitle className="text-lg sm:text-xl">Pending Orders</CardTitle>
              <CardDescription className="text-xs sm:text-sm">Orders awaiting processing</CardDescription>
            </CardHeader>
            <CardContent className="p-3 sm:p-4 md:p-6 overflow-x-auto">
              <OrderList orders={transformedOrders?.filter((o) => o.status === "pending") || []} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="processing" className="mt-3 sm:mt-4 md:mt-6">
          <Card className="bg-white dark:bg-slate-900 border-gray-200 dark:border-gray-800">
            <CardHeader className="p-3 sm:p-4 md:p-6">
              <CardTitle className="text-lg sm:text-xl">Processing Orders</CardTitle>
              <CardDescription className="text-xs sm:text-sm">Orders being fulfilled</CardDescription>
            </CardHeader>
            <CardContent className="p-3 sm:p-4 md:p-6 overflow-x-auto">
              <OrderList orders={transformedOrders?.filter((o) => o.status === "processing") || []} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="completed" className="mt-3 sm:mt-4 md:mt-6">
          <Card className="bg-white dark:bg-slate-900 border-gray-200 dark:border-gray-800">
            <CardHeader className="p-3 sm:p-4 md:p-6">
              <CardTitle className="text-lg sm:text-xl">Completed Orders</CardTitle>
              <CardDescription className="text-xs sm:text-sm">Successfully fulfilled</CardDescription>
            </CardHeader>
            <CardContent className="p-3 sm:p-4 md:p-6 overflow-x-auto">
              <OrderList orders={transformedOrders?.filter((o) => o.status === "completed") || []} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="partial" className="mt-3 sm:mt-4 md:mt-6">
          <Card className="bg-white dark:bg-slate-900 border-gray-200 dark:border-gray-800">
            <CardHeader className="p-3 sm:p-4 md:p-6">
              <CardTitle className="text-lg sm:text-xl">Partial Orders</CardTitle>
              <CardDescription className="text-xs sm:text-sm">Partially completed</CardDescription>
            </CardHeader>
            <CardContent className="p-3 sm:p-4 md:p-6 overflow-x-auto">
              <OrderList orders={transformedOrders?.filter((o) => o.status === "partial") || []} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
