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
          // Get cookie from document.cookie
          const value = `; ${document.cookie}`
          const parts = value.split(`; ${name}=`)
          if (parts.length === 2) {
            return parts.pop()?.split(';').shift()
          }
          return undefined
        },
        set(name: string, value: string, options: any) {
          // Set cookie with proper options
          let cookieString = `${name}=${value}; path=${options.path || '/'}`
          
          if (options.maxAge) {
            cookieString += `; max-age=${options.maxAge}`
          }
          
          if (options.sameSite) {
            cookieString += `; samesite=${options.sameSite}`
          }
          
          if (options.secure) {
            cookieString += '; secure'
          }
          
          document.cookie = cookieString
        },
        remove(name: string, options: any) {
          // Remove cookie by setting max-age to 0
          document.cookie = `${name}=; path=${options.path || '/'}; max-age=0`
        },
      },
    }
  )

  return supabaseClient
}
