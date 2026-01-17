"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { placeOrder } from "@/app/actions/orders"
import { useRouter } from "next/navigation"
import { Wallet, ShoppingCart, AlertCircle, CheckCircle2 } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useToast } from "@/hooks/use-toast"

export function OrderDialog({ service, open, onClose }: { service: any; open: boolean; onClose: () => void }) {
  const [link, setLink] = useState("")
  const [quantity, setQuantity] = useState(service.min_quantity || 100)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const { toast } = useToast()

  const servicePrice = Number(service.price || service.base_price || 0)
  const totalPrice = ((quantity / 1000) * servicePrice).toFixed(2)

  useEffect(() => {
    if (open) {
      setLink("")
      setQuantity(service.min_quantity || 100)
      setError(null)
    }
  }, [open, service.min_quantity])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const result = await placeOrder(service.id, link, quantity)

      if (result.error) {
        throw new Error(result.error)
      }

      toast({
        title: "Order Placed Successfully!",
        description: `Your order has been placed and will be processed shortly.`,
        duration: 5000,
      })

      onClose()
      router.push("/dashboard/orders")
      router.refresh()
    } catch (err: any) {
      setError(err.message)
      toast({
        title: "Order Failed",
        description: err.message,
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ShoppingCart className="h-5 w-5" />
            <span className="line-clamp-1">{service.name}</span>
          </DialogTitle>
          <DialogDescription>
            Enter your order details below. Funds will be deducted from your wallet.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="link">Target Link/URL *</Label>
            <Input
              id="link"
              placeholder="https://instagram.com/username or post URL"
              required
              value={link}
              onChange={(e) => setLink(e.target.value)}
              disabled={loading}
            />
            <p className="text-xs text-muted-foreground">Enter the profile or post URL you want to boost</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="quantity">Quantity *</Label>
            <Input
              id="quantity"
              type="number"
              min={service.min_quantity || 100}
              max={service.max_quantity || 10000}
              required
              value={quantity}
              onChange={(e) => setQuantity(Number(e.target.value))}
              disabled={loading}
            />
            <p className="text-xs text-muted-foreground">
              Min: {(service.min_quantity || 100).toLocaleString()} • Max:{" "}
              {(service.max_quantity || 10000).toLocaleString()}
            </p>
          </div>

          <div className="rounded-lg border-2 border-primary/20 bg-primary/5 p-4 space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Price per 1000:</span>
              <span className="font-semibold">${servicePrice.toFixed(2)}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Quantity:</span>
              <span className="font-semibold">{quantity.toLocaleString()}</span>
            </div>
            <div className="border-t pt-3 flex items-center justify-between">
              <span className="font-semibold flex items-center gap-2">
                <Wallet className="h-4 w-4" />
                Total Amount:
              </span>
              <span className="text-2xl font-bold text-primary">${totalPrice}</span>
            </div>
          </div>

          {(service.has_refill || service.refill) && (
            <Alert>
              <CheckCircle2 className="h-4 w-4" />
              <AlertDescription>
                This service supports automatic refills if the count drops within the guarantee period.
              </AlertDescription>
            </Alert>
          )}

          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading} className="gap-2">
              {loading ? (
                <>Processing...</>
              ) : (
                <>
                  <Wallet className="h-4 w-4" />
                  Place Order - ${totalPrice}
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
