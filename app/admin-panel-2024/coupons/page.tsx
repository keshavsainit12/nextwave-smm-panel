import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { CouponList } from "@/components/admin/coupon-list"
import { AddCouponDialog } from "@/components/admin/add-coupon-dialog"

export default async function AdminCouponsPage() {
  const supabase = await createClient()
  const { data: coupons } = await supabase.from("coupons").select("*").order("created_at", { ascending: false })

  return (
    <div className="space-y-3 sm:space-y-4 md:space-y-6">
      {/* Header - Mobile responsive */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
        <div className="min-w-0">
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold tracking-tight">Coupons</h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">Create and manage discount codes</p>
        </div>
        <div className="flex-shrink-0 w-full sm:w-auto">
          <AddCouponDialog />
        </div>
      </div>

      {/* Coupons Card - Mobile responsive */}
      <Card className="bg-white dark:bg-slate-900 border-gray-200 dark:border-gray-800">
        <CardHeader className="p-3 sm:p-4 md:p-6">
          <CardTitle className="text-lg sm:text-xl">All Coupons</CardTitle>
          <CardDescription className="text-xs sm:text-sm">Manage discount codes and active promotions</CardDescription>
        </CardHeader>
        <CardContent className="p-3 sm:p-4 md:p-6 overflow-x-auto">
          <CouponList coupons={coupons || []} />
        </CardContent>
      </Card>
    </div>
  )
}
