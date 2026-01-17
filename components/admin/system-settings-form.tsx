"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export function SystemSettingsForm({ settings }: { settings: Record<string, string> }) {
  return (
    <form className="space-y-6">
      <div className="grid gap-4">
        <div className="grid gap-2">
          <Label htmlFor="site_name">Site Name</Label>
          <Input id="site_name" name="site_name" defaultValue={settings.site_name} />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="currency_symbol">Currency Symbol</Label>
          <Input id="currency_symbol" name="currency_symbol" defaultValue={settings.currency_symbol} />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="min_deposit">Minimum Deposit ($)</Label>
          <Input id="min_deposit" name="min_deposit" type="number" defaultValue={settings.min_deposit} />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="global_markup">Global Markup (%)</Label>
          <Input id="global_markup" name="global_markup" type="number" defaultValue={settings.global_markup} />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="referral_commission">Referral Commission (%)</Label>
          <Input
            id="referral_commission"
            name="referral_commission"
            type="number"
            defaultValue={settings.referral_commission}
          />
        </div>
      </div>
      <Button type="submit">Save Settings</Button>
    </form>
  )
}
