import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { XCircle, ArrowLeft, RefreshCw, HelpCircle } from "lucide-react"
import Link from "next/link"
import { redirect } from "next/navigation"

export default async function DepositCancelPage({
  searchParams,
}: {
  searchParams: { transaction_id?: string; reason?: string }
}) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  // If transaction_id provided, mark it as cancelled
  const transactionId = searchParams.transaction_id
  let transaction = null

  if (transactionId) {
    // Fetch transaction
    const { data: txData } = await supabase
      .from("transactions")
      .select("*")
      .eq("id", transactionId)
      .single()

    transaction = txData

    // If transaction is pending, mark it as cancelled
    if (txData && txData.status === "pending") {
      await supabase
        .from("transactions")
        .update({
          status: "cancelled",
          notes: `${txData.notes || ""} - Cancelled by user or payment failed`
        })
        .eq("id", transactionId)
    }
  }

  // Get reason for cancellation if provided
  const cancelReason = searchParams.reason || "User cancelled or payment timeout"

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

          {/* Transaction Details */}
          {transaction && (
            <div className="text-sm text-muted-foreground space-y-1 bg-white dark:bg-slate-900 rounded-lg p-3 border">
              <div className="flex justify-between">
                <span>Transaction ID:</span>
                <span className="font-mono text-xs">{transaction.id.substring(0, 12)}...</span>
              </div>
              <div className="flex justify-between">
                <span>Amount:</span>
                <span className="font-semibold">${Number(transaction.amount || 0).toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Status:</span>
                <span className="text-orange-600 dark:text-orange-400 font-semibold capitalize">
                  Cancelled
                </span>
              </div>
            </div>
          )}

          {/* Common reasons */}
          <div className="bg-white dark:bg-slate-900 rounded-lg p-4 border">
            <div className="flex items-start gap-2 mb-2">
              <HelpCircle className="h-4 w-4 text-muted-foreground mt-0.5" />
              <div className="text-sm">
                <p className="font-medium mb-1">Common reasons for cancellation:</p>
                <ul className="list-disc list-inside text-muted-foreground space-y-1">
                  <li>User closed payment page</li>
                  <li>Payment timeout (session expired)</li>
                  <li>Insufficient funds</li>
                  <li>Payment provider declined</li>
                  <li>Network connection issue</li>
                </ul>
              </div>
            </div>
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
