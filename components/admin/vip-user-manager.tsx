"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { updateUserTier } from "@/app/actions/admin-services"
import { toast } from "sonner"
import { Crown, Users } from "lucide-react"

interface VIPUserManagerProps {
  userId: string
  currentTier?: number
  userEmail: string
}

export function VIPUserManager({ userId, currentTier, userEmail }: VIPUserManagerProps) {
  const [open, setOpen] = useState(false)
  const [tier, setTier] = useState(String(currentTier || 1))
  const [customMultiplier, setCustomMultiplier] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const multiplier = tier === "4" && customMultiplier ? Number(customMultiplier) : undefined
      await updateUserTier(userId, Number(tier), multiplier)
      toast.success(`Updated tier for ${userEmail}`)
      setOpen(false)
    } catch (error) {
      toast.error("Failed to update user tier")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Crown className="mr-2 h-4 w-4" />
          Set Tier
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Manage User Tier</DialogTitle>
          <DialogDescription>Set pricing tier for {userEmail}</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>User Tier</Label>
            <Select value={tier} onValueChange={setTier}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">Normal User (×3.0)</SelectItem>
                <SelectItem value="2">Bulk Buyer (×2.5)</SelectItem>
                <SelectItem value="3">Reseller (×2.0)</SelectItem>
                <SelectItem value="4">VIP (Custom)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {tier === "4" && (
            <div className="space-y-2">
              <Label htmlFor="multiplier">Custom Price Multiplier</Label>
              <Input
                id="multiplier"
                type="number"
                step="0.1"
                min="1"
                max="5"
                value={customMultiplier}
                onChange={(e) => setCustomMultiplier(e.target.value)}
                placeholder="e.g., 1.5 for 50% profit"
                required
              />
              <p className="text-xs text-muted-foreground">Recommended: 1.5 - 2.5 for VIP users</p>
            </div>
          )}

          <div className="bg-muted p-3 rounded-lg space-y-1">
            <p className="text-sm font-medium">Pricing Tiers Explained:</p>
            <ul className="text-xs text-muted-foreground space-y-1">
              <li>• Normal: ×3 provider cost (standard profit)</li>
              <li>• Bulk Buyer: ×2.5 provider cost (volume discount)</li>
              <li>• Reseller: ×2 provider cost (wholesale pricing)</li>
              <li>• VIP: Custom multiplier (premium customers)</li>
            </ul>
          </div>

          <Button type="submit" disabled={loading} className="w-full">
            <Users className="mr-2 h-4 w-4" />
            Update User Tier
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
