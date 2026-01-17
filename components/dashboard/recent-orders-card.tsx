import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { formatDistance } from "date-fns"

export function RecentOrdersCard({ orders }: { orders: any[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Orders</CardTitle>
      </CardHeader>
      <CardContent>
        {orders.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">No orders yet</div>
        ) : (
          <div className="space-y-3">
            {orders.map((order) => (
              <div key={order.id} className="flex items-center justify-between p-3 rounded-lg border">
                <div className="flex-1">
                  <div className="font-medium">{order.services?.name}</div>
                  <div className="text-sm text-muted-foreground">
                    {formatDistance(new Date(order.created_at), new Date(), { addSuffix: true })}
                  </div>
                </div>
                <Badge variant={order.status === "completed" ? "default" : "secondary"}>{order.status}</Badge>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
