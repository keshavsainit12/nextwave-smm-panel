"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { toast } from "sonner"
import { Edit } from "lucide-react"

interface EditCouponDialogProps {
  coupon: any
  onCouponUpdated?: () => void
}

export function EditCouponDialog({ coupon, onCouponUpdated }: EditCouponDialogProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    code: coupon.code,
    discount_percentage: coupon.discount_value,
    max_uses: coupon.max_uses || "",
    is_active: coupon.is_active,
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch(`/api/v1/coupons/${coupon.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: formData.code.toUpperCase().trim(),
          discount_type: 'percentage',
          discount_value: formData.discount_percentage,
          max_uses: formData.max_uses ? parseInt(formData.max_uses) : null,
          is_active: formData.is_active,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Failed to update coupon")
      }

      toast.success("Coupon updated successfully!")
      setOpen(false)
      onCouponUpdated?.()
    } catch (error: any) {
      console.error("[v0] Update coupon error:", error)
      toast.error(error.message || "Failed to update coupon")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <Edit className="h-3 w-3" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Coupon</DialogTitle>
          <DialogDescription>Update coupon details</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Coupon Code */}
          <div className="space-y-2">
            <Label htmlFor="code">Coupon Code</Label>
            <Input
              id="code"
              placeholder="SAVE10"
              value={formData.code}
              onChange={(e) => setFormData({ ...formData, code: e.target.value })}
              disabled={loading}
              required
            />
          </div>

          {/* Discount Percentage */}
          <div className="space-y-2">
            <Label htmlFor="discount">Discount %</Label>
            <Input
              id="discount"
              type="number"
              placeholder="10"
              min="1"
              max="100"
              value={formData.discount_percentage}
              onChange={(e) => setFormData({ ...formData, discount_percentage: parseInt(e.target.value) || 0 })}
              disabled={loading}
              required
            />
          </div>

          {/* Max Uses */}
          <div className="space-y-2">
            <Label htmlFor="max_uses">Max Uses (leave empty for unlimited)</Label>
            <Input
              id="max_uses"
              type="number"
              placeholder="100"
              min="1"
              value={formData.max_uses}
              onChange={(e) => setFormData({ ...formData, max_uses: e.target.value })}
              disabled={loading}
            />
          </div>

          {/* Active Status */}
          <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900 rounded-lg border">
            <Label htmlFor="is_active" className="text-sm font-medium">Active</Label>
            <Switch
              id="is_active"
              checked={formData.is_active}
              onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
              disabled={loading}
            />
          </div>

          {/* Submit Buttons */}
          <div className="flex gap-2 justify-end pt-4">
            <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Updating..." : "Update Coupon"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
