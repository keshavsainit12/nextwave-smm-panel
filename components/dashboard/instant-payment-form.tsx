"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

interface InstantPaymentFormProps {
  userId: string
  userEmail: string
  userName: string
  currentBalance: number
}

export function InstantPaymentForm({ currentBalance }: InstantPaymentFormProps) {
  // Convert XAF to USD
  const balanceInUSD = currentBalance / 600

  const handlePay = () => {
    // Direct redirect to AccountPe dashboard
    window.location.href = "https://app.accountpe.com/payin/dashboard"
  }

  return (
    <div className="space-y-6">
      <Card className="border-2 border-purple-500/20 bg-gradient-to-br from-purple-50 to-violet-50 dark:from-purple-950/20 dark:to-violet-950/20">
        <CardContent className="pt-6 space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-violet-600 rounded-lg flex items-center justify-center text-white font-bold text-lg">
              N
            </div>
            <div>
              <h3 className="font-semibold text-purple-900 dark:text-purple-100">NextWave Global Payment</h3>
              <p className="text-sm text-purple-700 dark:text-purple-200">Instant Payment Gateway</p>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-lg p-3 space-y-2 text-sm border border-purple-100 dark:border-purple-900">
            <div className="flex justify-between">
              <span className="text-slate-600 dark:text-slate-400">Current Balance:</span>
              <span className="font-semibold text-purple-600 dark:text-purple-400">${balanceInUSD.toFixed(2)} USD</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Button
        onClick={handlePay}
        className="w-full bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-700 hover:to-violet-700 text-white"
        size="lg"
      >
        Pay Now
      </Button>
    </div>
  )
}
