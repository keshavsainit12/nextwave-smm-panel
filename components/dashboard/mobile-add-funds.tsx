"use client"

import type React from "react"

import { useState } from "react"
import { ArrowLeft, Check, Upload, ArrowRight } from "lucide-react"
import { useRouter } from "next/navigation"
import { submitCryptoDeposit } from "@/app/actions/deposits"
import type { CryptoCurrency } from "@/lib/types/database"
import { toast } from "sonner"

export function MobileAddFunds({
  currencies,
  currentBalance,
}: { currencies: CryptoCurrency[]; currentBalance: number }) {
  const router = useRouter()
  const [amount, setAmount] = useState("100.00")
  const [selectedCurrency, setSelectedCurrency] = useState<CryptoCurrency | null>(
    currencies.length > 0 ? currencies[0] : null,
  )
  const [cryptoAmount, setCryptoAmount] = useState("")
  const [screenshot, setScreenshot] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [copied, setCopied] = useState(false)

  const quickAmounts = [10, 50, 100, 500]

  const addQuickAmount = (value: number) => {
    const current = Number.parseFloat(amount) || 0
    setAmount((current + value).toFixed(2))
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

  const handleSubmit = async () => {
    if (!selectedCurrency) {
      toast.error("Please select a cryptocurrency")
      return
    }

    if (!amount || Number(amount) <= 0) {
      toast.error("Please enter a valid amount")
      return
    }

    if (Number(amount) < selectedCurrency.minimum_deposit) {
      toast.error(`Minimum deposit is $${selectedCurrency.minimum_deposit}`)
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
        toast.success("Deposit submitted successfully! Waiting for admin approval.")
        setAmount("100.00")
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
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-purple-50 dark:from-[#191022] dark:via-[#1a0f2e] dark:to-[#191022] pb-32">
      {/* Header */}
      <header className="flex items-center justify-between p-6">
        <button
          onClick={() => router.back()}
          className="size-12 flex items-center justify-center rounded-full bg-white dark:bg-white/10 shadow-sm active:scale-95 transition-transform"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-xl font-bold">Add Funds</h1>
        <div className="size-12"></div>
      </header>

      {/* Main Card */}
      <main className="px-4">
        <div className="bg-white/70 dark:bg-white/5 backdrop-blur-xl rounded-[40px] p-8 shadow-2xl shadow-purple-500/5">
          {/* Orbital Balance Ring */}
          <div className="relative size-32 flex items-center justify-center mb-8 mx-auto">
            <div
              className="absolute inset-0 rounded-full opacity-20"
              style={{
                background: "conic-gradient(from 0deg, #7f13ec 0%, #7f13ec 75%, transparent 75%, transparent 100%)",
                mask: "radial-gradient(farthest-side, transparent calc(100% - 6px), #fff 0)",
                WebkitMask: "radial-gradient(farthest-side, transparent calc(100% - 6px), #fff 0)",
              }}
            ></div>
            <div
              className="absolute inset-0 rounded-full rotate-45 shadow-[0_0_15px_rgba(127,19,236,0.2)]"
              style={{
                background: "conic-gradient(from 0deg, #7f13ec 0%, #7f13ec 75%, transparent 75%, transparent 100%)",
                mask: "radial-gradient(farthest-side, transparent calc(100% - 6px), #fff 0)",
                WebkitMask: "radial-gradient(farthest-side, transparent calc(100% - 6px), #fff 0)",
              }}
            ></div>
            <div className="z-10 text-center">
              <p className="text-[8px] font-bold uppercase tracking-widest opacity-60">Current</p>
              <p className="text-lg font-bold leading-tight">${currentBalance.toFixed(2)}</p>
            </div>
          </div>

          {/* Amount Input */}
          <div className="w-full space-y-4">
            <label className="text-sm font-semibold opacity-60 px-2 block">Enter Amount</label>
            <div className="relative flex items-center">
              <span className="absolute left-6 text-3xl font-bold text-purple-600">$</span>
              <input
                className="w-full bg-slate-100/50 dark:bg-white/5 border-none rounded-3xl py-6 pl-14 pr-6 text-4xl font-bold focus:ring-2 focus:ring-purple-600/20 transition-all outline-none"
                placeholder="0.00"
                type="number"
                step="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
            </div>

            {/* Quick Add Buttons */}
            <div className="flex overflow-x-auto gap-3 py-2 hide-scrollbar">
              {quickAmounts.map((value) => (
                <button
                  key={value}
                  onClick={() => addQuickAmount(value)}
                  className={`shrink-0 px-6 py-3 rounded-full font-bold text-sm transition-all ${
                    value === 50
                      ? "bg-purple-600 text-white shadow-lg shadow-purple-600/20"
                      : "bg-purple-600/10 text-purple-600 border border-purple-600/10"
                  }`}
                >
                  +${value}
                </button>
              ))}
            </div>
          </div>

          {/* Crypto Selection - ALWAYS SHOW */}
          <div className="w-full mt-10 space-y-4">
            <h2 className="text-sm font-semibold opacity-60 px-2">Select Cryptocurrency</h2>
            <div className="grid grid-cols-2 gap-3">
              {currencies.map((currency) => (
                <button
                  key={currency.id}
                  onClick={() => setSelectedCurrency(currency)}
                  className={`p-4 rounded-3xl flex flex-col items-start gap-3 relative overflow-hidden group transition-all ${
                    selectedCurrency?.id === currency.id
                      ? "bg-slate-100/50 dark:bg-white/5 border-2 border-purple-600"
                      : "bg-slate-100/30 dark:bg-white/5 border-2 border-transparent opacity-70"
                  }`}
                >
                  <div className="size-10 rounded-2xl bg-purple-600/10 flex items-center justify-center">
                    <span className="text-purple-600 text-lg font-bold">{currency.symbol}</span>
                  </div>
                  <span className="font-bold text-sm">{currency.name}</span>
                  {selectedCurrency?.id === currency.id && (
                    <div className="absolute top-2 right-2">
                      <Check className="text-purple-600 w-5 h-5" />
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Crypto Details - ALWAYS SHOW when currency selected */}
          {selectedCurrency && (
            <>
              {/* Wallet Address */}
              <div className="mt-6 p-6 rounded-3xl bg-purple-50/50 dark:bg-purple-950/20 space-y-3">
                <p className="text-sm font-semibold opacity-60">Wallet Address</p>
                <button
                  onClick={copyAddress}
                  className="w-full p-4 bg-white dark:bg-white/5 rounded-2xl text-left break-all text-sm font-mono flex items-start justify-between gap-2 hover:bg-slate-50 dark:hover:bg-white/10 transition-colors"
                >
                  <span className="flex-1">{selectedCurrency.wallet_address}</span>
                  {copied ? (
                    <Check className="w-5 h-5 text-green-600 shrink-0" />
                  ) : (
                    <span className="text-purple-600 shrink-0">📋</span>
                  )}
                </button>
                <p className="text-xs opacity-60">
                  Minimum: ${selectedCurrency.minimum_deposit} • Network: {selectedCurrency.network || "Default"}
                </p>
              </div>

              {/* Crypto Amount Input */}
              <div className="mt-6 space-y-2">
                <label className="text-sm font-semibold opacity-60 px-2 block">
                  Amount Sent in {selectedCurrency.symbol}
                </label>
                <input
                  className="w-full bg-slate-100/50 dark:bg-white/5 border-none rounded-3xl py-4 px-6 text-lg font-semibold focus:ring-2 focus:ring-purple-600/20 transition-all outline-none"
                  placeholder={`e.g., 0.00123 ${selectedCurrency.symbol}`}
                  value={cryptoAmount}
                  onChange={(e) => setCryptoAmount(e.target.value)}
                />
              </div>

              {/* Screenshot Upload */}
              <div className="mt-6 space-y-2">
                <label className="text-sm font-semibold opacity-60 px-2 block">Payment Proof Screenshot</label>
                <div className="border-2 border-dashed border-slate-300 dark:border-white/10 rounded-3xl p-8 text-center hover:border-purple-600/50 transition-colors">
                  <input
                    id="screenshot"
                    type="file"
                    accept="image/*"
                    onChange={handleScreenshotChange}
                    className="hidden"
                  />
                  <label htmlFor="screenshot" className="cursor-pointer">
                    <Upload className="h-10 w-10 mx-auto mb-2 text-purple-600" />
                    {screenshot ? (
                      <div className="space-y-1">
                        <p className="text-sm font-medium text-green-600">{screenshot.name}</p>
                        <p className="text-xs opacity-60">{(screenshot.size / 1024).toFixed(2)} KB</p>
                      </div>
                    ) : (
                      <div className="space-y-1">
                        <p className="text-sm font-medium">Click to upload</p>
                        <p className="text-xs opacity-60">PNG, JPG up to 5MB</p>
                      </div>
                    )}
                  </label>
                </div>
              </div>
            </>
          )}
        </div>
      </main>

      {/* Fixed Bottom Button */}
      <div className="fixed bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-purple-50 dark:from-[#191022] pt-12">
        <button
          onClick={handleSubmit}
          disabled={loading || !selectedCurrency || !amount || !cryptoAmount || !screenshot}
          className="w-full py-5 rounded-[2rem] bg-purple-600 text-white font-bold text-lg flex items-center justify-center gap-3 shadow-2xl shadow-purple-600/40 active:scale-[0.98] transition-transform disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <span>{loading ? "Submitting..." : "Proceed to Payment"}</span>
          <ArrowRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  )
}
