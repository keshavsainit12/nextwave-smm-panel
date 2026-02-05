"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { DollarSign, TrendingUp, Zap, ShoppingCart } from "lucide-react"
import { useCurrency } from "@/lib/currency-context"

interface AdminTransactionStatsProps {
  totalRevenue: number
  totalProfit: number
  totalInstantPaymentAmount: number
  totalCryptoDepositAmount: number
}

export function AdminTransactionStats({
  totalRevenue,
  totalProfit,
  totalInstantPaymentAmount,
  totalCryptoDepositAmount,
}: AdminTransactionStatsProps) {
  const { displayAmount } = useCurrency()

  const stats = [
    {
      title: "Total Revenue (Orders)",
      value: displayAmount(totalRevenue),
      icon: DollarSign,
      description: "From completed orders",
      color: "text-blue-600",
    },
    {
      title: "Total Profit",
      value: displayAmount(totalProfit),
      icon: TrendingUp,
      description: "Revenue - Cost",
      color: "text-green-600",
    },
    {
      title: "Instant Payments",
      value: displayAmount(totalInstantPaymentAmount),
      icon: Zap,
      description: "XAF deposits",
      color: "text-purple-600",
    },
    {
      title: "Crypto Deposits",
      value: displayAmount(totalCryptoDepositAmount),
      icon: ShoppingCart,
      description: "Cryptocurrency",
      color: "text-orange-600",
    },
  ]

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => {
        const Icon = stat.icon
        return (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <Icon className={`h-4 w-4 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${stat.color === "text-green-600" ? "text-green-600" : ""}`}>
                {stat.value}
              </div>
              <p className="text-xs text-muted-foreground">{stat.description}</p>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
