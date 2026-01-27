import type React from "react"
import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { DashboardSidebar } from "@/components/dashboard/dashboard-sidebar"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { MobileBottomNav } from "@/components/dashboard/mobile-bottom-nav"

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  const { data: userProfile } = await supabase.from("users").select("*").eq("id", user.id).single()

  return (
    <>
      <div className="flex flex-col md:flex-row h-screen bg-slate-50/50 md:overflow-hidden">
        {/* Sidebar - Hidden on mobile, fixed width on desktop */}
        <div className="hidden md:flex md:w-56 lg:w-64 flex-shrink-0 md:border-r md:border-gray-200 md:dark:border-gray-800">
          <DashboardSidebar
            userName={userProfile?.full_name || user?.email || "User"}
            userBalance={userProfile?.balance || 0}
            priceMultiplier={userProfile?.price_multiplier}
          />
        </div>

        {/* Main content area */}
        <div className="flex flex-col flex-1 md:overflow-hidden w-full">
          {/* Header - Always visible */}
          <div className="flex-shrink-0 md:border-b md:border-gray-200 md:dark:border-gray-800">
            <DashboardHeader user={userProfile} />
          </div>

          {/* Main content - Scrollable, with padding for mobile bottom nav */}
          <main className="flex-1 overflow-y-auto overflow-x-hidden pb-20 md:pb-0">
            <div className="h-full w-full">
              <div className="w-full max-w-7xl mx-auto px-2 py-4 sm:px-4 md:px-6 lg:px-8">{children}</div>
            </div>
          </main>
        </div>
      </div>

      {/* Mobile Bottom Navigation */}
      <MobileBottomNav />
    </>
  )
}
