"use client"

import { Button } from "@/components/ui/button"
import { RefreshCw } from "lucide-react"
import { useState } from "react"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"

export function SyncServicesButton({ providers }: { providers: any[] }) {
  const [open, setOpen] = useState(false)
  const [syncing, setSyncing] = useState(false)
  const [selectedProvider, setSelectedProvider] = useState<string>("")
  const [multiplier, setMultiplier] = useState("3")
  const { toast } = useToast()
  const router = useRouter()

  const handleSync = async () => {
    if (!selectedProvider) {
      toast({
        title: "Provider Required",
        description: "Please select an API provider to sync",
        variant: "destructive",
      })
      return
    }

    setSyncing(true)
    
    try {
      toast({
        title: "Syncing Services",
        description: `Fetching services with ${multiplier}x pricing...`,
      })

      const response = await fetch("/api/admin/sync-services", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          providerId: selectedProvider,
          multiplier: Number.parseFloat(multiplier),
        }),
      })

      const result = await response.json()

      if (result.success || result.synced > 0) {
        toast({
          title: "Sync Complete!",
          description: result.message || `Synced ${result.synced} services successfully`,
        })
        setOpen(false)
        router.refresh()
      } else {
        toast({
          title: "Sync Failed",
          description: result.error || "Failed to sync services",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Sync Error",
        description: error instanceof Error ? error.message : "Failed to sync services",
        variant: "destructive",
      })
    } finally {
      setSyncing(false)
    }
  }

  if (providers.length === 0) {
    return (
      <Button variant="outline" disabled>
        <RefreshCw className="mr-2 h-4 w-4" />
        Sync from API
      </Button>
    )
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <RefreshCw className="mr-2 h-4 w-4" />
          Sync from API
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Sync Services from API</DialogTitle>
          <DialogDescription>
            Import services from your API provider with customizable pricing markup
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="provider">API Provider</Label>
            <Select value={selectedProvider} onValueChange={setSelectedProvider}>
              <SelectTrigger id="provider">
                <SelectValue placeholder="Select provider" />
              </SelectTrigger>
              <SelectContent>
                {providers.map((provider) => (
                  <SelectItem key={provider.id} value={provider.id}>
                    {provider.name} {!provider.is_active && "(Inactive)"}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="multiplier">Price Multiplier</Label>
            <Select value={multiplier} onValueChange={setMultiplier}>
              <SelectTrigger id="multiplier">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="2">×2 (Reseller pricing)</SelectItem>
                <SelectItem value="2.5">×2.5 (Bulk pricing)</SelectItem>
                <SelectItem value="3">×3 (Normal pricing - recommended)</SelectItem>
                <SelectItem value="4">×4 (Premium pricing)</SelectItem>
                <SelectItem value="5">×5 (High margin)</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              Your selling price = Provider cost × {multiplier}
            </p>
          </div>
        </div>
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => setOpen(false)} disabled={syncing}>
            Cancel
          </Button>
          <Button onClick={handleSync} disabled={syncing}>
            {syncing ? (
              <>
                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                Syncing...
              </>
            ) : (
              <>
                <RefreshCw className="mr-2 h-4 w-4" />
                Sync Services
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
