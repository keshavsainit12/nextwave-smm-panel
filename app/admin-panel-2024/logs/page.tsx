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
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Activity & Fraud Logs</h1>
        <p className="text-muted-foreground">Monitor system activities and detect suspicious behavior</p>
      </div>

      <Card className="border-destructive">
        <CardHeader>
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            <CardTitle>Suspicious Activities</CardTitle>
          </div>
          <CardDescription>Potential fraud or abuse detected</CardDescription>
        </CardHeader>
        <CardContent>
          {suspiciousLogs && suspiciousLogs.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Action</TableHead>
                  <TableHead>IP Address</TableHead>
                  <TableHead>Time</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {suspiciousLogs.slice(0, 10).map((log) => (
                  <TableRow key={log.id}>
                    <TableCell>{log.users?.email || "System"}</TableCell>
                    <TableCell>
                      <Badge variant="destructive">{log.action}</Badge>
                    </TableCell>
                    <TableCell className="font-mono text-sm">{log.ip_address || "N/A"}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {formatDistance(new Date(log.created_at), new Date(), { addSuffix: true })}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <p className="text-sm text-muted-foreground">No suspicious activities detected</p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>All Activity Logs</CardTitle>
          <CardDescription>Complete system activity history</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Action</TableHead>
                <TableHead>Entity</TableHead>
                <TableHead>IP Address</TableHead>
                <TableHead>Time</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {logs?.map((log) => (
                <TableRow key={log.id}>
                  <TableCell>{log.users?.email || "System"}</TableCell>
                  <TableCell>{log.action}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{log.entity_type || "N/A"}</TableCell>
                  <TableCell className="font-mono text-sm">{log.ip_address || "N/A"}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">
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
