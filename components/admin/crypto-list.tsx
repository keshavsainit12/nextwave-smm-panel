"use client"

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Edit, Trash2, Copy, Check } from "lucide-react"
import type { CryptoCurrency } from "@/lib/types/database"
import { useState } from "react"
import { EditCryptoDialog } from "./edit-crypto-dialog"
import { deleteCryptoCurrency } from "@/app/actions/crypto"
import { useRouter } from "next/navigation"

export function CryptoList({ currencies }: { currencies: CryptoCurrency[] }) {
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [editingCurrency, setEditingCurrency] = useState<CryptoCurrency | null>(null)
  const router = useRouter()

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this cryptocurrency?")) {
      await deleteCryptoCurrency(id)
      router.refresh()
    }
  }

  if (currencies.length === 0) {
    return <div className="text-center py-8 text-muted-foreground">No cryptocurrencies added yet</div>
  }

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Currency</TableHead>
            <TableHead>Network</TableHead>
            <TableHead>Wallet Address</TableHead>
            <TableHead>Min Deposit</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {currencies.map((currency) => (
            <TableRow key={currency.id}>
              <TableCell className="font-medium">
                {currency.name} ({currency.symbol})
              </TableCell>
              <TableCell>{currency.network || "N/A"}</TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <code className="text-xs bg-muted px-2 py-1 rounded">
                    {currency.wallet_address.slice(0, 12)}...{currency.wallet_address.slice(-8)}
                  </code>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7"
                    onClick={() => copyToClipboard(currency.wallet_address, currency.id)}
                  >
                    {copiedId === currency.id ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                  </Button>
                </div>
              </TableCell>
              <TableCell>${currency.minimum_deposit}</TableCell>
              <TableCell>
                <Badge variant={currency.is_active ? "default" : "secondary"}>
                  {currency.is_active ? "Active" : "Inactive"}
                </Badge>
              </TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-2">
                  <Button variant="ghost" size="icon" onClick={() => setEditingCurrency(currency)}>
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => handleDelete(currency.id)}>
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {editingCurrency && (
        <EditCryptoDialog
          currency={editingCurrency}
          open={!!editingCurrency}
          onClose={() => setEditingCurrency(null)}
        />
      )}
    </>
  )
}
