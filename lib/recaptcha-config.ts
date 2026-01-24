// reCAPTCHA Configuration
// Site Key (Public) - Used on frontend for reCAPTCHA widget
export const RECAPTCHA_SITE_KEY = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY || ""

// Secret Key (Private) - Used on backend for token verification
export const RECAPTCHA_SECRET_KEY = process.env.RECAPTCHA_SECRET_KEY || ""

// Validation function
export function isRecaptchaConfigured(): boolean {
  return !!(RECAPTCHA_SITE_KEY && RECAPTCHA_SECRET_KEY)
}

// Recaptcha minimum score for validation (0-1)
export const RECAPTCHA_MIN_SCORE = 0.5
