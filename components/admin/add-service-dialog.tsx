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
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus } from "lucide-react"
import { addService } from "@/app/actions/services"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"

export function AddServiceDialog({ categories, providers }: { categories: any[]; providers: any[] }) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)

    try {
      const formData = new FormData(e.currentTarget)

      const result = await addService(formData)

      if (!result?.success) {
        throw new Error("Failed to add service")
      }

      toast({
        title: "Success",
        description: "Service added successfully",
      })

      setOpen(false)
      e.currentTarget.reset()
      router.refresh()
    } catch (error: any) {
      console.error("[v0] Service add error:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to add service",
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
          Add Service
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Add New Service</DialogTitle>
          <DialogDescription>Create a new SMM service for users to order</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Service Name</Label>
              <Input id="name" name="name" placeholder="Instagram Followers" required />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Textarea id="description" name="description" placeholder="High quality Instagram followers..." />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="category_id">Category</Label>
                <Select name="category_id" required>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id}>
                        {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="provider_id">Provider (Optional)</Label>
                <Select name="provider_id">
                  <SelectTrigger>
                    <SelectValue placeholder="None (Custom)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None (Custom Service)</SelectItem>
                    {providers.map((provider) => (
                      <SelectItem key={provider.id} value={provider.id}>
                        {provider.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="base_price">Price ($)</Label>
                <Input id="base_price" name="base_price" type="number" step="0.01" required placeholder="10.00" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="min_quantity">Min Quantity</Label>
                <Input id="min_quantity" name="min_quantity" type="number" defaultValue="100" required />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="max_quantity">Max Quantity</Label>
                <Input id="max_quantity" name="max_quantity" type="number" defaultValue="100000" required />
              </div>
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="has_refill">Enable Refill Guarantee</Label>
              <Switch id="has_refill" name="has_refill" />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="is_active">Active</Label>
              <Switch id="is_active" name="is_active" defaultChecked />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Adding..." : "Add Service"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
