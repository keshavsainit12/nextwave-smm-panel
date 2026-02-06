"use client"

import React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Download, Search, Info, MessageCircle, RefreshCw, X, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { createTicket } from "@/app/actions/tickets"
import { requestRefill, cancelOrder } from "@/app/actions/orders"
import { toast } from "sonner"

import { displayAmount } from "@/lib/currency"
interface Order {
  id: string
  order_id: string
  status: string
  quantity: number
  price: number
  start_count?: number
  created_at: string
  can_refill?: boolean
  services: {
    name: string
    platform: string | null
    can_cancel?: boolean
    cancel?: boolean
  }
}

const statusConfig = {
  completed: {
    label: "Completed",
    bg: "bg-green-100",
    text: "text-green-700",
    progress: 100,
  },
  in_progress: {
    label: "In Progress",
    bg: "bg-blue-100",
    text: "text-blue-700",
    progress: 42,
  },
  processing: {
    label: "In Progress",
    bg: "bg-blue-100",
    text: "text-blue-700",
    progress: 30,
  },
  pending: {
    label: "Pending",
    bg: "bg-slate-100",
    text: "text-slate-600",
    progress: 10,
  },
  canceled: {
    label: "Canceled",
    bg: "bg-red-100",
    text: "text-red-700",
    progress: 0,
  },
  cancelled: {
    label: "Canceled",
    bg: "bg-red-100",
    text: "text-red-700",
    progress: 0,
  },
}

// Platform icon mapping - PNG icons from blob storage
const iconMap: Record<string, string> = {
  Instagram: "/images/image-from-rawpixel-id-3344505-png.png",
  TikTok: "/images/social-media.png",
  Facebook: "/images/facebook.png",
  YouTube: "/images/youtube-20-281-29.png",
  Twitter: "/images/twitter.png",
  Discord: "/images/discord.png",
  Telegram: "/images/telegram.png",
  LinkedIn: "/images/linkedin.png",
  Spotify: "/images/spotify.png",
}

const getIconUrl = (serviceName: string): string | undefined => {
  let platformName = serviceName || ''
  
  // Extract platform name from service name (e.g., "Instagram - Likes" -> "Instagram")
  if (platformName.includes(' - ')) {
    platformName = platformName.split(' - ')[0].trim()
  }
  
  // Try exact match in icon map
  if (iconMap[platformName]) {
    return iconMap[platformName]
  }
  
  // Try matching the start of the platform name (case-insensitive)
  for (const [key, url] of Object.entries(iconMap)) {
    if (platformName.toLowerCase().includes(key.toLowerCase()) || key.toLowerCase().includes(platformName.toLowerCase())) {
      return url
    }
  }
  
  return undefined
}

