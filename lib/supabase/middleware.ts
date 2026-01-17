import { createServerClient } from "@supabase/ssr"
import { NextResponse, type NextRequest } from "next/server"

export async function updateSession(request: NextRequest) {
  if (
    request.nextUrl.pathname.startsWith("/admin-panel-2024") ||
    request.nextUrl.pathname.startsWith("/admin-nx-wave-secure") ||
    request.nextUrl.pathname.startsWith("/admin-login")
  ) {
    const adminSession = request.cookies.get("admin_session")

    if (!adminSession || adminSession.value !== "authenticated") {
      // Only redirect if not already on admin-login
      if (!request.nextUrl.pathname.startsWith("/admin-login")) {
        const url = request.nextUrl.clone()
        url.pathname = "/admin-login"
        return NextResponse.redirect(url)
      }
    }

    // Admin is authenticated or on login page, allow access
    return NextResponse.next()
  }

  if (
    request.nextUrl.pathname.startsWith("/auth") ||
    request.nextUrl.pathname === "/" ||
    request.nextUrl.pathname.startsWith("/api/admin")
  ) {
    return NextResponse.next()
  }

  let supabaseResponse = NextResponse.next({
    request,
  })

  try {
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll()
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
            supabaseResponse = NextResponse.next({
              request,
            })
            cookiesToSet.forEach(({ name, value, options }) => supabaseResponse.cookies.set(name, value, options))
          },
        },
      },
    )

    const {
      data: { user },
    } = await supabase.auth.getUser()

    // Protect dashboard routes
    if (request.nextUrl.pathname.startsWith("/dashboard") && !user) {
      const url = request.nextUrl.clone()
      url.pathname = "/auth/login"
      return NextResponse.redirect(url)
    }

    return supabaseResponse
  } catch (error) {
    console.error("[v0] Middleware error:", error)
    return NextResponse.next()
  }
}
