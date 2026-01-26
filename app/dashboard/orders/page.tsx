import { createClient } from "@/lib/supabase/server"
import { MobileOrdersHistory } from "@/components/dashboard/mobile-orders-history"
import { redirect } from "next/navigation"
import { Suspense } from "react"
import { Badge } from "@/components/ui/badge"
import { format } from "date-fns"

interface OrdersPageProps {
  searchParams: Promise<{ page?: string }>
}

async function OrdersContent({ page = 1 }: { page: number }) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  const pageSize = 20
  const offset = (page - 1) * pageSize

  // Fetch paginated orders
  const { data: orders, error: ordersError } = await supabase
    .from("orders")
    .select("id, user_id, service_id, external_order_id, link, quantity, price, start_count, remains, status, can_refill, refill_count, created_at, services(id, name, icon, platform, has_refill, category_id)")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .range(offset, offset + pageSize - 1)

  // Get total count for pagination
  const { count: totalOrders, error: countError } = await supabase
    .from("orders")
    .select("id", { count: "exact", head: true })
    .eq("user_id", user.id)

  if (ordersError) {
    console.error("[v0] Orders fetch error:", ordersError)
  }
  
  if (countError) {
    console.error("[v0] Orders count fetch error:", countError)
  }

  // Transform orders to use category icon if service icon is missing
  const transformedOrders = orders?.map((order: any) => {
    const price = parseFloat(String(order.price)) || 0
    return {
      ...order,
      price: isNaN(price) ? 0 : Math.max(0, price),
      services: {
        ...order.services,
        // Use service icon if available, otherwise will use default
        icon: order.services?.icon,
      },
    }
  }) || []

  const totalPages = Math.ceil((totalOrders || 0) / pageSize)

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case "completed":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
      case "pending":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
      case "failed":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
      case "processing":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
    }
  }

  return (
    <>
      {/* Mobile view */}
      <div className="lg:hidden">
        <MobileOrdersHistory orders={transformedOrders} />
      </div>

      {/* Desktop view */}
      <div className="hidden lg:block space-y-6 p-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">My Orders</h1>
          <p className="text-muted-foreground">View and manage your order history</p>
        </div>

        {/* Desktop order table with all order details */}
        {transformedOrders && transformedOrders.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
                  <th className="text-left px-4 py-3 font-semibold text-gray-900 dark:text-white">Order ID</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-900 dark:text-white">Service</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-900 dark:text-white">Quantity</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-900 dark:text-white">Link</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-900 dark:text-white">Status</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-900 dark:text-white">Price</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-900 dark:text-white">Date</th>
                </tr>
              </thead>
              <tbody>
                {transformedOrders.map((order: any, idx: number) => (
                  <tr
                    key={order.id || idx}
                    className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                  >
                    <td className="px-4 py-3 font-mono text-xs text-gray-600 dark:text-gray-400 truncate max-w-xs">
                      {order.id}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        {order.services?.icon && (
                          <img src={order.services.icon} alt="service" className="w-5 h-5 rounded" />
                        )}
                        <span className="font-medium text-gray-900 dark:text-white">{order.services?.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-700 dark:text-gray-300">{order.quantity}</td>
                    <td className="px-4 py-3 text-gray-600 dark:text-gray-400 truncate max-w-xs">{order.link}</td>
                    <td className="px-4 py-3">
                      <Badge className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                        {order.status || "Pending"}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 font-semibold text-gray-900 dark:text-white">
                      ₹{typeof order.price === 'number' ? order.price.toFixed(2) : parseFloat(order.price || '0').toFixed(2)}
                    </td>
                    <td className="px-4 py-3 text-gray-600 dark:text-gray-400">
                      {order.created_at ? format(new Date(order.created_at), "MMM dd, yyyy") : "N/A"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-12 bg-gray-50 dark:bg-gray-900/50 rounded-lg border border-gray-200 dark:border-gray-700">
            <p className="text-muted-foreground">No orders found</p>
          </div>
        )}
      </div>
    </>
  )
}

export default async function OrdersPage({ searchParams }: OrdersPageProps) {
  const params = await searchParams
  const page = parseInt(params?.page || "1", 10)

  return (
    <Suspense fallback={<OrdersPageSkeleton />}>
      <OrdersContent page={page} />
    </Suspense>
  )
}

function OrdersPageSkeleton() {
  return (
    <div className="hidden lg:block space-y-6 p-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">My Orders</h1>
        <p className="text-muted-foreground">View and manage your order history</p>
      </div>
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="animate-pulse space-y-2">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-12 bg-gray-100 dark:bg-gray-700"></div>
          ))}
        </div>
      </div>
    </div>
  )
}
