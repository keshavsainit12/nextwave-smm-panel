import { createClient } from "@/lib/supabase/server"
import { MobileOrdersHistory } from "@/components/dashboard/mobile-orders-history"
import { DesktopOrdersTable } from "@/components/dashboard/desktop-orders-table"
import { redirect } from "next/navigation"
import { Suspense } from "react"
import { getCurrency } from "@/lib/currency"

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

  // Get system currency settings
  const { data: currencySettings } = await supabase
    .from("system_settings")
    .select("value")
    .eq("key", "currency")
    .single()

  const { data: currencySymbolSettings } = await supabase
    .from("system_settings")
    .select("value")
    .eq("key", "currency_symbol")
    .single()

  const currency = currencySettings?.value || "USD"
  const currencySymbol = currencySymbolSettings?.value || getCurrency(currency)?.symbol || "$"

  // Fetch paginated orders
  const { data: orders, error: ordersError } = await supabase
    .from("orders")
    .select("id, order_id, user_id, service_id, external_order_id, link, quantity, price, start_count, remains, status, can_refill, refill_count, created_at, services(id, name, icon, platform, has_refill, category_id)")
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

  return (
    <>
      {/* Mobile view */}
      <div className="lg:hidden">
        <MobileOrdersHistory 
          orders={transformedOrders} 
          currency={currency}
          currencySymbol={currencySymbol}
        />
      </div>

      {/* Desktop view */}
      <div className="hidden lg:block">
        <DesktopOrdersTable 
          orders={transformedOrders}
          currency={currency}
          currencySymbol={currencySymbol}
        />
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
