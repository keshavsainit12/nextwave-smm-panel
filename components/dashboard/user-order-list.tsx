"use client"

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { formatDistance } from "date-fns"
import { RefreshCw, X } from "lucide-react"
import { requestRefill, cancelOrder } from "@/app/actions/orders"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"
import { useState } from "react"

const statusColors: Record<string, "default" | "secondary" | "destructive"> = {
  pending: "secondary",
  processing: "default",
  completed: "default",
  partial: "secondary",
  canceled: "destructive",
}

export function UserOrderList({ orders }: { orders: any[] }) {
  const router = useRouter()
  const { toast } = useToast()
  const [loading, setLoading] = useState<string | null>(null)

  const handleRefill = async (orderId: string) => {
    setLoading(orderId)
    try {
      const result = await requestRefill(orderId)
      if (result.success) {
        toast({
          title: "Success",
          description: result.message,
        })
        router.refresh()
      } else {
        toast({
          title: "Error",
          description: result.error,
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: String(error),
        variant: "destructive",
      })
    } finally {
      setLoading(null)
    }
  }

  const handleCancel = async (orderId: string) => {
    if (!confirm("Are you sure you want to cancel this order? You will be refunded.")) {
      return
    }

    setLoading(orderId)
    try {
      const result = await cancelOrder(orderId)
      if (result.success) {
        toast({
          title: "Success",
          description: result.message,
        })
        router.refresh()
      } else {
        toast({
          title: "Error",
          description: result.error,
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: String(error),
        variant: "destructive",
      })
    } finally {
      setLoading(null)
    }
  }

  if (orders.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground mb-4">You haven't placed any orders yet</p>
        <a href="/dashboard/new-order">
          <Button>Browse Services</Button>
        </a>
      </div>
    )
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Service</TableHead>
          <TableHead>Link</TableHead>
          <TableHead>Quantity</TableHead>
          <TableHead>Price</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Date</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {orders.map((order) => (
          <TableRow key={order.id}>
            <TableCell>
              <div>
                <div className="font-medium">{order.services?.name || "N/A"}</div>
                <div className="text-xs text-muted-foreground">{order.services?.platform}</div>
              </div>
            </TableCell>
            <TableCell>
              <code className="text-xs bg-muted px-2 py-1 rounded">{order.link.slice(0, 30)}...</code>
            </TableCell>
            <TableCell>{order.quantity.toLocaleString()}</TableCell>
            <TableCell className="font-mono">${order.price.toFixed(2)}</TableCell>
            <TableCell>
              <Badge variant={statusColors[order.status] || "default"}>{order.status}</Badge>
            </TableCell>
            <TableCell className="text-sm text-muted-foreground">
              {formatDistance(new Date(order.created_at), new Date(), { addSuffix: true })}
            </TableCell>
            <TableCell className="text-right">
              <div className="flex justify-end gap-2">
                {order.can_refill && order.status === "completed" && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRefill(order.id)}
                    disabled={loading === order.id}
                  >
                    <RefreshCw className={`h-3 w-3 mr-1 ${loading === order.id ? "animate-spin" : ""}`} />
                    Refill
                  </Button>
                )}
                {(order.status === "pending" || order.status === "processing") && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleCancel(order.id)}
                    disabled={loading === order.id}
                  >
                    <X className="h-3 w-3 mr-1" />
                    Cancel
                  </Button>
                )}
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
