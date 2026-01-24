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
      <DialogContent className="max-h-[90vh] w-full max-w-[95vw] overflow-y-auto sm:max-w-[550px] bg-gradient-to-b from-slate-50 to-white rounded-2xl border border-slate-200/50 shadow-xl">
        <DialogHeader className="border-b border-slate-200/50 pb-4">
          <DialogTitle className="flex items-center gap-3 text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            {service.icon && (
              <img
                src={service.icon || "/placeholder.svg"}
                alt={service.name}
                className="h-8 w-8 rounded-lg object-contain"
                crossOrigin="anonymous"
                onError={(e) => {
                  e.currentTarget.style.display = "none"
                }}
              />
            )}
            <span className="line-clamp-1">{service.name}</span>
          </DialogTitle>
          <DialogDescription className="text-sm text-slate-600 mt-2">
            Quick and secure order placement. Funds deducted instantly from wallet.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          {/* Link Input */}
          <div className="space-y-2">
            <Label htmlFor="link" className="text-sm font-semibold text-slate-700">Target Link/Username *</Label>
            <div className="relative">
              <Input
                id="link"
                placeholder="https://instagram.com/username"
                required
                value={link}
                onChange={(e) => setLink(e.target.value)}
                disabled={loading}
                className="pl-10 h-11 bg-white border-slate-200 focus:border-blue-500 focus:ring-blue-500/20"
              />
              <ShoppingCart className="absolute left-3 top-3.5 h-4 w-4 text-slate-400" />
            </div>
            <p className="text-xs text-slate-500">Enter profile or post URL you want to boost</p>
          </div>

          {/* Quantity Input */}
          <div className="space-y-2">
            <Label htmlFor="quantity" className="text-sm font-semibold text-slate-700">Quantity *</Label>
            <Input
              id="quantity"
              type="number"
              min={service.min_quantity || 100}
              max={service.max_quantity || 10000}
              required
              value={quantity}
              onChange={(e) => setQuantity(Number(e.target.value))}
              disabled={loading}
              className="h-11 bg-white border-slate-200 focus:border-blue-500 focus:ring-blue-500/20"
            />
            <p className="text-xs text-slate-500">
              Min: {(service.min_quantity || 100).toLocaleString()} • Max: {(service.max_quantity || 10000).toLocaleString()}
            </p>
          </div>

          {/* Price Breakdown Card */}
          <div className="rounded-xl border border-blue-200/50 bg-gradient-to-br from-blue-50 to-blue-50/50 p-4 space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-600">Price per 1000:</span>
              <span className="font-semibold text-slate-900">${servicePrice.toFixed(2)}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-600">Quantity:</span>
              <span className="font-semibold text-slate-900">{quantity.toLocaleString()}</span>
            </div>
            <div className="border-t border-blue-200 pt-3 flex items-center justify-between">
              <span className="font-semibold text-slate-700 flex items-center gap-2">
                <Wallet className="h-4 w-4 text-blue-600" />
                Total:
              </span>
              <span className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">${totalPrice}</span>
            </div>
          </div>

          {/* Refill Alert */}
          {(service.has_refill || service.refill) && (
            <Alert className="border-green-200/50 bg-green-50">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-sm text-green-700">
                ✓ Auto-refill enabled if count drops within guarantee period
              </AlertDescription>
            </Alert>
          )}

          {/* Error Alert */}
          {error && (
            <Alert variant="destructive" className="border-red-200/50 bg-red-50">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Submit Button */}
          <Button
            type="submit"
            disabled={loading}
            className="w-full h-12 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold rounded-lg transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <div className="flex items-center gap-2">
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                Processing...
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <ShoppingCart className="h-5 w-5" />
                Place Order Now
              </div>
            )}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
