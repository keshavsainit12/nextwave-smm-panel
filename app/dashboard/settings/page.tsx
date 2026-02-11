import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import UserSettingsForm from "@/components/dashboard/user-settings-form"

export const metadata = {
  title: "Settings | NextWave SMM",
  description: "Manage your account settings and preferences",
}

export default async function SettingsPage() {
  const supabase = await createClient()

  // Get current user
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  // Get user profile data
  const { data: userData } = await supabase.from("users").select("*").eq("id", user.id).single()

  if (!userData) {
    redirect("/auth/login")
  }

  return (
    <div className="space-y-4 sm:space-y-6 md:space-y-8 p-3 sm:p-4 md:p-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight">Settings</h1>
        <p className="text-sm sm:text-base text-muted-foreground mt-1">Manage your account settings and preferences</p>
      </div>

      {/* Settings Form Card */}
      <div className="bg-white dark:bg-slate-900 rounded-lg sm:rounded-xl border border-gray-200 dark:border-gray-800 p-4 sm:p-6 md:p-8">
        <UserSettingsForm
          userData={{
            id: user.id,
            email: user.email || "",
            full_name: userData.full_name || "",
          }}
        />
      </div>
    </div>
  )
}
