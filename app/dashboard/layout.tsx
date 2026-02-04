import type React from "react"
import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { DashboardSidebar } from "@/components/dashboard/dashboard-sidebar"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { MobileBottomNav } from "@/components/dashboard/mobile-bottom-nav"
import { CurrencyProvider } from "@/lib/currency-context"
import { getCurrency } from "@/lib/currency"


export default async function DashboardLayout({
children,
}: {
children: React.ReactNode
}) {
const supabase = await createClient()


const {
data: { user },
} = await supabase.auth.getUser()


if (!user) {
redirect("/auth/login")
}


  // Get user profile with basic fields
  const { data: userProfile, error: profileError } = await supabase
    .from("users")
    .select("*")
    .eq("id", user.id)
    .single()

  if (profileError) {
    console.error("[v0] Dashboard layout - user profile error:", profileError)
    redirect("/auth/login")
  }

  // Note: Removed auto-redirect for admins - they can access both dashboard and admin panel

  // Get system currency settings
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
<div className="flex flex-col md:flex-row h-screen bg-slate-50/50 md:overflow-hidden">
{/* Sidebar */}
<div className="hidden md:flex md:w-56 lg:w-64 flex-shrink-0 md:border-r md:border-gray-200 md:dark:border-gray-800">
        <DashboardSidebar
          userName={userProfile?.full_name || user?.email || "User"}
          userBalance={userProfile?.balance || 0}
          priceMultiplier={userProfile?.price_multiplier}
          userRole={userProfile?.role}
        />
</div>


{/* Main */}
<div className="flex flex-col flex-1 md:overflow-hidden w-full">
{/* Header */}
<div className="flex-shrink-0 md:border-b md:border-gray-200 md:dark:border-gray-800">
        <DashboardHeader
          user={userProfile}
          priceMultiplier={userProfile?.price_multiplier}
        />
</div>


{/* Content */}
<main className="flex-1 overflow-y-auto overflow-x-hidden pb-20 md:pb-0">
<div className="h-full w-full">
<div className="w-full max-w-7xl mx-auto px-2 py-4 sm:px-4 md:px-6 lg:px-8">
{children}
</div>
</div>
</main>
</div>
</div>


{/* Mobile Nav */}
<MobileBottomNav />
</CurrencyProvider>
)
}
