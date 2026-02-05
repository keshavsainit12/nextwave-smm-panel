"use client"

import { useEffect, useState, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { CheckCircle, XCircle, Info } from "lucide-react"

function PaymentStatusAlertContent() {
  const searchParams = useSearchParams()
  const [show, setShow] = useState(false)
  const [status, setStatus] = useState<"success" | "failed" | null>(null)

  useEffect(() => {
    const urlStatus = searchParams.get("status")
    let detectedStatus: "success" | "failed" | null = null

    if (urlStatus === "success") {
      detectedStatus = "success"
    } else if (urlStatus === "failed" || urlStatus === "failure") {
      detectedStatus = "failed"
    }

    if (detectedStatus) {
      setStatus(detectedStatus)
      setShow(true)
      // Auto-hide after 10 seconds
      const timer = setTimeout(() => setShow(false), 10000)
      return () => clearTimeout(timer)
    }
  }, [searchParams])

  if (!show || !status) return null

  return (
    <>
      {status === "success" && (
        <Alert className="border-green-200 bg-green-50 dark:border-green-900 dark:bg-green-950/20">
          <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
          <AlertTitle className="text-green-900 dark:text-green-100">Payment Successful!</AlertTitle>
          <AlertDescription className="text-green-800 dark:text-green-200">
            Your payment has been completed successfully. Your wallet balance has been updated. Check the deposit history
            below.
          </AlertDescription>
        </Alert>
      )}

      {status === "failed" && (
        <Alert className="border-red-200 bg-red-50 dark:border-red-900 dark:bg-red-950/20">
          <XCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
          <AlertTitle className="text-red-900 dark:text-red-100">Payment Failed</AlertTitle>
          <AlertDescription className="text-red-800 dark:text-red-200">
            Your payment could not be completed. No charges have been made. Please try again or contact support if the
            issue persists.
          </AlertDescription>
        </Alert>
      )}
    </>
  )
}

export function PaymentStatusAlert() {
  return (
    <Suspense fallback={null}>
      <PaymentStatusAlertContent />
    </Suspense>
  )
}
