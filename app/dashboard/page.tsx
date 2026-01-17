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
      .select("*, services(name, platform)")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(10),
    supabase.from("services").select("*, service_categories(name, icon)").eq("is_active", true),
    supabase.from("service_categories").select("*").order("name"),
  ])

  const firstName = userProfile?.full_name?.split(" ")[0] || "User"

  console.log("[v0] Dashboard data loaded:", {
    ordersCount: orders?.length || 0,
    totalOrders: userProfile?.total_orders,
    totalSpent: userProfile?.total_spent,
    balance: userProfile?.balance,
  })

  return (
    <div className="min-h-screen">
      <div className="md:hidden">
        <MobileHighTrustDashboard
          services={services || []}
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
          services={services || []}
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
