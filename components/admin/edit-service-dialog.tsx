"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { updateService } from "@/app/actions/services"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"
import { Loader2 } from "lucide-react"

export function EditServiceDialog({ service, open, onClose }: any) {
  const [formData, setFormData] = useState({
    name: service.name,
    description: service.description || "",
    price: service.price || service.base_price || 0,
    min_quantity: service.min_quantity,
    max_quantity: service.max_quantity,
  })
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  const handleSubmit = async () => {
    setLoading(true)
    try {
      // Send base_price to database (not 'price')
      await updateService(service.id, {
        name: formData.name,
        description: formData.description,
        base_price: formData.price, // Map 'price' field to 'base_price' for database
        min_quantity: formData.min_quantity,
        max_quantity: formData.max_quantity,
      })
      toast({ title: "Success", description: "Service updated successfully" })
      onClose()
      router.refresh()
    } catch (error) {
      toast({ title: "Error", description: "Failed to update service", variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }

  const providerPrice = service.provider_price || 0
  const profitMargin = providerPrice > 0 ? (((formData.price - providerPrice) / providerPrice) * 100).toFixed(1) : 0

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Edit Service</DialogTitle>
          <DialogDescription>Update service details and pricing</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Service Name</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4 p-4 bg-muted rounded-lg">
            <div>
              <p className="text-sm text-muted-foreground">Provider Price</p>
              <p className="text-lg font-semibold">${Number(providerPrice).toFixed(4)}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Profit Margin</p>
              <p
                className={`text-lg font-semibold ${Number(profitMargin) >= 100 ? "text-green-600" : "text-orange-500"}`}
              >
                {profitMargin}%
              </p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="price">Selling Price ($)</Label>
              <Input
                id="price"
                type="number"
                step="0.0001"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: Number.parseFloat(e.target.value) })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="min_quantity">Min Quantity</Label>
              <Input
                id="min_quantity"
                type="number"
                value={formData.min_quantity}
                onChange={(e) => setFormData({ ...formData, min_quantity: Number.parseInt(e.target.value) })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="max_quantity">Max Quantity</Label>
              <Input
                id="max_quantity"
                type="number"
                value={formData.max_quantity}
                onChange={(e) => setFormData({ ...formData, max_quantity: Number.parseInt(e.target.value) })}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Quick Set Price</Label>
            <div className="flex gap-2">
              {[2, 2.5, 3, 4].map((mult) => (
                <Button
                  key={mult}
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setFormData({ ...formData, price: providerPrice * mult })}
                  disabled={!providerPrice}
                >
                  {mult}x
                </Button>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={loading}>
              {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              {loading ? "Updating..." : "Update Service"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
