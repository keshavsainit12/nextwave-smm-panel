"use client"

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Check, X, ImageIcon } from "lucide-react"
import { formatDistance } from "date-fns"
import { approveDeposit, rejectDeposit } from "@/app/actions/deposits"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { toast } from "sonner"

export function CryptoDepositList({ deposits }: { deposits: any[] }) {
  const router = useRouter()
  const [selectedScreenshot, setSelectedScreenshot] = useState<string | null>(null)
  const [loading, setLoading] = useState<string | null>(null)

  const handleApprove = async (id: string) => {
    if (confirm("Approve this deposit and credit user balance?")) {
      setLoading(id)
      try {
        const result = await approveDeposit(id)
        if (result.success) {
          toast.success("Deposit approved! User balance updated.")
          router.refresh()
        } else {
          toast.error(result.error || "Failed to approve deposit")
        }
      } catch (error: any) {
        console.error("[v0] Approve error:", error)
        toast.error(error?.message || "Failed to approve deposit")
      } finally {
        setLoading(null)
      }
    }
  }

  const handleReject = async (id: string) => {
    const reason = prompt("Rejection reason:")
    if (reason && reason.trim()) {
      setLoading(id)
      try {
        const result = await rejectDeposit(id, reason)
        if (result.success) {
          toast.success("Deposit rejected successfully")
          router.refresh()
        } else {
          toast.error(result.error || "Failed to reject deposit")
        }
      } catch (error: any) {
        console.error("[v0] Reject error:", error)
        toast.error(error?.message || "Failed to reject deposit")
      } finally {
        setLoading(null)
      }
    }
  }

  if (deposits.length === 0) {
    return <div className="text-center py-8 text-muted-foreground">No deposits found</div>
  }

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>User</TableHead>
            <TableHead>Currency</TableHead>
            <TableHead>Amount (USD)</TableHead>
            <TableHead>Crypto Amount</TableHead>
            <TableHead>Screenshot</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Date</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {deposits.map((deposit) => (
            <TableRow key={deposit.id}>
              <TableCell>
                <div>
                  <div className="font-medium">{deposit.user_id?.full_name || deposit.user_id?.email?.split("@")[0]}</div>
                  <div className="text-xs text-muted-foreground">{deposit.user_id?.email}</div>
                </div>
              </TableCell>
              <TableCell>
                <div className="font-medium">{deposit.crypto_currency_id?.symbol}</div>
                <div className="text-xs text-muted-foreground">{deposit.crypto_currency_id?.name}</div>
              </TableCell>
              <TableCell className="font-mono font-semibold text-green-600">${deposit.amount}</TableCell>
              <TableCell className="font-mono text-sm">{deposit.crypto_amount}</TableCell>
              <TableCell>
                {deposit.screenshot_url ? (
                  <Button variant="outline" size="sm" onClick={() => setSelectedScreenshot(deposit.screenshot_url)}>
                    <ImageIcon className="mr-1 h-3 w-3" />
                    View
                  </Button>
                ) : (
                  <span className="text-muted-foreground text-sm">No screenshot</span>
                )}
              </TableCell>
              <TableCell>
                <Badge
                  variant={
                    deposit.status === "approved"
                      ? "default"
                      : deposit.status === "rejected"
                        ? "destructive"
                        : "secondary"
                  }
                  className="capitalize"
                >
                  {deposit.status}
                </Badge>
              </TableCell>
              <TableCell className="text-sm text-muted-foreground">
                {formatDistance(new Date(deposit.created_at), new Date(), { addSuffix: true })}
              </TableCell>
              <TableCell className="text-right">
                {deposit.status === "pending" ? (
                  <div className="flex justify-end gap-2">
                    <Button
                      size="sm"
                      variant="default"
                      onClick={() => handleApprove(deposit.id)}
                      disabled={loading === deposit.id}
                    >
                      <Check className="mr-1 h-3 w-3" />
                      {loading === deposit.id ? "Processing..." : "Approve"}
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleReject(deposit.id)}
                      disabled={loading === deposit.id}
                    >
                      <X className="mr-1 h-3 w-3" />
                      {loading === deposit.id ? "Processing..." : "Reject"}
                    </Button>
                  </div>
                ) : deposit.status === "rejected" ? (
                  <div className="text-xs text-right">
                    {deposit.admin_notes && (
                      <div className="text-red-600 dark:text-red-400 font-medium">
                        Reason: {deposit.admin_notes}
                      </div>
                    )}
                    {deposit.reviewed_at && (
                      <div className="text-muted-foreground text-xs mt-1">
                        {formatDistance(new Date(deposit.reviewed_at), new Date(), { addSuffix: true })}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-xs text-right">
                    {deposit.reviewed_at && (
                      <div className="text-green-600 dark:text-green-400 font-medium">
                        Approved {formatDistance(new Date(deposit.reviewed_at), new Date(), { addSuffix: true })}
                      </div>
                    )}
                    {deposit.reviewed_by && (
                      <div className="text-muted-foreground text-xs mt-1">
                        By: {deposit.reviewed_by.substring(0, 8)}...
                      </div>
                    )}
                  </div>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {/* Screenshot viewer dialog */}
      <Dialog open={!!selectedScreenshot} onOpenChange={() => setSelectedScreenshot(null)}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Payment Screenshot</DialogTitle>
          </DialogHeader>
          <div className="relative">
            {selectedScreenshot && (
              <img
                src={selectedScreenshot || "/placeholder.svg"}
                alt="Payment proof"
                className="w-full h-auto rounded-lg border"
              />
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
