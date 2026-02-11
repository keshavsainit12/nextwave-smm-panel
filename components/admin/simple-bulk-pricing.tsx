"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "sonner"
import { simpleBulkPricing } from "@/app/actions/simple-bulk-pricing"
import { Loader2 } from "lucide-react"

/**
 * NEW Simple Bulk Pricing Component
 * Simpler, more reliable approach
 */
export function SimpleBulkPricing() {
  const [percentage, setPercentage] = useState<string>("10")
  const [loading, setLoading] = useState(false)

  const handleAdjust = async (isIncrease: boolean) => {
    const percentValue = parseFloat(percentage)
    
    if (isNaN(percentValue) || percentValue <= 0) {
      toast.error("Please enter a valid percentage")
      return
    }
    
    setLoading(true)
    console.log(`[SimpleBulkUI] ===== USER ACTION =====`)
    console.log(`[SimpleBulkUI] Action: ${isIncrease ? 'INCREASE' : 'DECREASE'}`)
    console.log(`[SimpleBulkUI] Percentage: ${percentValue}%`)
    
    try {
      const finalPercentage = isIncrease ? percentValue : -percentValue
      console.log(`[SimpleBulkUI] Final percentage to apply: ${finalPercentage}%`)
      console.log(`[SimpleBulkUI] Calling simpleBulkPricing function...`)
      
      const result = await simpleBulkPricing(finalPercentage)
      
      console.log(`[SimpleBulkUI] ===== RESULT RECEIVED =====`)
      console.log(`[SimpleBulkUI] Result object:`, JSON.stringify(result, null, 2))
      console.log(`[SimpleBulkUI] Success:`, result.success)
      console.log(`[SimpleBulkUI] Updated:`, result.updated)
      console.log(`[SimpleBulkUI] Total:`, result.total)
      
      if (result.success) {
        const action = isIncrease ? "increased" : "decreased"
        const absPercentage = Math.abs(finalPercentage)
        const message = `Successfully ${action} prices for ${result.updated}/${result.total} services by ${absPercentage}%`
        console.log(`[SimpleBulkUI] ✅ SUCCESS:`, message)
        toast.success(message, { duration: 3000 })
        
        // Wait to show message, then force reload bypassing cache
        console.log(`[SimpleBulkUI] Waiting 2 seconds before reload...`)
        setTimeout(() => {
          console.log(`[SimpleBulkUI] Now force reloading page (bypassing cache) to show updated prices...`)
          // Force reload bypassing cache by adding timestamp to URL
          const currentUrl = new URL(window.location.href)
          currentUrl.searchParams.set('_t', Date.now().toString())
          window.location.href = currentUrl.toString()
        }, 2000)
      } else {
        const errorMsg = result.error || "Failed to update prices"
        console.error(`[SimpleBulkUI] ❌ FAILURE:`, errorMsg)
        toast.error(errorMsg, { duration: 5000 })
        setLoading(false)
      }
    } catch (error) {
      console.error(`[SimpleBulkUI] ❌❌❌ EXCEPTION IN UI ❌❌❌`)
      console.error(`[SimpleBulkUI] Error:`, error)
      console.error(`[SimpleBulkUI] Error type:`, typeof error)
      console.error(`[SimpleBulkUI] Error message:`, error instanceof Error ? error.message : String(error))
      toast.error("An unexpected error occurred. Check console for details.", { duration: 5000 })
      setLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>🆕 NEW Simple Bulk Pricing</CardTitle>
        <CardDescription>
          New simplified system - Updates each service individually for reliability
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex gap-4 items-end">
          <div className="flex-1">
            <label className="text-sm font-medium">Percentage</label>
            <Input
              type="number"
              min="0"
              step="0.1"
              value={percentage}
              onChange={(e) => setPercentage(e.target.value)}
              placeholder="Enter percentage"
              disabled={loading}
            />
          </div>
          <div className="flex gap-2">
            <Button
              onClick={() => handleAdjust(true)}
              disabled={loading}
              className="bg-green-600 hover:bg-green-700"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                `Increase +${percentage}%`
              )}
            </Button>
            <Button
              onClick={() => handleAdjust(false)}
              disabled={loading}
              variant="destructive"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                `Decrease -${percentage}%`
              )}
            </Button>
          </div>
        </div>
        <p className="text-sm text-muted-foreground mt-4">
          ✨ This is a NEW system that updates services one by one for better reliability.
        </p>
      </CardContent>
    </Card>
  )
}
