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
import { addCryptoCurrency } from "@/app/actions/crypto"
import { useRouter } from "next/navigation"
import { toast } from "@/hooks/use-toast"

export function AddCryptoDialog() {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)

    try {
      const formData = new FormData(e.currentTarget)
      const result = await addCryptoCurrency(formData)

      if (result && !result.success) {
        throw new Error(result.error || "Failed to add cryptocurrency")
      }

      toast({
        title: "Success",
        description: "Cryptocurrency added successfully",
      })

      setOpen(false)
      e.currentTarget.reset()
      router.refresh()
    } catch (error) {
      console.error("[v0] Crypto add error:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to add cryptocurrency. Please try again.",
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
          Add Cryptocurrency
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Add Cryptocurrency</DialogTitle>
          <DialogDescription>Add a new cryptocurrency for user deposits. Changes reflect instantly.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Currency Name</Label>
              <Input id="name" name="name" placeholder="Bitcoin" required disabled={loading} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="symbol">Symbol</Label>
              <Input id="symbol" name="symbol" placeholder="BTC" required disabled={loading} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="network">Network</Label>
              <Input id="network" name="network" placeholder="Bitcoin Mainnet" disabled={loading} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="wallet_address">Wallet Address</Label>
              <Input
                id="wallet_address"
                name="wallet_address"
                placeholder="bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh"
                required
                disabled={loading}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="minimum_deposit">Minimum Deposit ($)</Label>
              <Input
                id="minimum_deposit"
                name="minimum_deposit"
                type="number"
                step="0.01"
                defaultValue="10"
                required
                disabled={loading}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="is_active">Active</Label>
              <Switch id="is_active" name="is_active" defaultChecked disabled={loading} />
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
                  Adding...
                </>
              ) : (
                "Add Currency"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
