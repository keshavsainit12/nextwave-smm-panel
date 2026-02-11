import { NextResponse } from 'next/server'
import { checkEnvironmentVariables, validateSupabaseEnvVars } from '@/lib/env-diagnostics'

export const dynamic = 'force-dynamic'
export const revalidate = 0

/**
 * Environment Variables Check Endpoint
 * 
 * Usage: GET /api/check-env
 * 
 * This endpoint helps diagnose environment variable issues
 */
export async function GET() {
  try {
    console.log('[EnvCheck] Starting environment variables check...')
    
    const envCheck = checkEnvironmentVariables()
    const supabaseCheck = validateSupabaseEnvVars()
    
    // Log to server console for debugging
    console.log('[EnvCheck] ========================================')
    console.log('[EnvCheck] ENVIRONMENT VARIABLES STATUS')
    console.log('[EnvCheck] ========================================')
    console.log('[EnvCheck] All valid:', envCheck.allValid)
    console.log('[EnvCheck] Missing required:', envCheck.missingRequired)
    console.log('[EnvCheck] Missing optional:', envCheck.missingOptional)
    console.log('[EnvCheck] Supabase valid:', supabaseCheck.valid)
    console.log('[EnvCheck] ========================================')
    
    // Don't expose actual values in API response for security
    const safeVars = envCheck.allVars.map(v => ({
      name: v.name,
      isSet: v.isSet,
      required: v.required,
      isPublic: v.isPublic,
      description: v.description,
      // Only show preview for public vars, and only first few chars
      preview: v.isSet && v.isPublic && v.value 
        ? v.value.substring(0, 30) + '...' 
        : v.isSet ? '✓ Set (hidden for security)' : '✗ Not set'
    }))
    
    const response = {
      success: envCheck.allValid && supabaseCheck.valid,
      timestamp: new Date().toISOString(),
      
      summary: {
        allRequiredSet: envCheck.allValid,
        supabaseConfigured: supabaseCheck.valid,
        totalVars: envCheck.allVars.length,
        setVars: envCheck.allVars.filter(v => v.isSet).length,
        missingRequired: envCheck.missingRequired.length,
        missingOptional: envCheck.missingOptional.length
      },
      
      supabase: {
        valid: supabaseCheck.valid,
        message: supabaseCheck.message,
        missing: supabaseCheck.missing
      },
      
      variables: safeVars,
      
      missingRequired: envCheck.missingRequired,
      missingOptional: envCheck.missingOptional,
      
      instructions: {
        hindi: '🔧 Environment Variables Kaise Add Karein',
        steps: [
          '1. Vercel Dashboard खोलें: https://vercel.com/dashboard',
          '2. अपना project select करें',
          '3. Settings → Environment Variables में जाएं',
          '4. नीचे दिए गए missing variables add करें',
          '5. Apply to: Production, Preview, Development (सभी select करें)',
          '6. Save करें',
          '7. Redeploy करें या 2-3 minutes wait करें',
          '8. फिर से इस endpoint को check करें'
        ],
        english: 'How to Add Environment Variables',
        englishSteps: [
          '1. Open Vercel Dashboard: https://vercel.com/dashboard',
          '2. Select your project',
          '3. Go to Settings → Environment Variables',
          '4. Add the missing variables listed below',
          '5. Apply to: Production, Preview, Development (select all)',
          '6. Save',
          '7. Redeploy or wait 2-3 minutes',
          '8. Check this endpoint again'
        ]
      }
    }
    
    // Return appropriate status code
    const statusCode = envCheck.allValid ? 200 : 500
    
    if (!envCheck.allValid) {
      console.error('[EnvCheck] ❌ CONFIGURATION ERROR!')
      console.error('[EnvCheck] Missing required variables:', envCheck.missingRequired)
      console.error('[EnvCheck] ⚠️ YE VARIABLES ADD KARNE HAIN:')
      envCheck.missingRequired.forEach(name => {
        console.error(`[EnvCheck]    ❌ ${name}`)
      })
    } else {
      console.log('[EnvCheck] ✅ All required environment variables are set!')
    }
    
    return NextResponse.json(response, { status: statusCode })
    
  } catch (error: any) {
    console.error('[EnvCheck] ❌ Error checking environment variables:', error)
    
    return NextResponse.json({
      success: false,
      message: 'Error checking environment variables',
      error: {
        message: error.message || 'Unknown error',
        name: error.name
      },
      instructions: {
        hindi: '⚠️ Environment variables check करने में error आया',
        action: 'Server logs check करें या Vercel dashboard में manually verify करें'
      }
    }, { status: 500 })
  }
}
