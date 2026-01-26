"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"
import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"

export function RevenueChart() {
  const [chartData, setChartData] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchRevenueData = async () => {
      try {
        const supabase = createClient()
        
        // Get completed orders from last 30 days
        const thirtyDaysAgo = new Date()
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

        const { data: orders } = await supabase
          .from("orders")
          .select("created_at, price, base_price")
          .eq("status", "completed")
          .gte("created_at", thirtyDaysAgo.toISOString())
          .order("created_at", { ascending: true })

        if (orders && orders.length > 0) {
          // Group data by date
          const groupedData: Record<string, { revenue: number; profit: number; count: number }> = {}

          orders.forEach((order) => {
            const date = new Date(order.created_at).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
            })

            if (!groupedData[date]) {
              groupedData[date] = { revenue: 0, profit: 0, count: 0 }
            }

            const revenue = Number(order.price || 0)
            const cost = Number(order.base_price || 0)
            const profit = revenue - cost

            groupedData[date].revenue += revenue
            groupedData[date].profit += profit
            groupedData[date].count += 1
          })

          const data = Object.entries(groupedData).map(([date, stats]) => ({
            date,
            revenue: Number(stats.revenue.toFixed(2)),
            profit: Number(stats.profit.toFixed(2)),
          }))

          setChartData(data)
          console.log("[v0] Revenue chart data loaded:", data.length, "days")
        } else {
          console.log("[v0] No orders found for revenue chart")
        }
      } catch (error) {
        console.error("[v0] Error fetching revenue data:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchRevenueData()
  }, [])

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Revenue Overview</CardTitle>
          <CardDescription>Last 30 days</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] flex items-center justify-center text-muted-foreground">
            <p>Loading revenue data...</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (chartData.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Revenue Overview</CardTitle>
          <CardDescription>Last 30 days</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] flex items-center justify-center text-muted-foreground">
            <p>No completed orders yet. Revenue will appear here once orders are completed.</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Revenue Overview</CardTitle>
        <CardDescription>Last 30 days - Revenue vs Profit</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={chartData} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis dataKey="date" stroke="#6b7280" />
            <YAxis stroke="#6b7280" />
            <Tooltip 
              contentStyle={{
                backgroundColor: "#fff",
                border: "1px solid #e5e7eb",
                borderRadius: "8px",
              }}
              formatter={(value) => `$${Number(value).toFixed(2)}`}
            />
            <Legend />
            <Line
              type="monotone"
              dataKey="revenue"
              stroke="#3b82f6"
              strokeWidth={2}
              dot={{ fill: "#3b82f6", r: 4 }}
              activeDot={{ r: 6 }}
            />
            <Line
              type="monotone"
              dataKey="profit"
              stroke="#10b981"
              strokeWidth={2}
              dot={{ fill: "#10b981", r: 4 }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
