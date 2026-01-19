// Company branding constants
export const COMPANY_NAME = "NextWave SMM"
export const COMPANY_EMAIL = "nextwavesmm07@gmail.com"
export const COMPANY_WEBSITE = "https://nextwavesmm.vercel.app"
export const COMPANY_SUPPORT_EMAIL = "support@nextwavesmm.com"

// OAuth Configuration
export const OAUTH_CONFIG = {
  redirectUrl: process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL || window?.location?.origin,
  scopes: ["profile", "email"],
}

// Email Configuration
export const EMAIL_CONFIG = {
  fromName: COMPANY_NAME,
  fromEmail: COMPANY_EMAIL,
  subject: {
    confirmation: `Welcome to ${COMPANY_NAME}`,
    passwordReset: `${COMPANY_NAME} - Reset Your Password`,
    emailChange: `${COMPANY_NAME} - Confirm Your Email`,
  },
}
