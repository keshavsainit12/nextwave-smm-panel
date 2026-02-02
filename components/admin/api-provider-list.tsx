"use client"

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Trash2, TestTube, RefreshCw } from "lucide-react"
import type { ApiProvider } from "@/lib/types/database"
import { deleteApiProvider, testApiProvider } from "@/app/actions/api-providers"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { useToast } from "@/hooks/use-toast"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { EditApiProviderDialog } from "./edit-api-provider-dialog"

export function ApiProviderList({ providers }: { providers: ApiProvider[] }) {
  const router = useRouter()
  const { toast } = useToast()
  const [testing, setTesting] = useState<string | null>(null)
  const [syncing, setSyncing] = useState<string | null>(null)
  const [multiplier, setMultiplier] = useState<string>("3")

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure? This will affect services using this provider.")) {
      await deleteApiProvider(id)
      toast({ title: "Provider Deleted", description: "API provider removed successfully" })
      router.refresh()
    }
  }

  const handleTest = async (id: string) => {
    setTesting(id)
    try {
      const result = await testApiProvider(id)
      if (result.success) {
        toast({
          title: "Connection Successful",
          description: `Balance: ${result.balance} ${result.currency}`,
        })
      } else {
        toast({
          title: "Connection Failed",
          description: result.error,
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: String(error),
        variant: "destructive",
      })
    } finally {
      setTesting(null)
    }
  }

  const handleSync = async (id: string) => {
    setSyncing(id)
    try {
      const response = await fetch("/api/admin/sync-services", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ providerId: id, multiplier: Number.parseFloat(multiplier) }),
      })

      const result = await response.json()

      if (result.success) {
        toast({
          title: "Sync Complete",
          description: result.message,
        })
        router.refresh()
      } else {
        toast({
          title: "Sync Failed",
          description: result.error,
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Sync Failed",
        description: String(error),
        variant: "destructive",
      })
    } finally {
      setSyncing(null)
    }
  }

  if (providers.length === 0) {
    return <div className="text-center py-8 text-muted-foreground">No API providers configured yet</div>
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4 p-4 bg-muted rounded-lg">
        <span className="text-sm font-medium">Default Price Multiplier:</span>
        <Select value={multiplier} onValueChange={setMultiplier}>
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="2">×2 (Reseller)</SelectItem>
            <SelectItem value="2.5">×2.5 (Bulk)</SelectItem>
            <SelectItem value="3">×3 (Normal)</SelectItem>
            <SelectItem value="4">×4 (Premium)</SelectItem>
          </SelectContent>
        </Select>
        <span className="text-xs text-muted-foreground">Applied when syncing services</span>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Provider Name</TableHead>
            <TableHead>API URL</TableHead>
            <TableHead>Priority</TableHead>
            <TableHead>Success Rate</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {providers.map((provider) => (
            <TableRow key={provider.id}>
              <TableCell className="font-medium">{provider.name}</TableCell>
              <TableCell>
                <code className="text-xs bg-muted px-2 py-1 rounded">{provider.api_url}</code>
              </TableCell>
              <TableCell>{provider.priority}</TableCell>
              <TableCell>{provider.success_rate.toFixed(1)}%</TableCell>
              <TableCell>
                <Badge variant={provider.is_active ? "default" : "secondary"}>
                  {provider.is_active ? "Active" : "Inactive"}
                </Badge>
              </TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-2">
                  <EditApiProviderDialog provider={provider} />
                  <Button
                    variant="ghost"
                    size="icon"
                    title="Test Connection"
                    onClick={() => handleTest(provider.id)}
                    disabled={testing === provider.id}
                  >
                    <TestTube className={`h-4 w-4 ${testing === provider.id ? "animate-pulse" : ""}`} />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    title={`Sync Services (${multiplier}x pricing)`}
                    onClick={() => handleSync(provider.id)}
                    disabled={syncing === provider.id}
                  >
                    <RefreshCw className={`h-4 w-4 ${syncing === provider.id ? "animate-spin" : ""}`} />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => handleDelete(provider.id)}>
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
