"use client"

import {
  Home,
  History,
  Settings,
  AccountCircle,
  Notifications,
  AddCircle,
  QueryStats,
  AccountBalanceWallet,
  SupportAgent,
  TrendingUp,
  VerifiedUser,
  Layers,
} from "@mui/icons-material"
import { useRouter } from "next/navigation"
import Link from "next/link"

export function MobileDashboardSimplified({
  userBalance,
  userName,
  totalOrders,
}: {
  userBalance: number
  userName: string
  totalOrders: number
}) {
  const router = useRouter()

  return (
    <div className="relative mx-auto flex h-auto min-h-screen w-full max-w-[480px] flex-col overflow-x-hidden bg-[#f6f6f8] dark:bg-[#101622] pb-24 font-['Plus_Jakarta_Sans']">
      {/* TopAppBar */}
      <header className="flex items-center bg-white dark:bg-[#101622]/50 backdrop-blur-md sticky top-0 z-50 p-4 justify-between border-b border-[#dbdfe6]/30">
        <div className="flex size-12 items-center justify-center rounded-full bg-[#f6f6f8] dark:bg-white/10">
          <AccountCircle className="text-[#1152d4]" />
        </div>
        <h2 className="text-[#111318] dark:text-white text-lg font-bold leading-tight tracking-[-0.015em] flex-1 text-center">
          SMM Pro
        </h2>
        <div className="flex w-12 items-center justify-end">
          <button className="flex size-10 items-center justify-center rounded-full bg-[#f6f6f8] dark:bg-white/10 text-[#1152d4]">
            <Notifications />
          </button>
        </div>
      </header>

      {/* Profile/Hero Header */}
      <section className="p-4 pt-6">
        <div className="flex w-full flex-col gap-6 items-center bg-white dark:bg-white/5 p-6 rounded-lg shadow-sm">
          <div className="flex flex-col items-center justify-center">
            <div className="flex items-center gap-1.5 bg-[#1152d4]/10 text-[#1152d4] px-3 py-1 rounded-full mb-4">
              <VerifiedUser className="text-[16px]" />
              <span className="text-xs font-bold uppercase tracking-wider">Safe & Secure</span>
            </div>
            <p className="text-[#1152d4] text-[42px] font-extrabold leading-tight tracking-[-0.03em] text-center">
              ${userBalance.toFixed(2)}
            </p>
            <p className="text-[#616f89] dark:text-gray-400 text-base font-medium text-center">Available Balance</p>
          </div>
          <button
            onClick={() => router.push("/dashboard/deposit")}
            className="flex min-w-[180px] cursor-pointer items-center justify-center overflow-hidden rounded-full h-12 px-6 bg-[#1152d4] text-white text-base font-bold leading-normal tracking-[0.015em] shadow-lg shadow-[#1152d4]/30 active:scale-95 transition-transform"
          >
            <AddCircle className="mr-2" />
            <span>Add Funds</span>
          </button>
        </div>
      </section>

      {/* TextGrid / Navigation Tiles - CHANGE: Removed New Order tile */}
      <section className="px-4">
        <div className="grid grid-cols-2 gap-3">
          <Link href="/dashboard/orders">
            <div className="flex flex-col gap-3 rounded-lg border border-[#dbdfe6] dark:border-white/10 bg-white dark:bg-white/5 p-4 items-start active:bg-[#1152d4]/5 transition-colors cursor-pointer">
              <div className="bg-[#1152d4]/10 p-2 rounded-full text-[#1152d4]">
                <QueryStats />
              </div>
              <div>
                <h2 className="text-[#111318] dark:text-white text-base font-bold leading-tight">Order Status</h2>
                <p className="text-[#616f89] dark:text-gray-400 text-xs mt-1">{totalOrders} Total</p>
              </div>
            </div>
          </Link>

          <Link href="/dashboard/deposit">
            <div className="flex flex-col gap-3 rounded-lg border border-[#dbdfe6] dark:border-white/10 bg-white dark:bg-white/5 p-4 items-start active:bg-[#1152d4]/5 transition-colors cursor-pointer">
              <div className="bg-[#e2e8f0] dark:bg-white/10 p-2 rounded-full text-[#111318] dark:text-white">
                <AccountBalanceWallet />
              </div>
              <div>
                <h2 className="text-[#111318] dark:text-white text-base font-bold leading-tight">Add Funds</h2>
                <p className="text-[#616f89] dark:text-gray-400 text-xs mt-1">Top up balance</p>
              </div>
            </div>
          </Link>

          <Link href="/dashboard/tickets">
            <div className="flex flex-col gap-3 rounded-lg border border-[#dbdfe6] dark:border-white/10 bg-white dark:bg-white/5 p-4 items-start active:bg-[#1152d4]/5 transition-colors cursor-pointer">
              <div className="bg-[#e2e8f0] dark:bg-white/10 p-2 rounded-full text-[#111318] dark:text-white">
                <SupportAgent />
              </div>
              <div>
                <h2 className="text-[#111318] dark:text-white text-base font-bold leading-tight">Support</h2>
                <p className="text-[#616f89] dark:text-gray-400 text-xs mt-1">Get 24/7 help</p>
              </div>
            </div>
          </Link>

          <Link href="/dashboard/api">
            <div className="flex flex-col gap-3 rounded-lg border border-[#dbdfe6] dark:border-white/10 bg-white dark:bg-white/5 p-4 items-start active:bg-[#1152d4]/5 transition-colors cursor-pointer">
              <div className="bg-[#e2e8f0] dark:bg-white/10 p-2 rounded-full text-[#111318] dark:text-white">
                <Layers />
              </div>
              <div>
                <h2 className="text-[#111318] dark:text-white text-base font-bold leading-tight">API Access</h2>
                <p className="text-[#616f89] dark:text-gray-400 text-xs mt-1">For resellers</p>
              </div>
            </div>
          </Link>
        </div>
      </section>

      {/* Service of the Day Card (Featured) */}
      <section className="p-4">
        <div className="bg-[#1152d4] p-5 rounded-lg text-white relative overflow-hidden">
          <div className="relative z-10">
            <div className="flex justify-between items-start mb-4">
              <span className="bg-white/20 text-[10px] font-bold uppercase px-2 py-0.5 rounded tracking-widest backdrop-blur-sm">
                Featured Service
              </span>
              <div className="flex items-center gap-1 text-xs">
                <TrendingUp className="text-sm" />
                <span>99% Success</span>
              </div>
            </div>
            <h4 className="text-xl font-bold leading-tight mb-1">Instagram Real Followers</h4>
            <p className="text-white/80 text-sm mb-4">Instant delivery, non-drop guarantee.</p>
            <button
              onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
              className="bg-white text-[#1152d4] px-4 py-2 rounded-full text-sm font-bold active:scale-95 transition-transform"
            >
              Order Now
            </button>
          </div>
          {/* Abstract Background Pattern */}
          <div className="absolute top-[-20%] right-[-10%] opacity-20">
            <TrendingUp style={{ fontSize: "150px" }} className="rotate-12" />
          </div>
        </div>
      </section>

      {/* Bottom Navigation Bar (iOS Style) - CHANGE: Removed Services/new-order link */}
      <nav className="fixed bottom-0 left-0 right-0 mx-auto max-w-[480px] bg-white/90 dark:bg-[#101622]/90 backdrop-blur-lg border-t border-[#dbdfe6]/50 dark:border-white/10 px-8 py-4 flex justify-between items-center z-50">
        <Link href="/dashboard" className="flex flex-col items-center gap-1 text-[#1152d4]">
          <Home />
          <span className="text-[10px] font-bold">Home</span>
        </Link>
        <Link href="/dashboard/orders" className="flex flex-col items-center gap-1 text-[#616f89]">
          <History />
          <span className="text-[10px] font-bold">Orders</span>
        </Link>
        <Link href="/dashboard/deposit" className="flex flex-col items-center gap-1 text-[#616f89]">
          <AccountBalanceWallet />
          <span className="text-[10px] font-bold">Wallet</span>
        </Link>
        <Link href="/dashboard/profile" className="flex flex-col items-center gap-1 text-[#616f89]">
          <Settings />
          <span className="text-[10px] font-bold">Profile</span>
        </Link>
      </nav>
    </div>
  )
}
