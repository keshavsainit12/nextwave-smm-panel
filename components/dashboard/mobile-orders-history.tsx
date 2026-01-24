"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Download, Search, Info } from "lucide-react"

interface Order {
  id: string
  order_id: string
  status: string
  quantity: number
  total_price: number
  start_count?: number
  created_at: string
  services: {
    name: string
    platform: string | null
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
  cancelled: {
    label: "Canceled",
    bg: "bg-red-100",
    text: "text-red-700",
    progress: 0,
  },
}

// Platform icon mapping - PNG icons from blob storage
const iconMap: Record<string, string> = {
  Instagram: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-from-rawpixel-id-3344505-png-MUwyzUmruwNctIiWklZ5p3woDYRXyQ.png",
  TikTok: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/social-media-LukRdeHaWfMPqnPN0UopDTorIys0ZS.png",
  Facebook: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/facebook-6RRn4IBRaNjBYVv9LYGM6eL41qQWlW.png",
  YouTube: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/youtube%20%281%29-fnEdlaxiQiBGHtLVMsS2pDQKjwgtBu.png",
  Twitter: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/twitter-29Fes12erxMIaAdspjd7dgcWfJcwBa.png",
  Discord: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/discord-viy5WuDAnWXu9jECoyCcdiaYJjZ9l0.png",
  Telegram: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/telegram-9xtdNkV3zP6wfwWNpx57A1hNZvEqK2.png",
  LinkedIn: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/linkedin-x8OqmW2CILJ7lo8H5FhKD888W7Z6eN.png",
  Spotify: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/spotify-7ygXrRUZpZh0pQSmRoDdDCRstAA6Oa.png",
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

export function MobileOrdersHistory({ orders }: { orders: Order[] }) {
  const [searchQuery, setSearchQuery] = useState("")
  const [filterStatus, setFilterStatus] = useState("all")
  const router = useRouter()

  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order.order_id?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.services?.name?.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesFilter = filterStatus === "all" || order.status?.toLowerCase() === filterStatus
    return matchesSearch && matchesFilter
  })

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
                          src={iconUrl}
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
                        <h3 className="text-sm font-bold text-slate-900 leading-tight truncate">
                          {order.services?.name}
                        </h3>
                        <p className="text-xs text-slate-500 uppercase font-semibold tracking-wider">
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
                      <p className="text-sm font-bold text-slate-900">{order.quantity.toLocaleString()}</p>
                    </div>
                    <div className="bg-slate-50 rounded-lg p-3">
                      <p className="text-xs text-slate-600 font-medium mb-1">Total Price</p>
                      <p className="text-sm font-bold text-slate-900">${order.total_price.toFixed(2)}</p>
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
                </div>
              </div>
            )
          })
        )}
      </main>
    </div>
  )
}

