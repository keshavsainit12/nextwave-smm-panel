"use client"

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Trash2 } from "lucide-react"
import { toast } from "sonner"
import { EditCouponDialog } from "./edit-coupon-dialog"
import { useState } from "react"

interface CouponListProps {
  coupons: any[]
  onCouponDeleted?: () => void
  onCouponUpdated?: () => void
}

export function CouponList({ coupons, onCouponDeleted, onCouponUpdated }: CouponListProps) {
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const handleDelete = async (couponId: string) => {
    if (!window.confirm("Are you sure you want to delete this coupon?")) {
      return
    }

    setDeletingId(couponId)
    try {
      const response = await fetch(`/api/v1/coupons/${couponId}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Failed to delete coupon")
      }

      toast.success("Coupon deleted successfully!")
      onCouponDeleted?.()
    } catch (error: any) {
      console.error("[v0] Delete coupon error:", error)
      toast.error(error.message || "Failed to delete coupon")
    } finally {
      setDeletingId(null)
    }
  }

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
                {coupon.discount_value}%
              </TableCell>
              <TableCell className="text-sm">
                {coupon.used_count || 0} / {coupon.max_uses || "∞"}
              </TableCell>
              <TableCell>
                <Badge variant={coupon.is_active ? "default" : "secondary"} className="text-xs">
                  {coupon.is_active ? "Active" : "Inactive"}
                </Badge>
              </TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-1">
                  <EditCouponDialog coupon={coupon} onCouponUpdated={onCouponUpdated} />
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-8 w-8"
                    onClick={() => handleDelete(coupon.id)}
                    disabled={deletingId === coupon.id}
                  >
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
