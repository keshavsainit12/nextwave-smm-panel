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
    <div className="space-y-3 sm:space-y-4 md:space-y-6">
      <div className="bg-white dark:bg-slate-900 rounded-lg sm:rounded-xl p-3 sm:p-4 md:p-6 shadow-sm border border-gray-200 dark:border-gray-800">
        <h1 className="text-xl sm:text-2xl md:text-3xl font-bold tracking-tight bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Support Tickets</h1>
        <p className="text-xs sm:text-sm text-muted-foreground mt-1">Manage and respond to user support tickets</p>
      </div>

      <Tabs defaultValue="all">
        <TabsList className="grid grid-cols-2 sm:grid-cols-4 gap-1 w-full h-auto">
          <TabsTrigger value="all" className="text-xs sm:text-sm">All Tickets ({tickets?.length || 0})</TabsTrigger>
          <TabsTrigger value="open" className="text-xs sm:text-sm">Open ({statusCounts.open})</TabsTrigger>
          <TabsTrigger value="in_progress" className="text-xs sm:text-sm">In Progress ({statusCounts.in_progress})</TabsTrigger>
          <TabsTrigger value="closed" className="text-xs sm:text-sm">Closed ({statusCounts.closed})</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="mt-3 sm:mt-4 md:mt-6">
          <Card className="bg-white dark:bg-slate-900 border-gray-200 dark:border-gray-800">
            <CardHeader className="p-3 sm:p-4 md:p-6">
              <CardTitle className="text-lg sm:text-xl">All Tickets</CardTitle>
              <CardDescription className="text-xs sm:text-sm">Complete list of support tickets</CardDescription>
            </CardHeader>
            <CardContent className="p-3 sm:p-4 md:p-6 overflow-x-auto">
              <TicketList tickets={tickets || []} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="open" className="mt-3 sm:mt-4 md:mt-6">
          <Card className="bg-white dark:bg-slate-900 border-gray-200 dark:border-gray-800">
            <CardHeader className="p-3 sm:p-4 md:p-6">
              <CardTitle className="text-lg sm:text-xl">Open Tickets</CardTitle>
              <CardDescription className="text-xs sm:text-sm">New support requests</CardDescription>
            </CardHeader>
            <CardContent className="p-3 sm:p-4 md:p-6 overflow-x-auto">
              <TicketList tickets={tickets?.filter((t) => t.status === "open") || []} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="in_progress" className="mt-3 sm:mt-4 md:mt-6">
          <Card className="bg-white dark:bg-slate-900 border-gray-200 dark:border-gray-800">
            <CardHeader className="p-3 sm:p-4 md:p-6">
              <CardTitle className="text-lg sm:text-xl">In Progress Tickets</CardTitle>
              <CardDescription className="text-xs sm:text-sm">Tickets being handled</CardDescription>
            </CardHeader>
            <CardContent className="p-3 sm:p-4 md:p-6 overflow-x-auto">
              <TicketList tickets={tickets?.filter((t) => t.status === "in_progress") || []} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="closed" className="mt-3 sm:mt-4 md:mt-6">
          <Card className="bg-white dark:bg-slate-900 border-gray-200 dark:border-gray-800">
            <CardHeader className="p-3 sm:p-4 md:p-6">
              <CardTitle className="text-lg sm:text-xl">Closed Tickets</CardTitle>
              <CardDescription className="text-xs sm:text-sm">Resolved tickets</CardDescription>
            </CardHeader>
            <CardContent className="p-3 sm:p-4 md:p-6 overflow-x-auto">
              <TicketList tickets={tickets?.filter((t) => t.status === "closed") || []} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
