/**
 * Currency conversion utilities
 * 
 * The platform's base currency is USD (stored in database).
 * Display currency can be configured by admin in system settings.
 * 
 * Supported currencies:
 * - USD: United States Dollar
 * - XAF: Central African Franc
 * - EUR: Euro
 * - GBP: British Pound
 * - NGN: Nigerian Naira
 * - GHS: Ghanaian Cedi
 * - KES: Kenyan Shilling
 * 
 * All amounts are stored in USD and converted for display based on admin settings.
 */

// Default exchange rates (1 USD = X units of currency)
export const DEFAULT_EXCHANGE_RATES: Record<string, number> = {
  USD: 1,
  XAF: 600,
  EUR: 0.92,
  GBP: 0.79,
  NGN: 770,
  GHS: 12,
  KES: 129,
}

// Currency symbols and formatting
export const CURRENCY_SYMBOLS: Record<string, string> = {
  USD: '$',
  XAF: 'FCFA',
  EUR: '€',
  GBP: '£',
  NGN: '₦',
  GHS: 'GH₵',
  KES: 'KSh',
}

// Currency decimal places (0 for whole number currencies)
export const CURRENCY_DECIMALS: Record<string, number> = {
  USD: 2,
  XAF: 0,
  EUR: 2,
  GBP: 2,
  NGN: 0,
  GHS: 2,
  KES: 0,
}

// Legacy constants for backward compatibility
export const XAF_TO_USD_RATE = 600

/**
 * Convert XAF (Central African Franc) to USD
 * @param xafAmount Amount in XAF
 * @returns Amount in USD (rounded to 4 decimal places for precision)
 */
export function convertXAFtoUSD(xafAmount: number): number {
  if (!xafAmount || xafAmount <= 0) {
    return 0
  }
  
  // Convert and round to 4 decimal places to maintain precision
  return Number((xafAmount / XAF_TO_USD_RATE).toFixed(4))
}

/**
 * Convert USD to XAF (Central African Franc)
 * @param usdAmount Amount in USD
 * @returns Amount in XAF (rounded to nearest whole number)
 */
export function convertUSDtoXAF(usdAmount: number): number {
  if (!usdAmount || usdAmount <= 0) {
    return 0
  }
  
  // Convert and round to nearest whole XAF
  return Math.round(usdAmount * XAF_TO_USD_RATE)
}

/**
 * Convert from USD to any supported currency
 * @param usdAmount Amount in USD (base currency)
 * @param targetCurrency Target currency code
 * @param exchangeRate Optional custom exchange rate (defaults to predefined rates)
 * @returns Converted amount in target currency
 */
export function convertFromUSD(
  usdAmount: number,
  targetCurrency: string,
  exchangeRate?: number
): number {
  if (!usdAmount || isNaN(usdAmount)) {
    return 0
  }
  
  // Use provided rate or default rate
  const rate = exchangeRate || DEFAULT_EXCHANGE_RATES[targetCurrency] || 1
  
  // Convert amount
  const converted = usdAmount * rate
  
  // Round based on currency decimals
  const decimals = CURRENCY_DECIMALS[targetCurrency] || 2
  if (decimals === 0) {
    return Math.round(converted)
  }
  
  return Number(converted.toFixed(decimals))
}

/**
 * Convert from any currency to USD
 * @param amount Amount in source currency
 * @param sourceCurrency Source currency code
 * @param exchangeRate Optional custom exchange rate (defaults to predefined rates)
 * @returns Amount in USD
 */
export function convertToUSD(
  amount: number,
  sourceCurrency: string,
  exchangeRate?: number
): number {
  if (!amount || isNaN(amount)) {
    return 0
  }
  
  if (sourceCurrency === 'USD') {
    return amount
  }
  
  // Use provided rate or default rate
  const rate = exchangeRate || DEFAULT_EXCHANGE_RATES[sourceCurrency] || 1
  
  // Convert to USD and round to 4 decimals for precision
  return Number((amount / rate).toFixed(4))
}

/**
 * Format amount with currency symbol
 * @param amount Numeric amount
 * @param currency Currency code
 * @param symbol Optional custom symbol (defaults to predefined symbols)
 * @returns Formatted string with currency symbol
 */
export function formatCurrency(
  amount: number,
  currency: string = 'USD',
  symbol?: string
): string {
  if (isNaN(amount)) {
    amount = 0
  }
  
  const currencySymbol = symbol || CURRENCY_SYMBOLS[currency] || '$'
  const decimals = CURRENCY_DECIMALS[currency] || 2
  
  // Format number with appropriate decimals
  const formattedAmount = decimals === 0 
    ? Math.round(amount).toLocaleString()
    : amount.toFixed(decimals)
  
  // Special formatting for some currencies
  if (currency === 'XAF') {
    return `${Math.round(amount).toLocaleString()} ${currencySymbol}`
  }
  
  // Default: symbol before amount
  return `${currencySymbol}${formattedAmount}`
}

/**
 * Get currency icon URL or emoji
 * @param currency Currency code
 * @returns Icon representation (emoji or symbol)
 */
export function getCurrencyIcon(currency: string): string {
  const icons: Record<string, string> = {
    USD: '💵',
    XAF: '💰',
    EUR: '💶',
    GBP: '💷',
    NGN: '₦',
    GHS: 'GH₵',
    KES: 'KSh',
  }
  
  return icons[currency] || '💰'
}

/**
 * Get list of supported currencies for dropdown
 * @returns Array of currency objects with code and name
 */
export function getSupportedCurrencies() {
  return [
    { code: 'USD', name: 'US Dollar ($)', symbol: '$' },
    { code: 'XAF', name: 'Central African Franc (FCFA)', symbol: 'FCFA' },
    { code: 'EUR', name: 'Euro (€)', symbol: '€' },
    { code: 'GBP', name: 'British Pound (£)', symbol: '£' },
    { code: 'NGN', name: 'Nigerian Naira (₦)', symbol: '₦' },
    { code: 'GHS', name: 'Ghanaian Cedi (GH₵)', symbol: 'GH₵' },
    { code: 'KES', name: 'Kenyan Shilling (KSh)', symbol: 'KSh' },
  ]
}
