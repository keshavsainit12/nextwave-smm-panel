import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { SystemSettingsForm } from "@/components/admin/system-settings-form"

export default async function AdminSettingsPage() {
  const supabase = await createClient()
  const { data: settings } = await supabase.from("system_settings").select("*")

  const settingsMap = settings?.reduce(
    (acc, setting) => {
      acc[setting.key] = setting.value
      return acc
    },
    {} as Record<string, string>,
  )

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">System Settings</h1>
        <p className="text-muted-foreground">Configure global system settings</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>General Settings</CardTitle>
          <CardDescription>Core system configuration</CardDescription>
        </CardHeader>
        <CardContent>
          <SystemSettingsForm settings={settingsMap || {}} />
        </CardContent>
      </Card>
    </div>
  )
}
