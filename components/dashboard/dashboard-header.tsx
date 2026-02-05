"use client"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { DashboardSidebar } from "./dashboard-sidebar"
import { Badge } from "@/components/ui/badge"
import Image from "next/image"
import { useEffect, useState } from "react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { createClient } from "@/lib/supabase/client"
import { Menu, Bell, ShoppingCart, Ticket, Wallet } from "lucide-react"
import { useRouter } from "next/navigation"

interface Notification {
  id: string
  type: string
  title: string
  message: string
  link: string | null
  read: boolean
  created_at: string
}

export function DashboardHeader({ user }: { user: any }) {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const supabase = createClient()

    // Fetch initial notifications
    const fetchNotifications = async () => {
      const { data, error } = await supabase
        .from("notifications")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(10)

      if (data) {
        setNotifications(data)
      }
      setLoading(false)
    }

    fetchNotifications()

    // Subscribe to real-time notifications
    const channel = supabase
      .channel("header-notifications")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "notifications",
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          setNotifications((prev) => [payload.new as Notification, ...prev.slice(0, 9)])
        }
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "notifications",
          filter: `user_id=eq.${user.id}`,
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
  }, [user.id])

  const unreadCount = notifications.filter((n) => !n.read).length

  const markAsRead = async (id: string) => {
    const supabase = createClient()
    await supabase.from("notifications").update({ read: true }).eq("id", id)
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
    if (type.includes("order")) {
      return <ShoppingCart className="h-4 w-4" />
    }
    if (type.includes("ticket")) {
      return <Ticket className="h-4 w-4" />
    }
    if (type.includes("deposit")) {
      return <Wallet className="h-4 w-4" />
    }
    return <Bell className="h-4 w-4" />
  }

  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)

    if (minutes < 1) return "Just now"
    if (minutes < 60) return `${minutes}m ago`
    if (hours < 24) return `${hours}h ago`
    return date.toLocaleDateString()
  }

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200/50 bg-white/80 backdrop-blur-xl">
      <div className="flex h-14 sm:h-14 md:h-14 items-center justify-between px-2 sm:px-6">
        <div className="flex items-center gap-2 sm:gap-3">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="lg:hidden h-10 w-10">
                <Menu className="h-6 w-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-64 p-0">
              <DashboardSidebar />
            </SheetContent>
          </Sheet>

          <div className="lg:hidden">
            <Image
              src="/logo.png"
              alt="NextWave SMM"
              width={450}
              height={112}
              className="w-36 sm:w-44 md:w-52 h-auto"
              priority
            />
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="relative h-9 w-9">
                <Bell className="h-5 w-5" />
                {unreadCount > 0 && (
                  <Badge className="absolute -top-1 -right-1 h-4 w-4 sm:h-5 sm:w-5 rounded-full p-0 flex items-center justify-center bg-red-500 text-[10px] sm:text-xs">
                    {unreadCount}
                  </Badge>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80 max-h-[500px] overflow-y-auto">
              <div className="px-4 py-3 border-b">
                <h3 className="font-semibold text-sm">Notifications</h3>
              </div>
              {loading ? (
                <div className="px-4 py-6 text-center text-sm text-slate-500">Loading...</div>
              ) : notifications.length === 0 ? (
                <div className="px-4 py-6 text-center text-sm text-slate-500">No notifications yet</div>
              ) : (
                notifications.map((notif) => (
                  <DropdownMenuItem
                    key={notif.id}
                    className={`px-4 py-3 cursor-pointer ${!notif.read ? "bg-blue-50/50" : ""}`}
                    onClick={() => handleNotificationClick(notif)}
                  >
                    <div className="flex gap-3 w-full">
                      <div className="flex-shrink-0 mt-1">{getIcon(notif.type)}</div>
                      <div className="flex flex-col gap-1 flex-1 min-w-0">
                        <p className={`text-sm ${notif.read ? "text-slate-600" : "text-slate-900 font-medium"}`}>
                          {notif.title}
                        </p>
                        <p className="text-xs text-slate-500 line-clamp-2">{notif.message}</p>
                        <p className="text-xs text-slate-400">{formatTime(notif.created_at)}</p>
                      </div>
                      {!notif.read && (
                        <div className="flex-shrink-0">
                          <div className="h-2 w-2 bg-blue-600 rounded-full"></div>
                        </div>
                      )}
                    </div>
                  </DropdownMenuItem>
                ))
              )}
              <div className="px-4 py-2 border-t">
                <Button
                  variant="ghost"
                  className="w-full text-xs text-blue-600 hover:text-blue-700"
                  onClick={() => router.push("/dashboard/notifications")}
                >
                  View All Notifications
                </Button>
              </div>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}
