"use client"

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { 
  convertFromUSD, 
  formatCurrency as formatCurrencyUtil,
  getCurrencyIcon,
  CURRENCY_SYMBOLS,
  DEFAULT_EXCHANGE_RATES 
} from '@/lib/currency'

interface CurrencySettings {
  currency: string
  symbol: string
  rate: number
}

interface CurrencyContextType {
  currency: string
  symbol: string
  rate: number
  convert: (usdAmount: number) => number
  format: (usdAmount: number) => string
  icon: string
  loading: boolean
  refresh: () => Promise<void>
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined)

export function CurrencyProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<CurrencySettings>({
    currency: 'USD',
    symbol: '$',
    rate: 1,
  })
  const [loading, setLoading] = useState(true)

  const fetchCurrencySettings = async () => {
    try {
      // Fetch currency settings from system_settings
      const response = await fetch('/api/currency-settings')
      if (response.ok) {
        const data = await response.json()
        
        // Get currency code (default to USD)
        const currency = data.currency || 'USD'
        
        // Get exchange rate (from settings or default)
        const rate = data.exchange_rate 
          ? parseFloat(data.exchange_rate) 
          : DEFAULT_EXCHANGE_RATES[currency] || 1
        
        // Get symbol (from settings or default)
        const symbol = data.currency_symbol || CURRENCY_SYMBOLS[currency] || '$'
        
        setSettings({ currency, symbol, rate })
      } else {
        // Fallback to defaults
        console.log('[Currency] Using default USD settings')
        setSettings({
          currency: 'USD',
          symbol: '$',
          rate: 1,
        })
      }
    } catch (error) {
      console.error('[Currency] Error fetching settings:', error)
      // Fallback to defaults
      setSettings({
        currency: 'USD',
        symbol: '$',
        rate: 1,
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCurrencySettings()
    
    // Refresh settings every 60 seconds (in case admin changes it)
    const interval = setInterval(fetchCurrencySettings, 60000)
    
    return () => clearInterval(interval)
  }, [])

  const convert = (usdAmount: number): number => {
    return convertFromUSD(usdAmount, settings.currency, settings.rate)
  }

  const format = (usdAmount: number): string => {
    const converted = convert(usdAmount)
    return formatCurrencyUtil(converted, settings.currency, settings.symbol)
  }

  const icon = getCurrencyIcon(settings.currency)

  const value: CurrencyContextType = {
    currency: settings.currency,
    symbol: settings.symbol,
    rate: settings.rate,
    convert,
    format,
    icon,
    loading,
    refresh: fetchCurrencySettings,
  }

  return (
    <CurrencyContext.Provider value={value}>
      {children}
    </CurrencyContext.Provider>
  )
}

export function useCurrency() {
  const context = useContext(CurrencyContext)
  if (context === undefined) {
    throw new Error('useCurrency must be used within a CurrencyProvider')
  }
  return context
}
