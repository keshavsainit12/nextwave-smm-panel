/**
 * Environment Variables Diagnostic Utility
 * 
 * This file helps diagnose and validate all required environment variables
 */

export interface EnvVarStatus {
  name: string
  value: string | undefined
  isSet: boolean
  isPublic: boolean
  required: boolean
  description: string
}

export interface EnvDiagnosticResult {
  allValid: boolean
  missingRequired: string[]
  missingOptional: string[]
  allVars: EnvVarStatus[]
}

/**
 * Check all environment variables and return diagnostic information
 */
export function checkEnvironmentVariables(): EnvDiagnosticResult {
  const envVars: EnvVarStatus[] = [
    // Supabase (Required)
    {
      name: 'NEXT_PUBLIC_SUPABASE_URL',
      value: process.env.NEXT_PUBLIC_SUPABASE_URL,
      isSet: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      isPublic: true,
      required: true,
      description: 'Supabase project URL (public, safe to expose)'
    },
    {
      name: 'NEXT_PUBLIC_SUPABASE_ANON_KEY',
      value: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      isSet: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      isPublic: true,
      required: true,
      description: 'Supabase anonymous key (public, safe to expose)'
    },
    {
      name: 'SUPABASE_SERVICE_ROLE_KEY',
      value: process.env.SUPABASE_SERVICE_ROLE_KEY,
      isSet: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
      isPublic: false,
      required: true,
      description: 'Supabase service role key (private, NEVER expose to client)'
    },
    
    // Email (Optional)
    {
      name: 'RESEND_API_KEY',
      value: process.env.RESEND_API_KEY,
      isSet: !!process.env.RESEND_API_KEY,
      isPublic: false,
      required: false,
      description: 'Resend API key for sending emails (optional)'
    },
    {
      name: 'RESEND_FROM_EMAIL',
      value: process.env.RESEND_FROM_EMAIL,
      isSet: !!process.env.RESEND_FROM_EMAIL,
      isPublic: false,
      required: false,
      description: 'From email address for Resend (optional, has default)'
    },
    
    // reCAPTCHA (Optional)
    {
      name: 'NEXT_PUBLIC_RECAPTCHA_SITE_KEY',
      value: process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY,
      isSet: !!process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY,
      isPublic: true,
      required: false,
      description: 'Google reCAPTCHA site key (optional, for bot protection)'
    },
    {
      name: 'RECAPTCHA_SECRET_KEY',
      value: process.env.RECAPTCHA_SECRET_KEY,
      isSet: !!process.env.RECAPTCHA_SECRET_KEY,
      isPublic: false,
      required: false,
      description: 'Google reCAPTCHA secret key (optional, for bot protection)'
    },
    
    // Site (Required)
    {
      name: 'NEXT_PUBLIC_SITE_URL',
      value: process.env.NEXT_PUBLIC_SITE_URL,
      isSet: !!process.env.NEXT_PUBLIC_SITE_URL,
      isPublic: true,
      required: true,
      description: 'Site URL (e.g., https://www.nextwavesmm.com)'
    },
  ]

  const missingRequired = envVars
    .filter(v => v.required && !v.isSet)
    .map(v => v.name)

  const missingOptional = envVars
    .filter(v => !v.required && !v.isSet)
    .map(v => v.name)

  return {
    allValid: missingRequired.length === 0,
    missingRequired,
    missingOptional,
    allVars: envVars
  }
}

/**
 * Print diagnostic report to console
 */
export function printEnvironmentDiagnostics(): void {
  const result = checkEnvironmentVariables()
  
  console.log('\n========================================')
  console.log('🔍 ENVIRONMENT VARIABLES DIAGNOSTIC')
  console.log('========================================\n')
  
  // Print all variables
  console.log('📋 All Environment Variables:\n')
  result.allVars.forEach(v => {
    const status = v.isSet ? '✅' : '❌'
    const reqLabel = v.required ? '⚠️ REQUIRED' : '✓ Optional'
    const visLabel = v.isPublic ? '🌐 Public' : '🔒 Private'
    
    console.log(`${status} ${v.name}`)
    console.log(`   ${reqLabel} | ${visLabel}`)
    console.log(`   ${v.description}`)
    if (v.isSet && v.value) {
      const preview = v.isPublic 
        ? v.value.substring(0, 40) + (v.value.length > 40 ? '...' : '')
        : v.value.substring(0, 20) + '...'
      console.log(`   Value: ${preview}`)
    }
    console.log('')
  })
  
  // Print summary
  console.log('========================================')
  console.log('📊 SUMMARY')
  console.log('========================================\n')
  
  if (result.allValid) {
    console.log('✅ All required environment variables are set!')
  } else {
    console.log('❌ Missing required environment variables!')
    console.log('\n⚠️ REQUIRED but MISSING:')
    result.missingRequired.forEach(name => {
      console.log(`   ❌ ${name}`)
    })
  }
  
  if (result.missingOptional.length > 0) {
    console.log('\n✓ Optional but not set (features will be disabled):')
    result.missingOptional.forEach(name => {
      console.log(`   ⚪ ${name}`)
    })
  }
  
  console.log('\n========================================')
  console.log('🔧 HOW TO FIX (Hindi)')
  console.log('========================================\n')
  
  if (!result.allValid) {
    console.log('Vercel में environment variables add karne ke liye:\n')
    console.log('1. Visit: https://vercel.com/dashboard')
    console.log('2. अपना project select करें')
    console.log('3. Settings → Environment Variables')
    console.log('4. नीचे दिए गए variables add करें:\n')
    
    result.missingRequired.forEach(name => {
      const varInfo = result.allVars.find(v => v.name === name)
      console.log(`   ❌ ${name}`)
      if (varInfo) {
        console.log(`      ${varInfo.description}`)
      }
      console.log('')
    })
    
    console.log('5. Apply to: Production, Preview, Development (सभी)')
    console.log('6. Save और Redeploy करें\n')
  }
  
  console.log('========================================\n')
}

/**
 * Get a summary message for API responses
 */
export function getEnvVarSummary(): string {
  const result = checkEnvironmentVariables()
  
  if (result.allValid) {
    return '✅ All required environment variables are configured'
  }
  
  return `❌ Missing required environment variables: ${result.missingRequired.join(', ')}`
}

/**
 * Validate that required Supabase variables are set
 */
export function validateSupabaseEnvVars(): { valid: boolean; missing: string[]; message: string } {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  
  const missing: string[] = []
  if (!supabaseUrl) missing.push('NEXT_PUBLIC_SUPABASE_URL')
  if (!supabaseAnonKey) missing.push('NEXT_PUBLIC_SUPABASE_ANON_KEY')
  if (!supabaseServiceKey) missing.push('SUPABASE_SERVICE_ROLE_KEY')
  
  if (missing.length === 0) {
    return {
      valid: true,
      missing: [],
      message: '✅ Supabase environment variables are properly configured'
    }
  }
  
  return {
    valid: false,
    missing,
    message: `❌ Missing Supabase environment variables: ${missing.join(', ')}. ` +
             'Please add these in Vercel dashboard → Settings → Environment Variables'
  }
}
