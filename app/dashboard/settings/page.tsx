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
    <div className="p-4 sm:p-6">
      <UserSettingsForm
        userData={{
          email: user.email || "",
          full_name: userData.full_name || "",
          language: userData.language || "English",
          two_factor_enabled: userData.two_factor_enabled || false,
        }}
      />
    </div>
  )
}
