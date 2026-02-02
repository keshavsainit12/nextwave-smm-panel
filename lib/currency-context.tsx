"use client"

import { createContext, useContext, ReactNode } from "react"
import { displayAmount } from "@/lib/currency"

interface CurrencyContextType {
  currency: string
  currencySymbol: string
  displayAmount: (amountInUsd: number, decimals?: number) => string
}

const CurrencyContext = createContext<CurrencyContextType>({
  currency: "USD",
  currencySymbol: "$",
  displayAmount: (amount: number) => `$${amount.toFixed(2)}`,
})

export function CurrencyProvider({ 
  children, 
  currency = "USD", 
  currencySymbol = "$" 
}: { 
  children: ReactNode
  currency?: string
  currencySymbol?: string
}) {
  const contextValue: CurrencyContextType = {
    currency,
    currencySymbol,
    displayAmount: (amountInUsd: number, decimals?: number) => 
      displayAmount(amountInUsd, currency, decimals),
  }

  return (
    <CurrencyContext.Provider value={contextValue}>
      {children}
    </CurrencyContext.Provider>
  )
}

export function useCurrency() {
  return useContext(CurrencyContext)
}
