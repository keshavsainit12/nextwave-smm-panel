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
import { Plus, Loader2 } from "lucide-react"
import { addApiProvider } from "@/app/actions/api-providers"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"

export function AddApiProviderDialog() {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [multiplier, setMultiplier] = useState("3")
  const [autoSync, setAutoSync] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [status, setStatus] = useState<string>("")
  const router = useRouter()
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setStatus("Starting...")

    console.log("[AddProvider] Form submitted")

    try {
      const formData = new FormData(e.currentTarget)
      
      // Log form data for debugging
      const name = formData.get("name")
      const apiUrl = formData.get("api_url")
      const apiKey = formData.get("api_key")
      console.log("[AddProvider] Form data:", { name, apiUrl, apiKey: apiKey ? "***" : "empty" })

      setStatus("Testing API connection...")
      console.log("[AddProvider] Testing connection...")

      toast({
        title: "Testing Connection",
        description: "Verifying API credentials...",
      })

      const result = await addApiProvider(formData)
      console.log("[AddProvider] Add provider result:", result)

      if (result.error) {
        console.error("[AddProvider] Error from addApiProvider:", result.error)
        throw new Error(result.error)
      }

      if (!result.providerId) {
        console.error("[AddProvider] No providerId returned")
        throw new Error("Provider added but no ID returned")
      }

      console.log("[AddProvider] Provider added successfully:", result.providerId)
      setStatus("Provider added successfully!")

      toast({
        title: "Provider Added ✅",
        description: "API Provider added successfully.",
      })

      if (autoSync && result.providerId) {
        setStatus("Syncing services...")
        console.log("[AddProvider] Starting service sync...")

        toast({
          title: "Syncing Services...",
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

        console.log("[AddProvider] Sync response status:", syncResponse.status)

        if (!syncResponse.ok) {
          const errorText = await syncResponse.text()
          console.error("[AddProvider] Sync failed:", errorText)
          throw new Error(`Sync failed: ${syncResponse.status} - ${errorText}`)
        }

        const syncResult = await syncResponse.json()
        console.log("[AddProvider] Sync result:", syncResult)

        if (syncResult.success) {
          setStatus("Sync complete!")
          toast({
            title: "Sync Complete ✅",
            description: syncResult.message || `Synced ${syncResult.synced} services`,
          })
        } else {
          console.warn("[AddProvider] Sync returned success=false:", syncResult)
          toast({
            title: "Sync Warning ⚠️",
            description: syncResult.error || "Services may need manual sync",
            variant: "destructive",
          })
        }
      }

      // Success - close dialog and refresh
      console.log("[AddProvider] Success! Closing dialog and refreshing...")
      setTimeout(() => {
        setOpen(false)
        router.refresh()
      }, 1000)

    } catch (error) {
      console.error("[AddProvider] Exception caught:", error)
      const errorMessage = error instanceof Error ? error.message : "Failed to add provider"
      setError(errorMessage)
      setStatus("Failed!")
      
      toast({
        title: "Error ❌",
        description: errorMessage,
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
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {status && loading && (
              <Alert>
                <Loader2 className="h-4 w-4 animate-spin" />
                <AlertDescription>{status}</AlertDescription>
              </Alert>
            )}

            <div className="grid gap-2">
              <Label htmlFor="name">Provider Name</Label>
              <Input id="name" name="name" placeholder="JustAnotherPanel" required disabled={loading} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="api_url">API URL</Label>
              <Input id="api_url" name="api_url" placeholder="https://justanotherpanel.com/api/v2" required disabled={loading} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="api_key">API Key</Label>
              <Input id="api_key" name="api_key" type="password" placeholder="Your API key" required disabled={loading} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="priority">Priority (lower = higher priority)</Label>
              <Input id="priority" name="priority" type="number" defaultValue="1" required disabled={loading} />
            </div>

            <div className="grid gap-2">
              <Label>Pricing Multiplier</Label>
              <Select value={multiplier} onValueChange={setMultiplier} disabled={loading}>
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
              <Switch id="is_active" name="is_active" defaultChecked disabled={loading} />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="auto_sync">Auto-Sync Services</Label>
                <p className="text-xs text-muted-foreground">Automatically import services after adding</p>
              </div>
              <Switch id="auto_sync" checked={autoSync} onCheckedChange={setAutoSync} disabled={loading} />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : autoSync ? (
                "Add & Sync Services"
              ) : (
                "Add Provider"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
