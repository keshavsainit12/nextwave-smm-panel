import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { SystemSettingsForm } from "@/components/admin/system-settings-form"
import AdminSettingsForm from "@/components/admin/admin-settings-form"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertTriangle } from "lucide-react"
import { cookies } from "next/headers"

export default async function AdminSettingsPage() {
  const supabase = await createClient()

  // Get system settings
  const { data: settings } = await supabase.from("system_settings").select("*")
  const settingsMap = settings?.reduce(
    (acc, setting) => {
      acc[setting.key] = setting.value
      return acc
    },
    {} as Record<string, string>,
  )

  // Get admin user info from cookies (admin panel uses custom auth)
  const cookieStore = await cookies()
  const adminUserId = cookieStore.get("admin_user_id")?.value
  const adminEmail = cookieStore.get("admin_email")?.value

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">Manage system and account settings</p>
      </div>

      <Tabs defaultValue="account" className="w-full">
        <TabsList>
          <TabsTrigger value="account">Account</TabsTrigger>
          <TabsTrigger value="system">System</TabsTrigger>
        </TabsList>

        {/* Account Settings Tab */}
        <TabsContent value="account" className="space-y-6">
          {adminUserId && adminEmail ? (
            <AdminSettingsForm userId={adminUserId} userEmail={adminEmail} />
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>Account Not Found</CardTitle>
                <CardDescription>Unable to load account settings</CardDescription>
              </CardHeader>
              <CardContent>
                <Alert variant="destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertTitle>Authentication Error</AlertTitle>
                  <AlertDescription>
                    Admin session expired or invalid. Please log out and log back in.
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* System Settings Tab */}
        <TabsContent value="system" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>General Settings</CardTitle>
              <CardDescription>Core system configuration</CardDescription>
            </CardHeader>
            <CardContent>
              <SystemSettingsForm settings={settingsMap || {}} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
