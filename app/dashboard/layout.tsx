import type React from "react"
import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { DashboardSidebar } from "@/components/dashboard/dashboard-sidebar"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"

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
    <div className="flex h-screen bg-slate-50/50 overflow-hidden">
      <div className="hidden md:flex md:w-56 lg:w-64 flex-shrink-0">
        <DashboardSidebar
          userName={userProfile?.full_name || user?.email || "User"}
          userBalance={userProfile?.balance || 0}
        />
      </div>

      <div className="flex flex-1 flex-col overflow-hidden min-w-0">
        <DashboardHeader user={userProfile} />
        <main className="flex-1 overflow-y-auto">
          <div className="h-full flex justify-center">
            <div className="w-full max-w-7xl px-2 py-4 sm:px-4 md:px-6 lg:px-8">{children}</div>
          </div>
        </main>
      </div>
    </div>
  )
}
