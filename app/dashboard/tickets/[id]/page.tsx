import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { TicketMessages } from "@/components/dashboard/ticket-messages"
import { notFound } from "next/navigation"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export default async function TicketDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    notFound()
  }

  // Fetch ticket first
  const { data: ticket, error: ticketError } = await supabase
    .from("support_tickets")
    .select("*")
    .eq("id", id)
    .eq("user_id", user.id)
    .single()

  if (ticketError || !ticket) {
    notFound()
  }

  // Fetch messages separately for better reliability
  const { data: messagesData } = await supabase
    .from("ticket_messages")
    .select("id, message, is_admin, created_at, user_id")
    .eq("ticket_id", id)
    .order("created_at", { ascending: true })

  const messages = messagesData || []

  return (
    <div className="min-h-screen bg-[#f6f6f8] p-4 pb-24 md:pb-6">
      <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <Link href="/dashboard/tickets">
            <Button variant="ghost" size="sm" className="mb-2">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to tickets
            </Button>
          </Link>
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">{ticket.subject}</h1>
              <p className="text-muted-foreground">Ticket #{ticket.id.slice(0, 8)}</p>
            </div>
            <div className="flex gap-2">
              <Badge
                variant={ticket.status === "open" ? "secondary" : ticket.status === "closed" ? "outline" : "default"}
              >
                {ticket.status}
              </Badge>
              <Badge variant="outline">{ticket.priority}</Badge>
            </div>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Conversation</CardTitle>
          </CardHeader>
          <CardContent>
            <TicketMessages ticketId={ticket.id} messages={messages} />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
