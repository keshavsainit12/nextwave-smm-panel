"use client"

import type React from "react"

import { useState, useEffect, useMemo } from "react"
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
  const [couponCode, setCouponCode] = useState("")
  const [couponDiscount, setCouponDiscount] = useState(0)
  const [couponError, setCouponError] = useState<string | null>(null)
  const [validateCouponLoading, setValidateCouponLoading] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const { toast } = useToast()

  // Memoize price calculations to ensure they update reactively
  const servicePrice = useMemo(() => Number(service.price || service.base_price || 0), [service])
  const priceMultiplier = useMemo(() => service.price_multiplier || 3.0, [service])
  const finalServicePrice = useMemo(() => servicePrice * priceMultiplier, [servicePrice, priceMultiplier])
  
  const totalPrice = useMemo(() => {
    const price = ((quantity / 1000) * finalServicePrice)
    return price.toFixed(2)
  }, [quantity, finalServicePrice])
  
  const discountedTotal = useMemo(() => {
    const total = Number(totalPrice)
    if (couponDiscount > 0) {
      return (total * (1 - couponDiscount / 100)).toFixed(2)
    }
    return total.toFixed(2)
  }, [totalPrice, couponDiscount])

  useEffect(() => {
    if (open) {
      setLink("")
      setQuantity(service.min_quantity || 100)
      setCouponCode("")
      setCouponDiscount(0)
      setCouponError(null)
      setError(null)
    }
  }, [open, service.min_quantity])

  const handleValidateCoupon = async () => {
    if (!couponCode.trim()) {
      setCouponError("Please enter a coupon code")
      return
    }

    setValidateCouponLoading(true)
    setCouponError(null)

    try {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 8000) // 8s timeout

      const response = await fetch("/api/v1/validate-coupon", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ couponCode: couponCode.toUpperCase() }),
        signal: controller.signal,
      })

      clearTimeout(timeoutId)

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error("Coupon code not found")
        } else if (response.status === 410) {
          throw new Error("This coupon has expired")
        } else if (response.status === 429) {
          throw new Error("Too many validation attempts. Please try again in a moment")
        } else if (response.status >= 500) {
          throw new Error("Server error. Please try again shortly")
        } else {
          throw new Error("Failed to validate coupon")
        }
      }

      const data = await response.json()

      if (data.valid) {
        setCouponDiscount(data.discount || 0)
        setCouponCode(couponCode.toUpperCase())
        toast({
          title: "Coupon Applied",
          description: `${data.discount}% discount applied to your order`,
          duration: 3000,
        })
      } else {
        setCouponError(data.error || "Invalid coupon code")
        setCouponDiscount(0)
      }
    } catch (err) {
      if (err instanceof DOMException && err.name === "AbortError") {
        setCouponError("Validation timed out. Please try again")
      } else {
        setCouponError(err instanceof Error ? err.message : "Failed to validate coupon")
      }
      setCouponDiscount(0)
    } finally {
      setValidateCouponLoading(false)
    }
  }

  const handleRemoveCoupon = () => {
    setCouponCode("")
    setCouponDiscount(0)
    setCouponError(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      if (!link.trim()) {
        throw new Error("Please enter a valid link")
      }

      if (quantity < (service.min_quantity || 100)) {
        throw new Error(`Minimum quantity is ${service.min_quantity || 100}`)
      }

      const result = await placeOrder(service.id, link, quantity, couponCode || undefined)

      if (result.error) {
        throw new Error(result.error)
      }

      if (!result.success) {
        throw new Error("Order placement failed - please try again")
      }

      toast({
        title: "Order Placed Successfully!",
        description: `Your order #${result.orderId} has been placed and will be processed shortly.`,
        duration: 5000,
      })

      onClose()
      setTimeout(() => {
        router.refresh()
        router.push("/dashboard/orders")
      }, 500)
    } catch (err: any) {
      const errorMessage = err instanceof Error ? err.message : "An error occurred while placing your order"
      setError(errorMessage)
      toast({
        title: "Order Failed",
        description: errorMessage,
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

          {/* Coupon Code Input */}
          <div className="space-y-2 p-4 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/30 dark:to-purple-950/30 rounded-lg border border-blue-200 dark:border-blue-800">
            <Label htmlFor="coupon" className="text-sm font-bold text-slate-900 dark:text-white">Apply Coupon Code (Optional)</Label>
            
            {couponDiscount > 0 ? (
              <div className="space-y-2">
                <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-950/30 rounded-lg border border-green-200 dark:border-green-800">
                  <div>
                    <p className="text-xs text-green-600 dark:text-green-400 font-medium">Coupon Applied</p>
                    <p className="text-lg font-bold text-green-700 dark:text-green-300">{couponCode}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-green-600 dark:text-green-400">Discount</p>
                    <p className="text-2xl font-bold text-green-700 dark:text-green-300">{couponDiscount}%</p>
                  </div>
                </div>
                <Button
                  type="button"
                  onClick={handleRemoveCoupon}
                  variant="outline"
                  className="w-full text-red-600 border-red-200 hover:bg-red-50 dark:hover:bg-red-950/30"
                >
                  Remove Coupon
                </Button>
              </div>
            ) : (
              <div className="flex gap-2">
                <Input
                  id="coupon"
                  placeholder="SAVE10, WELCOME, etc..."
                  value={couponCode}
                  onChange={(e) => {
                    setCouponCode(e.target.value.toUpperCase())
                    if (couponDiscount > 0) setCouponDiscount(0)
                  }}
                  disabled={loading || validateCouponLoading}
                  className="h-11 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 focus:border-blue-500 focus:ring-blue-500/20 uppercase font-semibold"
                />
                <Button
                  type="button"
                  onClick={handleValidateCoupon}
                  disabled={!couponCode.trim() || validateCouponLoading || loading}
                  className="px-6 h-11 bg-blue-600 hover:bg-blue-700 text-white font-semibold"
                >
                  {validateCouponLoading ? "Checking..." : "Apply"}
                </Button>
              </div>
            )}

            {couponError && (
              <Alert variant="destructive" className="border-red-300 bg-red-50 dark:bg-red-950/30">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription className="text-red-700 dark:text-red-300">{couponError}</AlertDescription>
              </Alert>
            )}

            <p className="text-xs text-slate-600 dark:text-slate-400 italic">
              💡 Have a coupon code? Enter it above to get instant discount on this order!
            </p>
          </div>

          {/* Price Breakdown Card */}
          <div key={`price-${couponDiscount}-${quantity}`} className="rounded-xl border border-blue-200/50 bg-gradient-to-br from-blue-50 to-blue-50/50 p-4 space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-600">Base Price per 1000:</span>
              <span className="font-semibold text-slate-900">${servicePrice.toFixed(2)}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-600">Final Price per 1000:</span>
              <span className="font-semibold text-blue-600">${finalServicePrice.toFixed(2)}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-600">Quantity:</span>
              <span className="font-semibold text-slate-900">{quantity.toLocaleString()}</span>
            </div>
            <div className="border-t border-blue-200 pt-3 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-slate-700">Subtotal:</span>
                <span key={`subtotal-${totalPrice}`} className="text-slate-900">${totalPrice}</span>
              </div>
              <div className="flex items-center justify-between" key={`discount-display-${couponDiscount}`}>
                <span className="text-sm text-slate-600">Discount:</span>
                <span className={`font-semibold ${couponDiscount > 0 ? 'text-green-700' : 'text-slate-600'}`}>
                  {couponDiscount > 0 ? `-$${(Number(totalPrice) * couponDiscount / 100).toFixed(2)}` : '$0.00'}
                </span>
              </div>
              <div className="flex items-center justify-between pt-2 border-t border-blue-200">
                <span className="font-semibold text-slate-700 flex items-center gap-2">
                  <Wallet className="h-4 w-4 text-blue-600" />
                  Total:
                </span>
                <span key={`total-${discountedTotal}`} className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">${discountedTotal}</span>
              </div>
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
