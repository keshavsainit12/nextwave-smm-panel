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
    { data: depositData },
  ] = await Promise.all([
    supabase.from("users").select("*", { count: "exact", head: true }),
    supabase.from("orders").select("*", { count: "exact", head: true }),
    supabase.from("orders").select("*", { count: "exact", head: true }).in("status", ["pending", "processing"]),
    supabase.from("crypto_deposits").select("*", { count: "exact", head: true }).eq("status", "pending"),
    supabase.from("orders").select("id, price, quantity, status, services(base_price)").eq("status", "completed"),
    supabase.from("users").select("id").gte("last_login", thirtyDaysAgo.toISOString()).limit(1000),
    supabase.from("crypto_deposits").select("amount, status"),
  ])

  // Calculate Order Revenue & Profit (Only from completed orders)
  const orderRevenue = ordersData?.reduce((sum, order) => {
    const price = Number(order.price || 0)
    const quantity = Number(order.quantity || 0)
    const totalOrderPrice = price * quantity
    return sum + totalOrderPrice
  }, 0) || 0

  const orderCost = ordersData?.reduce((sum, order) => {
    const baseCost = Number(order.services?.base_price || 0)
    const quantity = Number(order.quantity || 0)
    const totalOrderCost = baseCost * quantity
    return sum + totalOrderCost
  }, 0) || 0

  const orderProfit = orderRevenue - orderCost

  // Calculate Deposit Revenue (Only approved deposits)
  const depositRevenue = depositData?.reduce((sum, deposit) => {
    if (deposit.status === "approved") {
      return sum + Number(deposit.amount || 0)
    }
    return sum
  }, 0) || 0

  // Total Revenue = Orders + Deposits
  const totalRevenue = orderRevenue + depositRevenue

  // Total Profit = Order Profit (deposits don't have costs)
  const totalProfit = orderProfit

  const activeUsersCount = activeUsersData?.length || 0

  console.log("[v0] Admin Dashboard Calculations:", {
    orderRevenue: orderRevenue.toFixed(2),
    orderCost: orderCost.toFixed(2),
    orderProfit: orderProfit.toFixed(2),
    depositRevenue: depositRevenue.toFixed(2),
    totalRevenue: totalRevenue.toFixed(2),
    totalProfit: totalProfit.toFixed(2),
  })

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
