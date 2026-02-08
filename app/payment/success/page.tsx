"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { CheckCircle, Wallet } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function PaymentSuccessPage() {
  const router = useRouter()
  const [countdown, setCountdown] = useState(3)

  // 🔥 NEW: backend se payment confirm check
  useEffect(() => {
    const checkPaymentStatus = async () => {
      try {
        const res = await fetch("/api/cron/verify-instant-payments")
        const data = await res.json()

        if (data?.status === "SUCCESS") {
          router.push("/dashboard/wallet")
        }
      } catch (err) {
        console.error("Payment verification failed", err)
      }
    }

    const interval = setInterval(checkPaymentStatus, 3000)
    return () => clearInterval(interval)
  }, [router])

  // ⏳ Existing countdown (fallback)
  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer)
          router.push("/dashboard/wallet")
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [router])

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-gray-900 dark:to-gray-800">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 w-16 h-16 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center">
            <CheckCircle className="w-10 h-10 text-green-600 dark:text-green-400" />
          </div>
          <CardTitle className="text-2xl font-bold text-green-600 dark:text-green-400">
            Payment Successful! 🎉
          </CardTitle>
          <CardDescription className="text-base mt-2">
            Your payment has been processed successfully
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="text-center p-4 bg-green-50 dark:bg-green-900/10 rounded-lg border border-green-200 dark:border-green-800">
            <p className="text-sm text-muted-foreground mb-1">
              Your balance will be updated shortly
            </p>
            <p className="text-lg font-semibold text-green-600 dark:text-green-400">
              Transaction Completed
            </p>
          </div>

          <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/10 rounded-lg border border-blue-200 dark:border-blue-800">
            <p className="text-sm text-muted-foreground mb-2">
              Redirecting to your wallet in
            </p>
            <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">
              {countdown}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              seconds...
            </p>
          </div>

          <Button
            onClick={() => router.push("/dashboard/wallet")}
            className="w-full"
            size="lg"
          >
            <Wallet className="w-4 h-4 mr-2" />
            Go to Wallet Now
          </Button>

          <div className="text-center">
            <Button
              variant="ghost"
              onClick={() => router.push("/dashboard")}
              className="text-sm"
            >
              Return to Dashboard
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}   
 // only for previous
