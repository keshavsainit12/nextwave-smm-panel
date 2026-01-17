"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { updateCryptoCurrency } from "@/app/actions/crypto"
import { useRouter } from "next/navigation"
import type { CryptoCurrency } from "@/lib/types/database"

interface EditCryptoDialogProps {
  currency: CryptoCurrency
  open: boolean
  onClose: () => void
}

export function EditCryptoDialog({ currency, open, onClose }: EditCryptoDialogProps) {
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)

    const formData = new FormData(e.currentTarget)
    await updateCryptoCurrency(currency.id, formData)

    setLoading(false)
    onClose()
    router.refresh()
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Edit Cryptocurrency</DialogTitle>
          <DialogDescription>
            Update cryptocurrency settings. Changes reflect instantly on client panel.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Currency Name</Label>
              <Input id="name" name="name" defaultValue={currency.name} required />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="symbol">Symbol</Label>
              <Input id="symbol" name="symbol" defaultValue={currency.symbol} required />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="network">Network</Label>
              <Input id="network" name="network" defaultValue={currency.network || ""} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="wallet_address">Wallet Address</Label>
              <Input id="wallet_address" name="wallet_address" defaultValue={currency.wallet_address} required />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="minimum_deposit">Minimum Deposit ($)</Label>
              <Input
                id="minimum_deposit"
                name="minimum_deposit"
                type="number"
                step="0.01"
                defaultValue={currency.minimum_deposit}
                required
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="is_active">Active</Label>
              <Switch id="is_active" name="is_active" defaultChecked={currency.is_active} />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Updating..." : "Update Currency"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
