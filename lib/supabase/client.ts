import { createBrowserClient } from "@supabase/ssr"

let supabaseClient: ReturnType<typeof createBrowserClient> | null = null

export function createClient() {
  if (supabaseClient) {
    return supabaseClient
  }

  supabaseClient = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return document.cookie
            .split('; ')
            .find(row => row.startsWith(`${name}=`))
            ?.split('=')[1]
        },
        set(name: string, value: string, options: any) {
          document.cookie = `${name}=${value}; path=/; ${options.maxAge ? `max-age=${options.maxAge};` : ''} SameSite=Lax; Secure`
        },
        remove(name: string, options: any) {
          document.cookie = `${name}=; path=/; max-age=0; SameSite=Lax; Secure`
        },
      },
      auth: {
        flowType: 'pkce',
        detectSessionInUrl: true,
        persistSession: true,
        autoRefreshToken: true,
        storageKey: 'supabase.auth.token',
      },
    }
  )

  return supabaseClient
}
