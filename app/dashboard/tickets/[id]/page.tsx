import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { TicketMessages } from "@/components/dashboard/ticket-messages"
import { notFound } from "next/navigation"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export default async function TicketDetailPage({ params }: { params: { id: string } }) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    notFound()
  }

  // Fetch ticket with messages in single query
  const { data: ticket, error: ticketError } = await supabase
    .from("support_tickets")
    .select("*, ticket_messages(id, message, is_admin, created_at, user_id, users!inner(full_name, email))")
    .eq("id", params.id)
    .eq("user_id", user.id)
    .single()

  if (ticketError || !ticket) {
    console.error("[v0] Ticket fetch error:", ticketError)
    notFound()
  }

  const messages = ticket.ticket_messages || []

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
