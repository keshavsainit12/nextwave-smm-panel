import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { formatDistance } from "date-fns"
import { AlertTriangle } from "lucide-react"

export default async function AdminLogsPage() {
  const supabase = await createClient()

  const { data: logs } = await supabase
    .from("activity_logs")
    .select("*, users(email, full_name)")
    .order("created_at", { ascending: false })
    .limit(100)

  // Identify suspicious activities
  const suspiciousLogs = logs?.filter(
    (log) =>
      log.action.includes("failed") ||
      log.action.includes("banned") ||
      log.action.includes("suspicious") ||
      log.action.includes("multiple_accounts"),
  )

  return (
    <div className="space-y-3 sm:space-y-4 md:space-y-6">
      <div className="bg-white dark:bg-slate-900 rounded-lg sm:rounded-xl p-3 sm:p-4 md:p-6 shadow-sm border border-gray-200 dark:border-gray-800">
        <h1 className="text-xl sm:text-2xl md:text-3xl font-bold tracking-tight bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Activity & Fraud Logs</h1>
        <p className="text-xs sm:text-sm text-muted-foreground mt-1">Monitor system activities and detect suspicious behavior</p>
      </div>

      <Card className="bg-white dark:bg-slate-900 border-destructive">
        <CardHeader className="p-3 sm:p-4 md:p-6">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 sm:h-5 sm:w-5 text-destructive" />
            <CardTitle className="text-lg sm:text-xl">Suspicious Activities</CardTitle>
          </div>
          <CardDescription className="text-xs sm:text-sm">Potential fraud or abuse detected</CardDescription>
        </CardHeader>
        <CardContent className="p-3 sm:p-4 md:p-6 overflow-x-auto">
          {suspiciousLogs && suspiciousLogs.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="min-w-[150px]">User</TableHead>
                  <TableHead className="min-w-[120px]">Action</TableHead>
                  <TableHead className="min-w-[100px]">IP Address</TableHead>
                  <TableHead className="min-w-[100px]">Time</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {suspiciousLogs.slice(0, 10).map((log) => (
                  <TableRow key={log.id}>
                    <TableCell className="text-xs sm:text-sm">{log.users?.email || "System"}</TableCell>
                    <TableCell>
                      <Badge variant="destructive" className="text-xs">{log.action}</Badge>
                    </TableCell>
                    <TableCell className="font-mono text-xs sm:text-sm">{log.ip_address || "N/A"}</TableCell>
                    <TableCell className="text-xs sm:text-sm text-muted-foreground">
                      {formatDistance(new Date(log.created_at), new Date(), { addSuffix: true })}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <p className="text-xs sm:text-sm text-muted-foreground">No suspicious activities detected</p>
          )}
        </CardContent>
      </Card>

      <Card className="bg-white dark:bg-slate-900 border-gray-200 dark:border-gray-800">
        <CardHeader className="p-3 sm:p-4 md:p-6">
          <CardTitle className="text-lg sm:text-xl">All Activity Logs</CardTitle>
          <CardDescription className="text-xs sm:text-sm">Complete system activity history</CardDescription>
        </CardHeader>
        <CardContent className="p-3 sm:p-4 md:p-6 overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="min-w-[150px]">User</TableHead>
                <TableHead className="min-w-[120px]">Action</TableHead>
                <TableHead className="min-w-[100px]">Entity</TableHead>
                <TableHead className="min-w-[100px]">IP Address</TableHead>
                <TableHead className="min-w-[100px]">Time</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {logs?.map((log) => (
                <TableRow key={log.id}>
                  <TableCell className="text-xs sm:text-sm">{log.users?.email || "System"}</TableCell>
                  <TableCell className="text-xs sm:text-sm">{log.action}</TableCell>
                  <TableCell className="text-xs sm:text-sm text-muted-foreground">{log.entity_type || "N/A"}</TableCell>
                  <TableCell className="font-mono text-xs sm:text-sm">{log.ip_address || "N/A"}</TableCell>
                  <TableCell className="text-xs sm:text-sm text-muted-foreground">
                    {formatDistance(new Date(log.created_at), new Date(), { addSuffix: true })}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
