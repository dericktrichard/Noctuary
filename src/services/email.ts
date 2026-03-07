import 'server-only';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

const FROM_NAME = 'Noctuary';
const FROM_EMAIL = 'hello@noctuary.ink';
const FROM_ADDRESS = `${FROM_NAME} <${FROM_EMAIL}>`;
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

// CRITICAL: Always include plain text version to avoid spam
export async function sendOrderConfirmation(
  email: string,
  orderData: {
    orderId: string;
    accessToken: string;
    type: 'QUICK' | 'CUSTOM';
    deliveryHours: number;
    isFirstTime: boolean;
  }
) {
  const trackingUrl = `${APP_URL}/order/${orderData.accessToken}`;
  
  // Simple, spam-safe subject line
  const subject = `Order Confirmation - Noctuary #${orderData.orderId.slice(0, 8)}`;

  // Plain text version (CRITICAL for spam prevention)
  const text = `
NOCTUARY - Human Ink, Digital Canvas

Order Confirmation

Thank you for your ${orderData.type === 'QUICK' ? 'quick poem' : 'custom poem'} commission.

Order Details:
- Order ID: ${orderData.orderId}
- Expected Delivery: Within ${orderData.deliveryHours} hours
- Type: ${orderData.type} Poem

${orderData.isFirstTime ? 'First Commission Bonus: Thank you for trusting us with your first poetry commission.\n\n' : ''}

Track your order: ${trackingUrl}

What happens next?
Our poet will begin working on your piece. You'll receive an email when your poem is ready.

Questions? Simply reply to this email.

---
© ${new Date().getFullYear()} Noctuary
Noctuary Poetry Services
Based in Nairobi, Kenya
  `.trim();

  const html = `
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Order Confirmation</title>
        <style>
          body { 
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif;
            line-height: 1.6; 
            color: #1f2937; 
            background-color: #f9fafb;
            margin: 0;
            padding: 0;
          }
          .email-wrapper { 
            max-width: 600px; 
            margin: 20px auto; 
            background: #ffffff;
            border-radius: 8px;
            overflow: hidden;
            box-shadow: 0 1px 3px rgba(0,0,0,0.1);
          }
          .header { 
            background: #111827;
            color: #ffffff;
            text-align: center; 
            padding: 32px 20px;
          }
          .header h1 { 
            margin: 0; 
            font-size: 28px; 
            font-weight: 600;
            letter-spacing: 1px;
          }
          .header p { 
            margin: 8px 0 0 0; 
            color: #9ca3af;
            font-size: 14px;
          }
          .content { 
            padding: 32px 24px;
          }
          .content h2 {
            margin: 0 0 16px 0;
            font-size: 20px;
            color: #111827;
          }
          .content p {
            margin: 0 0 16px 0;
            color: #4b5563;
          }
          .info-box { 
            background: #f3f4f6; 
            padding: 20px; 
            border-radius: 6px;
            border-left: 4px solid #111827; 
            margin: 24px 0;
          }
          .info-box p {
            margin: 8px 0;
            color: #374151;
          }
          .info-box strong {
            color: #111827;
          }
          .bonus-box { 
            background: #fef3c7; 
            padding: 20px; 
            border-radius: 6px;
            border-left: 4px solid #f59e0b; 
            margin: 24px 0;
          }
          .button-wrapper {
            text-align: center;
            margin: 32px 0;
          }
          .button { 
            display: inline-block; 
            padding: 14px 32px; 
            background: #111827; 
            color: #ffffff !important; 
            text-decoration: none; 
            border-radius: 6px;
            font-weight: 500;
          }
          .footer { 
            background: #f9fafb;
            text-align: center; 
            padding: 24px 20px; 
            color: #6b7280;
            font-size: 13px;
            line-height: 1.5;
          }
          .footer p {
            margin: 4px 0;
          }
        </style>
      </head>
      <body>
        <div class="email-wrapper">
          <div class="header">
            <h1>NOCTUARY</h1>
            <p>Human Ink, Digital Canvas</p>
          </div>
          
          <div class="content">
            <h2>Order Confirmation</h2>
            
            <p>Thank you for commissioning a ${orderData.type === 'QUICK' ? 'quick poem' : 'custom poem'}. Your order has been received and will be crafted by a human poet.</p>
            
            <div class="info-box">
              <p><strong>Order ID:</strong> ${orderData.orderId}</p>
              <p><strong>Expected Delivery:</strong> Within ${orderData.deliveryHours} hours</p>
              <p><strong>Type:</strong> ${orderData.type} Poem</p>
            </div>
            
            ${orderData.isFirstTime ? `
              <div class="bonus-box">
                <p><strong>First Commission Bonus</strong></p>
                <p>Thank you for trusting us with your first poetry commission. We're honored to craft words for you.</p>
              </div>
            ` : ''}
            
            <p><strong>What happens next?</strong></p>
            <p>Our poet will begin working on your piece. You'll receive an email when your poem is ready.</p>
            
            <div class="button-wrapper">
              <a href="${trackingUrl}" class="button">Track Your Order</a>
            </div>
            
            <p style="font-size: 14px; color: #6b7280;">You can track your order status anytime using the button above.</p>
          </div>
          
          <div class="footer">
            <p><strong>Noctuary Poetry Services</strong></p>
            <p>Based in Nairobi, Kenya</p>
            <p>© ${new Date().getFullYear()} Noctuary. All rights reserved.</p>
            <p>Questions? Simply reply to this email.</p>
          </div>
        </div>
      </body>
    </html>
  `;

  try {
    const { data, error } = await resend.emails.send({
      from: FROM_ADDRESS,
      to: email,
      subject,
      html,
      text, // CRITICAL: Plain text version
    });

    if (error) {
      console.error('[EMAIL] Send failed (non-critical):', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Email service error:', error);
    throw error;
  }
}

export async function sendPoemDelivery(
  email: string,
  data: { orderId: string; poemContent: string; accessToken: string; title: string }
) {
  const { orderId, poemContent, accessToken, title } = data;
  const trackingUrl = `${APP_URL}/order/${accessToken}`;

  const subject = `Your Poem: ${title}`;

  const text = `
NOCTUARY

Your Poem: "${title}"

${poemContent}

View and download: ${trackingUrl}

Copyright Notice: Full copyright has been transferred to you. Use this poem however you wish.

Questions? Reply to this email.

---
© ${new Date().getFullYear()} Noctuary
Noctuary Poetry Services
Based in Nairobi, Kenya
  `.trim();

  const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Your Poem</title>
      <style>
        body { 
          font-family: Georgia, serif;
          line-height: 1.8; 
          color: #1f2937; 
          background-color: #f9fafb;
          margin: 0;
          padding: 0;
        }
        .email-wrapper { 
          max-width: 600px; 
          margin: 20px auto; 
          background: #ffffff;
          border-radius: 8px;
          overflow: hidden;
          box-shadow: 0 1px 3px rgba(0,0,0,0.1);
        }
        .header { 
          background: #111827;
          color: #ffffff;
          text-align: center; 
          padding: 32px 20px;
        }
        .header h1 { 
          margin: 0; 
          font-size: 28px; 
          font-weight: 600;
          letter-spacing: 1px;
        }
        .content { 
          padding: 32px 24px;
        }
        .content h2 {
          text-align: center;
          margin: 0 0 24px 0;
          font-size: 24px;
          color: #111827;
        }
        .poem-box { 
          background: #f9fafb; 
          padding: 32px; 
          border-left: 4px solid #6366f1; 
          margin: 24px 0;
          white-space: pre-wrap;
          font-style: italic;
          color: #374151;
          line-height: 2;
        }
        .button-wrapper {
          text-align: center;
          margin: 32px 0;
        }
        .button { 
          display: inline-block; 
          padding: 14px 32px; 
          background: #6366f1; 
          color: #ffffff !important; 
          text-decoration: none; 
          border-radius: 6px;
          font-weight: 500;
          margin: 8px;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif;
        }
        .notice {
          background: #f3f4f6;
          padding: 16px;
          border-radius: 6px;
          margin: 24px 0;
          font-size: 14px;
          color: #4b5563;
        }
        .footer { 
          background: #f9fafb;
          text-align: center; 
          padding: 24px 20px; 
          color: #6b7280;
          font-size: 13px;
          line-height: 1.5;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif;
        }
        .footer p {
          margin: 4px 0;
        }
      </style>
    </head>
    <body>
      <div class="email-wrapper">
        <div class="header">
          <h1>NOCTUARY</h1>
        </div>

        <div class="content">
          <h2>"${title}"</h2>
          
          <div class="poem-box">${poemContent}</div>
          
          <div class="button-wrapper">
            <a href="${trackingUrl}" class="button">View & Download</a>
          </div>
          
          <div class="notice">
            <strong>Copyright Notice:</strong> Full copyright has been transferred to you. Use this poem however you wish.
          </div>
        </div>
        
        <div class="footer">
          <p><strong>Noctuary Poetry Services</strong></p>
          <p>Based in Nairobi, Kenya</p>
          <p>© ${new Date().getFullYear()} Noctuary. All rights reserved.</p>
          <p>Questions? Simply reply to this email.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  try {
    const { data: result, error } = await resend.emails.send({
      from: FROM_ADDRESS,
      to: email,
      subject,
      html,
      text, // CRITICAL: Plain text version
    });

    if (error) {
      console.error('[EMAIL] Delivery failed (non-critical):', error);
      return null;
    }

    return result;
  } catch (error) {
    console.error('[EMAIL] Delivery error:', error);
    return null;
  }
}

export async function sendPaymentConfirmation(
  email: string,
  data: { orderId: string; amount: number; currency: string }
) {
  const { orderId, amount, currency } = data;
  const trackingUrl = `${APP_URL}/order/${orderId}`;

  const subject = `Payment Confirmed - Order #${orderId.slice(0, 8)}`;

  const text = `
NOCTUARY

Payment Confirmed

Your payment of ${currency} ${amount.toFixed(2)} has been received.

Our poet is now crafting your piece.

Track your order: ${trackingUrl}

Order ID: ${orderId}

---
© ${new Date().getFullYear()} Noctuary
Noctuary Poetry Services
Based in Nairobi, Kenya
  `.trim();

  const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Payment Confirmed</title>
      <style>
        body { 
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif;
          line-height: 1.6; 
          color: #1f2937; 
          background-color: #f9fafb;
          margin: 0;
          padding: 0;
        }
        .email-wrapper { 
          max-width: 600px; 
          margin: 20px auto; 
          background: #ffffff;
          border-radius: 8px;
          overflow: hidden;
          box-shadow: 0 1px 3px rgba(0,0,0,0.1);
        }
        .header { 
          background: #10b981;
          color: #ffffff;
          text-align: center; 
          padding: 32px 20px;
        }
        .header h1 { 
          margin: 0; 
          font-size: 28px; 
          font-weight: 600;
        }
        .content { 
          padding: 32px 24px;
        }
        .content h2 {
          margin: 0 0 16px 0;
          font-size: 20px;
          color: #111827;
        }
        .content p {
          margin: 0 0 16px 0;
          color: #4b5563;
        }
        .button-wrapper {
          text-align: center;
          margin: 32px 0;
        }
        .button { 
          display: inline-block; 
          padding: 14px 32px; 
          background: #111827; 
          color: #ffffff !important; 
          text-decoration: none; 
          border-radius: 6px;
          font-weight: 500;
        }
        .footer { 
          background: #f9fafb;
          text-align: center; 
          padding: 24px 20px; 
          color: #6b7280;
          font-size: 13px;
          line-height: 1.5;
        }
        .footer p {
          margin: 4px 0;
        }
      </style>
    </head>
    <body>
      <div class="email-wrapper">
        <div class="header">
          <h1>✓ Payment Confirmed</h1>
        </div>

        <div class="content">
          <h2>Thank You</h2>
          
          <p>Your payment of <strong>${currency} ${amount.toFixed(2)}</strong> has been received.</p>
          
          <p>Our poet is now crafting your piece with care and intention.</p>
          
          <div class="button-wrapper">
            <a href="${trackingUrl}" class="button">Track Your Order</a>
          </div>
          
          <p style="font-size: 13px; color: #6b7280;">Order ID: ${orderId}</p>
        </div>

        <div class="footer">
          <p><strong>Noctuary Poetry Services</strong></p>
          <p>Based in Nairobi, Kenya</p>
          <p>© ${new Date().getFullYear()} Noctuary. All rights reserved.</p>
          <p>Questions? Simply reply to this email.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  try {
    const { data: result, error } = await resend.emails.send({
      from: FROM_ADDRESS,
      to: email,
      subject,
      html,
      text, // CRITICAL: Plain text version
    });

    if (error) {
      console.error('[EMAIL] Payment confirmation failed (non-critical):', error);
      return null;
    }

    return result;
  } catch (error) {
    console.error('[EMAIL] Payment confirmation error:', error);
    return null;
  }
}

export async function sendAdminOrderNotification(data: {
  orderId: string;
  type: string;
  amount: number;
  currency: string;
  customerEmail: string;
  title?: string | null;
  deliveryHours: number;
}) {
  const { orderId, type, amount, currency, customerEmail, title, deliveryHours } = data;
  const adminEmail = 'dericktrichard@gmail.com'; 
  const orderUrl = `${APP_URL}/admin/dashboard/orders`;

  const subject = `New ${type} Order - ${currency} ${amount.toFixed(2)}`;

  const text = `
New Order Received

Order Details:
- Order ID: ${orderId}
- Type: ${type} POEM
${title ? `- Title: ${title}` : ''}
- Amount: ${currency} ${amount.toFixed(2)}
- Customer: ${customerEmail}
- Delivery: Within ${deliveryHours} hours

View in dashboard: ${orderUrl}
  `.trim();

  const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>New Order</title>
      <style>
        body { 
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif;
          line-height: 1.6; 
          color: #1f2937; 
          margin: 0;
          padding: 20px;
        }
        .container { max-width: 600px; margin: 0 auto; }
        .alert { 
          background: #6366f1; 
          color: white; 
          padding: 24px; 
          border-radius: 8px; 
          text-align: center;
          margin-bottom: 20px;
        }
        .alert h1 { margin: 0; font-size: 24px; }
        .details { 
          background: #f9fafb; 
          padding: 24px; 
          border-radius: 8px; 
          margin: 20px 0;
        }
        table { width: 100%; border-collapse: collapse; }
        td { 
          padding: 12px 0; 
          border-bottom: 1px solid #e5e7eb;
        }
        td:first-child { 
          font-weight: 600; 
          width: 40%;
          color: #6b7280;
        }
        .button { 
          display: inline-block; 
          padding: 12px 30px; 
          background: #6366f1; 
          color: white !important; 
          text-decoration: none; 
          border-radius: 6px;
          font-weight: 500;
        }
        .button-wrapper {
          text-align: center;
          margin: 24px 0;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="alert">
          <h1>New Order Received</h1>
        </div>

        <div class="details">
          <h2 style="margin-top: 0;">Order Details</h2>
          <table>
            <tr>
              <td>Order ID</td>
              <td><code>${orderId}</code></td>
            </tr>
            <tr>
              <td>Type</td>
              <td><strong>${type} POEM</strong></td>
            </tr>
            ${title ? `
            <tr>
              <td>Title</td>
              <td>${title}</td>
            </tr>
            ` : ''}
            <tr>
              <td>Amount</td>
              <td><strong>${currency} ${amount.toFixed(2)}</strong></td>
            </tr>
            <tr>
              <td>Customer</td>
              <td>${customerEmail}</td>
            </tr>
            <tr>
              <td>Delivery</td>
              <td>Within ${deliveryHours} hours</td>
            </tr>
          </table>
        </div>

        <div class="button-wrapper">
          <a href="${orderUrl}" class="button">
            View in Dashboard
          </a>
        </div>

        <p style="text-align: center; color: #6b7280; font-size: 12px; margin-top: 30px;">
          Automated notification from Noctuary
        </p>
      </div>
    </body>
    </html>
  `;

  try {
    const { data: result, error } = await resend.emails.send({
      from: FROM_ADDRESS,
      to: adminEmail,
      subject,
      html,
      text, // CRITICAL: Plain text version
    });

    if (error) {
      console.error('[EMAIL] Admin notification failed:', error);
      return null;
    }

    return result;
  } catch (error) {
    console.error('[EMAIL] Admin notification error:', error);
    return null;
  }
}