export function MobileOrdersHistory({ orders }: { orders: Order[] }) {
  const [searchQuery, setSearchQuery] = useState("")
  const [filterStatus, setFilterStatus] = useState("all")
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const router = useRouter()

  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order.order_id?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.services?.name?.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesFilter = filterStatus === "all" || order.status?.toLowerCase() === filterStatus
    return matchesSearch && matchesFilter
  })

  return (
    <div className="bg-background-light dark:bg-background-dark min-h-screen pb-24 font-sans">
      {/* Header */}
      <div className="sticky top-0 z-30 bg-white/90 dark:bg-background-dark/90 backdrop-blur-md border-b border-[#dbdfe6] dark:border-gray-800">
        <div className="flex items-center justify-between p-4 pb-3">
          <h1 className="text-xl font-bold tracking-tight">Order History</h1>
          <button className="size-10 flex items-center justify-center rounded-full bg-background-light dark:bg-gray-800">
            <Download size={22} />
          </button>
        </div>

        {/* Search Bar */}
        <div className="px-4 pb-4 space-y-3">
          <div className="relative">
            <Search size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#616f89]" />
            <input
              className="w-full pl-10 pr-4 py-2.5 bg-background-light dark:bg-gray-800 border-none rounded-xl text-sm focus:ring-2 focus:ring-primary/20 transition-all"
              placeholder="Search by Order ID or Service..."
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* Filter Buttons */}
          <div className="flex gap-2 overflow-x-auto custom-scrollbar pb-1">
            {["all", "in_progress", "completed", "pending", "cancelled"].map((status) => (
              <button
                key={status}
                onClick={() => setFilterStatus(status)}
                className={`px-3 py-1.5 rounded-full text-xs font-bold shrink-0 ${
                  filterStatus === status
                    ? "bg-primary text-white"
                    : "bg-white dark:bg-gray-800 border border-[#dbdfe6] dark:border-gray-700"
                }`}
              >
                {status.charAt(0).toUpperCase() + status.slice(1).replace("_", " ")}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Orders List */}
      <main className="max-w-md mx-auto p-4 space-y-4">
        {filteredOrders.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-[#616f89] text-sm">No orders found</p>
          </div>
        ) : (
          filteredOrders.map((order) => {
            const platform = order.services?.platform?.toLowerCase() || "instagram"
            const platformInfo = platformConfig[platform as keyof typeof platformConfig] || platformConfig.instagram
            const status = order.status?.toLowerCase() || "pending"
            const statusInfo = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending
            const progress = Math.min(100, Math.max(0, statusInfo.progress))

            return (
              <div
                key={order.id}
                className="bg-white dark:bg-gray-800 rounded-xl border border-[#dbdfe6] dark:border-gray-700 shadow-sm overflow-hidden"
              >
                <div className="p-4 border-b border-gray-50 dark:border-gray-700/50">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center gap-3">
                      <div
                        className={`size-10 rounded-lg bg-${platformInfo.color}/10 text-${platformInfo.color} flex items-center justify-center shrink-0`}
                      >
                        {platformInfo.icon}
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-[#111318] dark:text-white leading-tight">
                          {order.services.name}
                        </h3>
                        <p className="text-[10px] text-[#616f89] uppercase font-bold tracking-wider">
                          Order #{order.order_id} • {order.services.platform || "Service"}
                        </p>
                      </div>
                    </div>
                    <span
                      className={`px-2.5 py-1 rounded-full ${statusInfo.bg} ${statusInfo.text} text-[10px] font-bold uppercase`}
                    >
                      {statusInfo.label}
                    </span>
                  </div>

                  {(status === "in_progress" || status === "processing") && (
                    <div className="space-y-2 mt-4">
                      <div className="flex justify-between text-[11px] font-bold text-[#616f89]">
                        <span>
                          Progress: {Math.floor((order.quantity || 0) * (progress / 100))} / {order.quantity}
                        </span>
                        <span>{progress}%</span>
                      </div>
                      <div className="w-full bg-gray-100 dark:bg-gray-700 rounded-full h-1.5 overflow-hidden">
                        <div className="bg-trust-orange h-full rounded-full" style={{ width: `${progress}%` }} />
                      </div>
                    </div>
                  )}

                  {status === "completed" && (
                    <div className="grid grid-cols-2 gap-4 mt-4">
                      <div className="p-2 rounded-lg bg-background-light dark:bg-gray-900/50">
                        <p className="text-[9px] text-[#616f89] uppercase font-bold">Start Count</p>
                        <p className="text-xs font-bold text-[#111318] dark:text-white">
                          {order.start_count?.toLocaleString() || "N/A"}
                        </p>
                      </div>
                      <div className="p-2 rounded-lg bg-background-light dark:bg-gray-900/50">
                        <p className="text-[9px] text-[#616f89] uppercase font-bold">Quantity</p>
                        <p className="text-xs font-bold text-[#111318] dark:text-white">
                          {order.quantity?.toLocaleString()}
                        </p>
                      </div>
                    </div>
                  )}

                  {status === "cancelled" && (
                    <p className="text-[11px] text-trust-red font-medium italic mt-3">
                      Refunded to your balance due to invalid URL format.
                    </p>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex items-center p-3 gap-2 bg-gray-50/50 dark:bg-gray-900/20">
                  {status === "completed" ? (
                    <>
                      <button className="flex-1 text-xs font-bold py-2 px-4 rounded-lg border border-primary/20 text-primary bg-primary/5 flex items-center justify-center gap-1">
                        <RotateCw size={14} />
                        Refill
                      </button>
                      <button
                        onClick={() => setSelectedOrder(order)}
                        className="flex-[1.5] text-xs font-bold py-2 px-4 rounded-lg bg-primary text-white shadow-sm flex items-center justify-center gap-1"
                      >
                        View Details
                      </button>
                    </>
                  ) : status === "cancelled" ? (
                    <button className="w-full text-xs font-bold py-2 px-4 rounded-lg border border-[#dbdfe6] dark:border-gray-700 text-[#616f89] dark:text-gray-400 flex items-center justify-center gap-2">
                      <Info size={16} />
                      View Cancellation Reason
                    </button>
                  ) : (
                    <>
                      <button
                        onClick={() => router.push("/dashboard/tickets")}
                        className="flex-1 text-xs font-bold py-2 px-4 rounded-lg border border-[#dbdfe6] dark:border-gray-700 text-[#616f89] dark:text-gray-400"
                      >
                        Support
                      </button>
                      <button
                        onClick={() => setSelectedOrder(order)}
                        className="flex-[1.5] text-xs font-bold py-2 px-4 rounded-lg bg-primary text-white shadow-sm flex items-center justify-center gap-1"
                      >
                        View Details
                      </button>
                    </>
                  )}
                </div>
              </div>
            )
          })
        )}
      </main>

      {/* View Details Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-end">
          <div className="w-full bg-white dark:bg-gray-800 rounded-t-2xl p-6 max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold">Order Details</h2>
              <button onClick={() => setSelectedOrder(null)} className="text-2xl leading-none text-gray-400">
                ✕
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <p className="text-xs text-[#616f89] uppercase font-bold">Order ID</p>
                <p className="text-sm font-bold">{selectedOrder.order_id}</p>
              </div>
              <div>
                <p className="text-xs text-[#616f89] uppercase font-bold">Service</p>
                <p className="text-sm font-bold">{selectedOrder.services?.name}</p>
              </div>
              <div>
                <p className="text-xs text-[#616f89] uppercase font-bold">Username / Link</p>
                <p className="text-sm font-bold break-all">{selectedOrder.link || "N/A"}</p>
              </div>
              <div>
                <p className="text-xs text-[#616f89] uppercase font-bold">Quantity</p>
                <p className="text-sm font-bold">{selectedOrder.quantity?.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-xs text-[#616f89] uppercase font-bold">Price</p>
                <p className="text-sm font-bold">${selectedOrder.total_price?.toFixed(2)}</p>
              </div>
              <div>
                <p className="text-xs text-[#616f89] uppercase font-bold">Status</p>
                <p className="text-sm font-bold capitalize">{selectedOrder.status}</p>
              </div>
              <div>
                <p className="text-xs text-[#616f89] uppercase font-bold">Created</p>
                <p className="text-sm font-bold">{new Date(selectedOrder.created_at).toLocaleString()}</p>
              </div>
            </div>

            <button
              onClick={() => setSelectedOrder(null)}
              className="w-full mt-6 py-3 bg-primary text-white rounded-lg font-bold"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white/90 dark:bg-background-dark/90 backdrop-blur-md border-t border-[#dbdfe6] dark:border-gray-800 h-20 px-6 ios-tab-shadow flex justify-between items-start pt-3 z-40">
        <button
          onClick={() => router.push("/dashboard")}
          className="flex flex-col items-center gap-1 text-[#616f89] dark:text-gray-400"
        >
          <Grid3x3 size={24} />
          <span className="text-[10px] font-medium">Dashboard</span>
        </button>
        <button className="flex flex-col items-center gap-1 text-primary">
          <ListTodo size={24} />
          <span className="text-[10px] font-bold">Orders</span>
        </button>
        <button
          onClick={() => router.push("/dashboard/profile")}
          className="flex flex-col items-center gap-1 text-[#616f89] dark:text-gray-400"
        >
          <User size={24} />
          <span className="text-[10px] font-medium">Profile</span>
        </button>
      </nav>

      {/* Floating Support Button */}
      <button
        onClick={() => router.push("/dashboard/tickets")}
        className="fixed bottom-24 right-4 size-14 rounded-full bg-primary text-white shadow-xl flex items-center justify-center z-50"
      >
        <MessageCircle size={28} />
      </button>
    </div>
  )
}
