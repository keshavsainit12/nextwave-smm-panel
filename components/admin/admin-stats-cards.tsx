"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { DollarSign, Users, ShoppingCart, Clock, AlertCircle, UserCheck, TrendingUp } from "lucide-react"
import { useCurrency } from "@/lib/currency-context"

interface AdminStatsCardsProps {
  totalRevenue: number
  totalProfit: number
  totalUsers: number
  activeUsers: number
  totalOrders: number
  activeOrders: number
  pendingDeposits: number
}

export function AdminStatsCards({
  totalRevenue,
  totalProfit,
  totalUsers,
  activeUsers,
  totalOrders,
  activeOrders,
  pendingDeposits,
}: AdminStatsCardsProps) {
  const { displayAmount } = useCurrency()
  
  const stats = [
    {
      title: "Total Revenue",
      value: displayAmount(totalRevenue),
      icon: DollarSign,
      description: "From completed orders",
    },
    {
      title: "Total Profit",
      value: displayAmount(totalProfit),
      icon: TrendingUp,
      description: "Revenue minus cost",
    },
    {
      title: "Total Users",
      value: totalUsers.toString(),
      icon: Users,
      description: "Registered accounts",
    },
    {
      title: "Active Users",
      value: activeUsers.toString(),
      icon: UserCheck,
      description: "Last 30 days",
    },
    {
      title: "Total Orders",
      value: totalOrders.toString(),
      icon: ShoppingCart,
      description: "All-time orders",
    },
    {
      title: "Active Orders",
      value: activeOrders.toString(),
      icon: Clock,
      description: "In progress",
    },
    {
      title: "Pending Deposits",
      value: pendingDeposits.toString(),
      icon: AlertCircle,
      description: "Awaiting approval",
    },
  ]

  return (
    <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => {
        const Icon = stat.icon
        return (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <Icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">{stat.description}</p>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
