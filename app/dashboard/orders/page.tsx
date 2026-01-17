import { createClient } from "@/lib/supabase/server"
import { MobileOrdersHistory } from "@/components/dashboard/mobile-orders-history"

export default async function OrdersPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { data: orders } = await supabase
    .from("orders")
    .select("*, services(name, platform, has_refill, service_categories(name))")
    .eq("user_id", user!.id)
    .order("created_at", { ascending: false })

  return (
    <>
      {/* Mobile view */}
      <div className="lg:hidden">
        <MobileOrdersHistory orders={orders || []} />
      </div>

      {/* Desktop view */}
      <div className="hidden lg:block space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">My Orders</h1>
          <p className="text-muted-foreground">View and manage your order history</p>
        </div>
        {/* Desktop order list here */}
      </div>
    </>
  )
}
