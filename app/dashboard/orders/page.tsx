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
            <div className="animate-pulse space-y-2">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-12 bg-gray-100 dark:bg-gray-700"></div>
              ))}
            </div>
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No orders found</p>
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
  )
}
