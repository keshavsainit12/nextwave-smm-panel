/**
 * Currency Conversion Utility
 * 
 * This module handles currency conversion throughout the application.
 * All amounts are stored in USD in the database (base currency).
 * Amounts are displayed in the selected currency using exchange rates.
 */

export interface Currency {
  code: string
  name: string
  symbol: string
  exchangeRate: number // Rate to USD (1 USD = X units of this currency)
}

// Supported currencies with their exchange rates
export const CURRENCIES: Record<string, Currency> = {
  USD: {
    code: "USD",
    name: "US Dollar",
    symbol: "$",
    exchangeRate: 1, // Base currency
  },
  XAF: {
    code: "XAF",
    name: "Central African CFA Franc",
    symbol: "FCFA",
    exchangeRate: 620, // 1 USD = 620 XAF (approximate)
  },
  EUR: {
    code: "EUR",
    name: "Euro",
    symbol: "€",
    exchangeRate: 0.92, // 1 USD = 0.92 EUR (approximate)
  },
  GBP: {
    code: "GBP",
    name: "British Pound",
    symbol: "£",
    exchangeRate: 0.79, // 1 USD = 0.79 GBP (approximate)
  },
  INR: {
    code: "INR",
    name: "Indian Rupee",
    symbol: "₹",
    exchangeRate: 83, // 1 USD = 83 INR (approximate)
  },
  NGN: {
    code: "NGN",
    name: "Nigerian Naira",
    symbol: "₦",
    exchangeRate: 1550, // 1 USD = 1550 NGN (approximate)
  },
}

/**
 * Convert an amount from USD to the target currency
 * @param amountInUsd Amount in USD (stored in database)
 * @param targetCurrency Target currency code
 * @returns Amount in target currency
 */
export function convertFromUsd(amountInUsd: number, targetCurrency: string): number {
  const currency = CURRENCIES[targetCurrency]
  if (!currency) {
    console.warn(`Currency ${targetCurrency} not found, using USD`)
    return amountInUsd
  }
  
  return amountInUsd * currency.exchangeRate
}

/**
 * Convert an amount from any currency to USD
 * @param amount Amount in source currency
 * @param sourceCurrency Source currency code
 * @returns Amount in USD
 */
export function convertToUsd(amount: number, sourceCurrency: string): number {
  const currency = CURRENCIES[sourceCurrency]
  if (!currency) {
    console.warn(`Currency ${sourceCurrency} not found, assuming USD`)
    return amount
  }
  
  return amount / currency.exchangeRate
}

/**
 * Format an amount with the currency symbol
 * Amount should already be in the display currency
 * @param amount Amount to format
 * @param currencyCode Currency code
 * @param decimals Number of decimal places (default: 2)
 * @returns Formatted string
 */
export function formatCurrency(amount: number, currencyCode: string, decimals: number = 2): string {
  const currency = CURRENCIES[currencyCode] || CURRENCIES.USD
  
  // For XAF and similar currencies with large numbers, show 0 decimals
  const decimalPlaces = currencyCode === "XAF" || currencyCode === "NGN" || currencyCode === "INR" ? 0 : decimals
  
  const formattedAmount = amount.toFixed(decimalPlaces)
  
  // Format with symbol
  if (currencyCode === "XAF") {
    return `${formattedAmount} ${currency.symbol}` // XAF style: "620 FCFA"
  } else if (currencyCode === "EUR" || currencyCode === "GBP") {
    return `${currency.symbol}${formattedAmount}` // Symbol before: "€10.00"
  } else {
    return `${currency.symbol}${formattedAmount}` // Default: "$10.00"
  }
}

/**
 * Get currency info
 * @param currencyCode Currency code
 * @returns Currency object
 */
export function getCurrency(currencyCode: string): Currency {
  return CURRENCIES[currencyCode] || CURRENCIES.USD
}

/**
 * Get list of all supported currencies
 * @returns Array of currency codes
 */
export function getSupportedCurrencies(): string[] {
  return Object.keys(CURRENCIES)
}

/**
 * Convert and format an amount from USD to display currency
 * This is the main function to use throughout the app
 * @param amountInUsd Amount in USD (from database)
 * @param displayCurrency Currency to display in
 * @param decimals Number of decimal places
 * @returns Formatted string with currency symbol
 */
export function displayAmount(
  amountInUsd: number,
  displayCurrency: string = "USD",
  decimals: number = 2
): string {
  const converted = convertFromUsd(amountInUsd, displayCurrency)
  return formatCurrency(converted, displayCurrency, decimals)
}
