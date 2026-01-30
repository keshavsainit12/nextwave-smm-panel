"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertTriangle, CheckCircle, Loader2 } from "lucide-react"
import { updateSystemSettings } from "@/app/actions/admin-settings"
import { toast } from "sonner"
import { useRouter } from "next/navigation"

export function SystemSettingsForm({ settings }: { settings: Record<string, string> }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  
  const [formData, setFormData] = useState({
    site_name: settings.site_name || "",
    currency_symbol: settings.currency_symbol || "$",
    min_deposit: settings.min_deposit || "10",
    global_markup: settings.global_markup || "3",
    referral_commission: settings.referral_commission || "5",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setSuccess(false)

    try {
      console.log("[v0] Submitting system settings:", formData)
      
      const result = await updateSystemSettings(formData)

      if (result.success) {
        setSuccess(true)
        toast.success(result.message || "System settings updated successfully")
        setTimeout(() => setSuccess(false), 5000)
        router.refresh()
      } else {
        setError(result.error || "Failed to update system settings")
        toast.error(result.error || "Failed to update system settings")
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "An error occurred"
      setError(errorMessage)
      toast.error(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const handleReset = () => {
    setFormData({
      site_name: settings.site_name || "",
      currency_symbol: settings.currency_symbol || "$",
      min_deposit: settings.min_deposit || "10",
      global_markup: settings.global_markup || "3",
      referral_commission: settings.referral_commission || "5",
    })
    setError(null)
    setSuccess(false)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Success Alert */}
      {success && (
        <Alert className="border-green-200 bg-green-50 dark:border-green-900 dark:bg-green-950/20">
          <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
          <AlertTitle className="text-green-900 dark:text-green-100">Success</AlertTitle>
          <AlertDescription className="text-green-800 dark:text-green-200">
            System settings have been updated successfully.
          </AlertDescription>
        </Alert>
      )}

      {/* Error Alert */}
      {error && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="grid gap-4">
        <div className="grid gap-2">
          <Label htmlFor="site_name">Site Name</Label>
          <Input 
            id="site_name" 
            name="site_name" 
            value={formData.site_name}
            onChange={(e) => setFormData({ ...formData, site_name: e.target.value })}
            placeholder="Enter site name"
            disabled={loading}
          />
          <p className="text-xs text-muted-foreground">The name of your SMM panel</p>
        </div>
        
        <div className="grid gap-2">
          <Label htmlFor="currency_symbol">Currency Symbol</Label>
          <Input 
            id="currency_symbol" 
            name="currency_symbol" 
            value={formData.currency_symbol}
            onChange={(e) => setFormData({ ...formData, currency_symbol: e.target.value })}
            placeholder="$"
            disabled={loading}
          />
          <p className="text-xs text-muted-foreground">Currency symbol to display (e.g., $, €, ₹)</p>
        </div>
        
        <div className="grid gap-2">
          <Label htmlFor="min_deposit">Minimum Deposit ($)</Label>
          <Input 
            id="min_deposit" 
            name="min_deposit" 
            type="number"
            step="0.01"
            min="0"
            value={formData.min_deposit}
            onChange={(e) => setFormData({ ...formData, min_deposit: e.target.value })}
            disabled={loading}
          />
          <p className="text-xs text-muted-foreground">Minimum amount users can deposit</p>
        </div>
        
        <div className="grid gap-2">
          <Label htmlFor="global_markup">Global Markup (×)</Label>
          <Input 
            id="global_markup" 
            name="global_markup" 
            type="number"
            step="0.1"
            min="1"
            value={formData.global_markup}
            onChange={(e) => setFormData({ ...formData, global_markup: e.target.value })}
            disabled={loading}
          />
          <p className="text-xs text-muted-foreground">Default price multiplier for services (e.g., 3 = 3x provider cost)</p>
        </div>
        
        <div className="grid gap-2">
          <Label htmlFor="referral_commission">Referral Commission (%)</Label>
          <Input
            id="referral_commission"
            name="referral_commission"
            type="number"
            step="0.1"
            min="0"
            max="100"
            value={formData.referral_commission}
            onChange={(e) => setFormData({ ...formData, referral_commission: e.target.value })}
            disabled={loading}
          />
          <p className="text-xs text-muted-foreground">Commission percentage for referral program (0-100)</p>
        </div>
      </div>

      <Alert className="border-blue-200 bg-blue-50 dark:border-blue-900 dark:bg-blue-950/20">
        <AlertTriangle className="h-4 w-4 text-blue-600 dark:text-blue-400" />
        <AlertTitle className="text-blue-900 dark:text-blue-100">Note</AlertTitle>
        <AlertDescription className="text-blue-800 dark:text-blue-200">
          Changes to these settings will affect all users. Some changes may require users to refresh their page to see updates.
        </AlertDescription>
      </Alert>

      <div className="flex gap-3 pt-4">
        <Button 
          type="submit" 
          className="bg-blue-600 hover:bg-blue-700 text-white"
          disabled={loading}
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving Settings...
            </>
          ) : (
            "Save Settings"
          )}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={handleReset}
          disabled={loading}
        >
          Reset to Current
        </Button>
      </div>
    </form>
  )
}
