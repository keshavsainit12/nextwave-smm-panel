"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { getSupportedCurrencies, DEFAULT_EXCHANGE_RATES } from "@/lib/currency"
import { updateSystemSettings } from "@/app/actions/system-settings"
import { useToast } from "@/hooks/use-toast"
import { Loader2 } from "lucide-react"

export function SystemSettingsForm({ settings }: { settings: Record<string, string> }) {
  const [loading, setLoading] = useState(false)
  const [selectedCurrency, setSelectedCurrency] = useState(settings.currency || 'USD')
  const { toast } = useToast()
  
  const supportedCurrencies = getSupportedCurrencies()

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)

    try {
      const formData = new FormData(e.currentTarget)
      const updates: Record<string, string> = {}

      // Collect all form values
      formData.forEach((value, key) => {
        updates[key] = value.toString()
      })

      // Add currency settings
      const currency = formData.get('currency') as string
      updates.currency = currency
      
      // Get the symbol for the selected currency
      const currencyInfo = supportedCurrencies.find(c => c.code === currency)
      if (currencyInfo) {
        updates.currency_symbol = currencyInfo.symbol
      }
      
      // Set the exchange rate for the currency
      updates.exchange_rate = String(DEFAULT_EXCHANGE_RATES[currency] || 1)

      const result = await updateSystemSettings(updates)

      if (result.success) {
        toast({
          title: "Settings Updated",
          description: "System settings have been updated successfully. Currency changes will apply across the platform.",
        })
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to update settings",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid gap-4">
        <div className="grid gap-2">
          <Label htmlFor="site_name">Site Name</Label>
          <Input id="site_name" name="site_name" defaultValue={settings.site_name} required />
        </div>
        
        <div className="grid gap-2">
          <Label htmlFor="currency">Website Currency</Label>
          <Select name="currency" defaultValue={selectedCurrency} onValueChange={setSelectedCurrency}>
            <SelectTrigger id="currency">
              <SelectValue placeholder="Select currency" />
            </SelectTrigger>
            <SelectContent>
              {supportedCurrencies.map((curr) => (
                <SelectItem key={curr.code} value={curr.code}>
                  {curr.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="text-xs text-muted-foreground">
            This will change how all prices are displayed to users. Balances are stored in USD and converted in real-time.
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
            required 
          />
          <p className="text-xs text-muted-foreground">
            Stored in USD, displayed in selected currency
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
            required 
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
            required
          />
        </div>
      </div>
      
      <Button type="submit" disabled={loading}>
        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        Save Settings
      </Button>
    </form>
  )
}
