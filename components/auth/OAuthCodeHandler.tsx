"use client"

import { useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"

/**
 * Component to handle OAuth code detection and redirect
 * Must be wrapped in Suspense boundary due to useSearchParams()
 */
export default function OAuthCodeHandler() {
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    const code = searchParams.get("code")
    
    if (code) {
      console.log("[v0] OAuth code detected on landing page, redirecting to callback...")
      router.push(`/auth/callback?code=${code}`)
    }
  }, [searchParams, router])

  return null // This component doesn't render anything
}
