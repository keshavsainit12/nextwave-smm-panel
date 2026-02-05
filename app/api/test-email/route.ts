import { NextResponse } from "next/server"
import { EmailService } from "@/lib/email"

export const dynamic = 'force-dynamic'
export const revalidate = 0

/**
 * Test Email Endpoint
 * 
 * Sends a test deposit confirmation email to keshavsainit1@gmail.com
 * 
 * Usage:
 * - Visit: /api/test-email
 * - Or: curl https://yourdomain.com/api/test-email
 * 
 * This endpoint is for testing email delivery and template rendering
 */
export async function GET() {
  try {
    console.log('[TestEmail] Starting test email send...')
    
    // Check if API key is configured
    const apiKey = process.env.RESEND_API_KEY
    console.log('[TestEmail] API Key check:', apiKey ? '✅ Found' : '❌ Missing')
    
    if (!apiKey || apiKey === 're_MsciK1E1_AzghPuCc8R8tE3vznMjp2nLv') {
      console.error('[TestEmail] ❌ RESEND_API_KEY not properly configured!')
      return NextResponse.json({
        success: false,
        message: 'Email configuration missing - RESEND_API_KEY not set',
        error: {
          code: 'MISSING_API_KEY',
          message: 'RESEND_API_KEY environment variable is not configured'
        },
        solution: {
          hindi: '📧 EMAIL KAHA DALNI HAI?',
          step1: 'Vercel Dashboard खोलें → https://vercel.com',
          step2: 'अपना project select करें',
          step3: 'Settings → Environment Variables में जाएं',
          step4: 'Add New Variable:',
          key: 'RESEND_API_KEY',
          value: 're_MsciK1E1_AzghPuCc8R8tE3vznMjp2nLv',
          step5: 'Select: Production, Preview, Development (सभी)',
          step6: 'Save करें',
          step7: 'Deployment automatically restart होगी',
          step8: '2-3 minutes wait करें',
          step9: 'फिर से test करें',
          documentation: 'Full guide: देखें RESEND_EMAIL_SETUP.md file'
        }
      }, { status: 500 })
    }
    
    // Test email data
    const testData = {
      userEmail: 'keshavsainit1@gmail.com',
      username: 'Test User',
      amount: 10000.00,
      currency: 'XAF',
      transactionId: 'TEST-' + Date.now(),
      timestamp: new Date().toISOString()
    }

    console.log('[TestEmail] Sending to:', testData.userEmail)
    console.log('[TestEmail] Amount:', testData.amount, testData.currency)
    console.log('[TestEmail] Transaction ID:', testData.transactionId)
    
    // Send test deposit confirmation email with correct parameters
    const emailResult = await EmailService.sendDepositConfirmation(
      testData.userEmail,      // to
      testData.amount,          // amount
      testData.currency,        // currency
      testData.transactionId,   // transactionId
      testData.username         // userName
    )

    if (emailResult.success) {
      console.log('[TestEmail] ✅ Email sent successfully!')
      console.log('[TestEmail] Email data:', emailResult.data)
      
      return NextResponse.json({
        success: true,
        message: '✅ Test email sent successfully! Check keshavsainit1@gmail.com inbox.',
        recipient: testData.userEmail,
        emailId: emailResult.data?.id,
        testData: {
          amount: `${testData.currency} ${testData.amount.toLocaleString()}`,
          transactionId: testData.transactionId,
          timestamp: testData.timestamp
        },
        instructions: {
          hindi: 'Email inbox check करें (spam folder भी देखें)',
          waitTime: '1-2 minutes में email आ जाएगा',
          dashboard: 'Check करें: https://resend.com/emails'
        }
      }, { status: 200 })
    } else {
      console.error('[TestEmail] ❌ Failed to send email')
      console.error('[TestEmail] Error details:', JSON.stringify(emailResult.error, null, 2))
      
      return NextResponse.json({
        success: false,
        message: 'Failed to send test email',
        error: emailResult.error,
        troubleshooting: {
          hindi: 'Email भेजने में problem हुई',
          possibleCauses: [
            'API key invalid या expired',
            'Resend account में problem',
            'Daily email limit exceed हो गया (100 emails/day)',
            'Sender email verify नहीं है'
          ],
          checkList: [
            'Vercel logs check करें',
            'Resend dashboard check करें: https://resend.com/emails',
            'API key verify करें: https://resend.com/api-keys'
          ]
        }
      }, { status: 500 })
    }
    
  } catch (error: any) {
    console.error('[TestEmail] ❌ Exception occurred:', error)
    console.error('[TestEmail] Stack:', error.stack)
    
    return NextResponse.json({
      success: false,
      message: 'Error sending test email - Exception occurred',
      error: {
        message: error.message || 'Unknown error',
        name: error.name,
        code: error.code
      },
      details: error.stack?.split('\n').slice(0, 5),
      troubleshooting: {
        hindi: 'Technical error आ गई',
        action: 'Server logs check करें या developer को contact करें'
      }
    }, { status: 500 })
  }
}
