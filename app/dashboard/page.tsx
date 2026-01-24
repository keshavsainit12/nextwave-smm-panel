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

  const [{ data: userProfile }, { data: orders }, { data: services }, { data: categories }] = await Promise.all([
    supabase.from("users").select("balance, total_orders, total_spent, full_name").eq("id", user.id).single(),
    supabase
      .from("orders")
      .select("*, services(name, icon, platform)")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(10),
    // Fetch services with optional category relationship (left join instead of inner)
    supabase
      .from("services")
      .select("id, name, icon, category_id, platform, min_quantity, max_quantity, base_price, has_refill, is_active, description, service_categories(id, name, icon)")
      .eq("is_active", true),
    supabase.from("service_categories").select("*").order("name"),
  ])

  // Transform services to use category icon if service icon is missing
  const transformedServices = services?.map((service: any) => {
    const serviceIcon = service.icon || service.service_categories?.icon || null
    return {
      ...service,
      icon: serviceIcon,
    }
  }) || []

  const firstName = userProfile?.full_name?.split(' ')[0] || ''

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
        />
      </div>
    </div>
  )
}
