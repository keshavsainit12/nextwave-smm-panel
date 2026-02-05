import { Resend } from 'resend';

// Initialize Resend with API key from environment
// Will throw error if API key is missing when trying to send emails
const resendApiKey = process.env.RESEND_API_KEY;

if (!resendApiKey) {
  console.warn('[EmailService] WARNING: RESEND_API_KEY not configured. Email sending will not work.');
}

const resend = new Resend(resendApiKey);

// Email service class
export class EmailService {
  // Use environment variable for from email, fallback to a placeholder
  private static fromEmail = process.env.RESEND_FROM_EMAIL || 'NextWave SMM Panel <onboarding@resend.dev>';

  /**
   * Send deposit confirmation email
   */
  static async sendDepositConfirmation(
    to: string,
    amount: number,
    currency: string,
    transactionId: string,
    userName: string
  ) {
    try {
      if (!resendApiKey) {
        console.error('[EmailService] Cannot send email: RESEND_API_KEY not configured');
        return { success: false, error: { message: 'Email service not configured' } };
      }

      const { data, error } = await resend.emails.send({
        from: this.fromEmail,
        to: to,
        subject: `Deposit Confirmed - ${currency} ${amount.toFixed(2)}`,
        html: this.getDepositEmailTemplate(userName, amount, currency, transactionId),
      });

      if (error) {
        console.error('[EmailService] Deposit email error:', error);
        return { success: false, error };
      }

      console.log('[EmailService] Deposit email sent:', data);
      return { success: true, data };
    } catch (error) {
      console.error('[EmailService] Deposit email exception:', error);
      return { success: false, error };
    }
  }

  /**
   * Send order confirmation email
   */
  static async sendOrderConfirmation(
    to: string,
    orderId: string,
    serviceName: string,
    quantity: number,
    amount: number,
    currency: string,
    userName: string
  ) {
    try {
      if (!resendApiKey) {
        console.error('[EmailService] Cannot send email: RESEND_API_KEY not configured');
        return { success: false, error: { message: 'Email service not configured' } };
      }

      const { data, error } = await resend.emails.send({
        from: this.fromEmail,
        to: to,
        subject: `Order Confirmed - #${orderId}`,
        html: this.getOrderEmailTemplate(userName, orderId, serviceName, quantity, amount, currency),
      });

      if (error) {
        console.error('[EmailService] Order email error:', error);
        return { success: false, error };
      }

      console.log('[EmailService] Order email sent:', data);
      return { success: true, data };
    } catch (error) {
      console.error('[EmailService] Order email exception:', error);
      return { success: false, error };
    }
  }

  /**
   * Send order status update email
   */
  static async sendOrderStatusUpdate(
    to: string,
    orderId: string,
    serviceName: string,
    oldStatus: string,
    newStatus: string,
    userName: string
  ) {
    try {
      if (!resendApiKey) {
        console.error('[EmailService] Cannot send email: RESEND_API_KEY not configured');
        return { success: false, error: { message: 'Email service not configured' } };
      }

      const { data, error } = await resend.emails.send({
        from: this.fromEmail,
        to: to,
        subject: `Order Status Update - #${orderId}`,
        html: this.getOrderStatusEmailTemplate(userName, orderId, serviceName, oldStatus, newStatus),
      });

      if (error) {
        console.error('[EmailService] Order status email error:', error);
        return { success: false, error };
      }

      console.log('[EmailService] Order status email sent:', data);
      return { success: true, data };
    } catch (error) {
      console.error('[EmailService] Order status email exception:', error);
      return { success: false, error };
    }
  }

  /**
   * Send ticket reply notification
   */
  static async sendTicketReply(
    to: string,
    ticketId: string,
    ticketSubject: string,
    replyMessage: string,
    userName: string
  ) {
    try {
      if (!resendApiKey) {
        console.error('[EmailService] Cannot send email: RESEND_API_KEY not configured');
        return { success: false, error: { message: 'Email service not configured' } };
      }

      const { data, error } = await resend.emails.send({
        from: this.fromEmail,
        to: to,
        subject: `New Reply on Ticket #${ticketId}`,
        html: this.getTicketReplyEmailTemplate(userName, ticketId, ticketSubject, replyMessage),
      });

      if (error) {
        console.error('[EmailService] Ticket reply email error:', error);
        return { success: false, error };
      }

      console.log('[EmailService] Ticket reply email sent:', data);
      return { success: true, data };
    } catch (error) {
      console.error('[EmailService] Ticket reply email exception:', error);
      return { success: false, error };
    }
  }

