import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"

export async function createClient() {
  const cookieStore = await cookies()

  // Validate environment variables
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    const missing = []
    if (!supabaseUrl) missing.push('NEXT_PUBLIC_SUPABASE_URL')
    if (!supabaseAnonKey) missing.push('NEXT_PUBLIC_SUPABASE_ANON_KEY')
    
    console.error('❌ [Supabase Server] Missing required environment variables:', missing)
    console.error('📋 [Supabase Server] Environment variables status:')
    console.error('   NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl ? '✅ Set' : '❌ Missing')
    console.error('   NEXT_PUBLIC_SUPABASE_ANON_KEY:', supabaseAnonKey ? '✅ Set' : '❌ Missing')
    console.error('')
    console.error('🔧 [Supabase Server] How to fix:')
    console.error('   1. Check .env.local file exists')
    console.error('   2. Verify variables are set in Vercel dashboard')
    console.error('   3. Redeploy the application')
    console.error('   Missing:', missing.join(', '))
    console.error('')
    
    throw new Error(
      `Supabase server configuration error: Missing environment variables: ${missing.join(', ')}. ` +
      'Check Vercel environment settings.'
    )
  }

  console.log('✅ [Supabase Server] Environment variables validated')

  return createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll()
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options))
        } catch {
          // Called from Server Component - ignore
        }
      },
    },
  })
}
