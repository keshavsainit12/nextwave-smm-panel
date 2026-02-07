import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ReferralStats } from "@/components/dashboard/referral-stats"
import { ReferralList } from "@/components/dashboard/referral-list"

export default async function ReferralsPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const [{ data: userProfile }, { data: referredUsers }, { data: earnings }] = await Promise.all([
    supabase.from("users").select("referral_code").eq("id", user!.id).single(),
    supabase.from("users").select("*").eq("referred_by", user!.id).order("created_at", { ascending: false }),
    supabase
      .from("referral_earnings")
      .select("commission_amount")
      .eq("referrer_id", user!.id)
      .gt("created_at", new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()),
  ])

  // If user doesn't have a referral code, generate one
  let referralCode = userProfile?.referral_code || ""
  if (!referralCode && user) {
    referralCode = "REF" + Math.random().toString(36).substring(2, 10).toUpperCase()
    
    // Update user profile with new referral code
    const { error } = await supabase
      .from("users")
      .update({ referral_code: referralCode })
      .eq("id", user.id)
    
    if (error) {
      console.error("Failed to generate referral code:", error)
      referralCode = "" // Fallback to empty if update fails
    }
  }

  const totalEarnings = earnings?.reduce((sum, e) => sum + Number(e.commission_amount), 0) || 0

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Referral Program</h1>
        <p className="text-muted-foreground">Invite friends and earn commission on their orders</p>
      </div>

      <ReferralStats
        referralCode={referralCode}
        totalReferrals={referredUsers?.length || 0}
        monthlyEarnings={totalEarnings}
      />

      <Card>
        <CardHeader>
          <CardTitle>Your Referrals</CardTitle>
          <CardDescription>Users who signed up using your referral code</CardDescription>
        </CardHeader>
        <CardContent>
          <ReferralList referrals={referredUsers || []} />
        </CardContent>
      </Card>
    </div>
  )
}
