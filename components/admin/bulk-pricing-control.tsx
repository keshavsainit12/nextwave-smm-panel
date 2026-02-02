"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { updateAllServicesPricing, setAllServicesMultiplier } from "@/app/actions/services"
import { toast } from "sonner"
import { Percent, TrendingUp, TrendingDown, Loader2, X } from "lucide-react"
import { useRouter } from "next/navigation"
import { Separator } from "@/components/ui/separator"

export function BulkPricingControl() {
  const [percentage, setPercentage] = useState(0)
  const [multiplier, setMultiplier] = useState(2)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleUpdate = async (increase: boolean) => {
    setLoading(true)
    try {
      const finalPercentage = increase ? Math.abs(percentage) : -Math.abs(percentage)
      const result = await updateAllServicesPricing(finalPercentage)
      toast.success(`Updated ${result.updated} services with ${increase ? "+" : ""}${finalPercentage}% change`)
      setPercentage(0)
      router.refresh()
    } catch (error) {
      console.error("[v0] Pricing update error:", error)
      toast.error("Failed to update pricing")
    } finally {
      setLoading(false)
    }
  }

  const handleMultiplierUpdate = async () => {
    if (multiplier <= 0) {
      toast.error("Multiplier must be greater than 0")
      return
    }

    setLoading(true)
    try {
      console.log(`[v0] Setting ${multiplier}× multiplier for all services`)
      const result = await setAllServicesMultiplier(multiplier)
      
      if (result.errors > 0) {
        toast.warning(`Updated ${result.updated}/${result.total} services (${result.errors} failed)`)
      } else {
        toast.success(`Successfully updated ${result.updated} service${result.updated === 1 ? '' : 's'} with ${multiplier}× multiplier`)
      }
      
      router.refresh()
    } catch (error) {
      console.error("[v0] Multiplier update error:", error)
      toast.error(error instanceof Error ? error.message : "Failed to update services")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Bulk Pricing Control</CardTitle>
        <CardDescription>Apply pricing changes to all services quickly</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Price Multiplier */}
        <div className="space-y-2">
          <Label htmlFor="multiplier" className="text-base font-semibold">
            Set Price Multiplier
          </Label>
          <p className="text-sm text-muted-foreground">
            Apply a multiplier to provider prices (e.g., ×2 = double the price)
          </p>
          <div className="flex items-center gap-2">
            <X className="h-4 w-4 text-muted-foreground" />
            <Input
              id="multiplier"
              type="number"
              step="0.1"
              value={multiplier}
              onChange={(e) => setMultiplier(Number(e.target.value))}
              placeholder="Enter multiplier (e.g. 2)"
              min="0.1"
              max="10"
            />
            <Button onClick={handleMultiplierUpdate} disabled={loading || multiplier <= 0} className="whitespace-nowrap">
              {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Apply ×{multiplier}
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            Example: If provider price is $1, a ×2 multiplier will set service price to $2
          </p>
        </div>

        <Separator />

        {/* Percentage Change */}
        <div className="space-y-2">
          <Label htmlFor="percentage" className="text-base font-semibold">
            Adjust All Prices by Percentage
          </Label>
          <div className="flex items-center gap-2">
            <Percent className="h-4 w-4 text-muted-foreground" />
            <Input
              id="percentage"
              type="number"
              value={percentage}
              onChange={(e) => setPercentage(Number(e.target.value))}
              placeholder="Enter percentage (e.g. 10)"
              min="0"
              max="100"
            />
          </div>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => handleUpdate(true)} disabled={loading || percentage === 0} className="flex-1">
            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <TrendingUp className="mr-2 h-4 w-4" />}
            Increase +{percentage}%
          </Button>
          <Button
            onClick={() => handleUpdate(false)}
            disabled={loading || percentage === 0}
            variant="destructive"
            className="flex-1"
          >
            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <TrendingDown className="mr-2 h-4 w-4" />}
            Decrease -{percentage}%
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
