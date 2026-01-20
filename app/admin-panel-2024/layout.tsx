import type React from "react"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { AdminSidebar } from "@/components/admin/admin-sidebar"

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies()
  const adminSession = cookieStore.get("admin_session")

  if (!adminSession || adminSession.value !== "authenticated") {
    redirect("/admin-login")
  }

  return (
    <div className="relative flex min-h-screen flex-col lg:flex-row bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 overflow-hidden">
      {/* Animated background orbs */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden z-0">
        <div className="animate-blob absolute -left-4 top-0 h-72 w-72 rounded-full bg-purple-300 opacity-70 mix-blend-multiply blur-xl filter"></div>
        <div className="animate-blob animation-delay-2000 absolute -right-4 top-0 h-72 w-72 rounded-full bg-blue-300 opacity-70 mix-blend-multiply blur-xl filter"></div>
        <div className="animate-blob animation-delay-4000 absolute -bottom-8 left-20 h-72 w-72 rounded-full bg-pink-300 opacity-70 mix-blend-multiply blur-xl filter"></div>
      </div>

      {/* Sidebar */}
      <div className="relative z-40">
        <AdminSidebar />
      </div>

      {/* Main Content */}
      <main className="relative z-10 flex-1 overflow-y-auto pt-16 lg:pt-0">
        <div className="w-full min-h-screen">
          <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-6 md:px-6 lg:px-8 xl:px-10">
            {children}
          </div>
        </div>
      </main>
    </div>
  )
}
