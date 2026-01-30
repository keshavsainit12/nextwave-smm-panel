import { createAdminClient } from "@/lib/supabase/admin"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { AdminTicketList } from "@/components/admin/admin-ticket-list"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default async function AdminTicketsPage() {
  const supabase = createAdminClient()
  
  const { data: tickets, error: ticketsError } = await supabase
    .from("support_tickets")
    .select("*, users(email, full_name), ticket_messages(id, message, is_admin, created_at, user_id)")
    .order("created_at", { ascending: false })

  if (ticketsError) {
    console.error("[v0] Tickets fetch error:", ticketsError)
  }

  const openCount = tickets?.filter((t) => t.status === "open").length || 0
  const repliedCount = tickets?.filter((t) => t.status === "replied").length || 0

  return (
    <div className="space-y-3 sm:space-y-4 md:space-y-6">
      <div className="bg-white dark:bg-slate-900 rounded-lg sm:rounded-xl p-3 sm:p-4 md:p-6 shadow-sm border border-gray-200 dark:border-gray-800">
        <h1 className="text-xl sm:text-2xl md:text-3xl font-bold tracking-tight bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Support Tickets</h1>
        <p className="text-xs sm:text-sm text-muted-foreground mt-1">Manage and respond to user support requests</p>
      </div>

      <Tabs defaultValue="all">
        <TabsList className="grid grid-cols-3 gap-1 w-full h-auto">
          <TabsTrigger value="all" className="text-xs sm:text-sm">All Tickets ({tickets?.length || 0})</TabsTrigger>
          <TabsTrigger value="open" className="text-xs sm:text-sm">Open ({openCount})</TabsTrigger>
          <TabsTrigger value="replied" className="text-xs sm:text-sm">Replied ({repliedCount})</TabsTrigger>
        </TabsList>
        <TabsContent value="all" className="mt-3 sm:mt-4 md:mt-6">
          <Card className="bg-white dark:bg-slate-900 border-gray-200 dark:border-gray-800">
            <CardHeader className="p-3 sm:p-4 md:p-6">
              <CardTitle className="text-lg sm:text-xl">All Tickets</CardTitle>
              <CardDescription className="text-xs sm:text-sm">Complete ticket history</CardDescription>
            </CardHeader>
            <CardContent className="p-3 sm:p-4 md:p-6 overflow-x-auto">
              <AdminTicketList tickets={tickets || []} />
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="open" className="mt-3 sm:mt-4 md:mt-6">
          <Card className="bg-white dark:bg-slate-900 border-gray-200 dark:border-gray-800">
            <CardHeader className="p-3 sm:p-4 md:p-6">
              <CardTitle className="text-lg sm:text-xl">Open Tickets</CardTitle>
              <CardDescription className="text-xs sm:text-sm">Tickets awaiting response</CardDescription>
            </CardHeader>
            <CardContent className="p-3 sm:p-4 md:p-6 overflow-x-auto">
              <AdminTicketList tickets={tickets?.filter((t) => t.status === "open") || []} />
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="replied" className="mt-3 sm:mt-4 md:mt-6">
          <Card className="bg-white dark:bg-slate-900 border-gray-200 dark:border-gray-800">
            <CardHeader className="p-3 sm:p-4 md:p-6">
              <CardTitle className="text-lg sm:text-xl">Replied Tickets</CardTitle>
              <CardDescription className="text-xs sm:text-sm">Tickets with admin responses</CardDescription>
            </CardHeader>
            <CardContent className="p-3 sm:p-4 md:p-6 overflow-x-auto">
              <AdminTicketList tickets={tickets?.filter((t) => t.status === "replied") || []} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
