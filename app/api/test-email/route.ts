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
    
    // Send test deposit confirmation email
    const emailResult = await EmailService.sendDepositConfirmation({
      userEmail: testData.userEmail,
      username: testData.username,
      amount: testData.amount,
      currency: testData.currency,
      transactionId: testData.transactionId,
      timestamp: testData.timestamp
    })

    if (emailResult.success) {
      console.log('[TestEmail] ✅ Email sent successfully!')
      console.log('[TestEmail] Email ID:', emailResult.emailId)
      
      return NextResponse.json({
        success: true,
        message: 'Test email sent successfully! Check keshavsainit1@gmail.com inbox.',
        recipient: testData.userEmail,
        emailId: emailResult.emailId,
        testData: {
          amount: `${testData.currency} ${testData.amount.toLocaleString()}`,
          transactionId: testData.transactionId,
          timestamp: testData.timestamp
        }
      }, { status: 200 })
    } else {
      console.error('[TestEmail] ❌ Failed to send email')
      console.error('[TestEmail] Error:', emailResult.error)
      
      return NextResponse.json({
        success: false,
        message: 'Failed to send test email',
        error: emailResult.error
      }, { status: 500 })
    }
    
  } catch (error: any) {
    console.error('[TestEmail] ❌ Exception occurred:', error)
    console.error('[TestEmail] Stack:', error.stack)
    
    return NextResponse.json({
      success: false,
      message: 'Error sending test email',
      error: error.message || 'Unknown error',
      details: error.stack
    }, { status: 500 })
  }
}
