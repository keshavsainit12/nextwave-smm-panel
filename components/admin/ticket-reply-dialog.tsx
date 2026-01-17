"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { replyToTicket, updateTicketStatus } from "@/app/actions/support"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"

export function TicketReplyDialog({ ticket, open, onClose }: any) {
  const [reply, setReply] = useState("")
  const [status, setStatus] = useState(ticket.status)
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  const handleSubmit = async () => {
    if (!reply.trim()) {
      toast({ title: "Error", description: "Please enter a reply", variant: "destructive" })
      return
    }

    setLoading(true)
    try {
      await replyToTicket(ticket.id, reply)

      if (status !== ticket.status) {
        await updateTicketStatus(ticket.id, status)
      }

      toast({ title: "Success", description: "Reply sent successfully" })
      setReply("")
      onClose()
      router.refresh()
    } catch (error) {
      toast({ title: "Error", description: "Failed to send reply", variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Reply to Ticket #{ticket.id.slice(0, 8)}</DialogTitle>
          <DialogDescription>{ticket.subject}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="p-4 bg-muted rounded-lg">
            <p className="text-sm font-medium mb-2">Original Message:</p>
            <p className="text-sm">{ticket.message}</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="reply">Your Reply</Label>
            <Textarea
              id="reply"
              placeholder="Type your reply here..."
              value={reply}
              onChange={(e) => setReply(e.target.value)}
              rows={6}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="status">Update Status</Label>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="open">Open</SelectItem>
                <SelectItem value="in_progress">In Progress</SelectItem>
                <SelectItem value="closed">Closed</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={loading}>
              {loading ? "Sending..." : "Send Reply"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
