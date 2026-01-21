import { createClient } from "@/lib/supabase/server"
import { MobileOrdersHistory } from "@/components/dashboard/mobile-orders-history"

export default async function OrdersPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { data: orders } = await supabase
    .from("orders")
    .select("*, services(id, name, icon, platform, has_refill, category_id, service_categories!inner(id, name, icon))")
    .eq("user_id", user!.id)
    .order("created_at", { ascending: false })

  // Transform orders to use category icon if service icon is missing
  const transformedOrders = orders?.map((order: any) => ({
    ...order,
    services: {
      ...order.services,
      icon: order.services?.icon || order.services?.service_categories?.icon,
    },
  })) || []

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
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-900/50">
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <th className="px-6 py-3 text-left text-xs font-bold uppercase text-gray-600 dark:text-gray-400">
                    Service
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-bold uppercase text-gray-600 dark:text-gray-400">
                    Quantity
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-bold uppercase text-gray-600 dark:text-gray-400">
                    Price
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-bold uppercase text-gray-600 dark:text-gray-400">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-bold uppercase text-gray-600 dark:text-gray-400">
                    Date
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {transformedOrders.map((order: any) => (
                  <tr key={order.id} className="hover:bg-gray-50 dark:hover:bg-gray-900/30 transition-colors">
                    <td className="px-6 py-4 font-medium">
                      <div className="flex items-center gap-3">
                        {order.services?.icon && (
                          <img
                            src={order.services.icon || "/placeholder.svg"}
                            alt={order.services?.name}
                            className="h-8 w-8 rounded object-contain bg-muted p-1 flex-shrink-0"
                            onError={(e) => {
                              e.currentTarget.style.display = "none"
                            }}
                          />
                        )}
                        <span>{order.services?.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm">{order.quantity?.toLocaleString()}</td>
                    <td className="px-6 py-4 text-sm font-semibold">${order.price?.toFixed(2)}</td>
                    <td className="px-6 py-4 text-sm">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-bold ${
                          order.status === "completed"
                            ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                            : order.status === "processing"
                              ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
                              : order.status === "pending"
                                ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400"
                                : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                        }`}
                      >
                        {order.status?.charAt(0).toUpperCase() + order.status?.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                      {new Date(order.created_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-12 bg-gray-50 dark:bg-gray-900/30 rounded-lg">
            <p className="text-gray-600 dark:text-gray-400">No orders yet</p>
          </div>
        )}
      </div>
    </>
  )
}
