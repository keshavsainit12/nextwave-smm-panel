"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "sonner"
import { Loader2 } from "lucide-react"
import { CURRENCIES, getSupportedCurrencies } from "@/lib/currency"
import { updateSystemSettings } from "@/app/actions/system-settings"

export function SystemSettingsForm({ 
  settings, 
  userId 
}: { 
  settings: Record<string, string>
  userId?: string
}) {
  const [loading, setLoading] = useState(false)
  const [currency, setCurrency] = useState(settings.currency || "USD")

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)

    try {
      const formData = new FormData(e.currentTarget)
      const data = {
        site_name: formData.get("site_name") as string,
        currency: currency,
        currency_symbol: CURRENCIES[currency]?.symbol || "$",
        min_deposit: formData.get("min_deposit") as string,
        global_markup: formData.get("global_markup") as string,
        referral_commission: formData.get("referral_commission") as string,
      }

      // Pass userId to server action
      const result = await updateSystemSettings(data, userId)

      if (result.success) {
        toast.success("Settings updated successfully! 🎉", {
          description: currency !== "USD" 
            ? `Currency changed to ${CURRENCIES[currency]?.name}. All amounts will now display in ${currency}.`
            : "System settings have been saved."
        })
        
        // Refresh page to apply new currency
        setTimeout(() => {
          window.location.reload()
        }, 1500)
      } else {
        toast.error(result.error || "Failed to update settings")
      }
    } catch (error) {
      console.error("Settings update error:", error)
      toast.error("An error occurred while updating settings")
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid gap-4">
        <div className="grid gap-2">
          <Label htmlFor="site_name">Site Name</Label>
          <Input 
            id="site_name" 
            name="site_name" 
            defaultValue={settings.site_name} 
            disabled={loading}
          />
        </div>

        <div className="grid gap-2">
          <Label htmlFor="currency">Currency</Label>
          <Select value={currency} onValueChange={setCurrency} disabled={loading}>
            <SelectTrigger id="currency">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {getSupportedCurrencies().map((code) => {
                const curr = CURRENCIES[code]
                return (
                  <SelectItem key={code} value={code}>
                    {curr.symbol} {curr.name} ({code})
                  </SelectItem>
                )
              })}
            </SelectContent>
          </Select>
          <p className="text-xs text-muted-foreground">
            All amounts will be converted and displayed in this currency. 
            {currency !== "USD" && ` (1 USD = ${CURRENCIES[currency]?.exchangeRate} ${currency})`}
          </p>
        </div>

        <div className="grid gap-2">
          <Label htmlFor="min_deposit">Minimum Deposit (USD)</Label>
          <Input 
            id="min_deposit" 
            name="min_deposit" 
            type="number" 
            step="0.01"
            defaultValue={settings.min_deposit} 
            disabled={loading}
          />
          <p className="text-xs text-muted-foreground">
            Base amount in USD. Will be converted for display.
          </p>
        </div>

        <div className="grid gap-2">
          <Label htmlFor="global_markup">Global Markup (%)</Label>
          <Input 
            id="global_markup" 
            name="global_markup" 
            type="number" 
            step="0.1"
            defaultValue={settings.global_markup} 
            disabled={loading}
          />
        </div>

        <div className="grid gap-2">
          <Label htmlFor="referral_commission">Referral Commission (%)</Label>
          <Input
            id="referral_commission"
            name="referral_commission"
            type="number"
            step="0.1"
            defaultValue={settings.referral_commission}
            disabled={loading}
          />
        </div>
      </div>

      <Button type="submit" disabled={loading} className="w-full sm:w-auto">
        {loading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Saving Settings...
          </>
        ) : (
          "Save Settings"
        )}
      </Button>

      {currency !== "USD" && (
        <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
          <p className="text-sm text-blue-900 dark:text-blue-100">
            <strong>Note:</strong> When you save, the page will reload and all amounts (wallets, services, transactions) 
            will be displayed in {CURRENCIES[currency]?.name} ({currency}). 
            The conversion uses the rate: 1 USD = {CURRENCIES[currency]?.exchangeRate} {currency}
          </p>
        </div>
      )}
    </form>
  )
}
