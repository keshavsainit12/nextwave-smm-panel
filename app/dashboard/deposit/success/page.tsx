import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CheckCircle, ArrowRight, Wallet, Clock, AlertCircle } from "lucide-react"
import Link from "next/link"
import { redirect } from "next/navigation"
import { SuccessRedirect } from "@/components/deposit/success-redirect"

export default async function DepositSuccessPage({
  searchParams,
}: {
  searchParams: { transaction_id?: string; amount?: string; status?: string }
}) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  // Fetch updated user balance
  const { data: userData } = await supabase
    .from("users")
    .select("balance, full_name")
    .eq("id", user.id)
    .single()

  const transactionId = searchParams.transaction_id
  let transaction = null
  let transactionStatus = "pending" // default

  if (transactionId) {
    const { data: txData } = await supabase
      .from("transactions")
      .select("*")
      .eq("id", transactionId)
      .single()

    transaction = txData
    transactionStatus = txData?.status || "pending"
  }

  // Handle different transaction statuses
  const isCompleted = transactionStatus === "completed"
  const isPending = transactionStatus === "pending"
  const isFailed = transactionStatus === "failed"

  // If webhook hasn't processed yet, show pending state
  if (isPending) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="w-full max-w-md border-yellow-200 bg-yellow-50/50 dark:border-yellow-900 dark:bg-yellow-950/20">
          <CardHeader className="text-center space-y-4">
            <div className="mx-auto w-16 h-16 bg-yellow-100 dark:bg-yellow-900 rounded-full flex items-center justify-center">
              <Clock className="h-10 w-10 text-yellow-600 dark:text-yellow-400 animate-spin" />
            </div>
            <div>
              <CardTitle className="text-2xl text-yellow-900 dark:text-yellow-100">
                Payment Processing...
              </CardTitle>
              <CardDescription className="text-yellow-700 dark:text-yellow-300 mt-2">
                Your payment is being confirmed. This usually takes a few seconds.
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Processing Info */}
            <div className="bg-white dark:bg-slate-900 rounded-lg p-4 border border-yellow-200 dark:border-yellow-900">
              <p className="text-sm text-muted-foreground text-center">
                Please wait while we confirm your payment with the payment provider. 
                Your balance will be updated automatically once confirmed.
              </p>
            </div>

            {/* Transaction Details */}
            {transaction && (
              <div className="text-sm text-muted-foreground space-y-1">
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
                  <span className="text-yellow-600 dark:text-yellow-400 font-semibold capitalize">
                    {transaction.status}
                  </span>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="space-y-3">
              <Link href="/dashboard" className="block">
                <Button variant="outline" className="w-full" size="lg">
                  <ArrowRight className="mr-2 h-4 w-4" />
                  Go to Dashboard
                </Button>
              </Link>
            </div>

            {/* Auto-refresh notice */}
            <p className="text-xs text-center text-muted-foreground">
              This page will refresh automatically when payment is confirmed...
            </p>
          </CardContent>
        </Card>

        {/* Auto-refresh script */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              setTimeout(function() {
                window.location.reload();
              }, 3000);
            `,
          }}
        />
      </div>
    )
  }

  // If transaction failed, show error state
  if (isFailed) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="w-full max-w-md border-red-200 bg-red-50/50 dark:border-red-900 dark:bg-red-950/20">
          <CardHeader className="text-center space-y-4">
            <div className="mx-auto w-16 h-16 bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center">
              <AlertCircle className="h-10 w-10 text-red-600 dark:text-red-400" />
            </div>
            <div>
              <CardTitle className="text-2xl text-red-900 dark:text-red-100">Payment Failed</CardTitle>
              <CardDescription className="text-red-700 dark:text-red-300 mt-2">
                Your payment could not be processed
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Error Info */}
            <div className="bg-white dark:bg-slate-900 rounded-lg p-4 border border-red-200 dark:border-red-900">
              <p className="text-sm text-muted-foreground text-center">
                The payment was not successful. No charges were made to your account. 
                Please try again or contact support if the issue persists.
              </p>
            </div>

            {/* Transaction Details */}
            {transaction && (
              <div className="text-sm text-muted-foreground space-y-1">
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
                  <span className="text-red-600 dark:text-red-400 font-semibold capitalize">
                    {transaction.status}
                  </span>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="space-y-3">
              <Link href="/dashboard/deposit" className="block">
                <Button className="w-full bg-red-600 hover:bg-red-700 text-white" size="lg">
                  Try Again
                </Button>
              </Link>
              <Link href="/dashboard" className="block">
                <Button variant="outline" className="w-full" size="lg">
                  <ArrowRight className="mr-2 h-4 w-4" />
                  Back to Dashboard
                </Button>
              </Link>
            </div>

            {/* Help */}
            <div className="text-center">
              <p className="text-xs text-muted-foreground">
                Need help?{" "}
                <Link href="/dashboard/tickets" className="text-red-600 hover:underline">
                  Contact Support
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Success state - payment completed
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-md border-green-200 bg-green-50/50 dark:border-green-900 dark:bg-green-950/20">
        <CardHeader className="text-center space-y-4">
          <div className="mx-auto w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
            <CheckCircle className="h-10 w-10 text-green-600 dark:text-green-400" />
          </div>
          <div>
            <CardTitle className="text-2xl text-green-900 dark:text-green-100">Payment Successful!</CardTitle>
            <CardDescription className="text-green-700 dark:text-green-300 mt-2">
              Your deposit has been processed successfully
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Amount Added */}
          {transaction && (
            <div className="bg-white dark:bg-slate-900 rounded-lg p-4 border border-green-200 dark:border-green-900">
              <div className="text-center">
                <p className="text-sm text-muted-foreground mb-1">Amount Added</p>
                <p className="text-3xl font-bold text-green-600 dark:text-green-400">
                  ${Number(transaction.amount || 0).toFixed(2)}
                </p>
              </div>
            </div>
          )}

          {/* New Balance */}
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30 rounded-lg p-4 border border-green-200 dark:border-green-900">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Wallet className="h-5 w-5 text-green-600 dark:text-green-400" />
                <span className="font-medium text-green-900 dark:text-green-100">Current Balance</span>
              </div>
              <span className="text-2xl font-bold text-green-600 dark:text-green-400">
                ${Number(userData?.balance || 0).toFixed(2)}
              </span>
            </div>
          </div>

          {/* Transaction Details */}
          {transaction && (
            <div className="text-sm text-muted-foreground space-y-1">
              <div className="flex justify-between">
                <span>Transaction ID:</span>
                <span className="font-mono text-xs">{transaction.id.substring(0, 12)}...</span>
              </div>
              <div className="flex justify-between">
                <span>Status:</span>
                <span className="text-green-600 dark:text-green-400 font-semibold capitalize">
                  {transaction.status}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Payment Method:</span>
                <span className="capitalize">{transaction.payment_method?.replace('_', ' ')}</span>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="space-y-3">
            <Link href="/dashboard" className="block">
              <Button className="w-full bg-green-600 hover:bg-green-700 text-white" size="lg">
                Go to Dashboard
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <Link href="/dashboard/deposit" className="block">
              <Button variant="outline" className="w-full" size="lg">
                Make Another Deposit
              </Button>
            </Link>
          </div>

          {/* Auto-redirect notice with countdown */}
          <SuccessRedirect />
        </CardContent>
      </Card>
    </div>
  )
}
