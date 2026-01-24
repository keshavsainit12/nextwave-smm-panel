// AccountPe Configuration
// ACCOUNTPE_API_KEY format should be: "email:password" for JWT authentication
// Example: "admin@example.com:mypassword123"
export const ACCOUNTPE_API_KEY = process.env.ACCOUNTPE_API_KEY
export const ACCOUNTPE_API_URL = "https://api.accountpe.com/api/payin"
export const ACCOUNTPE_MERCHANT_ID = "nextwavedigitalsolutions1"
export const ACCOUNTPE_CREDENTIALS = process.env.ACCOUNTPE_API_KEY
export const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://nextwavesmm.com"

// Parse credentials - MUST be "email:password" format for AccountPe JWT auth
export function parseCredentials(credentials: string | undefined) {
  if (!credentials) {
    return null
  }
  
  // AccountPe requires email:password format for JWT authentication
  if (credentials.includes(":")) {
    const parts = credentials.split(":")
    if (parts.length >= 2) {
      const email = parts[0]
      const password = parts.slice(1).join(":") // Handle passwords with colons
      return { email, password }
    }
  }
  
  return null
}
