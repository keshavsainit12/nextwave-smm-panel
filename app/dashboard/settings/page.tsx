import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"

export default function SettingsPage() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground mt-2">Manage your account preferences</p>
      </div>

      {/* Settings Cards */}
      <div className="space-y-6">
        {/* Notifications */}
        <Card>
          <CardHeader>
            <CardTitle>Notifications</CardTitle>
            <CardDescription>Control how you receive notifications</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3">
              <Checkbox id="order-notif" defaultChecked />
              <label htmlFor="order-notif" className="text-sm font-medium cursor-pointer">
                Order Notifications
              </label>
            </div>
            <div className="flex items-center gap-3">
              <Checkbox id="email-updates" defaultChecked />
              <label htmlFor="email-updates" className="text-sm font-medium cursor-pointer">
                Email Updates
              </label>
            </div>
          </CardContent>
        </Card>

        {/* Security */}
        <Card>
          <CardHeader>
            <CardTitle>Security</CardTitle>
            <CardDescription>Manage your account security</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3">
              <Checkbox id="two-factor" />
              <label htmlFor="two-factor" className="text-sm font-medium cursor-pointer">
                Two-Factor Authentication
              </label>
            </div>
          </CardContent>
        </Card>

        {/* Save Button */}
        <div className="flex gap-3">
          <Button className="bg-blue-600 hover:bg-blue-700">Save Settings</Button>
          <Button variant="outline">Cancel</Button>
        </div>
      </div>
    </div>
  )
}
