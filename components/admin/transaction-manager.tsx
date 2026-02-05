"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { formatDistance } from "date-fns"
import { Edit2, Trash2, Search, Loader2 } from "lucide-react"
import { updateTransactionStatus, deleteTransaction, getUserTransactions, searchUserByEmail } from "@/app/actions/admin-transactions"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { useCurrency } from "@/lib/currency-context"

export function AdminTransactionManager() {
  const [searchEmail, setSearchEmail] = useState("")
  const [selectedUser, setSelectedUser] = useState<any>(null)
  const [userTransactions, setUserTransactions] = useState<any[]>([])
  const [searchResults, setSearchResults] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [selectedTransaction, setSelectedTransaction] = useState<any>(null)
  const [showStatusDialog, setShowStatusDialog] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [newStatus, setNewStatus] = useState("")
  const [adminNotes, setAdminNotes] = useState("")
  const router = useRouter()
  const { displayAmount } = useCurrency()

  const handleSearch = async () => {
    if (!searchEmail.trim()) return

    setLoading(true)
    try {
      const result = await searchUserByEmail(searchEmail)
      if (result.error) {
        toast.error(result.error)
      } else {
        setSearchResults(result.data || [])
      }
    } finally {
      setLoading(false)
    }
  }

  const handleSelectUser = async (user: any) => {
    setSelectedUser(user)
    setSearchResults([])
    setSearchEmail("")

    // Fetch user's transactions
    setLoading(true)
    try {
      const result = await getUserTransactions(user.id)
      if (result.error) {
        toast.error(result.error)
      } else {
        setUserTransactions(result.data || [])
      }
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateStatus = async () => {
    if (!selectedTransaction || !newStatus) return

    setLoading(true)
    try {
      const result = await updateTransactionStatus(selectedTransaction.id, newStatus as any, adminNotes)
      if (result.error) {
        toast.error(result.error)
      } else {
        toast.success("Transaction status updated")
        setShowStatusDialog(false)
        setNewStatus("")
        setAdminNotes("")
        setSelectedTransaction(null)
        router.refresh()

        // Refresh user transactions
        if (selectedUser) {
          const txResult = await getUserTransactions(selectedUser.id)
          setUserTransactions(txResult.data || [])
        }
      }
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteTransaction = async () => {
    if (!selectedTransaction) return

    setLoading(true)
    try {
      const result = await deleteTransaction(selectedTransaction.id)
      if (result.error) {
        toast.error(result.error)
      } else {
        toast.success("Transaction deleted successfully")
        setShowDeleteDialog(false)
        setSelectedTransaction(null)
        router.refresh()

        // Refresh user transactions
        if (selectedUser) {
          const txResult = await getUserTransactions(selectedUser.id)
          setUserTransactions(txResult.data || [])
        }
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* User Search */}
      <Card>
        <CardHeader>
          <CardTitle>Search User Transactions</CardTitle>
          <CardDescription>Find and manage transactions for any user</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex gap-2">
              <Input
                placeholder="Search by email..."
                value={searchEmail}
                onChange={(e) => setSearchEmail(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              />
              <Button onClick={handleSearch} disabled={loading || !searchEmail.trim()}>
                <Search className="h-4 w-4 mr-2" />
                Search
              </Button>
            </div>

            {/* Search Results */}
            {searchResults.length > 0 && (
              <div className="border rounded-lg p-4 space-y-2">
                {searchResults.map((user) => (
                  <button
                    key={user.id}
                    onClick={() => handleSelectUser(user)}
                    className="w-full text-left p-3 rounded-lg hover:bg-muted border border-transparent hover:border-primary transition-all"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{user.full_name || user.email}</p>
                        <p className="text-sm text-muted-foreground">{user.email}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">{displayAmount(user.balance || 0)}</p>
                        <Badge variant={user.status === "active" ? "default" : "secondary"}>{user.status}</Badge>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Selected User Info */}
      {selectedUser && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>{selectedUser.full_name || selectedUser.email}</CardTitle>
              <CardDescription>{selectedUser.email}</CardDescription>
            </div>
            <Button variant="outline" size="sm" onClick={() => setSelectedUser(null)}>
              Clear
            </Button>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Balance</p>
                <p className="text-2xl font-bold">{displayAmount(selectedUser.balance || 0)}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Status</p>
                <Badge variant={selectedUser.status === "active" ? "default" : "secondary"}>
                  {selectedUser.status}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* User Transactions */}
      {selectedUser && (
        <Card>
          <CardHeader>
            <CardTitle>User Transactions</CardTitle>
            <CardDescription>All transactions for {selectedUser.email}</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : userTransactions.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">No transactions found</div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Details</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {userTransactions.map((tx) => (
                      <TableRow key={tx.id}>
                        <TableCell className="text-sm">
                          {formatDistance(new Date(tx.created_at), new Date(), { addSuffix: true })}
                        </TableCell>
                        <TableCell>
                          <Badge variant={tx.type === "deposit" ? "default" : "secondary"}>
                            {tx.type === "deposit" ? "Deposit" : "Order"}
                          </Badge>
                        </TableCell>
                        <TableCell className="font-mono font-semibold">
                          <span className={tx.type === "deposit" ? "text-green-600" : "text-red-600"}>
                            {tx.type === "deposit" ? "+" : "-"}{displayAmount(Math.abs(Number(tx.amount)))}
                          </span>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              tx.status === "completed"
                                ? "default"
                                : tx.status === "failed"
                                  ? "destructive"
                                  : "secondary"
                            }
                          >
                            {tx.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {tx.payment_method || tx.orders?.services?.name || "-"}
                        </TableCell>
                        <TableCell className="text-right space-x-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              setSelectedTransaction(tx)
                              setNewStatus(tx.status)
                              setAdminNotes(tx.admin_notes || "")
                              setShowStatusDialog(true)
                            }}
                          >
                            <Edit2 className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              setSelectedTransaction(tx)
                              setShowDeleteDialog(true)
                            }}
                          >
                            <Trash2 className="h-4 w-4 text-red-600" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Update Status Dialog */}
      <Dialog open={showStatusDialog} onOpenChange={setShowStatusDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update Transaction Status</DialogTitle>
            <DialogDescription>
              Transaction: {selectedTransaction?.id?.substring(0, 12)}...
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Current Status</Label>
              <p className="text-sm font-mono">{selectedTransaction?.status}</p>
            </div>
            <div>
              <Label htmlFor="status">New Status</Label>
              <Select value={newStatus} onValueChange={setNewStatus}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="failed">Failed</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="notes">Admin Notes</Label>
              <Textarea
                id="notes"
                placeholder="Add notes about this change..."
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                rows={3}
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowStatusDialog(false)}>
                Cancel
              </Button>
              <Button onClick={handleUpdateStatus} disabled={loading || !newStatus}>
                {loading ? "Updating..." : "Update Status"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Transaction?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the transaction. If it's a completed deposit of{" "}
              {selectedTransaction && displayAmount(Math.abs(Number(selectedTransaction.amount)))}, the amount will be
              refunded from the user's balance.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="flex justify-end gap-2">
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteTransaction} disabled={loading} className="bg-red-600">
              {loading ? "Deleting..." : "Delete Transaction"}
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
