"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Plus } from "lucide-react"
import { addApiProvider } from "@/app/actions/api-providers"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export function AddApiProviderDialog() {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [multiplier, setMultiplier] = useState("3")
  const [autoSync, setAutoSync] = useState(true)
  const router = useRouter()
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)

    try {
      const formData = new FormData(e.currentTarget)

      toast({
        title: "Testing Connection",
        description: "Verifying API credentials...",
      })

      const result = await addApiProvider(formData)

      if (result.error) {
        throw new Error(result.error)
      }

      toast({
        title: "Provider Added",
        description: "API Provider added successfully.",
      })

      if (autoSync && result.providerId) {
        toast({
          title: "Syncing Services",
          description: `Importing services with ${multiplier}x pricing...`,
        })

        const syncResponse = await fetch("/api/admin/sync-services", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            providerId: result.providerId,
            multiplier: Number.parseFloat(multiplier),
          }),
        })

        const syncResult = await syncResponse.json()

        if (syncResult.success) {
          toast({
            title: "Sync Complete",
            description: syncResult.message,
          })
        } else {
          toast({
            title: "Sync Warning",
            description: syncResult.error || "Services may need manual sync",
            variant: "destructive",
          })
        }
      }

      setOpen(false)
      router.refresh()
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to add provider",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Add API Provider
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Add API Provider</DialogTitle>
          <DialogDescription>Connect an external SMM API provider for automated order processing.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Provider Name</Label>
              <Input id="name" name="name" placeholder="JustAnotherPanel" required />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="api_url">API URL</Label>
              <Input id="api_url" name="api_url" placeholder="https://justanotherpanel.com/api/v2" required />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="api_key">API Key</Label>
              <Input id="api_key" name="api_key" type="password" placeholder="Your API key" required />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="priority">Priority (lower = higher priority)</Label>
              <Input id="priority" name="priority" type="number" defaultValue="1" required />
            </div>

            <div className="grid gap-2">
              <Label>Pricing Multiplier</Label>
              <Select value={multiplier} onValueChange={setMultiplier}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="2">×2 (Reseller pricing)</SelectItem>
                  <SelectItem value="2.5">×2.5 (Bulk pricing)</SelectItem>
                  <SelectItem value="3">×3 (Normal pricing - recommended)</SelectItem>
                  <SelectItem value="4">×4 (Premium pricing)</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Applied to all synced services (provider cost × multiplier)
              </p>
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="is_active">Active</Label>
              <Switch id="is_active" name="is_active" defaultChecked />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="auto_sync">Auto-Sync Services</Label>
                <p className="text-xs text-muted-foreground">Automatically import services after adding</p>
              </div>
              <Switch id="auto_sync" checked={autoSync} onCheckedChange={setAutoSync} />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Adding & Syncing..." : autoSync ? "Add & Sync Services" : "Add Provider"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
