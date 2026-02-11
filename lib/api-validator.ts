/**
 * API Configuration Validator
 * Validates all required environment variables and API connections
 */

import { DATABASE_CONFIG, RECAPTCHA_CONFIG, EMAIL_CONFIG, SMM_CONFIG } from "./config"

export interface ValidationResult {
  isValid: boolean
  warnings: string[]
  errors: string[]
  checklist: {
    database: boolean
    recaptcha: boolean
    email: boolean
    domain: boolean
  }
}

/**
 * Validate all API configurations
 */
export function validateApiConfiguration(): ValidationResult {
  const errors: string[] = []
  const warnings: string[] = []
  const checklist = {
    database: false,
    recaptcha: false,
    email: false,
    domain: false,
  }

  // Check Database Configuration
  if (!DATABASE_CONFIG.supabaseUrl) {
    errors.push("NEXT_PUBLIC_SUPABASE_URL is not configured")
  } else {
    checklist.database = true
  }

  if (!DATABASE_CONFIG.supabaseAnonKey) {
    errors.push("NEXT_PUBLIC_SUPABASE_ANON_KEY is not configured")
  }

  // Check reCAPTCHA Configuration
  if (!RECAPTCHA_CONFIG.siteKey) {
    warnings.push("reCAPTCHA site key not configured - form protection disabled")
  } else if (!RECAPTCHA_CONFIG.secretKey && typeof window === "undefined") {
    warnings.push("reCAPTCHA secret key not configured - server-side validation disabled")
  } else {
    checklist.recaptcha = true
  }

  // Check Email Configuration
  if (!EMAIL_CONFIG.smtpHost || !EMAIL_CONFIG.smtpUser) {
    warnings.push("Email SMTP not fully configured - email notifications disabled")
  } else {
    checklist.email = true
  }

  // Check Domain Configuration
  const domain = process.env.NEXT_PUBLIC_DOMAIN || "nextwavesmm.com"
  if (domain === "localhost" || domain === "127.0.0.1") {
    warnings.push("Running on localhost - domain-dependent features may not work")
  } else {
    checklist.domain = true
  }

  return {
    isValid: errors.length === 0,
    warnings,
    errors,
    checklist,
  }
}

/**
 * Log validation results
 */
export function logValidationResults() {
  const result = validateApiConfiguration()

  console.group("🔧 NextWave SMM - API Configuration Status")

  if (result.isValid) {
    console.log("✅ All critical configurations are set up")
  } else {
    console.error("❌ Critical configuration errors detected:")
    result.errors.forEach((err) => console.error(`   • ${err}`))
  }

  if (result.warnings.length > 0) {
    console.warn("⚠️ Configuration warnings:")
    result.warnings.forEach((warn) => console.warn(`   • ${warn}`))
  }

  console.table({
    Database: result.checklist.database ? "✅" : "❌",
    reCAPTCHA: result.checklist.recaptcha ? "✅" : "⚠️",
    Email: result.checklist.email ? "✅" : "⚠️",
    Domain: result.checklist.domain ? "✅" : "⚠️",
  })

  console.groupEnd()

  return result
}

/**
 * Test API endpoint connectivity
 */
export async function testApiConnection(endpoint: string, method: "GET" | "POST" = "GET") {
  try {
    const response = await fetch(endpoint, {
      method,
      headers: {
        "Content-Type": "application/json",
      },
    })

    return {
      success: response.ok,
      status: response.status,
      statusText: response.statusText,
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    }
  }
}

/**
 * Get API health status
 */
export async function getApiHealth() {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://nextwavesmm.com"

  try {
    const response = await fetch(`${baseUrl}/api/v1/services`, {
      method: "GET",
    })

    return {
      healthy: response.ok,
      status: response.status,
      timestamp: new Date().toISOString(),
    }
  } catch (error) {
    return {
      healthy: false,
      error: error instanceof Error ? error.message : "API unreachable",
      timestamp: new Date().toISOString(),
    }
  }
}

/**
 * Generate API configuration report
 */
export function generateConfigReport() {
  const validation = validateApiConfiguration()

  return {
    timestamp: new Date().toISOString(),
    domain: process.env.NEXT_PUBLIC_DOMAIN || "nextwavesmm.com",
    appUrl: process.env.NEXT_PUBLIC_APP_URL || "https://nextwavesmm.com",
    apiUrl: process.env.NEXT_PUBLIC_API_URL || "https://nextwavesmm.com/api",
    validation,
    environment: {
      nodeEnv: process.env.NODE_ENV,
      isDevelopment: process.env.NODE_ENV === "development",
      isProduction: process.env.NODE_ENV === "production",
    },
  }
}