  /**
   * Deposit email template
   */
  private static getDepositEmailTemplate(
    userName: string,
    amount: number,
    currency: string,
    transactionId: string
  ): string {
    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Deposit Confirmed</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
    <h1 style="color: white; margin: 0; font-size: 28px;">Deposit Confirmed! 💰</h1>
  </div>
  
  <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
    <p style="font-size: 16px; margin-bottom: 20px;">Hi <strong>${userName}</strong>,</p>
    
    <p style="font-size: 16px; margin-bottom: 20px;">Great news! Your deposit has been successfully processed and added to your account.</p>
    
    <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #667eea;">
      <h2 style="color: #667eea; margin-top: 0; font-size: 20px;">Deposit Details</h2>
      <table style="width: 100%; border-collapse: collapse;">
        <tr>
          <td style="padding: 8px 0; font-weight: bold;">Amount:</td>
          <td style="padding: 8px 0; text-align: right; color: #28a745; font-size: 24px; font-weight: bold;">
            ${currency} ${amount.toFixed(2)}
          </td>
        </tr>
        <tr>
          <td style="padding: 8px 0; font-weight: bold;">Transaction ID:</td>
          <td style="padding: 8px 0; text-align: right; color: #666; font-family: monospace;">
            ${transactionId}
          </td>
        </tr>
        <tr>
          <td style="padding: 8px 0; font-weight: bold;">Status:</td>
          <td style="padding: 8px 0; text-align: right;">
            <span style="background: #28a745; color: white; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: bold;">
              COMPLETED
            </span>
          </td>
        </tr>
      </table>
    </div>
    
    <p style="font-size: 16px; margin: 20px 0;">You can now use this balance to place orders on our platform.</p>
    
    <div style="text-align: center; margin: 30px 0;">
      <a href="${process.env.NEXT_PUBLIC_SITE_URL || 'https://yourdomain.com'}/dashboard" 
         style="background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">
        Go to Dashboard
      </a>
    </div>
    
    <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">
    
    <p style="font-size: 14px; color: #666; margin-bottom: 10px;">
      If you have any questions, please contact our support team.
    </p>
    
    <p style="font-size: 14px; color: #666;">
      Best regards,<br>
      <strong>NextWave SMM Panel Team</strong>
    </p>
  </div>
  
  <div style="text-align: center; padding: 20px; font-size: 12px; color: #999;">
    <p>© ${new Date().getFullYear()} NextWave SMM Panel. All rights reserved.</p>
  </div>
</body>
</html>
    `;
  }

  /**
   * Order confirmation email template
   */
  private static getOrderEmailTemplate(
    userName: string,
    orderId: string,
    serviceName: string,
    quantity: number,
    amount: number,
    currency: string
  ): string {
    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Order Confirmed</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
    <h1 style="color: white; margin: 0; font-size: 28px;">Order Confirmed! 🎉</h1>
  </div>
  
  <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
    <p style="font-size: 16px; margin-bottom: 20px;">Hi <strong>${userName}</strong>,</p>
    
    <p style="font-size: 16px; margin-bottom: 20px;">Your order has been received and is being processed.</p>
    
    <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #667eea;">
      <h2 style="color: #667eea; margin-top: 0; font-size: 20px;">Order Details</h2>
      <table style="width: 100%; border-collapse: collapse;">
        <tr>
          <td style="padding: 8px 0; font-weight: bold;">Order ID:</td>
          <td style="padding: 8px 0; text-align: right; color: #666; font-family: monospace;">
            #${orderId}
          </td>
        </tr>
        <tr>
          <td style="padding: 8px 0; font-weight: bold;">Service:</td>
          <td style="padding: 8px 0; text-align: right;">
            ${serviceName}
          </td>
        </tr>
        <tr>
          <td style="padding: 8px 0; font-weight: bold;">Quantity:</td>
          <td style="padding: 8px 0; text-align: right; font-weight: bold;">
            ${quantity.toLocaleString()}
          </td>
        </tr>
        <tr>
          <td style="padding: 8px 0; font-weight: bold;">Amount:</td>
          <td style="padding: 8px 0; text-align: right; color: #667eea; font-size: 20px; font-weight: bold;">
            ${currency} ${amount.toFixed(2)}
          </td>
        </tr>
        <tr>
          <td style="padding: 8px 0; font-weight: bold;">Status:</td>
          <td style="padding: 8px 0; text-align: right;">
            <span style="background: #ffc107; color: #333; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: bold;">
              PENDING
            </span>
          </td>
        </tr>
      </table>
    </div>
    
    <p style="font-size: 16px; margin: 20px 0;">We'll notify you once your order is in progress and completed.</p>
    
    <div style="text-align: center; margin: 30px 0;">
      <a href="${process.env.NEXT_PUBLIC_SITE_URL || 'https://yourdomain.com'}/dashboard/orders" 
         style="background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">
        Track Order
      </a>
    </div>
    
    <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">
    
    <p style="font-size: 14px; color: #666; margin-bottom: 10px;">
      If you have any questions about your order, please contact our support team.
    </p>
    
    <p style="font-size: 14px; color: #666;">
      Best regards,<br>
      <strong>NextWave SMM Panel Team</strong>
    </p>
  </div>
  
  <div style="text-align: center; padding: 20px; font-size: 12px; color: #999;">
    <p>© ${new Date().getFullYear()} NextWave SMM Panel. All rights reserved.</p>
  </div>
</body>
</html>
    `;
  }

