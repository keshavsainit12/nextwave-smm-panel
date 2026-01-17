"use client"

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { MessageSquare } from "lucide-react"
import { TicketReplyDialog } from "./ticket-reply-dialog"
import { useState } from "react"

export function TicketList({ tickets }: { tickets: any[] }) {
  const [selectedTicket, setSelectedTicket] = useState<any>(null)

  if (tickets.length === 0) {
    return <div className="text-center py-8 text-muted-foreground">No tickets found</div>
  }

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Ticket ID</TableHead>
            <TableHead>User</TableHead>
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
              <TableCell className="font-mono text-xs">#{ticket.id.slice(0, 8)}</TableCell>
              <TableCell>{ticket.users?.email || "N/A"}</TableCell>
              <TableCell className="max-w-xs truncate">{ticket.subject}</TableCell>
              <TableCell>
                <Badge
                  variant={
                    ticket.priority === "high" ? "destructive" : ticket.priority === "medium" ? "default" : "secondary"
                  }
                >
                  {ticket.priority}
                </Badge>
              </TableCell>
              <TableCell>
                <Badge
                  variant={
                    ticket.status === "open" ? "default" : ticket.status === "in_progress" ? "secondary" : "outline"
                  }
                >
                  {ticket.status}
                </Badge>
              </TableCell>
              <TableCell>{new Date(ticket.created_at).toLocaleDateString()}</TableCell>
              <TableCell className="text-right">
                <Button variant="ghost" size="sm" onClick={() => setSelectedTicket(ticket)}>
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Reply
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {selectedTicket && (
        <TicketReplyDialog ticket={selectedTicket} open={!!selectedTicket} onClose={() => setSelectedTicket(null)} />
      )}
    </>
  )
}
