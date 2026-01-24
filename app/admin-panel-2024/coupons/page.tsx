import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { CouponList } from "@/components/admin/coupon-list"
import { AddCouponDialog } from "@/components/admin/add-coupon-dialog"

export default async function AdminCouponsPage() {
  const supabase = await createClient()
  const { data: coupons } = await supabase.from("coupons").select("*").order("created_at", { ascending: false })

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header - Mobile responsive */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Coupons & Discounts</h1>
          <p className="text-muted-foreground text-sm sm:text-base">Create and manage discount codes</p>
        </div>
        <AddCouponDialog />
      </div>

      {/* Coupons Card - Mobile responsive */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg sm:text-xl">All Coupons</CardTitle>
          <CardDescription className="text-xs sm:text-sm">Manage discount codes and promotions</CardDescription>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <CouponList coupons={coupons || []} />
        </CardContent>
      </Card>
    </div>
  )
}
