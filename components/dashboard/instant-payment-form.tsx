"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { Loader2 } from "lucide-react"

interface InstantPaymentFormProps {
  userId: string
  userEmail: string
  userName: string
  currentBalance: number
}

export function InstantPaymentForm({ userId, userEmail, userName, currentBalance }: InstantPaymentFormProps) {
  const [amount, setAmount] = useState("")
  const [loading, setLoading] = useState(false)

  // Convert XAF to USD
  const balanceInUSD = currentBalance / 600

  const handlePay = () => {
    if (!amount || Number(amount) <= 0) {
      return
    }

    if (Number(amount) < 100) {
      return
    }

    setLoading(true)
    
    // Direct redirect to AccountPe - simple and clean
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

      <div className="space-y-2">
        <Label htmlFor="amount">Amount (XAF - Central African Franc)</Label>
        <Input
          id="amount"
          type="number"
          step="1"
          min="100"
          placeholder="Minimum XAF 100"
          required
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          disabled={loading}
        />
        <p className="text-xs text-muted-foreground">Minimum XAF 100. Your balance will be credited instantly.</p>
      </div>

      <Button
        onClick={handlePay}
        className="w-full bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-700 hover:to-violet-700 text-white"
        size="lg"
        disabled={loading || !amount || Number(amount) < 100}
      >
        {loading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Processing...
          </>
        ) : (
          "Proceed to Pay"
        )}
      </Button>
    </div>
  )
}
