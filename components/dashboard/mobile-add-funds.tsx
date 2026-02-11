"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { Copy, Check, Upload } from "lucide-react"
import { submitCryptoDeposit } from "@/app/actions/deposits"
import { useRouter } from "next/navigation"
import type { CryptoCurrency } from "@/lib/types/database"
import { toast } from "sonner"

export function MobileAddFunds({
  currencies,
  currentBalance,
}: {
  currencies: CryptoCurrency[]
  currentBalance: number
}) {
  const [selectedCurrency, setSelectedCurrency] = useState<CryptoCurrency | null>(null)
  const [amount, setAmount] = useState("")
  const [cryptoAmount, setCryptoAmount] = useState("")
  const [screenshot, setScreenshot] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [copied, setCopied] = useState(false)
  const router = useRouter()

  const copyAddress = () => {
    if (selectedCurrency) {
      navigator.clipboard.writeText(selectedCurrency.wallet_address)
      setCopied(true)
      toast.success("Wallet address copied!")
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const handleScreenshotChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (!file.type.startsWith("image/")) {
        toast.error("Please upload an image file")
        return
      }
      if (file.size > 5 * 1024 * 1024) {
        toast.error("File size must be less than 5MB")
        return
      }
      setScreenshot(file)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!selectedCurrency) {
      toast.error("Please select a cryptocurrency")
      return
    }

    if (!amount || Number(amount) <= 0) {
      toast.error("Please enter a valid amount")
      return
    }

    if (!cryptoAmount) {
      toast.error("Please enter the crypto amount you sent")
      return
    }

    if (!screenshot) {
      toast.error("Please upload payment proof screenshot")
      return
    }

    if (Number(amount) < selectedCurrency.minimum_deposit) {
      toast.error(`Minimum deposit is $${selectedCurrency.minimum_deposit}`)
      return
    }

    setLoading(true)

    try {
      const base64String = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader()
        reader.onloadend = () => {
          if (reader.result) {
            resolve(reader.result as string)
          } else {
            reject(new Error("Failed to read file"))
          }
        }
        reader.onerror = () => reject(new Error("File reading error"))
        reader.readAsDataURL(screenshot)
      })

      const result = await submitCryptoDeposit({
        cryptoCurrencyId: selectedCurrency.id,
        amount: Number(amount),
        cryptoAmount,
        screenshotBase64: base64String,
      })

      if (result.success) {
        toast.success("Deposit submitted! Awaiting admin approval.")
        setSelectedCurrency(null)
        setAmount("")
        setCryptoAmount("")
        setScreenshot(null)

        const fileInput = document.getElementById("screenshot") as HTMLInputElement
        if (fileInput) fileInput.value = ""

        router.push("/dashboard")
        router.refresh()
      } else {
        toast.error(result.error || "Failed to submit deposit. Please try again.")
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to submit deposit. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 w-full">
      {/* Cryptocurrency Selection */}
      <div className="space-y-3">
        <Label className="text-base font-semibold">Select Cryptocurrency</Label>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2 md:gap-3">
          {currencies.map((currency) => (
            <button
              key={currency.id}
              type="button"
              onClick={() => setSelectedCurrency(currency)}
              className={`relative p-3 md:p-4 rounded-lg md:rounded-xl border-2 transition-all flex flex-col items-center gap-2 ${
                selectedCurrency?.id === currency.id
                  ? "border-purple-600 bg-purple-50 dark:bg-purple-950/40"
                  : "border-slate-200 dark:border-slate-700 hover:border-purple-300 dark:hover:border-purple-700"
              }`}
            >
              <div className="w-8 md:w-10 h-8 md:h-10 rounded-md md:rounded-lg bg-purple-100 dark:bg-purple-900 flex items-center justify-center">
                <span className="font-bold text-purple-600 dark:text-purple-300 text-xs md:text-sm">{currency.symbol}</span>
              </div>
              <span className="text-xs md:text-sm font-medium text-center line-clamp-1">{currency.name}</span>
              {selectedCurrency?.id === currency.id && (
                <Check className="w-4 h-4 text-purple-600 absolute top-1 right-1" />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Form content - only show when currency selected */}
      {selectedCurrency ? (
        <>
          {/* Wallet Address Card */}
          <Card className="border-2 border-purple-200 dark:border-purple-800 bg-purple-50/50 dark:bg-purple-950/20">
            <CardContent className="pt-6 space-y-3">
              <div>
                <p className="text-sm font-semibold text-muted-foreground mb-2">Wallet Address</p>
                <button
                  type="button"
                  onClick={copyAddress}
                  className="w-full p-3 md:p-4 bg-white dark:bg-white/5 rounded-lg md:rounded-xl text-left break-all text-xs md:text-sm font-mono hover:bg-slate-50 dark:hover:bg-white/10 transition-colors flex justify-between items-start gap-2 group"
                >
                  <span className="flex-1">{selectedCurrency.wallet_address}</span>
                  {copied ? (
                    <Check className="w-4 h-4 text-green-600 shrink-0 mt-1" />
                  ) : (
                    <Copy className="w-4 h-4 text-purple-600 shrink-0 mt-1 group-hover:text-purple-700" />
                  )}
                </button>
              </div>
              <div className="space-y-1 text-xs md:text-sm">
                <p className="font-semibold">Minimum: ${selectedCurrency.minimum_deposit}</p>
                <p className="text-muted-foreground">Network: {selectedCurrency.network || "Default"}</p>
              </div>
            </CardContent>
          </Card>

          {/* Amount Input */}
          <div className="space-y-2">
            <Label htmlFor="amount" className="text-sm font-semibold">
              Amount (USD) *
            </Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-lg font-bold text-purple-600">$</span>
              <Input
                id="amount"
                type="number"
                step="0.01"
                min={selectedCurrency.minimum_deposit}
                placeholder="0.00"
                required
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="pl-8 text-base md:text-lg h-10 md:h-11"
              />
            </div>
            <p className="text-xs text-muted-foreground">Minimum ${selectedCurrency.minimum_deposit}</p>
          </div>

          {/* Crypto Amount Input */}
          <div className="space-y-2">
            <Label htmlFor="cryptoAmount" className="text-sm font-semibold">
              Amount Sent in {selectedCurrency.symbol} *
            </Label>
            <Input
              id="cryptoAmount"
              placeholder={`e.g., 0.00123 ${selectedCurrency.symbol}`}
              required
              value={cryptoAmount}
              onChange={(e) => setCryptoAmount(e.target.value)}
              className="text-base md:text-lg h-10 md:h-11"
            />
            <p className="text-xs text-muted-foreground">Exact amount sent from your wallet</p>
          </div>

          {/* Screenshot Upload */}
          <div className="space-y-2">
            <Label htmlFor="screenshot" className="text-sm font-semibold">
              Payment Proof Screenshot *
            </Label>
            <div className="border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-lg md:rounded-xl p-4 md:p-6 text-center hover:border-purple-400 dark:hover:border-purple-600 transition-colors">
              <Input
                id="screenshot"
                type="file"
                accept="image/*"
                required
                onChange={handleScreenshotChange}
                className="hidden"
              />
              <label htmlFor="screenshot" className="cursor-pointer block">
                <Upload className="h-6 md:h-8 w-6 md:w-8 mx-auto mb-2 text-muted-foreground" />
                {screenshot ? (
                  <div className="space-y-1">
                    <p className="text-xs md:text-sm font-medium text-green-600">{screenshot.name}</p>
                    <p className="text-xs text-muted-foreground">{(screenshot.size / 1024).toFixed(2)} KB</p>
                  </div>
                ) : (
                  <div className="space-y-1">
                    <p className="text-xs md:text-sm font-medium">Click to upload</p>
                    <p className="text-xs text-muted-foreground">PNG, JPG up to 5MB</p>
                  </div>
                )}
              </label>
            </div>
          </div>

          {/* Instructions */}
          <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900 rounded-lg md:rounded-xl p-3 md:p-4 text-xs md:text-sm space-y-2">
            <p className="font-semibold text-blue-900 dark:text-blue-100">📋 Steps:</p>
            <ol className="list-decimal list-inside space-y-1 text-blue-800 dark:text-blue-200 text-xs">
              <li>Copy wallet address</li>
              <li>Send exact crypto amount</li>
              <li>Take screenshot of transaction</li>
              <li>Upload & submit</li>
              <li>Wait for approval (24h)</li>
            </ol>
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 md:py-4 text-base md:text-lg"
            disabled={loading || !selectedCurrency || !amount || !cryptoAmount || !screenshot}
          >
            {loading ? "Submitting..." : "Submit Deposit Request"}
          </Button>
        </>
      ) : (
        <div className="text-center py-8 text-muted-foreground">
          <p className="text-sm">Select a cryptocurrency to continue</p>
        </div>
      )}
    </form>
  )
}
