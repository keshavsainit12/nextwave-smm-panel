import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { SMMApiClient } from "@/lib/smm-api-client"

/**
 * Admin endpoint to test provider API connection and diagnose issues
 * POST /api/admin/test-provider
 * Body: { provider_id: string }
 */
export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { data: userData } = await supabase.from("users").select("role, is_admin").eq("id", user.id).single()

    if (!userData?.is_admin && userData?.role !== "admin") {
      return NextResponse.json({ error: "Forbidden - Admin access required" }, { status: 403 })
    }

    const body = await request.json()
    const { provider_id } = body

    if (!provider_id) {
      return NextResponse.json({ error: "Missing provider_id" }, { status: 400 })
    }

    const { data: provider, error: providerError } = await supabase
      .from("api_providers")
      .select("*")
      .eq("id", provider_id)
      .single()

    if (providerError || !provider) {
      return NextResponse.json({ success: false, error: "Provider not found" }, { status: 404 })
    }

    const diagnostics: any = {
      provider_id: provider.id,
      provider_name: provider.name,
      api_url: provider.api_url,
      is_active: provider.is_active,
      auth_mode: (provider as any).auth_mode || "key",
      masked_api_key: provider.api_key ? `${provider.api_key.slice(0, 4)}...${provider.api_key.slice(-4)}` : "MISSING",
      tests: [],
    }

    console.log("[PROVIDER-TEST] Testing provider:", provider.id)
    
    if (!provider.api_url || !provider.api_key) {
      diagnostics.tests.push({
        test: "Configuration Check",
        status: "FAILED",
        error: !provider.api_url ? "API URL missing" : "API key missing",
      })
      return NextResponse.json({ success: false, diagnostics })
    }

    diagnostics.tests.push({
      test: "Configuration Check",
      status: "PASSED",
      message: "Provider configuration valid",
    })

    try {
      new URL(provider.api_url)
      diagnostics.tests.push({
        test: "URL Format Check",
        status: "PASSED",
        message: "API URL format valid",
      })
    } catch (urlError: any) {
      diagnostics.tests.push({
        test: "URL Format Check",
        status: "FAILED",
        error: "Invalid URL: " + urlError.message,
      })
      return NextResponse.json({ success: false, diagnostics })
    }

    const apiClient = new SMMApiClient(provider.api_url, provider.api_key)
    const authMode = (provider as any).auth_mode === "bearer" ? "bearer" : "key"

    try {
      const balance = await apiClient.getBalance({ authMode })
      diagnostics.tests.push({
        test: "Balance Check (Auth Test)",
        status: "PASSED",
        message: "Authentication successful",
        data: { balance: balance.balance, currency: balance.currency },
      })
    } catch (balanceError: any) {
      const errorResponse = balanceError.response || {}
      diagnostics.tests.push({
        test: "Balance Check (Auth Test)",
        status: "FAILED",
        error: balanceError.message,
        http_status: errorResponse.status,
        provider_response: errorResponse.body,
        suggestion: errorResponse.status === 401 || errorResponse.status === 403
          ? "API key invalid/expired. Regenerate on provider dashboard."
          : "Check API configuration.",
      })
    }

    try {
      const services = await apiClient.getServices({ authMode })
      diagnostics.tests.push({
        test: "Services List",
        status: "PASSED",
        message: `Retrieved ${Array.isArray(services) ? services.length : 0} services`,
      })
    } catch (servicesError: any) {
      const errorResponse = servicesError.response || {}
      diagnostics.tests.push({
        test: "Services List",
        status: "FAILED",
        error: servicesError.message,
        provider_response: errorResponse.body,
      })
    }

    const failedTests = diagnostics.tests.filter((t: any) => t.status === "FAILED")
    
    if (failedTests.length === 0) {
      diagnostics.overall_status = "ALL_TESTS_PASSED"
      diagnostics.message = "Provider API working correctly!"
    } else {
      diagnostics.overall_status = "TESTS_FAILED"
      diagnostics.message = "Provider API has issues. Check failed tests."
    }

    return NextResponse.json({ success: failedTests.length === 0, diagnostics })
  } catch (error: any) {
    console.error("[PROVIDER-TEST] Exception:", error)
    return NextResponse.json({ success: false, error: "Test failed", message: error.message }, { status: 500 })
  }
}
