import { COMPANY_NAME, COMPANY_WEBSITE, COMPANY_EMAIL } from "@/lib/constants/company"

export function getWelcomeEmailHTML(fullName: string, email: string) {
  return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #3b82f6 0%, #a855f7 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
        .header h1 { margin: 0; font-size: 28px; }
        .content { background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
        .welcome-text { font-size: 16px; margin-bottom: 20px; }
        .button { display: inline-block; background: linear-gradient(135deg, #3b82f6 0%, #a855f7 100%); color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; margin: 20px 0; font-weight: bold; }
        .features { background: white; padding: 20px; border-radius: 6px; margin: 20px 0; }
        .feature-item { padding: 10px 0; border-bottom: 1px solid #e5e7eb; }
        .feature-item:last-child { border-bottom: none; }
        .footer { text-align: center; padding: 20px; font-size: 12px; color: #666; border-top: 1px solid #e5e7eb; }
        .footer a { color: #3b82f6; text-decoration: none; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Welcome to ${COMPANY_NAME}! 🚀</h1>
        </div>
        <div class="content">
            <p class="welcome-text">Hi ${fullName},</p>
            
            <p>Thank you for joining <strong>${COMPANY_NAME}</strong>! We're excited to have you on board.</p>
            
            <p>Your account is now active and ready to use. You can access all our professional SMM services right away.</p>
            
            <div class="features">
                <h3 style="margin-top: 0; color: #3b82f6;">What You Can Do:</h3>
                <div class="feature-item">
                    ✓ <strong>Access SMM Services</strong> - Instagram, YouTube, TikTok, Facebook, Twitter and more
                </div>
                <div class="feature-item">
                    ✓ <strong>Manage Orders</strong> - Create and track your social media orders in real-time
                </div>
                <div class="feature-item">
                    ✓ <strong>Earn Referrals</strong> - Refer friends and earn commissions
                </div>
                <div class="feature-item">
                    ✓ <strong>24/7 Support</strong> - Our team is here to help anytime
                </div>
            </div>
            
            <p style="text-align: center;">
                <a href="${COMPANY_WEBSITE}/dashboard" class="button">Login to Your Dashboard</a>
            </p>
            
            <p><strong>Quick Start Tips:</strong></p>
            <ul>
                <li>Complete your profile to unlock premium features</li>
                <li>Check out our pricing to see all available services</li>
                <li>Join our community for tips and updates</li>
                <li>Use your referral code to earn extra credits</li>
            </ul>
            
            <p>If you have any questions or need assistance, feel free to reach out to our support team at <a href="mailto:${COMPANY_EMAIL}">${COMPANY_EMAIL}</a>.</p>
            
            <p>Happy growing! 📈</p>
            <p>Best regards,<br><strong>${COMPANY_NAME} Team</strong></p>
        </div>
        <div class="footer">
            <p>&copy; ${new Date().getFullYear()} ${COMPANY_NAME}. All rights reserved.</p>
            <p>
                <a href="${COMPANY_WEBSITE}">Visit Website</a> • 
                <a href="mailto:${COMPANY_EMAIL}">Contact Support</a>
            </p>
        </div>
    </div>
</body>
</html>
  `.trim()
}

export function getEmailConfirmationHTML(fullName: string, confirmUrl: string) {
  return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #3b82f6 0%, #a855f7 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
        .header h1 { margin: 0; font-size: 28px; }
        .content { background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
        .button { display: inline-block; background: linear-gradient(135deg, #3b82f6 0%, #a855f7 100%); color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; margin: 20px 0; font-weight: bold; text-align: center; }
        .footer { text-align: center; padding: 20px; font-size: 12px; color: #666; border-top: 1px solid #e5e7eb; }
        .footer a { color: #3b82f6; text-decoration: none; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Confirm Your Email 📧</h1>
        </div>
        <div class="content">
            <p class="welcome-text">Hi ${fullName},</p>
            
            <p>Thank you for signing up with <strong>${COMPANY_NAME}</strong>!</p>
            
            <p>To get started, please confirm your email address by clicking the button below:</p>
            
            <p style="text-align: center;">
                <a href="${confirmUrl}" class="button">Confirm Email</a>
            </p>
            
            <p style="color: #666; font-size: 14px;">Or copy this link: <br><code style="background: white; padding: 10px; display: block; word-break: break-all;">${confirmUrl}</code></p>
            
            <p style="color: #666; font-size: 14px; margin-top: 20px;">This confirmation link will expire in 24 hours. If you didn't sign up, you can safely ignore this email.</p>
            
            <p>Questions? Contact us at <a href="mailto:${COMPANY_EMAIL}">${COMPANY_EMAIL}</a></p>
        </div>
        <div class="footer">
            <p>&copy; ${new Date().getFullYear()} ${COMPANY_NAME}. All rights reserved.</p>
        </div>
    </div>
</body>
</html>
  `.trim()
}

export function getPasswordResetHTML(fullName: string, resetUrl: string) {
  return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #ef4444 0%, #f97316 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
        .header h1 { margin: 0; font-size: 28px; }
        .content { background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
        .button { display: inline-block; background: linear-gradient(135deg, #ef4444 0%, #f97316 100%); color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; margin: 20px 0; font-weight: bold; text-align: center; }
        .warning { background: #fef2f2; border-left: 4px solid #ef4444; padding: 15px; margin: 20px 0; }
        .footer { text-align: center; padding: 20px; font-size: 12px; color: #666; border-top: 1px solid #e5e7eb; }
        .footer a { color: #3b82f6; text-decoration: none; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Reset Your Password 🔒</h1>
        </div>
        <div class="content">
            <p class="welcome-text">Hi ${fullName},</p>
            
            <p>We received a request to reset your <strong>${COMPANY_NAME}</strong> password.</p>
            
            <p>Click the button below to reset your password:</p>
            
            <p style="text-align: center;">
                <a href="${resetUrl}" class="button">Reset Password</a>
            </p>
            
            <div class="warning">
                ⚠️ <strong>Security Notice:</strong> This link will expire in 1 hour for security reasons. If you didn't request a password reset, please ignore this email.
            </div>
            
            <p>If you need help, contact our support team at <a href="mailto:${COMPANY_EMAIL}">${COMPANY_EMAIL}</a></p>
        </div>
        <div class="footer">
            <p>&copy; ${new Date().getFullYear()} ${COMPANY_NAME}. All rights reserved.</p>
        </div>
    </div>
</body>
</html>
  `.trim()
}

export function getDepositConfirmationHTML(fullName: string, amount: number, transactionId: string) {
  return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #10b981 0%, #14b8a6 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
        .header h1 { margin: 0; font-size: 28px; }
        .content { background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
        .amount-box { background: white; border: 2px solid #10b981; border-radius: 8px; padding: 20px; text-align: center; margin: 20px 0; }
        .amount { font-size: 36px; font-weight: bold; color: #10b981; }
        .info-box { background: white; padding: 15px; border-radius: 6px; margin: 20px 0; }
        .info-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #e5e7eb; }
        .info-row:last-child { border-bottom: none; }
        .button { display: inline-block; background: linear-gradient(135deg, #10b981 0%, #14b8a6 100%); color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; margin: 20px 0; font-weight: bold; text-align: center; }
        .footer { text-align: center; padding: 20px; font-size: 12px; color: #666; border-top: 1px solid #e5e7eb; }
        .footer a { color: #3b82f6; text-decoration: none; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>✅ Deposit Successful!</h1>
        </div>
        <div class="content">
            <p class="welcome-text">Hi ${fullName},</p>
            
            <p>Great news! Your deposit has been successfully processed and credited to your account.</p>
            
            <div class="amount-box">
                <p style="margin: 0; font-size: 14px; color: #666;">Amount Credited</p>
                <p class="amount">$${amount.toFixed(2)}</p>
            </div>
            
            <div class="info-box">
                <div class="info-row">
                    <span style="color: #666;">Transaction ID:</span>
                    <span style="font-weight: bold; font-family: monospace;">${transactionId.substring(0, 12)}...</span>
                </div>
                <div class="info-row">
                    <span style="color: #666;">Status:</span>
                    <span style="font-weight: bold; color: #10b981;">Completed</span>
                </div>
                <div class="info-row">
                    <span style="color: #666;">Date & Time:</span>
                    <span style="font-weight: bold;">${new Date().toLocaleString()}</span>
                </div>
            </div>
            
            <p style="text-align: center;">
                <a href="${COMPANY_WEBSITE}/dashboard" class="button">View Dashboard</a>
            </p>
            
            <p>Your new balance is now available for placing orders. Start growing your social media presence today!</p>
            
            <p><strong>What's Next?</strong></p>
            <ul>
                <li>Browse our premium SMM services</li>
                <li>Place orders for Instagram, YouTube, TikTok, and more</li>
                <li>Track your orders in real-time</li>
                <li>Earn referral bonuses by inviting friends</li>
            </ul>
            
            <p>Need help? Our support team is available 24/7 at <a href="mailto:${COMPANY_EMAIL}">${COMPANY_EMAIL}</a></p>
            
            <p>Thank you for choosing ${COMPANY_NAME}! 🚀</p>
            <p>Best regards,<br><strong>${COMPANY_NAME} Team</strong></p>
        </div>
        <div class="footer">
            <p>&copy; ${new Date().getFullYear()} ${COMPANY_NAME}. All rights reserved.</p>
            <p>
                <a href="${COMPANY_WEBSITE}">Visit Website</a> • 
                <a href="mailto:${COMPANY_EMAIL}">Contact Support</a> • 
                <a href="${COMPANY_WEBSITE}/dashboard/transaction-history">View Transactions</a>
            </p>
        </div>
    </div>
</body>
</html>
  `.trim()
}
