"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { CheckCircle, XCircle, Loader2, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function PaymentReturnPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [status, setStatus] = useState<"loading" | "success" | "failed" | "pending">("loading")
  const [message, setMessage] = useState("")
  const [countdown, setCountdown] = useState(5)

  useEffect(() => {
    // Get status from URL parameters
    const urlStatus = searchParams.get("status")
    const txId = searchParams.get("transaction_id") || searchParams.get("txId")
    
    console.log("[v0] Payment return page loaded:", { urlStatus, txId })

    if (urlStatus === "success" || urlStatus === "1") {
      setStatus("success")
      setMessage("Payment completed successfully! Your wallet has been credited.")
    } else if (urlStatus === "failed" || urlStatus === "-1" || urlStatus === "failure") {
      setStatus("failed")
      setMessage("Payment failed or was cancelled. Please try again.")
    } else if (urlStatus === "pending" || urlStatus === "0") {
      setStatus("pending")
      setMessage("Payment is being processed. Your wallet will be credited shortly.")
    } else {
      setStatus("success")
      setMessage("Payment completed! Redirecting to your wallet...")
    }
  }, [searchParams])

  useEffect(() => {
    // Auto-redirect countdown
    if (status !== "loading" && countdown > 0) {
      const timer = setTimeout(() => {
        setCountdown(countdown - 1)
      }, 1000)
      return () => clearTimeout(timer)
    } else if (countdown === 0) {
      router.push("/dashboard/deposit")
    }
  }, [countdown, status, router])

  const handleRedirect = () => {
    router.push("/dashboard/deposit")
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-purple-50 to-violet-50 dark:from-slate-950 dark:to-slate-900">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            {status === "loading" && (
              <div className="w-16 h-16 bg-gradient-to-br from-purple-600 to-violet-600 rounded-full flex items-center justify-center">
                <Loader2 className="h-8 w-8 text-white animate-spin" />
              </div>
            )}
            {status === "success" && (
              <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center">
                <CheckCircle className="h-8 w-8 text-white" />
              </div>
            )}
            {status === "failed" && (
              <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-rose-600 rounded-full flex items-center justify-center">
                <XCircle className="h-8 w-8 text-white" />
              </div>
            )}
            {status === "pending" && (
              <div className="w-16 h-16 bg-gradient-to-br from-yellow-500 to-amber-600 rounded-full flex items-center justify-center">
                <Loader2 className="h-8 w-8 text-white animate-spin" />
              </div>
            )}
          </div>
          <CardTitle className="text-2xl">
            {status === "loading" && "Processing Payment..."}
            {status === "success" && "Payment Successful!"}
            {status === "failed" && "Payment Failed"}
            {status === "pending" && "Payment Pending"}
          </CardTitle>
          <CardDescription>{message}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {status === "success" && (
            <Alert className="border-green-200 bg-green-50 dark:border-green-900 dark:bg-green-950/20">
              <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
              <AlertTitle className="text-green-900 dark:text-green-100">Success</AlertTitle>
              <AlertDescription className="text-green-800 dark:text-green-200">
                Your payment has been processed and your wallet balance has been updated. You can now use your funds.
              </AlertDescription>
            </Alert>
          )}

          {status === "failed" && (
            <Alert className="border-red-200 bg-red-50 dark:border-red-900 dark:bg-red-950/20">
              <XCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
              <AlertTitle className="text-red-900 dark:text-red-100">Payment Failed</AlertTitle>
              <AlertDescription className="text-red-800 dark:text-red-200">
                Your payment could not be completed. No charges have been made. Please try again or contact support if
                the issue persists.
              </AlertDescription>
            </Alert>
          )}

          {status === "pending" && (
            <Alert className="border-yellow-200 bg-yellow-50 dark:border-yellow-900 dark:bg-yellow-950/20">
              <Loader2 className="h-4 w-4 text-yellow-600 dark:text-yellow-400 animate-spin" />
              <AlertTitle className="text-yellow-900 dark:text-yellow-100">Processing</AlertTitle>
              <AlertDescription className="text-yellow-800 dark:text-yellow-200">
                Your payment is being processed. This usually takes a few moments. Check your wallet balance in a few
                minutes.
              </AlertDescription>
            </Alert>
          )}

          <div className="space-y-3">
            <Button
              onClick={handleRedirect}
              className="w-full bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-700 hover:to-violet-700 text-white"
              size="lg"
            >
              Go to Wallet
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>

            {status !== "loading" && (
              <p className="text-sm text-center text-muted-foreground">
                Redirecting automatically in {countdown} seconds...
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
