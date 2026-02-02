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
import { Pencil } from "lucide-react"
import { updateApiProvider } from "@/app/actions/api-providers"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"
import type { ApiProvider } from "@/lib/types/database"

export function EditApiProviderDialog({ provider }: { provider: ApiProvider }) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
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

      await updateApiProvider(provider.id, formData)

      toast({
        title: "Provider Updated",
        description: "API Provider updated successfully.",
      })

      setOpen(false)
      router.refresh()
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update provider",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" title="Edit Provider">
          <Pencil className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Edit API Provider</DialogTitle>
          <DialogDescription>
            Update API provider settings and credentials
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Provider Name</Label>
              <Input
                id="name"
                name="name"
                placeholder="JustAnotherPanel"
                defaultValue={provider.name}
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="api_url">API URL</Label>
              <Input
                id="api_url"
                name="api_url"
                placeholder="https://justanotherpanel.com/api/v2"
                defaultValue={provider.api_url}
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="api_key">API Key</Label>
              <Input
                id="api_key"
                name="api_key"
                type="password"
                placeholder="Leave blank to keep current key"
                defaultValue={provider.api_key}
              />
              <p className="text-xs text-muted-foreground">
                Update only if you need to change the API key
              </p>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="priority">Priority (lower = higher priority)</Label>
              <Input
                id="priority"
                name="priority"
                type="number"
                defaultValue={provider.priority}
                required
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="is_active">Active</Label>
                <p className="text-xs text-muted-foreground">
                  Inactive providers won't receive new orders
                </p>
              </div>
              <Switch
                id="is_active"
                name="is_active"
                defaultChecked={provider.is_active}
              />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Updating & Testing..." : "Update Provider"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
