// AccountPe Configuration
export const ACCOUNTPE_API_KEY = process.env.ACCOUNTPE_API_KEY
export const ACCOUNTPE_API_URL = "https://api.accountpe.com/api/payin"
export const ACCOUNTPE_MERCHANT_ID = "nextwavedigitalsolutions1"
export const ACCOUNTPE_CREDENTIALS = process.env.ACCOUNTPE_API_KEY
export const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://nextwavesmm.vercel.app"

// Parse credentials - can be "email:password" or just password
export function parseCredentials(credentials: string | undefined) {
  if (!credentials) return null
  
  if (credentials.includes(":")) {
    const [email, password] = credentials.split(":")
    return { email, password }
  }
  
  // If no colon, treat as password for default admin email
  return { 
    email: "admin@example.com",
    password: credentials 
  }
}
