"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useRouter } from "next/navigation"
import { 
  Bell, 
  Check, 
  CheckCheck, 
  ShoppingCart, 
  Ticket, 
  Wallet,
  AlertCircle,
  XCircle
} from "lucide-react"

interface Notification {
  id: string
  type: string
  title: string
  message: string
  link: string | null
  read: boolean
  created_at: string
  related_order_id: string | null
  related_ticket_id: string | null
  related_transaction_id: string | null
}

interface NotificationsListProps {
  initialNotifications: Notification[]
}

export function NotificationsList({ initialNotifications }: NotificationsListProps) {
  const [notifications, setNotifications] = useState<Notification[]>(initialNotifications)
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    // Subscribe to real-time notifications
    const channel = supabase
      .channel("notifications-changes")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "notifications",
        },
        (payload) => {
          setNotifications((prev) => [payload.new as Notification, ...prev])
        }
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "notifications",
        },
        (payload) => {
          setNotifications((prev) =>
            prev.map((n) => (n.id === payload.new.id ? (payload.new as Notification) : n))
          )
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [supabase])

  const markAsRead = async (id: string) => {
    await supabase.from("notifications").update({ read: true }).eq("id", id)
  }

  const markAllAsRead = async () => {
    setLoading(true)
    await supabase.from("notifications").update({ read: true }).eq("read", false)
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
    setLoading(false)
  }

  const handleNotificationClick = (notification: Notification) => {
    if (!notification.read) {
      markAsRead(notification.id)
    }
    if (notification.link) {
      router.push(notification.link)
    }
  }

  const getIcon = (type: string) => {
    switch (type) {
      case "order_placed":
      case "order_completed":
      case "order_canceled":
      case "order_partial":
      case "order_processing":
        return <ShoppingCart className="h-5 w-5" />
      case "ticket_created":
      case "ticket_replied":
      case "ticket_closed":
        return <Ticket className="h-5 w-5" />
      case "deposit_approved":
      case "deposit_rejected":
        return <Wallet className="h-5 w-5" />
      default:
        return <Bell className="h-5 w-5" />
    }
  }

  const getIconColor = (type: string) => {
    if (type.includes("completed") || type.includes("approved")) {
      return "text-green-600 bg-green-50"
    }
    if (type.includes("canceled") || type.includes("rejected")) {
      return "text-red-600 bg-red-50"
    }
    if (type.includes("processing") || type.includes("partial")) {
      return "text-yellow-600 bg-yellow-50"
    }
    return "text-blue-600 bg-blue-50"
  }

  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)
    const days = Math.floor(diff / 86400000)

    if (minutes < 1) return "Just now"
    if (minutes < 60) return `${minutes}m ago`
    if (hours < 24) return `${hours}h ago`
    if (days < 7) return `${days}d ago`
    return date.toLocaleDateString()
  }

  const unreadCount = notifications.filter((n) => !n.read).length

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-sm text-slate-600">
            {unreadCount} unread notification{unreadCount !== 1 ? "s" : ""}
          </span>
        </div>
        {unreadCount > 0 && (
          <Button
            variant="outline"
            size="sm"
            onClick={markAllAsRead}
            disabled={loading}
          >
            <CheckCheck className="h-4 w-4 mr-2" />
            Mark all as read
          </Button>
        )}
      </div>

      <div className="space-y-2">
        {notifications.length === 0 ? (
          <Card className="p-12 text-center">
            <Bell className="h-12 w-12 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-600 font-medium">No notifications yet</p>
            <p className="text-sm text-slate-500 mt-1">
              You'll see notifications here when there's activity on your account
            </p>
          </Card>
        ) : (
          notifications.map((notification) => (
            <Card
              key={notification.id}
              className={`p-4 cursor-pointer transition-all hover:shadow-md ${
                !notification.read ? "bg-blue-50/50 border-blue-200" : "bg-white"
              }`}
              onClick={() => handleNotificationClick(notification)}
            >
              <div className="flex gap-4">
                <div
                  className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${getIconColor(
                    notification.type
                  )}`}
                >
                  {getIcon(notification.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <p
                        className={`text-sm font-medium ${
                          !notification.read ? "text-slate-900" : "text-slate-700"
                        }`}
                      >
                        {notification.title}
                      </p>
                      <p className="text-sm text-slate-600 mt-1">{notification.message}</p>
                      <p className="text-xs text-slate-400 mt-2">
                        {formatTime(notification.created_at)}
                      </p>
                    </div>
                    {!notification.read && (
                      <Badge variant="default" className="bg-blue-600 flex-shrink-0">
                        New
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