export function MobileOrdersHistory({ orders, currency, currencySymbol }: { orders: Order[], currency: string, currencySymbol: string }) {
  const [searchQuery, setSearchQuery] = useState("")
  const [filterStatus, setFilterStatus] = useState("all")
  const [ticketDialogOpen, setTicketDialogOpen] = useState(false)
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null)
  const [ticketLoading, setTicketLoading] = useState(false)
  const [refillLoading, setRefillLoading] = useState<string | null>(null)
  const [cancelLoading, setCancelLoading] = useState<string | null>(null)
  const router = useRouter()

  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order.order_id?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.services?.name?.toLowerCase().includes(searchQuery.toLowerCase())
    
    // Fix status matching to handle in_progress -> processing and canceled/cancelled
    let matchesFilter = filterStatus === "all"
    if (!matchesFilter) {
      const orderStatus = order.status?.toLowerCase() || ""
      if (filterStatus === "in_progress") {
        // Match both "processing" and "in_progress" statuses
        matchesFilter = orderStatus === "processing" || orderStatus === "in_progress"
      } else if (filterStatus === "cancelled") {
        // Match both "canceled" and "cancelled" spellings
        matchesFilter = orderStatus === "canceled" || orderStatus === "cancelled"
      } else {
        matchesFilter = orderStatus === filterStatus
      }
    }
    
    return matchesSearch && matchesFilter
  })

  const handleCreateTicket = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setTicketLoading(true)

    try {
      const formData = new FormData(e.currentTarget)
      formData.append("order_id", selectedOrderId || "")
      
      const result = await createTicket(formData)

      if (result && result.success) {
        toast.success("Support ticket created! We'll help you shortly.")
        setTicketDialogOpen(false)
        setSelectedOrderId(null)
        if (e.currentTarget) {
          e.currentTarget.reset()
        }
        router.refresh()
      } else {
        toast.error("Failed to create ticket. Please try again.")
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to create ticket. Please try again.")
    } finally {
      setTicketLoading(false)
    }
  }

  const handleRefill = async (orderId: string) => {
    setRefillLoading(orderId)
    try {
      const result = await requestRefill(orderId)
      if (result.success) {
        toast.success(result.message || "Refill requested successfully")
        router.refresh()
      } else {
        toast.error(result.error || "Failed to request refill")
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to request refill")
    } finally {
      setRefillLoading(null)
    }
  }

  const handleCancel = async (orderId: string) => {
    if (!confirm("Are you sure you want to cancel this order? You will be refunded.")) {
      return
    }

    setCancelLoading(orderId)
    try {
      const result = await cancelOrder(orderId)
      if (result.success) {
        toast.success(result.message || "Order cancelled successfully")
        router.refresh()
      } else {
        toast.error(result.error || "Failed to cancel order")
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to cancel order")
    } finally {
      setCancelLoading(null)
    }
  }

  return (
    <div className="min-h-screen pb-24 bg-gradient-to-b from-slate-50 to-white">
      {/* Header */}
      <div className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200/50 shadow-sm">
        <div className="flex items-center justify-between p-4 pb-3">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Order History</h1>
          <button className="h-10 w-10 flex items-center justify-center rounded-full bg-slate-100 hover:bg-slate-200 transition-colors">
            <Download size={20} className="text-slate-700" />
          </button>
        </div>

        {/* Search Bar */}
        <div className="px-4 pb-4 space-y-3">
          <div className="relative">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
              placeholder="Search by Order ID or Service..."
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* Filter Buttons */}
          <div className="flex gap-2 overflow-x-auto pb-1">
            {["all", "in_progress", "completed", "pending", "cancelled"].map((status) => (
              <button
                key={status}
                onClick={() => setFilterStatus(status)}
                className={`px-4 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                  filterStatus === status
                    ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg"
                    : "bg-white border border-slate-200 text-slate-700 hover:border-slate-300"
                }`}
              >
                {status === "all" ? "All" : status.charAt(0).toUpperCase() + status.slice(1).replace("_", " ")}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Orders List */}
      <main className="max-w-md mx-auto p-4 space-y-4">
        {filteredOrders.length === 0 ? (
          <div className="text-center py-12">
            <Info className="h-12 w-12 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-600 text-sm font-medium">No orders found</p>
          </div>
        ) : (
          filteredOrders.map((order) => {
            const iconUrl = getIconUrl(order.services?.name || "")
            const status = order.status?.toLowerCase() || "pending"
            const statusInfo = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending
            const progress = Math.min(100, Math.max(0, statusInfo.progress))

            return (
              <div
                key={order.id}
                className="bg-white border border-slate-200/50 rounded-xl shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="p-4 border-b border-slate-100">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center gap-3 flex-1">
                      {iconUrl ? (
                        <img
                          src={iconUrl || "/placeholder.svg"}
                          alt={order.services?.name}
                          className="h-10 w-10 rounded-lg object-contain flex-shrink-0"
                          crossOrigin="anonymous"
                          onError={(e) => {
                            e.currentTarget.style.display = "none"
                          }}
                        />
                      ) : (
                        <div className="h-10 w-10 rounded-lg bg-slate-100 flex items-center justify-center flex-shrink-0">
                          <span className="text-lg">📱</span>
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm font-bold text-slate-900 leading-tight break-words line-clamp-2">
                          {order.services?.name}
                        </h3>
                        <p className="text-xs text-slate-500 uppercase font-semibold tracking-wider truncate">
                          Order #{order.order_id}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className={`inline-block px-3 py-1 rounded-lg text-xs font-bold ${statusInfo.bg} ${statusInfo.text}`}>
                        {statusInfo.label}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="p-4 space-y-3">
                  {/* Progress Bar */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-600 font-medium">Progress</span>
                      <span className="font-bold text-slate-900">{progress}%</span>
                    </div>
                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full transition-all"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>

                  {/* Details Grid */}
                  <div className="grid grid-cols-2 gap-3 py-2">
                    <div className="bg-slate-50 rounded-lg p-3">
                      <p className="text-xs text-slate-600 font-medium mb-1">Quantity</p>
                      <p className="text-sm font-bold text-slate-900">{(order.quantity || 0).toLocaleString()}</p>
                    </div>
                    <div className="bg-slate-50 rounded-lg p-3">
                      <p className="text-xs text-slate-600 font-medium mb-1">Total Price</p>
                      <p className="text-sm font-bold text-slate-900">{displayAmount(order.price, currency)}</p>
                    </div>
                  </div>

                  {/* Date */}
                  <div className="text-xs text-slate-500">
                    {new Date(order.created_at).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2 pt-3 border-t border-slate-100">
                    <Button
                      type="button"
                      onClick={() => {
                        setSelectedOrderId(order.order_id)
                        setTicketDialogOpen(true)
                      }}
                      className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold h-9 flex items-center justify-center gap-2"
                    >
                      <MessageCircle size={16} />
                      Get Support
                    </Button>
                    
                    {/* Cancel Button - Priority for pending/processing orders */}
                    {(order.services?.can_cancel || order.services?.cancel) && (status === "pending" || status === "processing") && (
                      <Button
                        type="button"
                        variant="destructive"
                        onClick={() => handleCancel(order.id)}
                        disabled={cancelLoading === order.id || refillLoading === order.id}
                        aria-busy={cancelLoading === order.id}
                        aria-label={cancelLoading === order.id ? "Cancelling order" : "Cancel order"}
                        className="flex-1 h-9 flex items-center justify-center gap-2"
                      >
                        {cancelLoading === order.id ? (
                          <Loader2 size={16} className="animate-spin" />
                        ) : (
                          <X size={16} />
                        )}
                        {cancelLoading === order.id ? "Cancelling..." : "Cancel"}
                      </Button>
                    )}
                    
                    {/* Refill Button - Only for completed orders (use common sense!) */}
                    {(order.can_refill || order.services?.has_refill) && status === "completed" && (
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => handleRefill(order.id)}
                        disabled={refillLoading === order.id || cancelLoading === order.id}
                        aria-busy={refillLoading === order.id}
                        aria-label={refillLoading === order.id ? "Refilling order" : "Refill order"}
                        className="flex-1 border-slate-200 text-slate-700 hover:bg-slate-50 font-semibold h-9 flex items-center justify-center gap-2 bg-transparent"
                      >
                        <RefreshCw size={16} className={refillLoading === order.id ? "animate-spin" : ""} />
                        {refillLoading === order.id ? "Refilling..." : "Refill"}
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            )
          })
        )}
      </main>

      {/* Support Ticket Dialog */}
      <Dialog open={ticketDialogOpen} onOpenChange={setTicketDialogOpen}>
        <DialogContent className="max-h-[90vh] w-full max-w-[95vw] overflow-y-auto sm:max-w-[550px] bg-gradient-to-b from-slate-50 to-white rounded-2xl border border-slate-200/50 shadow-xl">
          <DialogHeader className="border-b border-slate-200/50 pb-4">
            <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Create Support Ticket
            </DialogTitle>
            <DialogDescription className="text-sm text-slate-600 mt-2">
              {selectedOrderId && <div className="mb-2">Order ID: <strong>#{selectedOrderId}</strong></div>}
              <span>Describe your issue and we'll help you resolve it quickly</span>
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreateTicket} className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="subject" className="text-sm font-semibold text-slate-700">Subject *</Label>
              <Input 
                id="subject" 
                name="subject" 
                placeholder="Brief description of your issue" 
                required 
                className="h-11 bg-white border-slate-200 focus:border-blue-500 focus:ring-blue-500/20"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="priority" className="text-sm font-semibold text-slate-700">Priority</Label>
              <Select name="priority" defaultValue="normal">
                <SelectTrigger className="h-11 bg-white border-slate-200 focus:border-blue-500">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-white border-slate-200">
                  <SelectItem value="low">Low Priority</SelectItem>
                  <SelectItem value="normal">Normal Priority</SelectItem>
                  <SelectItem value="high">High Priority</SelectItem>
                  <SelectItem value="urgent">Urgent</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="message" className="text-sm font-semibold text-slate-700">Message *</Label>
              <Textarea 
                id="message" 
                name="message" 
                rows={5} 
                placeholder="Detailed description of your issue..." 
                required 
                className="bg-white border-slate-200 focus:border-blue-500 focus:ring-blue-500/20 resize-none"
              />
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setTicketDialogOpen(false)}
                className="border-slate-200 text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={ticketLoading}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold disabled:opacity-50"
              >
                {ticketLoading ? "Creating..." : "Create Ticket"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
