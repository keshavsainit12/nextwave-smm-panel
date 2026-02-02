"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { updateAllServicesPricing, setAllServicesMultiplier } from "@/app/actions/services"
import { toast } from "sonner"
import { Percent, TrendingUp, TrendingDown, Loader2 } from "lucide-react"
import { useRouter } from "next/navigation"

export function BulkPricingControl() {
  const [percentage, setPercentage] = useState(0)
  const [loading, setLoading] = useState(false)
  const [multiplierLoading, setMultiplierLoading] = useState<number | null>(null)
  const router = useRouter()

  const handleUpdate = async (increase: boolean) => {
    if (percentage === 0) {
      toast.error("Please enter a percentage value")
      return
    }
    
    setLoading(true)
    try {
      const finalPercentage = increase ? Math.abs(percentage) : -Math.abs(percentage)
      console.log(`[v0] Updating all services with ${finalPercentage}% change`)
      
      const result = await updateAllServicesPricing(finalPercentage)
      
      console.log(`[v0] Percentage update result:`, result)
      
      if (result.errors && result.errors > 0) {
        toast.warning(`Updated ${result.updated} of ${result.total} services. ${result.errors} failed.`)
      } else {
        toast.success(`Updated ${result.updated} services with ${increase ? "+" : ""}${finalPercentage}% change`)
      }
      
      setPercentage(0)
      
      // Wait a bit before refresh to ensure database updates propagate
      await new Promise((resolve) => setTimeout(resolve, 500))
      router.refresh()
    } catch (error) {
      console.error("[v0] Pricing update error:", error)
      toast.error(error instanceof Error ? error.message : "Failed to update pricing")
    } finally {
      setLoading(false)
    }
  }

  const handleSetMultiplier = async (multiplier: number) => {
    setMultiplierLoading(multiplier)
    try {
      console.log(`[v0] Setting multiplier to ${multiplier}x`)
      const result = await setAllServicesMultiplier(multiplier)
      console.log(`[v0] Multiplier update result:`, result)

      if (result.errors && result.errors > 0) {
        toast.warning(
          `Set ${result.updated} of ${result.total} services to ${multiplier}x. ${result.errors} failed.`,
        )
      } else {
        toast.success(
          `Set ${result.updated} services to ${multiplier}x provider price (${((multiplier - 1) * 100).toFixed(0)}% profit)`,
        )
      }

      // Wait a bit before refresh to ensure database updates propagate
      await new Promise((resolve) => setTimeout(resolve, 500))
      router.refresh()
    } catch (error) {
      console.error("[v0] Multiplier update error:", error)
      toast.error(error instanceof Error ? error.message : "Failed to set multiplier")
    } finally {
      setMultiplierLoading(null)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Bulk Pricing Control</CardTitle>
        <CardDescription>Apply pricing changes to all services quickly</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Quick Multiplier Buttons */}
        <div className="space-y-3">
          <Label className="text-base font-semibold">
            Quick Multiplier (Provider Cost × Multiplier = Selling Price)
          </Label>
          <div className="flex flex-wrap gap-2">
            {[
              { value: 2, label: "2x", desc: "Reseller pricing (100% profit)" },
              { value: 2.5, label: "2.5x", desc: "Bulk buyer (150% profit)" },
              { value: 3, label: "3x", desc: "Standard (200% profit)", recommended: true },
              { value: 4, label: "4x", desc: "Premium (300% profit)" },
              { value: 5, label: "5x", desc: "Max profit (400% profit)" },
            ].map((mult) => (
              <Button
                key={mult.value}
                variant={mult.recommended ? "default" : "outline"}
                size="lg"
                onClick={() => handleSetMultiplier(mult.value)}
                disabled={multiplierLoading !== null}
                className="flex-1 min-w-[100px]"
                title={mult.desc}
              >
                {multiplierLoading === mult.value ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <TrendingUp className="mr-2 h-4 w-4" />
                )}
                <span className="font-bold">{mult.label}</span>
              </Button>
            ))}
          </div>
          <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
            <p className="text-sm text-blue-900 dark:text-blue-100">
              <strong>Example:</strong> Provider cost = $1.00 → 3x = $3.00 selling price (you earn $2.00 profit per 1K)
            </p>
          </div>
        </div>

        {/* Percentage Change */}
        <div className="space-y-2">
          <Label htmlFor="percentage" className="text-base font-semibold">
            Or Adjust All Prices by Percentage
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
