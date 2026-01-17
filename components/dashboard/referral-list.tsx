import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { formatDistance } from "date-fns"

export function ReferralList({ referrals }: { referrals: any[] }) {
  if (referrals.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">No referrals yet. Share your link to get started!</div>
    )
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>User</TableHead>
          <TableHead>Total Orders</TableHead>
          <TableHead>Total Spent</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Joined</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {referrals.map((referral) => (
          <TableRow key={referral.id}>
            <TableCell>
              <div>
                <div className="font-medium">{referral.full_name || "N/A"}</div>
                <div className="text-xs text-muted-foreground">{referral.email}</div>
              </div>
            </TableCell>
            <TableCell>{referral.total_orders}</TableCell>
            <TableCell className="font-mono">${referral.total_spent.toFixed(2)}</TableCell>
            <TableCell>
              <Badge variant={referral.status === "active" ? "default" : "secondary"}>{referral.status}</Badge>
            </TableCell>
            <TableCell className="text-sm text-muted-foreground">
              {formatDistance(new Date(referral.created_at), new Date(), { addSuffix: true })}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
