"use client"

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Eye } from "lucide-react"
import { formatDistance } from "date-fns"
import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { replyToTicket, closeTicket } from "@/app/actions/support"
import { toast } from "sonner"
import { useRouter } from "next/navigation"

export function AdminTicketList({ tickets }: { tickets: any[] }) {
  const [selectedTicket, setSelectedTicket] = useState<any>(null)
  const [reply, setReply] = useState("")
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleReply = async () => {
    if (!reply.trim() || !selectedTicket) return

    setLoading(true)
    try {
      const result = await replyToTicket(selectedTicket.id, reply)
      if (result.error) throw new Error(result.error)

      toast.success("Reply sent successfully")
      setReply("")
      setSelectedTicket(null)
      router.refresh()
    } catch (error: any) {
      toast.error(error.message || "Failed to send reply")
    } finally {
      setLoading(false)
    }
  }

  const handleClose = async (ticketId: string) => {
    if (!confirm("Close this ticket?")) return

    try {
      await closeTicket(ticketId)
      toast.success("Ticket closed")
      router.refresh()
    } catch (error: any) {
      toast.error("Failed to close ticket")
    }
  }

  if (tickets.length === 0) {
    return <div className="text-center py-8 text-muted-foreground">No tickets found</div>
  }

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Subject</TableHead>
            <TableHead>User</TableHead>
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
                <div className="text-sm">{ticket.users?.full_name || ticket.users?.email}</div>
              </TableCell>
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
                <Button variant="ghost" size="icon" onClick={() => setSelectedTicket(ticket)}>
                  <Eye className="h-4 w-4" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <Dialog open={!!selectedTicket} onOpenChange={() => setSelectedTicket(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{selectedTicket?.subject}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="bg-muted/50 rounded-lg p-4">
              <div className="text-sm font-medium mb-1">User Message</div>
              <p className="text-sm text-muted-foreground">{selectedTicket?.message}</p>
              <div className="flex gap-2 mt-2 text-xs text-muted-foreground">
                <span>Priority: {selectedTicket?.priority}</span>
                <span>•</span>
                <span>Status: {selectedTicket?.status}</span>
              </div>
            </div>

            {selectedTicket?.status !== "closed" && (
              <div className="space-y-2">
                <Label htmlFor="reply">Your Reply</Label>
                <Textarea
                  id="reply"
                  placeholder="Type your response..."
                  value={reply}
                  onChange={(e) => setReply(e.target.value)}
                  rows={4}
                  disabled={loading}
                />
                <div className="flex gap-2">
                  <Button onClick={handleReply} disabled={loading || !reply.trim()} className="flex-1">
                    {loading ? "Sending..." : "Send Reply"}
                  </Button>
                  <Button variant="outline" onClick={() => handleClose(selectedTicket.id)} disabled={loading}>
                    Close Ticket
                  </Button>
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
