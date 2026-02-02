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
  const [percentage, setPercentage] = useState(0)
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

  return (
    <Card>
      <CardHeader>
        <CardTitle>Bulk Pricing Control</CardTitle>
        <CardDescription>Apply pricing changes to all services quickly</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
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
