"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"

export function SuccessRedirect() {
  const router = useRouter()
  const [countdown, setCountdown] = useState(5)

  useEffect(() => {
    // Countdown timer
    const countdownInterval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(countdownInterval)
          return 0
        }
        return prev - 1
      })
    }, 1000)

    // Auto-redirect after 5 seconds
    const redirectTimer = setTimeout(() => {
      router.push("/dashboard")
    }, 5000)

    // Cleanup
    return () => {
      clearInterval(countdownInterval)
      clearTimeout(redirectTimer)
    }
  }, [router])

  return (
    <p className="text-xs text-center text-muted-foreground">
      Redirecting to dashboard in {countdown} second{countdown !== 1 ? "s" : ""}...
    </p>
  )
}
