"use client"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { DashboardSidebar } from "./dashboard-sidebar"
import { Badge } from "@/components/ui/badge"
import Image from "next/image"
import { useEffect, useState } from "react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { createClient } from "@/lib/supabase/client"
import { Menu, Bell } from "lucide-react"

export function DashboardHeader({ user }: { user: any }) {
  const [notifications, setNotifications] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const supabase = createClient()

    // Fetch initial notifications
    const fetchNotifications = async () => {
      const { data: tickets } = await supabase
        .from("support_tickets")
        .select("id, subject, status, updated_at")
        .eq("user_id", user.id)
        .order("updated_at", { ascending: false })
        .limit(5)

      const { data: orders } = await supabase
        .from("orders")
        .select("id, status, created_at")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(5)

      const notifs: any[] = []

      if (tickets) {
        tickets.forEach((ticket) => {
          if (ticket.status === "replied") {
            notifs.push({
              id: `ticket-${ticket.id}`,
              message: `Admin replied to your ticket: ${ticket.subject}`,
              time: new Date(ticket.updated_at).toLocaleString(),
              read: false,
            })
          }
        })
      }

      if (orders) {
        orders.forEach((order) => {
          if (order.status === "completed") {
            notifs.push({
              id: `order-${order.id}`,
              message: `Your order #${order.id} has been completed`,
              time: new Date(order.created_at).toLocaleString(),
              read: false,
            })
          }
        })
      }

      setNotifications(notifs)
      setLoading(false)
    }

    fetchNotifications()

    const ticketChannel = supabase
      .channel("ticket-updates")
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "support_tickets",
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          if (payload.new.status === "replied") {
            setNotifications((prev) => [
              {
                id: `ticket-${payload.new.id}`,
                message: `Admin replied to your ticket: ${payload.new.subject}`,
                time: "Just now",
                read: false,
              },
              ...prev,
            ])
          }
        },
      )
      .subscribe()

    return () => {
      supabase.removeChannel(ticketChannel)
    }
  }, [user.id])

  const unreadCount = notifications.filter((n) => !n.read).length

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200/50 bg-white/80 backdrop-blur-xl">
      <div className="flex h-16 sm:h-18 md:h-20 items-center justify-between px-2 sm:px-6">
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

        <div className="hidden md:flex items-center gap-2 sm:gap-3">
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
            <DropdownMenuContent align="end" className="w-80">
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
                    className="px-4 py-3 cursor-pointer"
                    onClick={() => {
                      if (notif.id.startsWith("ticket-")) {
                        const ticketId = notif.id.replace("ticket-", "")
                        window.location.href = `/dashboard/tickets/${ticketId}`
                      }
                    }}
                  >
                    <div className="flex flex-col gap-1 w-full">
                      <p className={`text-sm ${notif.read ? "text-slate-600" : "text-slate-900 font-medium"}`}>
                        {notif.message}
                      </p>
                      <p className="text-xs text-slate-400">{notif.time}</p>
                    </div>
                  </DropdownMenuItem>
                ))
              )}
              <div className="px-4 py-2 border-t">
                <Button variant="ghost" className="w-full text-xs text-blue-600 hover:text-blue-700">
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