  /**
   * Order status update email template
   */
  private static getOrderStatusEmailTemplate(
    userName: string,
    orderId: string,
    serviceName: string,
    oldStatus: string,
    newStatus: string
  ): string {
    const statusColors: Record<string, string> = {
      pending: '#ffc107',
      processing: '#17a2b8',
      in_progress: '#17a2b8',
      completed: '#28a745',
      partial: '#fd7e14',
      cancelled: '#dc3545',
      refunded: '#6c757d',
    };

    const statusColor = statusColors[newStatus.toLowerCase()] || '#667eea';

    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Order Status Update</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
    <h1 style="color: white; margin: 0; font-size: 28px;">Order Status Updated 📦</h1>
  </div>
  
  <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
    <p style="font-size: 16px; margin-bottom: 20px;">Hi <strong>${userName}</strong>,</p>
    
    <p style="font-size: 16px; margin-bottom: 20px;">Your order status has been updated.</p>
    
    <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #667eea;">
      <h2 style="color: #667eea; margin-top: 0; font-size: 20px;">Order Information</h2>
      <table style="width: 100%; border-collapse: collapse;">
        <tr>
          <td style="padding: 8px 0; font-weight: bold;">Order ID:</td>
          <td style="padding: 8px 0; text-align: right; color: #666; font-family: monospace;">
            #${orderId}
          </td>
        </tr>
        <tr>
          <td style="padding: 8px 0; font-weight: bold;">Service:</td>
          <td style="padding: 8px 0; text-align: right;">
            ${serviceName}
          </td>
        </tr>
        <tr>
          <td style="padding: 8px 0; font-weight: bold;">Status:</td>
          <td style="padding: 8px 0; text-align: right;">
            <span style="background: ${statusColor}; color: white; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: bold;">
              ${newStatus.toUpperCase()}
            </span>
          </td>
        </tr>
      </table>
    </div>
    
    ${newStatus.toLowerCase() === 'completed' ? `
    <div style="background: #d4edda; border: 1px solid #c3e6cb; padding: 15px; border-radius: 5px; margin: 20px 0;">
      <p style="margin: 0; color: #155724; font-weight: bold;">✓ Your order has been completed successfully!</p>
    </div>
    ` : ''}
    
    <div style="text-align: center; margin: 30px 0;">
      <a href="${process.env.NEXT_PUBLIC_SITE_URL || 'https://yourdomain.com'}/dashboard/orders" 
         style="background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">
        View Order Details
      </a>
    </div>
    
    <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">
    
    <p style="font-size: 14px; color: #666; margin-bottom: 10px;">
      If you have any questions, please contact our support team.
    </p>
    
    <p style="font-size: 14px; color: #666;">
      Best regards,<br>
      <strong>NextWave SMM Panel Team</strong>
    </p>
  </div>
  
  <div style="text-align: center; padding: 20px; font-size: 12px; color: #999;">
    <p>© ${new Date().getFullYear()} NextWave SMM Panel. All rights reserved.</p>
  </div>
</body>
</html>
    `;
  }

  /**
   * Ticket reply email template
   */
  private static getTicketReplyEmailTemplate(
    userName: string,
    ticketId: string,
    ticketSubject: string,
    replyMessage: string
  ): string {
    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>New Ticket Reply</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
    <h1 style="color: white; margin: 0; font-size: 28px;">New Reply Received 💬</h1>
  </div>
  
  <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
    <p style="font-size: 16px; margin-bottom: 20px;">Hi <strong>${userName}</strong>,</p>
    
    <p style="font-size: 16px; margin-bottom: 20px;">You have received a new reply on your support ticket.</p>
    
    <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #667eea;">
      <h2 style="color: #667eea; margin-top: 0; font-size: 20px;">Ticket Information</h2>
      <table style="width: 100%; border-collapse: collapse;">
        <tr>
          <td style="padding: 8px 0; font-weight: bold;">Ticket ID:</td>
          <td style="padding: 8px 0; text-align: right; color: #666; font-family: monospace;">
            #${ticketId}
          </td>
        </tr>
        <tr>
          <td style="padding: 8px 0; font-weight: bold;">Subject:</td>
          <td style="padding: 8px 0; text-align: right;">
            ${ticketSubject}
          </td>
        </tr>
      </table>
    </div>
    
    <div style="background: #e9ecef; padding: 20px; border-radius: 8px; margin: 20px 0;">
      <h3 style="margin-top: 0; color: #495057; font-size: 16px;">Reply Message:</h3>
      <p style="margin: 0; color: #212529; white-space: pre-wrap;">
        ${replyMessage}
      </p>
    </div>
    
    <div style="text-align: center; margin: 30px 0;">
      <a href="${process.env.NEXT_PUBLIC_SITE_URL || 'https://yourdomain.com'}/dashboard/tickets" 
         style="background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">
        View Ticket
      </a>
    </div>
    
    <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">
    
    <p style="font-size: 14px; color: #666;">
      Best regards,<br>
      <strong>NextWave SMM Panel Team</strong>
    </p>
  </div>
  
  <div style="text-align: center; padding: 20px; font-size: 12px; color: #999;">
    <p>© ${new Date().getFullYear()} NextWave SMM Panel. All rights reserved.</p>
  </div>
</body>
</html>
    `;
  }
}

export default EmailService;
