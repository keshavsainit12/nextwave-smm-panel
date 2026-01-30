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
    <div className="space-y-3 sm:space-y-4 md:space-y-6">
      <div className="bg-white dark:bg-slate-900 rounded-lg sm:rounded-xl p-3 sm:p-4 md:p-6 shadow-sm border border-gray-200 dark:border-gray-800">
        <h1 className="text-xl sm:text-2xl md:text-3xl font-bold tracking-tight bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Settings</h1>
        <p className="text-xs sm:text-sm text-muted-foreground mt-1">Manage system and account settings</p>
      </div>

      <Tabs defaultValue="account" className="w-full">
        <TabsList className="grid grid-cols-2 gap-1 w-full sm:w-auto h-auto">
          <TabsTrigger value="account" className="text-xs sm:text-sm">Account</TabsTrigger>
          <TabsTrigger value="system" className="text-xs sm:text-sm">System</TabsTrigger>
        </TabsList>

        {/* Account Settings Tab */}
        <TabsContent value="account" className="mt-3 sm:mt-4 md:mt-6">
          {user && <AdminSettingsForm userId={user.id} userEmail={user.email || ""} />}
        </TabsContent>

        {/* System Settings Tab */}
        <TabsContent value="system" className="mt-3 sm:mt-4 md:mt-6">
          <Card className="bg-white dark:bg-slate-900 border-gray-200 dark:border-gray-800">
            <CardHeader className="p-3 sm:p-4 md:p-6">
              <CardTitle className="text-lg sm:text-xl">General Settings</CardTitle>
              <CardDescription className="text-xs sm:text-sm">Core system configuration</CardDescription>
            </CardHeader>
            <CardContent className="p-3 sm:p-4 md:p-6">
              <SystemSettingsForm settings={settingsMap || {}} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
