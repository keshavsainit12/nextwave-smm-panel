"use client"

import { Avatar } from "@/components/ui/avatar"
import { SheetContent } from "@/components/ui/sheet"
import { SheetTrigger } from "@/components/ui/sheet"
import { Sheet } from "@/components/ui/sheet"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import Image from "next/image"
import { usePathname, useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import { toast } from "react-toastify"
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
} from "lucide-react"

const navigation = [
  { name: "Dashboard", href: "/admin-panel-2024", icon: LayoutDashboard },
  { name: "Transaction History", href: "/admin-panel-2024/transaction-history", icon: Receipt },
  { name: "Crypto Settings", href: "/admin-panel-2024/crypto", icon: Bitcoin },
  { name: "API Providers", href: "/admin-panel-2024/api-providers", icon: Plug },
  { name: "Users", href: "/admin-panel-2024/users", icon: Users },
  { name: "Orders", href: "/admin-panel-2024/orders", icon: ShoppingCart },
  { name: "Deposits", href: "/admin-panel-2024/deposits", icon: TrendingUp },
  { name: "Tickets", href: "/admin-panel-2024/tickets", icon: Ticket },
  { name: "Coupons", href: "/admin-panel-2024/coupons", icon: Gift },
  { name: "Activity Logs", href: "/admin-panel-2024/logs", icon: Activity },
  { name: "Settings", href: "/admin-panel-2024/settings", icon: Settings },
]

function SidebarContent({ pathname, handleLogout }: { pathname: string; handleLogout: () => Promise<void> }) {
  return (
    <>
      <div className="flex h-20 items-center justify-center border-b bg-white/50 backdrop-blur-sm px-6">
        {/* Removed NextWave logo from desktop sidebar, improved mobile header spacing, added user avatar section similar to user dashboard */}
      </div>
      <nav className="flex-1 space-y-1 overflow-y-auto p-4">
        {navigation.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href
          return (
            <Link
              key={item.name}
              href={item.href}
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
          onClick={handleLogout}
        >
          <LogOut className="mr-2 h-4 w-4" />
          Logout
        </Button>
      </div>
    </>
  )
}

export function AdminSidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const [open, setOpen] = useState(false)

  const handleLogout = async () => {
    try {
      const response = await fetch("/api/admin/logout", {
        method: "POST",
      })

      if (response.ok) {
        toast.success("Logged out successfully")
        router.push("/admin-login")
        router.refresh()
      }
    } catch (error) {
      toast.error("Logout failed")
    }
  }

  return (
    <>
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 flex items-center justify-between h-16 px-4 bg-white/80 backdrop-blur-md border-b shadow-sm">
        <Image src="/logo.png" alt="NextWave SMM" width={160} height={40} className="h-10 w-auto" priority />
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button variant="outline" size="icon" className="lg:hidden bg-transparent">
              <Menu className="h-5 w-5" />
              <span className="sr-only">Toggle menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-72 p-0 bg-white/95 backdrop-blur-lg">
            <div className="flex h-full flex-col">
              <div className="flex items-center justify-center py-4">
                <Avatar className="h-10 w-10 bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm">
                  A
                </Avatar>
                <div className="flex flex-col">
                  <span className="text-sm font-semibold text-slate-900 dark:text-white">Admin</span>
                  <span className="text-xs text-slate-500 dark:text-slate-400">Super Admin</span>
                </div>
              </div>
              <SidebarContent pathname={pathname} handleLogout={handleLogout} />
            </div>
          </SheetContent>
        </Sheet>
      </div>

      <div className="hidden lg:flex w-64 flex-col border-r bg-white/70 backdrop-blur-lg shadow-xl">
        <div className="flex items-center justify-between py-4">
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10 bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm">
              A
            </Avatar>
            <div className="flex flex-col">
              <span className="text-sm font-semibold text-slate-900 dark:text-white">Admin</span>
              <span className="text-xs text-slate-500 dark:text-slate-400">Super Admin</span>
            </div>
          </div>
        </div>
        <SidebarContent pathname={pathname} handleLogout={handleLogout} />
      </div>
    </>
  )
}
