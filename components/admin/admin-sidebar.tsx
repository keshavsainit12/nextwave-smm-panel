"use client"

import { Avatar } from "@/components/ui/avatar"
import { SheetContent } from "@/components/ui/sheet"
import { SheetTrigger } from "@/components/ui/sheet"
import { Sheet } from "@/components/ui/sheet"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import { toast } from "react-toastify"
import { createClient } from "@/lib/supabase/client"
import {
  LayoutDashboard,
  Bitcoin,
  Plug,
  Users,
  ShoppingCart,
  Ticket,
  Settings,
  TrendingUp,
  Gift,
  LogOut,
  Activity,
  Menu,
  Receipt,
  Zap,
  ImageIcon,
} from "lucide-react"

const navigation = [
  { name: "Dashboard", href: "/admin-panel-2024", icon: LayoutDashboard },
  { name: "Transaction History", href: "/admin-panel-2024/transaction-history", icon: Receipt },
  { name: "Process Payments", href: "/admin-panel-2024/process-payments", icon: Zap },
  { name: "Services", href: "/admin-panel-2024/services", icon: ShoppingCart },
  { name: "Icon Manager", href: "/admin-panel-2024/icon-manager", icon: ImageIcon },
  { name: "Crypto Settings", href: "/admin-panel-2024/crypto", icon: Bitcoin },
  { name: "API Providers", href: "/admin-panel-2024/api-providers", icon: Plug },
  { name: "Users", href: "/admin-panel-2024/users", icon: Users },
  { name: "Orders", href: "/admin-panel-2024/orders", icon: TrendingUp },
  { name: "Deposits", href: "/admin-panel-2024/deposits", icon: TrendingUp },
  { name: "Tickets", href: "/admin-panel-2024/tickets", icon: Ticket },
  { name: "Coupons", href: "/admin-panel-2024/coupons", icon: Gift },
  { name: "Activity Logs", href: "/admin-panel-2024/logs", icon: Activity },
  { name: "Settings", href: "/admin-panel-2024/settings", icon: Settings },
]

function SidebarContent({ pathname, handleLogout, onClose, userEmail }: { pathname: string; handleLogout: () => Promise<void>; onClose?: () => void; userEmail?: string }) {
  return (
    <>
      <div className="flex h-20 items-center justify-center border-b bg-white/50 backdrop-blur-sm px-6">
        <div className="flex flex-col items-center">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">Admin Panel</h2>

        </div>
      </div>
      <nav className="flex-1 space-y-1 overflow-y-auto p-4">
        {navigation.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href
          return (
            <Link
              key={item.name}
              href={item.href}
              onClick={onClose}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all",
                isActive
                  ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-md"
                  : "text-slate-700 hover:bg-white/70 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800/70",
              )}
            >
              <Icon className="h-5 w-5 flex-shrink-0" />
              <span className="truncate">{item.name}</span>
            </Link>
          )
        })}
      </nav>
      <div className="border-t bg-white/50 backdrop-blur-sm p-4">
        <Button
          variant="outline"
          className="w-full justify-start bg-transparent hover:bg-red-50 hover:text-red-600 hover:border-red-300"
          onClick={() => {
            onClose?.()
            handleLogout()
          }}
        >
          <LogOut className="mr-2 h-4 w-4" />
          Logout
        </Button>
      </div>
    </>
  )
}

export function AdminSidebar({ userEmail, isMobile, onClose }: { userEmail?: string; isMobile?: boolean; onClose?: () => void }) {
  const pathname = usePathname()
  const router = useRouter()

  const handleLogout = async () => {
    try {
      const supabase = createClient()
      await supabase.auth.signOut()
      
      toast.success("Logged out successfully")
      router.push("/auth/login")
      router.refresh()
    } catch (error) {
      toast.error("Logout failed")
    }
  }

  // For mobile view (inside Sheet), render only the content
  if (isMobile) {
    return <SidebarContent pathname={pathname} handleLogout={handleLogout} onClose={onClose} userEmail={userEmail} />
  }

  // For desktop view, render with container
  return (
    <div className="w-64 h-screen flex flex-col border-r bg-white/70 backdrop-blur-lg shadow-xl sticky top-0">
      <SidebarContent pathname={pathname} handleLogout={handleLogout} userEmail={userEmail} />
    </div>
  )
}
