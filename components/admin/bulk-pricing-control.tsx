"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { updateAllServicesPricing } from "@/app/actions/services"
import { toast } from "sonner"
import { Percent, TrendingUp, TrendingDown, Loader2 } from "lucide-react"
import { useRouter } from "next/navigation"

export function BulkPricingControl() {
  const [percentage, setPercentage] = useState(10)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleUpdate = async (increase: boolean) => {
    if (percentage <= 0 || percentage > 100) {
      toast.error("Please enter a valid percentage (1-100)")
      return
    }

    setLoading(true)
    try {
      console.log(`[BulkPricingUI] ====== START: Button clicked ======`)
      console.log(`[BulkPricingUI] Adjusting all service prices by ${percentage}% (${increase ? 'increase' : 'decrease'})`)
      
      const finalPercentage = increase ? Math.abs(percentage) : -Math.abs(percentage)
      console.log(`[BulkPricingUI] Final percentage to apply: ${finalPercentage}%`)
      console.log(`[BulkPricingUI] Calling updateAllServicesPricing...`)
      
      const result = await updateAllServicesPricing(finalPercentage)
      
      console.log(`[BulkPricingUI] Result received:`, JSON.stringify(result, null, 2))
      
      if (result.error) {
        console.error(`[BulkPricingUI] Error in result:`, result.error)
        toast.error(result.error)
      } else if (result.updated === 0) {
        console.warn(`[BulkPricingUI] No services updated`)
        toast.warning("No services were updated. Please check if services exist.")
      } else {
        console.log(`[BulkPricingUI] Success! ${result.updated} services updated`)
        toast.success(
          `Successfully ${increase ? 'increased' : 'decreased'} prices for ${result.updated} service${result.updated === 1 ? '' : 's'} by ${percentage}%`
        )
      }

      console.log(`[BulkPricingUI] Reloading page to show updated prices...`)
      window.location.reload()
      console.log(`[BulkPricingUI] ====== END: Complete ======`)
    } catch (error) {
      console.error("[BulkPricingUI] ====== EXCEPTION caught ======")
      console.error("[BulkPricingUI] Pricing update error:", error)
      console.error("[BulkPricingUI] Error stack:", error instanceof Error ? error.stack : 'No stack')
      toast.error("Failed to update pricing. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Bulk Pricing Control</CardTitle>
        <CardDescription>
          Adjust all service prices by percentage. Changes apply to admin panel and user dashboard in real-time.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="percentage" className="text-base font-semibold">
            Adjust All Prices by Percentage
          </Label>
          <p className="text-sm text-muted-foreground">
            Enter a percentage to increase or decrease all service prices
          </p>
          <div className="flex items-center gap-2">
            <Percent className="h-4 w-4 text-muted-foreground" />
            <Input
              id="percentage"
              type="number"
              value={percentage}
              onChange={(e) => setPercentage(Number(e.target.value))}
              placeholder="Enter percentage (e.g. 10)"
              min="1"
              max="100"
              disabled={loading}
            />
          </div>
          <p className="text-xs text-muted-foreground">
            Example: 10% on $3.00 → Increase: $3.30 | Decrease: $2.70
          </p>
        </div>
        
        <div className="flex gap-2">
          <Button 
            onClick={() => handleUpdate(true)} 
            disabled={loading || percentage === 0} 
            className="flex-1"
          >
            {loading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <TrendingUp className="mr-2 h-4 w-4" />
            )}
            Increase +{percentage}%
          </Button>
          <Button
            onClick={() => handleUpdate(false)}
            disabled={loading || percentage === 0}
            variant="destructive"
            className="flex-1"
          >
            {loading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <TrendingDown className="mr-2 h-4 w-4" />
            )}
            Decrease -{percentage}%
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
