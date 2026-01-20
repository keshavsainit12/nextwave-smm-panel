import { createAdminClient } from "@/lib/supabase/admin"
import { AdminStatsCards } from "@/components/admin/admin-stats-cards"
import { RevenueChart } from "@/components/admin/revenue-chart"
import { RecentOrders } from "@/components/admin/recent-orders"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"

export default async function AdminDashboardPage() {
  const supabase = createAdminClient()

  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

  const [
    { count: totalUsers },
    { count: totalOrders },
    { count: activeOrders },
    { count: pendingDeposits },
    { data: ordersData },
    { data: activeUsersData },
  ] = await Promise.all([
    supabase.from("users").select("id", { count: "exact", head: true }).limit(0),
    supabase.from("orders").select("id", { count: "exact", head: true }).limit(0),
    supabase.from("orders").select("id", { count: "exact", head: true }).in("status", ["pending", "processing"]).limit(0),
    supabase.from("crypto_deposits").select("id", { count: "exact", head: true }).eq("status", "pending").limit(0),
    supabase.from("orders").select("id, price, quantity, services!inner(provider_price)", { head: false }).eq("status", "completed").limit(500),
    supabase.from("users").select("id", { count: "exact", head: false }).gte("last_login", thirtyDaysAgo.toISOString()).limit(100),
  ])

  // Calculate Order Revenue & Profit (Only from completed orders)
  // Revenue = orders.price (this is TOTAL PRICE already - what customer PAID)
  const orderRevenue = ordersData?.reduce((sum, order) => {
    return sum + Number(order.price || 0)
  }, 0) || 0

  // Cost = provider_price per 1K × (quantity / 1000) = what API CHARGED you
  const orderCost = ordersData?.reduce((sum, order) => {
    const providerPrice = Number(order.services?.provider_price || 0)
    const quantity = Number(order.quantity || 0)
    const cost = (quantity / 1000) * providerPrice
    return sum + cost
  }, 0) || 0

  const orderProfit = orderRevenue - orderCost

  // Total Revenue = Order Revenue only (deposits tracked separately)
  const totalRevenue = orderRevenue

  // Total Profit = Order Profit
  const totalProfit = orderProfit

  const activeUsersCount = activeUsersData?.length || 0

  return (
    <div className="space-y-8">
      <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-100 flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Admin Dashboard
          </h1>
          <p className="text-gray-600 mt-2 text-lg">Welcome back! Here's what's happening today.</p>
        </div>
        <Link href="/admin-panel-2024/transaction-history">
          <Button className="flex items-center gap-2">
            View All Transactions
            <ArrowRight className="h-4 w-4" />
          </Button>
        </Link>
      </div>

      <AdminStatsCards
        totalRevenue={totalRevenue}
        totalProfit={totalProfit}
        totalUsers={totalUsers || 0}
        activeUsers={activeUsersCount}
        totalOrders={totalOrders || 0}
        activeOrders={activeOrders || 0}
        pendingDeposits={pendingDeposits || 0}
      />

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <RevenueChart />
        </div>
        <RecentOrders />
      </div>
    </div>
  )
}
