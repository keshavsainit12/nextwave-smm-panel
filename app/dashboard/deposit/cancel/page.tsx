import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { XCircle, ArrowLeft, RefreshCw } from "lucide-react"
import Link from "next/link"
import { redirect } from "next/navigation"

export default async function DepositCancelPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-md border-orange-200 bg-orange-50/50 dark:border-orange-900 dark:bg-orange-950/20">
        <CardHeader className="text-center space-y-4">
          <div className="mx-auto w-16 h-16 bg-orange-100 dark:bg-orange-900 rounded-full flex items-center justify-center">
            <XCircle className="h-10 w-10 text-orange-600 dark:text-orange-400" />
          </div>
          <div>
            <CardTitle className="text-2xl text-orange-900 dark:text-orange-100">Payment Cancelled</CardTitle>
            <CardDescription className="text-orange-700 dark:text-orange-300 mt-2">
              Your deposit was cancelled or failed
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Information */}
          <div className="bg-white dark:bg-slate-900 rounded-lg p-4 border border-orange-200 dark:border-orange-900">
            <p className="text-sm text-muted-foreground text-center">
              No charges were made to your account. You can try again with a different payment method or contact support
              if you need assistance.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            <Link href="/dashboard/deposit" className="block">
              <Button className="w-full bg-orange-600 hover:bg-orange-700 text-white" size="lg">
                <RefreshCw className="mr-2 h-4 w-4" />
                Try Again
              </Button>
            </Link>
            <Link href="/dashboard" className="block">
              <Button variant="outline" className="w-full" size="lg">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Dashboard
              </Button>
            </Link>
          </div>

          {/* Help */}
          <div className="text-center">
            <p className="text-xs text-muted-foreground">
              Need help?{" "}
              <Link href="/dashboard/tickets" className="text-orange-600 hover:underline">
                Contact Support
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
