import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { SystemSettingsForm } from "@/components/admin/system-settings-form"
import AdminSettingsForm from "@/components/admin/admin-settings-form"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

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

  // Get current admin user
  const {
    data: { user },
  } = await supabase.auth.getUser()

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
          {user && <AdminSettingsForm userId={user.id} userEmail={user.email || ""} />}
        </TabsContent>

        {/* System Settings Tab */}
        <TabsContent value="system" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>General Settings</CardTitle>
              <CardDescription>Core system configuration</CardDescription>
            </CardHeader>
            <CardContent>
              <SystemSettingsForm settings={settingsMap || {}} userId={user?.id} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
