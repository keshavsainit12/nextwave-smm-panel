"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { Home, Package, HeadphonesIcon, Gift, Code, LogOut, Settings, Receipt, Crown, Star, Wallet } from "lucide-react"
import { useCurrency } from "@/lib/currency-context"

// Tier configuration based on price_multiplier
const getTierInfo = (priceMultiplier: number | undefined | null) => {
  const multiplier = priceMultiplier ?? 3.0
  if (multiplier <= 1.5) return { name: "VIP Elite", color: "from-amber-500 to-yellow-400", textColor: "text-amber-600", bgColor: "bg-amber-100", icon: Crown }
  if (multiplier <= 2) return { name: "Reseller", color: "from-purple-500 to-indigo-500", textColor: "text-purple-600", bgColor: "bg-purple-100", icon: Star }
  if (multiplier <= 2.5) return { name: "Bulk Buyer", color: "from-blue-500 to-cyan-500", textColor: "text-blue-600", bgColor: "bg-blue-100", icon: Star }
  return { name: "Basic User", color: "from-slate-400 to-slate-500", textColor: "text-slate-600", bgColor: "bg-slate-100", icon: null }
}

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: Home },
  { name: "My Orders", href: "/dashboard/orders", icon: Package },
  { name: "Transaction History", href: "/dashboard/transaction-history", icon: Receipt },
  { name: "API Access", href: "/dashboard/api", icon: Code },
  { name: "Support", href: "/dashboard/tickets", icon: HeadphonesIcon },
  { name: "Referrals", href: "/dashboard/referrals", icon: Gift },
  { name: "Settings", href: "/dashboard/settings", icon: Settings },
]

export function DashboardSidebar({ userName = "User", userBalance = 0, priceMultiplier }: { userName?: string; userBalance?: number; priceMultiplier?: number }) {
  const tierInfo = getTierInfo(priceMultiplier)
  const pathname = usePathname()
  const router = useRouter()
  const { displayAmount } = useCurrency()

  const getCartoonAvatar = (name: string) => {
    const char = name.charAt(0).toUpperCase()
    const cartoons: { [key: string]: string } = {
      A: "🦁",
      B: "🐻",
      C: "😺",
      D: "🦆",
      E: "🐘",
      F: "🦊",
      G: "🦒",
      H: "🦔",
      I: "🐿️",
      J: "🤖",
      K: "🦋",
      L: "🦙",
      M: "🐵",
      N: "🐦",
      O: "🦉",
      P: "🐧",
      Q: "👑",
      R: "🐰",
      S: "🦈",
      T: "🐯",
      U: "🦃",
      V: "🧛",
      W: "🐺",
      X: "❌",
      Y: "🦅",
      Z: "⚡",
    }
    return cartoons[char] || "😊"
  }

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push("/")
  }

  return (
    <div className="flex h-full w-full flex-col bg-white dark:bg-slate-900 border-r border-slate-200/50 dark:border-slate-800/50">
      {/* User Profile Header */}
      <div className="p-4 sm:p-6 border-b border-slate-200/50 dark:border-slate-800/50">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-2xl flex-shrink-0 border-2 border-blue-200/30">
              {getCartoonAvatar(userName)}
            </div>
            <div className="absolute -bottom-0.5 -right-0.5 bg-green-500 text-white p-0.5 rounded-full ring-2 ring-white dark:ring-slate-900">
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5">
              <p className={`text-xs font-semibold uppercase tracking-wider ${tierInfo.textColor}`}>
                {tierInfo.name}
              </p>
              {tierInfo.icon && (
                <tierInfo.icon className={`w-3.5 h-3.5 ${tierInfo.textColor}`} />
              )}
            </div>
            <p className="font-bold text-sm sm:text-base text-slate-900 dark:text-white truncate">{userName}</p>
          </div>
        </div>
      </div>

      {/* Wallet Balance */}
      <div className="px-4 sm:px-6 py-3 border-b border-slate-200/50 dark:border-slate-800/50 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-slate-800 dark:to-slate-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-white dark:bg-slate-800 rounded-lg">
              <Wallet className="w-4 h-4 text-blue-600" />
            </div>
            <div>
              <p className="text-xs text-slate-600 dark:text-slate-400 font-medium">Wallet Balance</p>
              <p className="text-lg font-bold text-slate-900 dark:text-white">{displayAmount(userBalance)}</p>
            </div>
          </div>
          <Link href="/dashboard/deposit">
            <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white text-xs px-3 py-1 h-auto">
              Add Funds
            </Button>
          </Link>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4 sm:py-6 px-3 sm:px-4 space-y-1">
        {navigation.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + "/")
          const IconComponent = item.icon
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 sm:px-4 py-2.5 sm:py-3 rounded-2xl transition-all duration-200 text-sm font-medium",
                isActive
                  ? "bg-blue-600 text-white shadow-lg shadow-blue-600/20"
                  : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50",
              )}
            >
              <IconComponent className="w-5 h-5 flex-shrink-0" />
              <span className="flex-1">{item.name}</span>
              {item.badge && (
                <span className="bg-green-500/10 text-green-600 text-[10px] font-bold px-2 py-0.5 rounded-full whitespace-nowrap">
                  {item.badge}
                </span>
              )}
            </Link>
          )
        })}
      </nav>

      {/* Logout */}
      <div className="border-t border-slate-200/50 dark:border-slate-800/50 p-3 sm:p-4">
        <Button
          className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-2xl text-sm font-semibold"
          variant="ghost"
          onClick={handleLogout}
        >
          <LogOut className="w-5 h-5 mr-3" />
          Sign Out
        </Button>
      </div>
    </div>
  )
}
