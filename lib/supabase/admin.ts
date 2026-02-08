import { createClient } from "@supabase/supabase-js"

// Admin client with service role for bypassing RLS
export function createAdminClient() {
  // Validate environment variables
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !supabaseServiceKey) {
    const missing = []
    if (!supabaseUrl) missing.push('NEXT_PUBLIC_SUPABASE_URL')
    if (!supabaseServiceKey) missing.push('SUPABASE_SERVICE_ROLE_KEY')
    
    console.error('❌ [Supabase Admin] Missing required environment variables:', missing)
    console.error('📋 [Supabase Admin] Environment variables status:')
    console.error('   NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl ? '✅ Set' : '❌ Missing')
    console.error('   SUPABASE_SERVICE_ROLE_KEY:', supabaseServiceKey ? '✅ Set' : '❌ Missing')
    console.error('')
    console.error('🔧 [Supabase Admin] How to fix (Hindi):')
    console.error('   ⚠️ YE VARIABLES VERCEL ME ADD KARNE HAIN!')
    console.error('   1. Vercel Dashboard → https://vercel.com')
    console.error('   2. Project select करें')
    console.error('   3. Settings → Environment Variables')
    console.error('   4. Add करें:')
    missing.forEach(varName => {
      console.error(`      ❌ ${varName}`)
    })
    console.error('   5. Save और Redeploy')
    console.error('')
    
    throw new Error(
      `Supabase admin configuration error: Missing environment variables: ${missing.join(', ')}. ` +
      'These are REQUIRED for admin operations. Add in Vercel settings!'
    )
  }

  console.log('✅ [Supabase Admin] Environment variables validated')
  console.log('   NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl.substring(0, 30) + '...')
  console.log('   SUPABASE_SERVICE_ROLE_KEY:', supabaseServiceKey.substring(0, 20) + '...')

  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })
}
