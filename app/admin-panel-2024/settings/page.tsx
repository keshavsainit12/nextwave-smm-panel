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

  // Also fetch user email from database to ensure we have the latest
  let userEmail = user?.email || ""
  if (user?.id) {
    const { data: userData } = await supabase
      .from("users")
      .select("email")
      .eq("id", user.id)
      .single()
    
    if (userData?.email) {
      userEmail = userData.email
    }
  }

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
          {user ? (
            <AdminSettingsForm userId={user.id} userEmail={userEmail} />
          ) : (
            <Card>
              <CardContent className="py-8">
                <p className="text-center text-muted-foreground">Please log in to view account settings</p>
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
              <SystemSettingsForm settings={settingsMap || {}} userId={user?.id} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
