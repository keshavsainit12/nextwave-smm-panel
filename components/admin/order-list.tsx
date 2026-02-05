"use client"

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Eye } from "lucide-react"
import { formatDistance } from "date-fns"
import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { updateOrderStatus, cancelOrder } from "@/app/actions/admin-orders"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { useCurrency } from "@/lib/currency-context"

const statusColors: Record<string, "default" | "secondary" | "destructive"> = {
  pending: "secondary",
  processing: "default",
  completed: "default",
  partial: "secondary",
  canceled: "destructive",
  cancelled: "destructive",
}

export function OrderList({ orders }: { orders: any[] }) {
  const [selectedOrder, setSelectedOrder] = useState<any>(null)
  const [newStatus, setNewStatus] = useState("")
  const [adminNotes, setAdminNotes] = useState("")
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const { displayAmount } = useCurrency()

  const handleStatusUpdate = async () => {
    if (!selectedOrder || !newStatus) return

    setLoading(true)
    try {
      const result = await updateOrderStatus(selectedOrder.id, newStatus, adminNotes || undefined)
      if (result.error) throw new Error(result.error)

      toast.success(`Order status updated to ${newStatus}`)
      setSelectedOrder(null)
      setNewStatus("")
      setAdminNotes("")
      router.refresh()
    } catch (error: any) {
      toast.error(error.message || "Failed to update order status")
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = async () => {
    if (!selectedOrder) return

    const reason = prompt("Enter cancellation reason:")
    if (!reason) return

    setLoading(true)
    try {
      const result = await cancelOrder(selectedOrder.id, reason)
      if (result.error) throw new Error(result.error)

      toast.success("Order cancelled and balance refunded")
      setSelectedOrder(null)
      router.refresh()
    } catch (error: any) {
      toast.error(error.message || "Failed to cancel order")
    } finally {
      setLoading(false)
    }
  }

  if (orders.length === 0) {
    return <div className="text-center py-8 text-muted-foreground">No orders found</div>
  }

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Order ID</TableHead>
            <TableHead>User</TableHead>
            <TableHead>Service</TableHead>
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
              <TableCell className="font-mono text-sm font-bold text-blue-600">
                <span className="bg-blue-50 dark:bg-blue-900/20 px-3 py-1 rounded">#{order.order_id}</span>
              </TableCell>
              <TableCell>
                <div className="text-sm">{order.users?.full_name || order.users?.email}</div>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  {order.services?.icon && (
                    <img
                      src={order.services.icon || "/placeholder.svg"}
                      alt={order.services.name}
                      className="h-6 w-6 rounded object-contain bg-muted p-0.5 flex-shrink-0"
                      onError={(e) => {
                        e.currentTarget.style.display = "none"
                      }}
                    />
                  )}
                  <div>
                    <div className="text-sm font-medium">{order.services?.name || "N/A"}</div>
                    <div className="text-xs text-muted-foreground">{order.services?.platform}</div>
                  </div>
                </div>
              </TableCell>
              <TableCell>{order.quantity?.toLocaleString() || 0}</TableCell>
              <TableCell className="font-mono">{displayAmount(order.total_price || order.price || 0)}</TableCell>
              <TableCell>
                <Badge variant={statusColors[order.status] || "default"}>{order.status}</Badge>
              </TableCell>
              <TableCell className="text-sm text-muted-foreground">
                {formatDistance(new Date(order.created_at), new Date(), { addSuffix: true })}
              </TableCell>
              <TableCell className="text-right">
                <Button variant="ghost" size="icon" onClick={() => setSelectedOrder(order)} title="Manage Order">
                  <Eye className="h-4 w-4" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <Dialog open={!!selectedOrder} onOpenChange={() => setSelectedOrder(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Manage Order {selectedOrder?.id?.slice(0, 8)}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4 p-4 bg-gradient-to-r from-blue-50 to-slate-50 dark:from-blue-900/20 dark:to-slate-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
              <div>
                <div className="text-xs text-muted-foreground font-semibold">Order ID</div>
                <div className="font-mono font-bold text-lg text-blue-600">{selectedOrder?.order_id}</div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground font-semibold">User</div>
                <div className="font-medium">{selectedOrder?.users?.full_name || selectedOrder?.users?.email}</div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground font-semibold">Service</div>
                <div className="font-medium">{selectedOrder?.services?.name}</div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground font-semibold">Link</div>
                <div className="font-mono text-sm truncate">{selectedOrder?.link}</div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground font-semibold">Quantity</div>
                <div className="font-medium">{selectedOrder?.quantity?.toLocaleString()}</div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground font-semibold">Total Price</div>
                <div className="font-mono font-semibold text-green-600">
                  {displayAmount(selectedOrder?.price || selectedOrder?.total_price || 0)}
                </div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground font-semibold">Status</div>
                <Badge variant={statusColors[selectedOrder?.status] || "default"}>{selectedOrder?.status}</Badge>
              </div>
              <div>
                <div className="text-xs text-muted-foreground font-semibold">Created</div>
                <div className="text-sm">{new Date(selectedOrder?.created_at).toLocaleDateString()}</div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Update Status</Label>
              <Select value={newStatus} onValueChange={setNewStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="Select new status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="processing">Processing</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="partial">Partial</SelectItem>
                  <SelectItem value="refunded">Refunded</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Admin Notes (Optional)</Label>
              <Textarea
                id="notes"
                placeholder="Add notes about this status change..."
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                rows={3}
              />
            </div>

            <div className="flex gap-2">
              <Button onClick={handleStatusUpdate} disabled={loading || !newStatus} className="flex-1">
                {loading ? "Updating..." : "Update Status"}
              </Button>
              <Button variant="destructive" onClick={handleCancel} disabled={loading}>
                Cancel & Refund
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
