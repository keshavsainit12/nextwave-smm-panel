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
    const [{ data: userProfile, error: profileError }, { data: orders, error: ordersError }, { data: services, error: servicesError }, { data: categories, error: categoriesError }] = await Promise.all([
      supabase.from("users").select("balance, total_orders, total_spent, full_name, price_multiplier").eq("id", user.id).single(),
      supabase
        .from("orders")
        .select("id, user_id, service_id, quantity, price, status, created_at")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(10),
      supabase
        .from("services")
        .select("id, name, icon, platform, category_id, min_quantity, max_quantity, base_price, price, has_refill, is_active, description")
        .eq("is_active", true),
      supabase
        .from("service_categories")
        .select("*")
        .order("name"),
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

    const transformedServices = services?.map((service: any) => ({
      ...service,
    })) || []

    const firstName = userProfile?.full_name?.split(' ')[0] || 'User'

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
