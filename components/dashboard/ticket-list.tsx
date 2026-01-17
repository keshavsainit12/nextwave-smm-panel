"use client"

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Eye } from "lucide-react"
import { formatDistance } from "date-fns"
import Link from "next/link"

export function TicketList({ tickets }: { tickets: any[] }) {
  if (tickets.length === 0) {
    return <div className="text-center py-8 text-muted-foreground">No tickets yet. Create one to get help!</div>
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Subject</TableHead>
          <TableHead>Priority</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Created</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {tickets.map((ticket) => (
          <TableRow key={ticket.id}>
            <TableCell className="font-medium">{ticket.subject}</TableCell>
            <TableCell>
              <Badge variant="outline">{ticket.priority}</Badge>
            </TableCell>
            <TableCell>
              <Badge
                variant={ticket.status === "open" ? "secondary" : ticket.status === "closed" ? "outline" : "default"}
              >
                {ticket.status}
              </Badge>
            </TableCell>
            <TableCell className="text-sm text-muted-foreground">
              {formatDistance(new Date(ticket.created_at), new Date(), { addSuffix: true })}
            </TableCell>
            <TableCell className="text-right">
              <Link href={`/dashboard/tickets/${ticket.id}`}>
                <Button variant="ghost" size="icon">
                  <Eye className="h-4 w-4" />
                </Button>
              </Link>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
