import { createClient } from "@supabase/supabase-js"

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

async function createAdmin() {
  try {
    // Create auth user
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: "adminprim@gmail.com",
      password: "admin@123",
      email_confirm: true,
      user_metadata: {
        full_name: "Admin Prime",
      },
    })

    if (authError) {
      console.error("Auth error:", authError)
      return
    }

    if (!authData.user) {
      console.error("No user created")
      return
    }

    console.log("Auth user created:", authData.user.id)

    // Get default tier
    const { data: tierData } = await supabase.from("user_tiers").select("id").eq("name", "Regular").single()

    // Generate referral code
    const referralCode = "ADMIN" + Math.random().toString(36).substring(2, 8).toUpperCase()

    // Create user profile with admin role
    const { error: profileError } = await supabase.from("users").insert({
      id: authData.user.id,
      email: "adminprim@gmail.com",
      full_name: "Admin Prime",
      tier_id: tierData?.id || null,
      referral_code: referralCode,
      role: "admin",
      balance: 10000.0,
      total_spent: 0,
      total_orders: 0,
    })

    if (profileError) {
      console.error("Profile error:", profileError)
      return
    }

    console.log("Admin user created successfully!")
    console.log("Email: adminprim@gmail.com")
    console.log("Password: admin@123")
    console.log("Balance: $10,000")
  } catch (error) {
    console.error("Error:", error)
  }
}

createAdmin()
