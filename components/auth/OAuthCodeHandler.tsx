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

  // Immediate redirect - runs before first render
  const code = searchParams.get("code")
  
  if (code) {
    console.log("[v0] OAuth code detected, redirecting immediately...")
    router.replace(`/auth/callback?code=${code}`)
  }

  // Backup useEffect for safety
  useEffect(() => {
    const code = searchParams.get("code")
    
    if (code) {
      console.log("[v0] OAuth code detected (useEffect), redirecting...")
      router.replace(`/auth/callback?code=${code}`)
    }
  }, [searchParams, router])

  return null
}
