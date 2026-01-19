import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
})

async function createAdminUser() {
  try {
    console.log("Creating admin user...")

    // Create auth user
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: "nextwavesmm07@gmail.com",
      password: "admin@123",
      email_confirm: true,
      user_metadata: {
        full_name: "Admin NextWave",
      },
    })

    if (authError) {
      console.error("Auth error:", authError)
      throw authError
    }

    console.log("Auth user created:", authData.user.id)

    // Get default tier
    const { data: tierData } = await supabase.from("user_tiers").select("id").eq("name", "Regular").single()

    // Generate referral code
    const referralCode = "ADMIN" + Math.random().toString(36).substring(2, 8).toUpperCase()

    // Create user profile with admin role
    const { error: profileError } = await supabase.from("users").insert({
      id: authData.user.id,
      email: "nextwavesmm07@gmail.com",
      full_name: "Admin NextWave",
      tier_id: tierData?.id || null,
      referral_code: referralCode,
      role: "admin",
      balance: 10000.0,
      total_spent: 0,
      total_orders: 0,
    })

    if (profileError) {
      console.error("Profile error:", profileError)
      throw profileError
    }

    console.log("✅ Admin user created successfully!")
    console.log("Email: nextwavesmm07@gmail.com")
    console.log("Password: admin@123")
    console.log("Role: admin")
    console.log("Balance: $10,000")
    console.log("\nAdmin can login at: https://nextwavesmm.vercel.app/auth/login")
    console.log("Admin panel: https://nextwavesmm.vercel.app/admin-panel-2024")
  } catch (error) {
    console.error("Failed to create admin user:", error)
    process.exit(1)
  }
}

createAdminUser()
