"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Plus } from "lucide-react"
import { toast } from "sonner"

export function AddCouponDialog({ onCouponCreated }: { onCouponCreated?: () => void } = {}) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    code: "",
    discount_percentage: 10,
    max_uses: "",
    is_active: true,
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      // Validate form
      if (!formData.code.trim()) {
        toast.error("Coupon code is required")
        setLoading(false)
        return
      }

      if (formData.discount_percentage <= 0 || formData.discount_percentage > 100) {
        toast.error("Discount must be between 1 and 100%")
        setLoading(false)
        return
      }

      console.log("[v0] Creating coupon:", formData)

      const response = await fetch("/api/v1/coupons", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: formData.code.toUpperCase().trim(),
          discount_type: 'percentage',
          discount_value: formData.discount_percentage,
          max_uses: formData.max_uses ? parseInt(formData.max_uses) : null,
          is_active: formData.is_active,
        }),
      })

      console.log("[v0] API Response status:", response.status)
      const data = await response.json()
      console.log("[v0] API Response data:", data)

      if (!response.ok) {
        throw new Error(data.error || `Failed to create coupon (${response.status})`)
      }

      console.log("[v0] Coupon created successfully:", data)

      toast.success("Coupon created successfully!")
      setFormData({ code: "", discount_percentage: 10, max_uses: "", is_active: true })
      setOpen(false)
      onCouponCreated?.()

      // Refresh page to show new coupon
      setTimeout(() => {
        window.location.reload()
      }, 500)
    } catch (error: any) {
      console.error("[v0] Coupon creation error:", error.message)
      toast.error(error.message || "Failed to create coupon")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="w-full sm:w-auto">
          <Plus className="mr-2 h-4 w-4" />
          Add Coupon
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px] max-h-screen overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create Coupon</DialogTitle>
          <DialogDescription>Create a new discount code for users</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-4">
            {/* Coupon Code */}
            <div className="grid gap-2">
              <Label htmlFor="code" className="text-sm font-medium">Coupon Code</Label>
              <Input
                id="code"
                placeholder="SAVE10"
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                required
                disabled={loading}
              />
              <p className="text-xs text-gray-500">Code will be converted to uppercase automatically</p>
            </div>

            {/* Discount Percentage */}
            <div className="grid gap-2">
              <Label htmlFor="discount_percentage" className="text-sm font-medium">Discount (%)</Label>
              <Input
                id="discount_percentage"
                type="number"
                min="1"
                max="100"
                value={formData.discount_percentage}
                onChange={(e) => setFormData({ ...formData, discount_percentage: parseFloat(e.target.value) })}
                required
                disabled={loading}
              />
            </div>

            {/* Max Uses */}
            <div className="grid gap-2">
              <Label htmlFor="max_uses" className="text-sm font-medium">Max Uses (Optional)</Label>
              <Input
                id="max_uses"
                type="number"
                min="1"
                placeholder="Leave empty for unlimited"
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
          </div>

          {/* Buttons */}
          <div className="flex justify-end gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Creating..." : "Create Coupon"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
