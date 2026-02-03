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
      console.log(`[v0] Adjusting all service prices by ${percentage}% (${increase ? 'increase' : 'decrease'})`)
      
      const finalPercentage = increase ? Math.abs(percentage) : -Math.abs(percentage)
      const result = await updateAllServicesPricing(finalPercentage)
      
      // Check if result exists and handle accordingly
      if (!result) {
        toast.error("Failed to update pricing - no response from server")
        return
      }
      
      if (result.error) {
        toast.error(result.error)
      } else if (result.updated === 0) {
        toast.warning("No services were updated. Please check if services exist.")
      } else {
        toast.success(
          `Successfully ${increase ? 'increased' : 'decreased'} prices for ${result.updated} service${result.updated === 1 ? '' : 's'} by ${percentage}%`
        )
        
        // Force aggressive refresh for instant updates
        router.refresh()
        
        // Additional refresh after a brief delay to ensure database sync
        setTimeout(() => {
          router.refresh()
        }, 500)
        
        // Hard reload after 1 second to ensure all data is fresh
        setTimeout(() => {
          window.location.reload()
        }, 1000)
      }
    } catch (error) {
      console.error("[v0] Pricing update error:", error)
      toast.error(`Failed to update pricing: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Bulk Pricing Control</CardTitle>
        <CardDescription>
          Adjust all service prices by percentage. Changes apply instantly to admin panel and all user dashboards in real-time.
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
