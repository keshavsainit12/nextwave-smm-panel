import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import { Copy, Check } from "lucide-react"

interface CouponPasteCardProps {
  onCouponApplied?: (couponCode: string) => void
}

export function CouponPasteCard({ onCouponApplied }: CouponPasteCardProps) {
  const [couponCode, setCouponCode] = useState("")
  const [loading, setLoading] = useState(false)
  const [validatedCoupon, setValidatedCoupon] = useState<any>(null)
  const [copied, setCopied] = useState(false)

  const handleValidateCoupon = async () => {
    if (!couponCode.trim()) {
      toast.error("Please enter a coupon code")
      return
    }

    setLoading(true)
    try {
      const response = await fetch("/api/v1/validate-coupon", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ couponCode: couponCode.toUpperCase() }),
      })

      if (!response.ok) {
        throw new Error("Invalid coupon code")
      }

      const data = await response.json()

      if (data.valid) {
        setValidatedCoupon(data)
        toast.success(`${data.discount}% discount available!`)
        onCouponApplied?.(couponCode.toUpperCase())
      } else {
        toast.error(data.error || "Invalid coupon code")
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to validate coupon")
    } finally {
      setLoading(false)
    }
  }

  const handleCopyCode = () => {
    if (validatedCoupon?.code) {
      navigator.clipboard.writeText(validatedCoupon.code)
      setCopied(true)
      toast.success("Coupon code copied to clipboard")
      setTimeout(() => setCopied(false), 2000)
    }
  }

  return (
    <Card className="border-l-4 border-l-blue-600">
      <CardHeader>
        <CardTitle className="text-lg">Redeem Coupon Code</CardTitle>
        <CardDescription>Have a coupon code? Paste it here to get discounts</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {!validatedCoupon ? (
          <>
            <div className="flex gap-2">
              <Input
                placeholder="Paste coupon code here..."
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                onKeyPress={(e) => e.key === "Enter" && handleValidateCoupon()}
                disabled={loading}
                className="uppercase"
              />
              <Button
                onClick={handleValidateCoupon}
                disabled={loading || !couponCode.trim()}
                className="min-w-[100px]"
              >
                {loading ? "Checking..." : "Verify"}
              </Button>
            </div>
          </>
        ) : (
          <div className="p-4 bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-900 rounded-lg space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-green-900 dark:text-green-100">Coupon Valid</span>
              <Badge className="bg-green-600">Active</Badge>
            </div>

            <div className="flex items-center gap-2 bg-white dark:bg-slate-900 p-3 rounded border border-green-200 dark:border-green-900">
              <code className="flex-1 font-mono font-bold text-lg text-slate-900 dark:text-white">
                {validatedCoupon.code}
              </code>
              <Button
                size="icon"
                variant="ghost"
                className="h-8 w-8"
                onClick={handleCopyCode}
              >
                {copied ? (
                  <Check className="h-4 w-4 text-green-600" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
            </div>

            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-600 dark:text-slate-400">Discount:</span>
              <span className="font-bold text-lg text-green-600">
                {validatedCoupon.discount}%
              </span>
            </div>

            {validatedCoupon.max_uses && (
              <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                <span>Uses remaining:</span>
                <span>{validatedCoupon.max_uses - (validatedCoupon.used_count || 0)}</span>
              </div>
            )}

            <Button
              onClick={() => {
                setValidatedCoupon(null)
                setCouponCode("")
              }}
              variant="outline"
              className="w-full"
            >
              Clear
            </Button>
          </div>
        )}

        <p className="text-xs text-slate-500 dark:text-slate-400">
          💡 Tip: Use this coupon code during checkout to get your discount automatically applied
        </p>
      </CardContent>
    </Card>
  )
}
