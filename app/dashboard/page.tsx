import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { MobileHighTrustDashboard } from "@/components/dashboard/mobile-high-trust-dashboard"
import { DesktopDashboard } from "@/components/dashboard/desktop-dashboard"

export default async function DashboardPage() {
  const supabase = await createClient()

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (!user || authError) {
    redirect("/auth/login")
  }

  try {
    const [{ data: userProfile, error: profileError }, { data: orders, error: ordersError }, { data: services, error: servicesError }, { data: categories, error: categoriesError }, { data: systemSettings, error: settingsError }] = await Promise.all([
      supabase.from("users").select("balance, total_orders, total_spent, full_name, price_multiplier").eq("id", user.id).single(),
      supabase
        .from("orders")
        .select("id, user_id, service_id, quantity, price, status, created_at")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(10),
      supabase
        .from("services")
        .select("id, name, icon, platform, category_id, min_quantity, max_quantity, base_price, has_refill, is_active, description")
        .eq("is_active", true),
      supabase
        .from("service_categories")
        .select("*")
        .order("name"),
      supabase
        .from("system_settings")
        .select("key, value")
        .in("key", ["currency", "currency_symbol"]),
    ])

    if (profileError && profileError.code !== "PGRST116") {
      console.error("[v0] Profile fetch error:", profileError)
      return (
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <p className="text-red-600 mb-4">Error loading profile</p>
            <p className="text-gray-600">{profileError?.message}</p>
          </div>
        </div>
      )
    }

    // Log any other errors but don't block the page
    if (ordersError) console.error("[v0] Orders fetch error:", ordersError)
    if (servicesError) console.error("[v0] Services fetch error:", servicesError)
    if (categoriesError) console.error("[v0] Categories fetch error:", categoriesError)
    if (settingsError) console.error("[v0] Settings fetch error:", settingsError)

    const userMultiplier = userProfile?.price_multiplier || 3.0
    
    // Transform service prices based on user's multiplier
    const transformedServices = services?.map((service: any) => {
      const basePriceForNormal = Number(service.base_price || 0)
      // base_price is stored for normal users (3x markup)
      // Calculate provider cost, then apply user's multiplier
      const providerCost = basePriceForNormal / 3.0
      const userPrice = providerCost * userMultiplier
      
      return {
        ...service,
        base_price: userPrice,  // Override with user-specific price
        original_base_price: basePriceForNormal,  // Keep original for reference
      }
    }) || []

    const firstName = userProfile?.full_name?.split(' ')[0] || 'User'
    
    // Get system-wide currency (set by admin, applies to ALL users)
    const settingsMap = systemSettings?.reduce((acc: Record<string, string>, setting: any) => {
      acc[setting.key] = setting.value
      return acc
    }, {}) || {}
    const systemCurrency = settingsMap.currency || 'USD'

    return (
      <div className="min-h-screen">
        <div className="md:hidden">
          <MobileHighTrustDashboard
            services={transformedServices}
            categories={categories || []}
            userBalance={userProfile?.balance || 0}
            userName={firstName}
            totalOrders={userProfile?.total_orders || 0}
            totalSpent={userProfile?.total_spent || 0}
            recentOrders={orders || []}
            priceMultiplier={userProfile?.price_multiplier}
            userCurrency={systemCurrency}
          />
        </div>

        <div className="hidden md:block">
          <DesktopDashboard
            services={transformedServices}
            categories={categories || []}
            userBalance={userProfile?.balance || 0}
            userName={firstName}
            totalOrders={userProfile?.total_orders || 0}
            totalSpent={userProfile?.total_spent || 0}
            recentOrders={orders || []}
            priceMultiplier={userProfile?.price_multiplier}
            userCurrency={systemCurrency}
          />
        </div>
      </div>
    )
  } catch (error) {
    console.error("[v0] Dashboard error:", error)
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-red-600 mb-4">Error loading dashboard</p>
          <p className="text-gray-600">{error instanceof Error ? error.message : "Unknown error"}</p>
        </div>
      </div>
    )
  }
}
