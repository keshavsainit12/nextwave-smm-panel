"use client"

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Ban, Trash2 } from "lucide-react"
import { formatDistance } from "date-fns"
import { EditUserDialog } from "./edit-user-dialog"
import { banUser, deleteUser } from "@/app/actions/users"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { useCurrency } from "@/lib/currency-context"

function getTierName(tier: number | null | undefined): string {
  switch (tier) {
    case 1:
      return "Normal User"
    case 2:
      return "Bulk Buyer"
    case 3:
      return "Reseller"
    case 4:
      return "VIP"
    default:
      return "Normal User"
  }
}

export function UserList({ users }: { users: any[] }) {
  const router = useRouter()
  const { displayAmount } = useCurrency()

  const handleBan = async (userId: string, email: string) => {
    if (confirm(`Ban user ${email}? They won't be able to login.`)) {
      try {
        const result = await banUser(userId)
        if (result.success) {
          toast.success("User banned successfully")
          router.refresh()
        } else {
          toast.error(result.error || "Failed to ban user")
        }
      } catch (error: any) {
        toast.error(error?.message || "Failed to ban user")
      }
    }
  }

  const handleDelete = async (userId: string, email: string) => {
    if (confirm(`Delete user ${email}? This action cannot be undone!`)) {
      try {
        const result = await deleteUser(userId)
        if (result.success) {
          toast.success("User deleted successfully")
          router.refresh()
        } else {
          toast.error(result.error || "Failed to delete user")
        }
      } catch (error: any) {
        toast.error(error?.message || "Failed to delete user")
      }
    }
  }

  if (users.length === 0) {
    return <div className="text-center py-8 text-muted-foreground">No users found</div>
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>User</TableHead>
          <TableHead>Tier</TableHead>
          <TableHead>Balance</TableHead>
          <TableHead>Total Orders</TableHead>
          <TableHead>Language</TableHead>
          <TableHead>2FA</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Joined</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {users.map((user) => (
          <TableRow key={user.id}>
            <TableCell>
              <div>
                <div className="font-medium">{user.full_name || "N/A"}</div>
                <div className="text-xs text-muted-foreground">{user.email}</div>
              </div>
            </TableCell>
            <TableCell>
              <Badge variant="outline">{getTierName(user.tier)}</Badge>
            </TableCell>
            <TableCell className="font-mono">{displayAmount(user.balance || 0)}</TableCell>
            <TableCell>{user.total_orders || 0}</TableCell>
            <TableCell>
              <Badge variant="outline">{user.language || "English"}</Badge>
            </TableCell>
            <TableCell>
              <Badge variant={user.two_factor_enabled ? "default" : "secondary"}>
                {user.two_factor_enabled ? "Enabled" : "Disabled"}
              </Badge>
            </TableCell>
            <TableCell>
              <Badge variant={user.status === "active" ? "default" : "destructive"}>{user.status || "active"}</Badge>
            </TableCell>
            <TableCell className="text-sm text-muted-foreground">
              {formatDistance(new Date(user.created_at), new Date(), { addSuffix: true })}
            </TableCell>
            <TableCell className="text-right">
              <div className="flex justify-end gap-2">
                <EditUserDialog user={user} />
                <Button variant="ghost" size="icon" title="Ban User" onClick={() => handleBan(user.id, user.email)}>
                  <Ban className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  title="Delete User"
                  onClick={() => handleDelete(user.id, user.email)}
                >
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
