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
import { toast } from "sonner"
import { Edit, Loader2 } from "lucide-react"
import { updateUser } from "@/app/actions/users"

interface EditUserDialogProps {
  user: {
    id: string
    email: string
    full_name?: string
    balance: number
    tier: number
    status: string
  }
}

export function EditUserDialog({ user }: EditUserDialogProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [balance, setBalance] = useState(user.balance.toString())
  const [tier, setTier] = useState(user.tier.toString())
  const [status, setStatus] = useState(user.status)
  const [fullName, setFullName] = useState(user.full_name || "")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const result = await updateUser(user.id, {
        balance: Number(balance),
        tier: Number(tier),
        status,
        full_name: fullName || null,
      })
      
      if (result.success) {
        const tierNum = Number(tier)
        let successMsg = `User ${user.email} updated successfully!`
        
        // Show VIP-specific message
        if (tierNum === 4) {
          successMsg += " 🌟 VIP status activated with special pricing!"
        } else if (tierNum === 3) {
          successMsg += " 💼 Reseller pricing applied!"
        } else if (tierNum === 2) {
          successMsg += " 📦 Bulk buyer discount applied!"
        }
        
        toast.success(successMsg)
        setOpen(false)
      } else {
        toast.error(result.error || "Failed to update user")
      }
    } catch (error) {
      toast.error("Failed to update user")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" title="Edit User">
          <Edit className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Edit User</DialogTitle>
          <DialogDescription>{user.email}</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="fullName">Full Name</Label>
            <Input
              id="fullName"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Enter full name"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="balance">Wallet Balance (USD)</Label>
            <Input
              id="balance"
              type="number"
              step="0.01"
              value={balance}
              onChange={(e) => setBalance(e.target.value)}
              placeholder="0.00"
              required
            />
            <p className="text-xs text-muted-foreground">Current: ${user.balance.toFixed(2)}</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="tier">User Tier (Pricing)</Label>
            <Select value={tier} onValueChange={setTier}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">Tier 1 - Normal User (×3.0 markup)</SelectItem>
                <SelectItem value="2">Tier 2 - Bulk Buyer (×2.5 markup)</SelectItem>
                <SelectItem value="3">Tier 3 - Reseller (×2.0 markup)</SelectItem>
                <SelectItem value="4">Tier 4 - VIP (Custom pricing)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="status">Account Status</Label>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="suspended">Suspended</SelectItem>
                <SelectItem value="banned">Banned</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => setOpen(false)} className="flex-1">
              Cancel
            </Button>
            <Button type="submit" disabled={loading} className="flex-1">
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save Changes
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
