"use client"

import { useRouter } from "next/navigation"
import { Grid3x3, ListTodo, User, MessageCircle, Crown, Star } from "lucide-react"
import { Badge } from "@/components/ui/badge"

interface UserProfile {
  id: string
  email: string
  full_name: string
  tier: number
  balance: number
  status: string
  total_orders: number
  total_spent: number
  created_at: string
  price_multiplier?: number
}

export function MobileProfile({ user, userProfile }: { user: any; userProfile: UserProfile }) {
  const router = useRouter()
  
  // Calculate tier based on price_multiplier (like in sidebar)
  let tierName = "Normal User"
  let tierColor = "bg-gray-500"
  let tierIcon = null
  let discountPercent = 0
  
  if (userProfile?.price_multiplier) {
    const multiplier = userProfile.price_multiplier
    const normalMultiplier = 3.0
    discountPercent = ((normalMultiplier - multiplier) / normalMultiplier) * 100
    
    if (multiplier <= 2) {
      tierName = "Reseller"
      tierColor = "bg-purple-500"
      tierIcon = <Star className="h-3 w-3" />
    } else if (multiplier <= 2.5) {
      tierName = "Bulk Buyer"
      tierColor = "bg-blue-500"
      tierIcon = <Star className="h-3 w-3" />
    } else if (multiplier < 3) {
      tierName = "VIP"
      tierColor = "bg-yellow-500"
      tierIcon = <Crown className="h-3 w-3" />
    }
  }

  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark pb-24 font-sans">
      {/* Header */}
      <div className="bg-gradient-to-b from-primary/10 to-transparent pt-6 pb-8 px-4">
        <div className="text-center">
          <div className="size-16 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-3">
            <User size={32} className="text-primary" />
          </div>
          <h2 className="text-lg font-bold text-[#111318] dark:text-white">{userProfile?.full_name || "User"}</h2>
          <div className="flex items-center justify-center gap-2 mt-2">
            {tierName !== "Normal User" && (
              <Badge className={`${tierColor} text-white border-0 px-2 py-1 flex items-center gap-1`}>
                {tierIcon}
                <span className="font-bold">{tierName}</span>
              </Badge>
            )}
            {tierName === "Normal User" && (
              <p className="text-sm text-[#616f89]">{tierName}</p>
            )}
          </div>
          {discountPercent > 0 && (
            <div className="mt-2">
              <span className="text-xs font-semibold text-green-600 bg-green-50 px-2 py-1 rounded">
                {discountPercent.toFixed(0)}% OFF on all services
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <main className="max-w-md mx-auto px-4 space-y-4 py-4">
        {/* Balance Card */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-[#dbdfe6] dark:border-gray-700 p-4">
          <p className="text-[11px] text-[#616f89] uppercase font-bold mb-1">Current Balance</p>
          <p className="text-2xl font-bold text-primary">${Number(userProfile?.balance || 0).toFixed(2)}</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-[#dbdfe6] dark:border-gray-700 p-3">
            <p className="text-[10px] text-[#616f89] uppercase font-bold mb-2">Total Orders</p>
            <p className="text-xl font-bold text-[#111318] dark:text-white">{userProfile?.total_orders || 0}</p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-[#dbdfe6] dark:border-gray-700 p-3">
            <p className="text-[10px] text-[#616f89] uppercase font-bold mb-2">Lifetime Spent</p>
            <p className="text-xl font-bold text-[#111318] dark:text-white">
              ${Number(userProfile?.total_spent || 0).toFixed(2)}
            </p>
          </div>
        </div>

        {/* Account Info */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-[#dbdfe6] dark:border-gray-700 p-4 space-y-4">
          <div>
            <p className="text-[11px] text-[#616f89] uppercase font-bold mb-1">Email</p>
            <p className="text-sm font-medium text-[#111318] dark:text-white">{user?.email}</p>
          </div>
          <div>
            <p className="text-[11px] text-[#616f89] uppercase font-bold mb-1">Status</p>
            <div className="inline-block px-2 py-1 rounded-full bg-green-100/50 text-green-700 text-xs font-bold">
              {userProfile?.status || "Active"}
            </div>
          </div>
          <div>
            <p className="text-[11px] text-[#616f89] uppercase font-bold mb-1">Member Since</p>
            <p className="text-sm font-medium text-[#111318] dark:text-white">
              {new Date(userProfile?.created_at || "").toLocaleDateString()}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-2">
          <button className="w-full px-4 py-3 rounded-lg bg-primary text-white font-bold text-sm">Add Funds</button>
          <button className="w-full px-4 py-3 rounded-lg bg-white dark:bg-gray-800 border border-[#dbdfe6] dark:border-gray-700 text-[#616f89] dark:text-gray-400 font-bold text-sm">
            Change Password
          </button>
        </div>
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white/90 dark:bg-background-dark/90 backdrop-blur-md border-t border-[#dbdfe6] dark:border-gray-800 h-20 px-6 flex justify-between items-start pt-3 z-40">
        <button
          onClick={() => router.push("/dashboard")}
          className="flex flex-col items-center gap-1 text-[#616f89] dark:text-gray-400"
        >
          <Grid3x3 size={24} />
          <span className="text-[10px] font-medium">Dashboard</span>
        </button>
        <button
          onClick={() => router.push("/dashboard/orders")}
          className="flex flex-col items-center gap-1 text-[#616f89] dark:text-gray-400"
        >
          <ListTodo size={24} />
          <span className="text-[10px] font-medium">Orders</span>
        </button>
        <button className="flex flex-col items-center gap-1 text-primary">
          <User size={24} />
          <span className="text-[10px] font-bold">Profile</span>
        </button>
      </nav>

      {/* Support Button */}
      <button
        onClick={() => router.push("/dashboard/tickets")}
        className="fixed bottom-24 right-4 size-14 rounded-full bg-primary text-white shadow-xl flex items-center justify-center z-50"
      >
        <MessageCircle size={28} />
      </button>
    </div>
  )
}
