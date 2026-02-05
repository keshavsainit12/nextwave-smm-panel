import { Resend } from 'resend'
import { getDepositConfirmationHTML } from './email-templates'

// Lazy initialization - only create Resend instance when needed
function getResendClient() {
  if (!process.env.RESEND_API_KEY) {
    return null
  }
  return new Resend(process.env.RESEND_API_KEY)
}

export async function sendDepositConfirmation(
  userEmail: string,
  userName: string,
  amount: number,
  transactionId: string
) {
  try {
    const resend = getResendClient()
    
    if (!resend) {
      console.warn('[Email] RESEND_API_KEY not configured - skipping email')
      return { success: false, error: 'API key not configured' }
    }

    await resend.emails.send({
      from: 'NextWave SMM <noreply@nextwavesmm.com>',
      to: userEmail,
      subject: '✅ Deposit Confirmed - Balance Credited',
      html: getDepositConfirmationHTML(userName, amount, transactionId)
    })

    console.log('[Email] Deposit confirmation sent to:', userEmail)
    return { success: true }
  } catch (error) {
    console.error('[Email] Failed to send:', error)
    return { success: false, error }
  }
}
