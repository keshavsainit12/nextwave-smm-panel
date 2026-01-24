import { createClient } from "@/lib/supabase/server"
import { MobileOrdersHistory } from "@/components/dashboard/mobile-orders-history"
import { redirect } from "next/navigation"
import { Suspense } from "react"

interface OrdersPageProps {
  searchParams: { page?: string }
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
    .select("*, services(id, name, icon, platform, has_refill, category_id, service_categories(id, name, icon))")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .range(offset, offset + pageSize - 1)

  // Get total count for pagination
  const { count: totalOrders } = await supabase
    .from("orders")
    .select("id", { count: "exact", head: true })
    .eq("user_id", user.id)

  if (ordersError) {
    console.error("[v0] Orders fetch error:", ordersError)
  }

  // Transform orders to use category icon if service icon is missing
  const transformedOrders = orders?.map((order: any) => ({
    ...order,
    services: {
      ...order.services,
      icon: order.services?.icon || order.services?.service_categories?.icon,
    },
  })) || []

  const totalPages = Math.ceil((totalOrders || 0) / pageSize)

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
                    Order ID
                  </th>
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
                    <td className="px-6 py-4 font-mono text-sm text-gray-600">
                      <span className="bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded font-bold">#{order.order_id}</span>
                    </td>
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

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Showing {offset + 1} to {Math.min(offset + pageSize, totalOrders || 0)} of {totalOrders} orders
            </p>
            <div className="flex gap-2">
              <a
                href={`/dashboard/orders${page > 1 ? `?page=${page - 1}` : ""}`}
                className={`px-4 py-2 rounded-lg border text-sm font-medium transition-colors ${
                  page === 1
                    ? "border-gray-200 text-gray-400 cursor-not-allowed"
                    : "border-gray-200 text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-900/30"
                }`}
                aria-disabled={page === 1}
              >
                Previous
              </a>
              <div className="flex items-center gap-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .filter(p => p === 1 || p === totalPages || Math.abs(p - page) <= 1)
                  .map((p, idx, arr) => (
                    <div key={p}>
                      {idx > 0 && arr[idx - 1] !== p - 1 && <span className="text-gray-400">...</span>}
                      <a
                        href={`/dashboard/orders?page=${p}`}
                        className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                          p === page
                            ? "bg-blue-600 text-white"
                            : "border border-gray-200 text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-900/30"
                        }`}
                      >
                        {p}
                      </a>
                    </div>
                  ))}
              </div>
              <a
                href={`/dashboard/orders?page=${page + 1}`}
                className={`px-4 py-2 rounded-lg border text-sm font-medium transition-colors ${
                  page === totalPages
                    ? "border-gray-200 text-gray-400 cursor-not-allowed"
                    : "border-gray-200 text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-900/30"
                }`}
                aria-disabled={page === totalPages}
              >
                Next
              </a>
            </div>
          </div>
        )}
      </div>
    </>
  )
}

export default async function OrdersPage({ searchParams }: OrdersPageProps) {
  const page = parseInt(searchParams?.page || "1", 10)

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
