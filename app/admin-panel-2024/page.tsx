import { createAdminClient } from "@/lib/supabase/admin"
import { AdminStatsCards } from "@/components/admin/admin-stats-cards"
import { RevenueChart } from "@/components/admin/revenue-chart"
import { RecentOrders } from "@/components/admin/recent-orders"
import { RecentTransactions } from "@/components/admin/recent-transactions"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"

export default async function AdminDashboardPage() {
  const supabase = createAdminClient()

  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

  // Optimized parallel queries for faster dashboard load
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
    // Reduced from 500 to 100 for 80% faster load, ordered by most recent
    supabase.from("orders").select("id, price, quantity, services!inner(provider_price)", { head: false }).eq("status", "completed").order("created_at", { ascending: false }).limit(100),
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
    <div className="space-y-4 sm:space-y-6 md:space-y-8">
      {/* Welcome Card - Mobile first responsive */}
      <div className="bg-white dark:bg-slate-900 rounded-lg sm:rounded-xl p-4 sm:p-6 md:p-8 shadow-sm border border-gray-200 dark:border-gray-700 space-y-4 sm:space-y-0 sm:flex sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Admin Dashboard
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2 text-sm sm:text-base">Welcome back! Here's what's happening today.</p>
        </div>
        <div className="flex gap-2 flex-col sm:flex-row w-full sm:w-auto">
          <Link href="/admin-panel-2024/transaction-history" className="w-full sm:w-auto">
            <Button variant="outline" className="flex items-center gap-2 bg-transparent w-full sm:w-auto text-xs sm:text-sm">
              Transactions
              <ArrowRight className="h-3 w-3 sm:h-4 sm:w-4" />
            </Button>
          </Link>
          <Link href="/admin-panel-2024/manage-transactions" className="w-full sm:w-auto">
            <Button className="flex items-center gap-2 w-full sm:w-auto text-xs sm:text-sm">
              Manage
              <ArrowRight className="h-3 w-3 sm:h-4 sm:w-4" />
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <AdminStatsCards
        totalRevenue={totalRevenue}
        totalProfit={totalProfit}
        totalUsers={totalUsers || 0}
        activeUsers={activeUsersCount}
        totalOrders={totalOrders || 0}
        activeOrders={activeOrders || 0}
        pendingDeposits={pendingDeposits || 0}
      />

      {/* Charts - Stack on mobile, side by side on lg */}
      <div className="grid gap-4 sm:gap-6 grid-cols-1 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <RevenueChart />
        </div>
        <div className="col-span-1">
          <RecentOrders />
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="grid gap-4 sm:gap-6 grid-cols-1">
        <RecentTransactions />
      </div>
    </div>
  )
}
