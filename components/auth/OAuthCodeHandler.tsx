"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"

/**
 * Component to handle OAuth code detection and redirect
 * Must be wrapped in Suspense boundary due to useSearchParams()
 * Shows loading popup during OAuth processing
 */
export default function OAuthCodeHandler() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isProcessing, setIsProcessing] = useState(false)

  // Immediate redirect check - runs before first render
  const code = searchParams.get("code")
  
  if (code && !isProcessing) {
    console.log("[v0] OAuth code detected, redirecting immediately...")
    setIsProcessing(true)
    // Use replace for instant redirect without adding to history
    router.replace(`/auth/callback?code=${code}`)
  }

  // Backup useEffect for safety (in case the above doesn't trigger immediately)
  useEffect(() => {
    const code = searchParams.get("code")
    
    if (code) {
      console.log("[v0] OAuth code detected (useEffect), redirecting...")
      setIsProcessing(true)
      router.replace(`/auth/callback?code=${code}`)
    }
  }, [searchParams, router])

  // Show loading popup when processing OAuth
  if (!isProcessing) return null

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="bg-white rounded-lg shadow-2xl p-8 max-w-sm mx-4 text-center">
        <div className="mb-4">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
        </div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          Signing you in...
        </h3>
        <p className="text-gray-600 text-sm">
          Please wait while we complete your login
        </p>
      </div>
    </div>
  )
}
