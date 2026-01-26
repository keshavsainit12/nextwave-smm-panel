// ============================================
// APPLICATION CONFIGURATION
// ============================================

// Domain Configuration
export const DOMAIN = "nextwavesmm.com"
export const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://nextwavesmm.com"
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "https://nextwavesmm.com/api"

// ============================================
// PAYMENT GATEWAY CONFIGURATION
// ============================================

// AccountPe Configuration
// ACCOUNTPE_API_KEY format should be: "email:password" for JWT authentication
// Example: "admin@example.com:mypassword123"
export const ACCOUNTPE_API_KEY = process.env.ACCOUNTPE_API_KEY
export const ACCOUNTPE_API_URL = "https://api.accountpe.com/api/payin"
export const ACCOUNTPE_MERCHANT_ID = process.env.ACCOUNTPE_MERCHANT_ID || "nextwavedigitalsolutions1"
export const ACCOUNTPE_CREDENTIALS = process.env.ACCOUNTPE_API_KEY
export const ACCOUNTPE_WEBHOOK_URL = process.env.ACCOUNTPE_WEBHOOK_URL || `${APP_URL}/api/webhooks/instant-payment`

// ============================================
// SMM API PROVIDERS CONFIGURATION
// ============================================

// Default Provider Configuration
export const DEFAULT_PROVIDER = {
  api_url: process.env.DEFAULT_SMM_API_URL || "",
  api_key: process.env.DEFAULT_SMM_API_KEY || "",
}

// SMM Panel Service Configuration
export const SMM_CONFIG = {
  maxOrderQuantity: 1000000,
  minOrderQuantity: 1,
  defaultRefund: true,
  supportCategories: [
    "Instagram",
    "TikTok",
    "YouTube",
    "Twitter",
    "Facebook",
    "Snapchat",
    "LinkedIn",
    "Pinterest",
    "Telegram",
    "Discord",
  ],
}

// ============================================
// CRYPTO CONFIGURATION
// ============================================

export const CRYPTO_CONFIG = {
  enabled: process.env.CRYPTO_ENABLED === "true",
  supportedCoins: ["BTC", "ETH", "USDT", "USDC", "XRP", "BUSD"],
}

// ============================================
// EMAIL CONFIGURATION
// ============================================

export const EMAIL_CONFIG = {
  smtpHost: process.env.SMTP_HOST || "smtp.gmail.com",
  smtpPort: parseInt(process.env.SMTP_PORT || "587"),
  smtpUser: process.env.SMTP_USER || "",
  smtpPassword: process.env.SMTP_PASSWORD || "",
  fromEmail: process.env.FROM_EMAIL || "no-reply@nextwavesmm.com",
  fromName: "NextWave SMM",
}

// ============================================
// RECAPTCHA CONFIGURATION
// ============================================

export const RECAPTCHA_CONFIG = {
  siteKey: process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY || "",
  secretKey: process.env.RECAPTCHA_SECRET_KEY || "",
  enabled: process.env.RECAPTCHA_ENABLED === "true",
}

// ============================================
// DATABASE CONFIGURATION
// ============================================

export const DATABASE_CONFIG = {
  supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL || "",
  supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "",
  supabaseServiceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY || "",
}

// ============================================
// UTILITY FUNCTIONS
// ============================================

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

// Validate API Configuration
export function validateApiConfig() {
  const errors: string[] = []

  if (!DATABASE_CONFIG.supabaseUrl) errors.push("NEXT_PUBLIC_SUPABASE_URL is not set")
  if (!DATABASE_CONFIG.supabaseAnonKey) errors.push("NEXT_PUBLIC_SUPABASE_ANON_KEY is not set")

  if (errors.length > 0) {
    console.warn("API Configuration warnings:", errors)
    return false
  }

  return true
}

// Get API Endpoint
export function getApiEndpoint(path: string) {
  return `${API_BASE_URL}${path}`
}
