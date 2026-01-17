"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent } from "@/components/ui/card"
import { Copy, Check, Upload } from "lucide-react"
import { submitCryptoDeposit } from "@/app/actions/deposits"
import { useRouter } from "next/navigation"
import type { CryptoCurrency } from "@/lib/types/database"
import { toast } from "sonner"

export function CryptoDepositForm({ currencies }: { currencies: CryptoCurrency[] }) {
  const [selectedCurrency, setSelectedCurrency] = useState<CryptoCurrency | null>(null)
  const [amount, setAmount] = useState("")
  const [cryptoAmount, setCryptoAmount] = useState("")
  const [screenshot, setScreenshot] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [copied, setCopied] = useState(false)
  const router = useRouter()

  const handleCurrencyChange = (currencyId: string) => {
    const currency = currencies.find((c) => c.id === currencyId)
    setSelectedCurrency(currency || null)
  }

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
      // Validate file type
      if (!file.type.startsWith("image/")) {
        toast.error("Please upload an image file")
        return
      }
      // Validate file size (max 5MB)
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

    // Check minimum deposit
    if (Number(amount) < selectedCurrency.minimum_deposit) {
      toast.error(`Minimum deposit is $${selectedCurrency.minimum_deposit}`)
      return
    }

    setLoading(true)
    console.log("[v0] Starting deposit submission...")

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

      console.log("[v0] Image converted to base64, submitting deposit...")

      const result = await submitCryptoDeposit({
        cryptoCurrencyId: selectedCurrency.id,
        amount: Number(amount),
        cryptoAmount,
        screenshotBase64: base64String,
      })

      if (result.success) {
        console.log("[v0] Deposit submitted successfully")
        toast.success("Deposit submitted successfully! Waiting for admin approval.")

        // Reset form
        setSelectedCurrency(null)
        setAmount("")
        setCryptoAmount("")
        setScreenshot(null)

        // Reset file input
        const fileInput = document.getElementById("screenshot") as HTMLInputElement
        if (fileInput) fileInput.value = ""

        // Navigate to dashboard
        router.push("/dashboard")
        router.refresh()
      } else {
        console.error("[v0] Deposit failed:", result.error)
        toast.error(result.error || "Failed to submit deposit. Please try again.")
      }
    } catch (error) {
      console.error("[v0] Deposit submission error:", error)
      toast.error(error instanceof Error ? error.message : "Failed to submit deposit. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="currency">Select Cryptocurrency *</Label>
        <Select onValueChange={handleCurrencyChange}>
          <SelectTrigger>
            <SelectValue placeholder="Choose cryptocurrency" />
          </SelectTrigger>
          <SelectContent>
            {currencies.map((currency) => (
              <SelectItem key={currency.id} value={currency.id}>
                {currency.name} ({currency.symbol}) {currency.network && `- ${currency.network}`}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {selectedCurrency && (
        <>
          <Card className="border-2 border-primary/20">
            <CardContent className="pt-6 space-y-4">
              <div>
                <Label className="text-muted-foreground">Wallet Address</Label>
                <div className="flex items-center gap-2 mt-2">
                  <code className="flex-1 p-3 text-sm bg-muted rounded-md break-all font-mono">
                    {selectedCurrency.wallet_address}
                  </code>
                  <Button type="button" variant="outline" size="icon" onClick={copyAddress}>
                    {copied ? <Check className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
              <div className="text-sm space-y-1">
                <p className="font-semibold">Minimum deposit: ${selectedCurrency.minimum_deposit}</p>
                <p className="text-xs text-muted-foreground">Network: {selectedCurrency.network || "Default"}</p>
                <p className="text-xs text-amber-600 dark:text-amber-500">⚠️ Send exact amount to the address above</p>
              </div>
            </CardContent>
          </Card>

          <div className="space-y-2">
            <Label htmlFor="amount">Amount (USD) *</Label>
            <Input
              id="amount"
              type="number"
              step="0.01"
              min={selectedCurrency.minimum_deposit}
              placeholder={`Minimum $${selectedCurrency.minimum_deposit}`}
              required
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">Enter the amount you're depositing in USD</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="cryptoAmount">Amount Sent in {selectedCurrency.symbol} *</Label>
            <Input
              id="cryptoAmount"
              placeholder={`e.g., 0.00123 ${selectedCurrency.symbol}`}
              required
              value={cryptoAmount}
              onChange={(e) => setCryptoAmount(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">Exact crypto amount you sent from your wallet</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="screenshot">Payment Screenshot *</Label>
            <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center hover:border-primary/50 transition-colors">
              <Input
                id="screenshot"
                type="file"
                accept="image/*"
                required
                onChange={handleScreenshotChange}
                className="hidden"
              />
              <label htmlFor="screenshot" className="cursor-pointer">
                <Upload className="h-10 w-10 mx-auto mb-2 text-muted-foreground" />
                {screenshot ? (
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-green-600">{screenshot.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {(screenshot.size / 1024).toFixed(2)} KB - Click to change
                    </p>
                  </div>
                ) : (
                  <div className="space-y-1">
                    <p className="text-sm font-medium">Click to upload screenshot</p>
                    <p className="text-xs text-muted-foreground">PNG, JPG up to 5MB</p>
                  </div>
                )}
              </label>
            </div>
            <p className="text-xs text-muted-foreground">Upload proof of your transaction from your wallet</p>
          </div>

          <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900 rounded-lg p-4 text-sm">
            <p className="font-semibold text-blue-900 dark:text-blue-100 mb-2">📋 Instructions:</p>
            <ol className="list-decimal list-inside space-y-1 text-blue-800 dark:text-blue-200">
              <li>Copy the wallet address above</li>
              <li>Send the exact crypto amount from your wallet</li>
              <li>Take a screenshot of the completed transaction</li>
              <li>Upload the screenshot and submit</li>
              <li>Wait for admin approval (usually within 24 hours)</li>
            </ol>
          </div>

          <Button type="submit" className="w-full" size="lg" disabled={loading}>
            {loading ? "Submitting..." : "Submit Deposit Request"}
          </Button>
        </>
      )}
    </form>
  )
}
