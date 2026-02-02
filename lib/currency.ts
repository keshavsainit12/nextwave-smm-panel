/**
 * Currency conversion utilities
 * 
 * The platform's base currency is USD.
 * Local payment methods use XAF (Central African Franc).
 * 
 * Exchange rate: 1 USD = 600 XAF
 * 
 * This should be made configurable via admin settings in the future,
 * but for now we use a constant rate.
 */

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
 * Format amount with currency symbol
 * @param amount Numeric amount
 * @param currency Currency code (USD or XAF)
 * @returns Formatted string with currency symbol
 */
export function formatCurrency(amount: number, currency: 'USD' | 'XAF'): string {
  if (currency === 'USD') {
    return `$${amount.toFixed(2)}`
  } else {
    return `${Math.round(amount).toLocaleString()} XAF`
  }
}
