import type React from "react"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { AdminSidebar } from "@/components/admin/admin-sidebar"
import { MobileAdminMenu } from "@/components/admin/mobile-admin-menu"
import { CurrencyProvider } from "@/lib/currency-context"
import { getCurrency } from "@/lib/currency"
import { createAdminClient } from "@/lib/supabase/admin"

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies()
  const adminSession = cookieStore.get("admin_session")

  if (!adminSession || adminSession.value !== "authenticated") {
    redirect("/admin-login")
  }

  // Get system currency settings
  const supabase = createAdminClient()
  const { data: currencySettings } = await supabase
    .from("system_settings")
    .select("value")
    .eq("key", "currency")
    .single()

  const { data: currencySymbolSettings } = await supabase
    .from("system_settings")
    .select("value")
    .eq("key", "currency_symbol")
    .single()

  const currency = currencySettings?.value || "USD"
  const currencySymbol = currencySymbolSettings?.value || getCurrency(currency)?.symbol || "$"

  return (
    <CurrencyProvider currency={currency} currencySymbol={currencySymbol}>
    <div className="flex flex-col h-screen bg-slate-50 dark:bg-slate-950 lg:overflow-hidden">
      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-4 z-30">
        <h1 className="text-xl font-bold text-slate-900 dark:text-white">Admin</h1>
        <MobileAdminMenu />
      </div>

      <div className="flex flex-1 pt-16 lg:pt-0 lg:overflow-hidden">
        {/* Sidebar - Hidden on mobile, visible on lg */}
        <aside className="hidden lg:flex lg:w-64 flex-shrink-0 border-r border-slate-200 dark:border-slate-800 overflow-y-auto">
          <AdminSidebar />
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto w-full lg:overflow-x-hidden">
          <div className="w-full">
            <div className="w-full max-w-7xl mx-auto px-3 py-4 sm:px-4 sm:py-6 md:px-6 md:py-8 lg:px-8">{children}</div>
          </div>
        </main>
      </div>
    </div>
    </CurrencyProvider>
  )
}
