"use client"

import { useRouter } from "next/navigation"
import { XCircle, RefreshCw, Home } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"

export default function PaymentCancelPage() {
  const router = useRouter()

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-red-50 to-orange-50 dark:from-gray-900 dark:to-gray-800">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center">
            <XCircle className="w-10 h-10 text-red-600 dark:text-red-400" />
          </div>
          <CardTitle className="text-2xl font-bold text-red-600 dark:text-red-400">
            Payment Cancelled
          </CardTitle>
          <CardDescription className="text-base mt-2">
            Your payment was not completed
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <AlertDescription>
              No charges were made to your account. You can try again or return to your dashboard.
            </AlertDescription>
          </Alert>

          <div className="space-y-2">
            <Button
              onClick={() => router.push("/dashboard/instant-payment")}
              className="w-full"
              size="lg"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Try Payment Again
            </Button>

            <Button
              onClick={() => router.push("/dashboard")}
              variant="outline"
              className="w-full"
              size="lg"
            >
              <Home className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
          </div>

          <div className="text-center text-sm text-muted-foreground space-y-1">
            <p>Need help?</p>
            <Button
              variant="link"
              onClick={() => router.push("/dashboard/support")}
              className="text-sm h-auto p-0"
            >
              Contact Support
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
