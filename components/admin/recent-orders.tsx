"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { formatDistance } from "date-fns"
import { Badge } from "@/components/ui/badge"
import { Loader2 } from "lucide-react"
import { useCurrency } from "@/lib/currency-context"

export function RecentOrders() {
  const [orders, setOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const { displayAmount } = useCurrency()

  useEffect(() => {
    const fetchOrders = async () => {
      const supabase = createClient()
      const { data } = await supabase
        .from("orders")
        .select("*, services(name, icon), users(email, full_name)")
        .order("created_at", { ascending: false })
        .limit(10)

      setOrders(data || [])
      setLoading(false)
    }

    fetchOrders()

    // Set up real-time subscription
    const supabase = createClient()
    const channel = supabase
      .channel("recent-orders")
      .on("postgres_changes", { event: "*", schema: "public", table: "orders" }, () => {
        fetchOrders()
      })
      .subscribe()

    return () => {
      channel.unsubscribe()
    }
  }, [])

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Orders</CardTitle>
          <CardDescription>Latest order activity</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Orders</CardTitle>
        <CardDescription>Latest order activity (live)</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {orders.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">No recent orders</div>
          ) : (
            orders.map((order) => (
              <div key={order.id} className="flex items-center justify-between border-b pb-3 last:border-0 gap-3">
                {order.services?.icon && (
                  <img
                    src={order.services.icon || "/placeholder.svg"}
                    alt={order.services.name}
                    className="h-8 w-8 rounded object-contain bg-muted p-1 flex-shrink-0"
                    onError={(e) => {
                      e.currentTarget.style.display = "none"
                    }}
                  />
                )}
                <div className="space-y-1 flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{order.services?.name || "Unknown Service"}</p>
                  <p className="text-xs text-muted-foreground truncate">
                    {order.users?.full_name || order.users?.email} • {displayAmount(order.total_price || order.price || 0)}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {formatDistance(new Date(order.created_at), new Date(), { addSuffix: true })}
                  </p>
                </div>
                <Badge
                  variant={
                    order.status === "completed"
                      ? "default"
                      : order.status === "cancelled"
                        ? "destructive"
                        : "secondary"
                  }
                >
                  {order.status}
                </Badge>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  )
}
