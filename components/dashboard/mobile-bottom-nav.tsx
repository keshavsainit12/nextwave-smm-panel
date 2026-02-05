"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { LayoutDashboard, Package, User, Bell } from "lucide-react"
import { useState, useEffect } from "react"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Settings } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { Badge } from "@/components/ui/badge"

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Orders", href: "/dashboard/orders", icon: Package },
  { name: "Notifications", href: "/dashboard/notifications", icon: Bell, showBadge: true },
  { name: "Profile", href: "/dashboard/profile", icon: User },
]

export function MobileBottomNav() {
  const pathname = usePathname()
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)
  const supabase = createClient()

  useEffect(() => {
    // Fetch unread count
    const fetchUnreadCount = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { count } = await supabase
        .from("notifications")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user.id)
        .eq("read", false)

      if (count !== null) {
        setUnreadCount(count)
      }
    }

    fetchUnreadCount()

    // Subscribe to real-time updates
    const channel = supabase
      .channel("mobile-nav-notifications")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "notifications",
        },
        () => {
          fetchUnreadCount()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [supabase])

  return (
    <>
      <div className="fixed bottom-0 left-0 right-0 z-40 md:hidden bg-white dark:bg-slate-900 border-t border-gray-200 dark:border-gray-800">
        <nav className="flex items-center justify-around h-16">
          {navigation.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href

            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "flex flex-col items-center justify-center w-full h-full gap-1 text-xs font-medium transition-colors duration-200 relative",
                  isActive
                    ? "text-blue-600 dark:text-blue-400 border-t-2 border-blue-600 dark:border-blue-400"
                    : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200",
                )}
              >
                <div className="relative">
                  <Icon className="h-5 w-5" />
                  {item.showBadge && unreadCount > 0 && (
                    <Badge className="absolute -top-2 -right-2 h-4 w-4 rounded-full p-0 flex items-center justify-center bg-red-500 text-[8px]">
                      {unreadCount > 9 ? "9+" : unreadCount}
                    </Badge>
                  )}
                </div>
                <span>{item.name}</span>
              </Link>
            )
          })}
        </nav>
      </div>
    </>
  )
}
