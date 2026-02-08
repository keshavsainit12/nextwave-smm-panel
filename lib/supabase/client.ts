import { createBrowserClient } from "@supabase/ssr"

let supabaseClient: ReturnType<typeof createBrowserClient> | null = null

export function createClient() {
  if (supabaseClient) {
    return supabaseClient
  }

  // Validate environment variables
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    const missing = []
    if (!supabaseUrl) missing.push('NEXT_PUBLIC_SUPABASE_URL')
    if (!supabaseAnonKey) missing.push('NEXT_PUBLIC_SUPABASE_ANON_KEY')
    
    console.error('❌ [Supabase Client] Missing required environment variables:', missing)
    console.error('📋 [Supabase Client] Environment variables status:')
    console.error('   NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl ? '✅ Set' : '❌ Missing')
    console.error('   NEXT_PUBLIC_SUPABASE_ANON_KEY:', supabaseAnonKey ? '✅ Set' : '❌ Missing')
    console.error('')
    console.error('🔧 [Supabase Client] How to fix (Hindi):')
    console.error('   1. Vercel Dashboard खोलें → https://vercel.com')
    console.error('   2. अपना project select करें')
    console.error('   3. Settings → Environment Variables में जाएं')
    console.error('   4. Missing variables add करें:')
    missing.forEach(varName => {
      console.error(`      - ${varName}`)
    })
    console.error('   5. Redeploy करें')
    console.error('')
    
    throw new Error(
      `Supabase configuration error: Missing environment variables: ${missing.join(', ')}. ` +
      'Please add these variables in Vercel/environment settings and redeploy.'
    )
  }

  console.log('✅ [Supabase Client] Environment variables validated')
  console.log('   NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl.substring(0, 30) + '...')
  console.log('   NEXT_PUBLIC_SUPABASE_ANON_KEY:', supabaseAnonKey.substring(0, 20) + '...')

  supabaseClient = createBrowserClient(supabaseUrl, supabaseAnonKey)

  return supabaseClient
}
