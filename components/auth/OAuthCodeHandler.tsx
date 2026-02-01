"use client"

import { useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"

/**
 * Component to handle OAuth code detection and redirect
 * Must be wrapped in Suspense boundary due to useSearchParams()
 * Optimized for instant redirect
 */
export default function OAuthCodeHandler() {
  const router = useRouter()
  const searchParams = useSearchParams()

  // Immediate redirect check - runs before first render
  const code = searchParams.get("code")
  
  if (code) {
    console.log("[v0] OAuth code detected, redirecting immediately...")
    // Use replace for instant redirect without adding to history
    router.replace(`/auth/callback?code=${code}`)
  }

  // Backup useEffect for safety (in case the above doesn't trigger immediately)
  useEffect(() => {
    const code = searchParams.get("code")
    
    if (code) {
      console.log("[v0] OAuth code detected (useEffect), redirecting...")
      router.replace(`/auth/callback?code=${code}`)
    }
  }, [searchParams, router])

  return null // This component doesn't render anything
}
