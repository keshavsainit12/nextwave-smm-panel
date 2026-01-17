import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { TicketList } from "@/components/admin/ticket-list"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default async function AdminSupportPage() {
  const supabase = await createClient()
  const { data: tickets } = await supabase
    .from("support_tickets")
    .select("*, users(email, full_name)")
    .order("created_at", { ascending: false })

  const statusCounts = {
    open: tickets?.filter((t) => t.status === "open").length || 0,
    in_progress: tickets?.filter((t) => t.status === "in_progress").length || 0,
    closed: tickets?.filter((t) => t.status === "closed").length || 0,
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Support Tickets</h1>
        <p className="text-muted-foreground">Manage and respond to user support tickets</p>
      </div>

      <Tabs defaultValue="all">
        <TabsList>
          <TabsTrigger value="all">All Tickets ({tickets?.length || 0})</TabsTrigger>
          <TabsTrigger value="open">Open ({statusCounts.open})</TabsTrigger>
          <TabsTrigger value="in_progress">In Progress ({statusCounts.in_progress})</TabsTrigger>
          <TabsTrigger value="closed">Closed ({statusCounts.closed})</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>All Tickets</CardTitle>
              <CardDescription>Complete list of support tickets</CardDescription>
            </CardHeader>
            <CardContent>
              <TicketList tickets={tickets || []} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="open" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Open Tickets</CardTitle>
              <CardDescription>New support requests</CardDescription>
            </CardHeader>
            <CardContent>
              <TicketList tickets={tickets?.filter((t) => t.status === "open") || []} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="in_progress" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>In Progress Tickets</CardTitle>
              <CardDescription>Tickets being handled</CardDescription>
            </CardHeader>
            <CardContent>
              <TicketList tickets={tickets?.filter((t) => t.status === "in_progress") || []} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="closed" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Closed Tickets</CardTitle>
              <CardDescription>Resolved tickets</CardDescription>
            </CardHeader>
            <CardContent>
              <TicketList tickets={tickets?.filter((t) => t.status === "closed") || []} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
