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
          // Read cookie from document.cookie
          const matches = document.cookie.match(new RegExp(
            '(?:^|; )' + name.replace(/([.$?*|{}()[\]\\/+^])/g, '\\$1') + '=([^;]*)'
          ))
          return matches ? decodeURIComponent(matches[1]) : undefined
        },
        set(name: string, value: string, options: any) {
          // Write cookie to document.cookie
          let cookieStr = `${name}=${encodeURIComponent(value)}`
          
          if (options?.path) cookieStr += `; path=${options.path}`
          if (options?.maxAge) cookieStr += `; max-age=${options.maxAge}`
          if (options?.domain) cookieStr += `; domain=${options.domain}`
          if (options?.sameSite) cookieStr += `; samesite=${options.sameSite}`
          if (options?.secure) cookieStr += '; secure'
          
          document.cookie = cookieStr
        },
        remove(name: string, options: any) {
          // Remove cookie by setting max-age to 0
          this.set(name, '', { ...options, maxAge: 0 })
        },
      },
    }
  )

  return supabaseClient
}
