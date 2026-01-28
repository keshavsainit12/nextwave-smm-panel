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

      const response = await fetch("/api/v1/coupons", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: formData.code.toUpperCase().trim(),
          discount_type: "percentage",
          discount_value: formData.discount_percentage,
          max_uses: formData.max_uses ? parseInt(formData.max_uses) : null,
          is_active: formData.is_active,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || `Failed to create coupon (${response.status})`)
      }

      toast.success("Coupon created successfully!")
      setFormData({ code: "", discount_percentage: 10, max_uses: "", is_active: true })
      setOpen(false)
      onCouponCreated?.()

      // Refresh page to show new coupon
      setTimeout(() => {
        window.location.reload()
      }, 500)
    } catch (error: any) {
      console.error("[v0] Coupon creation error:", error.message || error)
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

      {/*
        IMPORTANT:
        - Added explicit background/text/border classes so this dialog matches admin surfaces
        - These classes make the dialog look correct even when global theme tokens are missing
      */}
      <DialogContent className="sm:max-w-[500px] max-h-screen overflow-y-auto bg-white text-slate-900 rounded-lg shadow-lg border border-gray-200 dark:bg-slate-900 dark:text-white dark:border-gray-800">
        <DialogHeader>
          <DialogTitle>Create Coupon</DialogTitle>
          <DialogDescription>Create a new discount code for users</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-4">
            {/* Coupon Code */}
            <div className="grid gap-2">
              <Label htmlFor="code" className="text-sm font-medium">
                Coupon Code
              </Label>
              <Input
                id="code"
                placeholder="SAVE10"
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                required
                disabled={loading}
              />
              <p className="text-xs text-muted-foreground">Code will be converted to uppercase automatically</p>
            </div>

            {/* Discount Percentage */}
            <div className="grid gap-2">
              <Label htmlFor="discount_percentage" className="text-sm font-medium">
                Discount (%)
              </Label>
              <Input
                id="discount_percentage"
                type="number"
                min={1}
                max={100}
                value={formData.discount_percentage}
                onChange={(e) => setFormData({ ...formData, discount_percentage: parseFloat(e.target.value || "0") })}
                required
                disabled={loading}
              />
            </div>

            {/* Max Uses */}
            <div className="grid gap-2">
              <Label htmlFor="max_uses" className="text-sm font-medium">
                Max Uses (leave empty for unlimited)
              </Label>
              <Input
                id="max_uses"
                placeholder="e.g. 100"
                value={formData.max_uses}
                onChange={(e) => setFormData({ ...formData, max_uses: e.target.value })}
                disabled={loading}
              />
            </div>

            {/* Active toggle */}
            <div className="flex items-center justify-between gap-4">
              <div>
                <Label htmlFor="is_active" className="text-sm font-medium">
                  Active
                </Label>
                <p className="text-xs text-muted-foreground">Toggle whether the coupon is usable by customers</p>
              </div>
              <Switch
                id="is_active"
                checked={formData.is_active}
                onCheckedChange={(val) => setFormData({ ...formData, is_active: Boolean(val) })}
                className="ml-auto"
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
              className="border-gray-300 text-slate-700 dark:text-gray-200"
            >
              Cancel
            </Button>

            <Button type="submit" disabled={loading} className="bg-[#1152d4] text-white hover:bg-[#0f43b8]">
              {loading ? "Creating..." : "Create Coupon"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}