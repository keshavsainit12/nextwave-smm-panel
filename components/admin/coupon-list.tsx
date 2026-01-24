import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Edit, Trash2 } from "lucide-react"

export function CouponList({ coupons }: { coupons: any[] }) {
  if (coupons.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <p>No coupons created yet</p>
        <p className="text-xs mt-2">Create your first coupon to get started</p>
      </div>
    )
  }

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="min-w-[120px]">Code</TableHead>
            <TableHead className="min-w-[100px]">Discount</TableHead>
            <TableHead className="min-w-[100px]">Uses</TableHead>
            <TableHead className="min-w-[80px]">Status</TableHead>
            <TableHead className="text-right min-w-[100px]">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {coupons.map((coupon) => (
            <TableRow key={coupon.id}>
              <TableCell className="font-mono font-medium text-sm">{coupon.code}</TableCell>
              <TableCell className="text-sm">
                {coupon.discount_percentage || coupon.discount_value}%
              </TableCell>
              <TableCell className="text-sm">
                {coupon.used_count || 0} / {coupon.max_uses || "∞"}
              </TableCell>
              <TableCell>
                <Badge variant={coupon.active ? "default" : "secondary"} className="text-xs">
                  {coupon.active ? "Active" : "Inactive"}
                </Badge>
              </TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-1">
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <Edit className="h-3 w-3" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <Trash2 className="h-3 w-3 text-destructive" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
