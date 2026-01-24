"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { LayoutDashboard, Package, Wallet, User } from "lucide-react"

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Orders", href: "/dashboard/orders", icon: Package },
  { name: "Balance", href: "/dashboard/deposit", icon: Wallet },
  { name: "Profile", href: "/dashboard/profile", icon: User },
]

export function MobileBottomNav() {
  const pathname = usePathname()

  return (
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
                "flex flex-col items-center justify-center w-full h-full gap-1 text-xs font-medium transition-colors duration-200",
                isActive
                  ? "text-blue-600 dark:text-blue-400 border-t-2 border-blue-600 dark:border-blue-400"
                  : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200",
              )}
            >
              <Icon className="h-5 w-5" />
              <span>{item.name}</span>
            </Link>
          )
        })}
      </nav>
    </div>
  )
}
