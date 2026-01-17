import { createAdminClient } from "@/lib/supabase/admin"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { AdminTicketList } from "@/components/admin/admin-ticket-list"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default async function AdminTicketsPage() {
  const supabase = createAdminClient()
  const { data: tickets } = await supabase
    .from("support_tickets")
    .select("*, users(email, full_name)")
    .order("created_at", { ascending: false })

  const openCount = tickets?.filter((t) => t.status === "open").length || 0
  const repliedCount = tickets?.filter((t) => t.status === "replied").length || 0

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Support Tickets</h1>
        <p className="text-muted-foreground">Manage and respond to user support requests</p>
      </div>

      <Tabs defaultValue="all">
        <TabsList>
          <TabsTrigger value="all">All Tickets ({tickets?.length || 0})</TabsTrigger>
          <TabsTrigger value="open">Open ({openCount})</TabsTrigger>
          <TabsTrigger value="replied">Replied ({repliedCount})</TabsTrigger>
        </TabsList>
        <TabsContent value="all" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>All Tickets</CardTitle>
              <CardDescription>Complete ticket history</CardDescription>
            </CardHeader>
            <CardContent>
              <AdminTicketList tickets={tickets || []} />
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="open" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Open Tickets</CardTitle>
              <CardDescription>Tickets awaiting response</CardDescription>
            </CardHeader>
            <CardContent>
              <AdminTicketList tickets={tickets?.filter((t) => t.status === "open") || []} />
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="replied" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Replied Tickets</CardTitle>
              <CardDescription>Tickets with admin responses</CardDescription>
            </CardHeader>
            <CardContent>
              <AdminTicketList tickets={tickets?.filter((t) => t.status === "replied") || []} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
