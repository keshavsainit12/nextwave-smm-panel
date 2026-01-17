import { createAdminClient } from "@/lib/supabase/admin"
import { AdminStatsCards } from "@/components/admin/admin-stats-cards"
import { RevenueChart } from "@/components/admin/revenue-chart"
import { RecentOrders } from "@/components/admin/recent-orders"

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
    supabase.from("users").select("*", { count: "exact", head: true }),
    supabase.from("orders").select("*", { count: "exact", head: true }),
    supabase.from("orders").select("*", { count: "exact", head: true }).in("status", ["pending", "processing"]),
    supabase.from("crypto_deposits").select("*", { count: "exact", head: true }).eq("status", "pending"),
    supabase.from("orders").select("total_price, base_price").eq("status", "completed"),
    supabase.from("users").select("id").gte("last_login", thirtyDaysAgo.toISOString()).limit(1000),
  ])

  const totalRevenue = ordersData?.reduce((sum, order) => sum + Number(order.total_price || 0), 0) || 0
  const totalCost = ordersData?.reduce((sum, order) => sum + Number(order.base_price || 0), 0) || 0
  const totalProfit = totalRevenue - totalCost

  const activeUsersCount = activeUsersData?.length || 0

  console.log("[v0] Admin Dashboard Stats - Revenue:", totalRevenue, "Profit:", totalProfit, "Users:", totalUsers)

  return (
    <div className="space-y-8">
      <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-100">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          Admin Dashboard
        </h1>
        <p className="text-gray-600 mt-2 text-lg">Welcome back! Here's what's happening today.</p>
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
