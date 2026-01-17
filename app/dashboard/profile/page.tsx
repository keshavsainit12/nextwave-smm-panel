import { createClient } from "@/lib/supabase/server"
import { MobileProfile } from "@/components/dashboard/mobile-profile"

interface UserProfile {
  id: string
  email: string
  full_name: string
  tier: number
  balance: number
  status: string
  total_orders: number
  total_spent: number
  created_at: string
}

export default async function ProfilePage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return null

  const { data: userProfile } = await supabase.from("users").select("*").eq("id", user.id).single()

  return <MobileProfile user={user} userProfile={userProfile as UserProfile} />
}
