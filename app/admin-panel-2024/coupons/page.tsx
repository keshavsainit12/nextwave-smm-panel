import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { CouponList } from "@/components/admin/coupon-list"
import { AddCouponDialog } from "@/components/admin/add-coupon-dialog"

export default async function AdminCouponsPage() {
  const supabase = await createClient()
  const { data: coupons } = await supabase.from("coupons").select("*").order("created_at", { ascending: false })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Coupons & Discounts</h1>
          <p className="text-muted-foreground">Create and manage discount codes</p>
        </div>
        <AddCouponDialog />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Coupons</CardTitle>
          <CardDescription>Manage discount codes and promotions</CardDescription>
        </CardHeader>
        <CardContent>
          <CouponList coupons={coupons || []} />
        </CardContent>
      </Card>
    </div>
  )
}
