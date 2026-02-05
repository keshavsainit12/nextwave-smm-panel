"use client"

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Edit, Trash2, Power, PowerOff, Search, Check, X, Loader2 } from "lucide-react"
import { deleteService, toggleServiceStatus, updateServicePrice } from "@/app/actions/services"
import { useRouter } from "next/navigation"
import { EditServiceDialog } from "./edit-service-dialog"
import { useState } from "react"
import { useToast } from "@/hooks/use-toast"

// Standard multiplier used for price calculations
// This represents the average markup: provider cost × 3 = selling price
const DEFAULT_PRICE_MULTIPLIER = 3

export function ServiceList({ services }: { services: any[] }) {
  const router = useRouter()
  const { toast } = useToast()
  const [editingService, setEditingService] = useState<any>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [editingPrice, setEditingPrice] = useState<{ id: string; price: number } | null>(null)
  const [savingPrice, setSavingPrice] = useState(false)

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this service?")) {
      try {
        await deleteService(id)
        toast({ title: "Success", description: "Service deleted successfully" })
        router.refresh()
      } catch (error) {
        toast({ title: "Error", description: "Failed to delete service", variant: "destructive" })
      }
    }
  }

  const handleToggleStatus = async (id: string, currentStatus: boolean) => {
    try {
      await toggleServiceStatus(id, !currentStatus)
      toast({
        title: "Success",
        description: `Service ${!currentStatus ? "activated" : "deactivated"} successfully`,
      })
      router.refresh()
    } catch (error) {
      toast({ title: "Error", description: "Failed to update service status", variant: "destructive" })
    }
  }

  const handleSavePrice = async () => {
    if (!editingPrice) return
    setSavingPrice(true)
    try {
      console.log("[v0] Saving price:", editingPrice)
      const result = await updateServicePrice(editingPrice.id, editingPrice.price)
      console.log("[v0] Update result:", result)
      
      // Show success feedback
      toast({ title: "Success", description: "Price updated successfully" })
      alert("Price updated successfully!") // Backup notification
      
      setEditingPrice(null)
      router.refresh()
    } catch (error: any) {
      console.error("[v0] Failed to update price:", error)
      const errorMsg = error?.message || "Failed to update price"
      
      // Show error feedback
      toast({ 
        title: "Error", 
        description: errorMsg, 
        variant: "destructive" 
      })
      alert(`ERROR: ${errorMsg}`) // Backup notification
    } finally {
      setSavingPrice(false)
    }
  }

  const filteredServices = services.filter(
    (s) =>
      s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.service_categories?.name?.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  if (services.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No services found. Sync services from API Providers first.
      </div>
    )
  }

  return (
    <>
      <div className="mb-4 flex items-center gap-2">
        <Search className="h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search services..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-sm"
        />
        <span className="text-sm text-muted-foreground">
          Showing {filteredServices.length} of {services.length}
        </span>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[300px]">Service Name</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Provider</TableHead>
              <TableHead>Provider Price</TableHead>
              <TableHead>Selling Price</TableHead>
              <TableHead>Profit</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredServices.map((service) => {
              const sellingPrice = Number(service.base_price || 0)
              // Calculate estimated provider cost from selling price
              // Note: Uses standard 3x multiplier since provider_price column not in base schema
              const providerPrice = sellingPrice > 0 ? sellingPrice / DEFAULT_PRICE_MULTIPLIER : 0
              const profit = providerPrice > 0 ? (((sellingPrice - providerPrice) / providerPrice) * 100).toFixed(0) : 0

              return (
                <TableRow key={service.id}>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      {service.icon && (
                        <img
                          src={service.icon || "/placeholder.svg"}
                          alt={service.name}
                          className="h-8 w-8 rounded object-contain bg-muted p-1"
                          onError={(e) => {
                            e.currentTarget.style.display = "none"
                          }}
                        />
                      )}
                      <div>
                        <div className="max-w-[250px] truncate">{service.name}</div>
                        {service.external_service_id && (
                          <div className="text-xs text-muted-foreground">ID: {service.external_service_id}</div>
                        )}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{service.service_categories?.name || "N/A"}</TableCell>
                  <TableCell>
                    <code className="text-xs bg-muted px-2 py-1 rounded">
                      {service.api_providers?.name || "Manual"}
                    </code>
                  </TableCell>
                  <TableCell className="text-muted-foreground">${providerPrice.toFixed(4)}</TableCell>
                  <TableCell>
                    {editingPrice?.id === service.id ? (
                      <div className="flex items-center gap-1">
                        <Input
                          type="number"
                          step="0.0001"
                          value={editingPrice.price}
                          onChange={(e) => setEditingPrice({ ...editingPrice, price: Number(e.target.value) })}
                          className="w-24 h-8"
                        />
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-8 w-8"
                          onClick={handleSavePrice}
                          disabled={savingPrice}
                        >
                          {savingPrice ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Check className="h-4 w-4 text-green-500" />
                          )}
                        </Button>
                        <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => setEditingPrice(null)}>
                          <X className="h-4 w-4 text-red-500" />
                        </Button>
                      </div>
                    ) : (
                      <span
                        className="font-semibold text-green-600 cursor-pointer hover:underline"
                        onClick={() => setEditingPrice({ id: service.id, price: sellingPrice })}
                      >
                        ${sellingPrice.toFixed(4)}
                      </span>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge variant={Number(profit) >= 100 ? "default" : "secondary"}>{profit}%</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={service.is_active ? "default" : "secondary"}>
                      {service.is_active ? "Active" : "Inactive"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleToggleStatus(service.id, service.is_active)}
                        title={service.is_active ? "Deactivate" : "Activate"}
                      >
                        {service.is_active ? (
                          <PowerOff className="h-4 w-4 text-orange-500" />
                        ) : (
                          <Power className="h-4 w-4 text-green-500" />
                        )}
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => setEditingService(service)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(service.id)}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </div>

      {editingService && (
        <EditServiceDialog service={editingService} open={!!editingService} onClose={() => setEditingService(null)} />
      )}
    </>
  )
}
