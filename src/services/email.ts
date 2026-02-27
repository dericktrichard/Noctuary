import 'server-only';
import { Resend } from 'resend';
import { sanitizeText } from '@/lib/sanitize';

const resend = new Resend(process.env.RESEND_API_KEY);

// Use the ONLY allowed sender on free tier
const FROM_NAME = 'Noctuary';
const FROM_EMAIL = 'hello@noctuary.ink';
const FROM_ADDRESS = `${FROM_NAME} <${FROM_EMAIL}>`;
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

//Send order confirmation email
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
  
  const subject = orderData.type === 'QUICK' 
    ? 'Your Quick Poem Commission - Order Received'
    : 'Your Custom Poem Commission - Order Received';

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body { font-family: 'Georgia', serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { text-align: center; padding: 30px 0; border-bottom: 2px solid #f0f0f0; }
          .content { padding: 30px 0; }
          .button { 
            display: inline-block; 
            padding: 12px 30px; 
            background: #000; 
            color: #fff !important; 
            text-decoration: none; 
            border-radius: 5px;
            margin: 20px 0;
          }
          .footer { 
            text-align: center; 
            padding: 20px 0; 
            border-top: 2px solid #f0f0f0; 
            color: #666;
            font-size: 14px;
          }
          .highlight { 
            background: #f8f8f8; 
            padding: 15px; 
            border-left: 4px solid #000; 
            margin: 20px 0;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1 style="margin: 0; font-size: 32px; letter-spacing: 2px;">NOCTUARY</h1>
            <p style="margin: 10px 0 0 0; color: #666;">Human Ink, Digital Canvas</p>
          </div>
          
          <div class="content">
            <h2>Thank you for your commission!</h2>
            
            <p>Your ${orderData.type === 'QUICK' ? 'quick poem' : 'custom poem'} order has been received and will be crafted with care by a human poet.</p>
            
            <div class="highlight">
              <strong>Expected Delivery:</strong> Within ${orderData.deliveryHours} hours<br>
              <strong>Order ID:</strong> ${orderData.orderId}
            </div>
            
            ${orderData.isFirstTime ? `
              <div style="background: #fffbeb; padding: 15px; border-left: 4px solid #f59e0b; margin: 20px 0;">
                <strong>First Commission Bonus!</strong><br>
                Thank you for trusting us with your first poetry commission. We're honored to craft words for you.
              </div>
            ` : ''}
            
            <p>You can track your order status anytime using the link below:</p>
            
            <div style="text-align: center;">
              <a href="${trackingUrl}" class="button">Track Your Order</a>
            </div>
            
            <p style="margin-top: 30px;">
              <strong>What happens next?</strong><br>
              Our poet will begin working on your piece. You'll receive an email as soon as your poem is ready.
            </p>
            
            <p style="font-style: italic; color: #666;">
              "Words are but the shadow of the heart's true ink."
            </p>
          </div>
          
          <div class="footer">
            <p>&copy; ${new Date().getFullYear()} Noctuary. All rights reserved.</p>
            <p>Questions? Reply to this email or visit our website.</p>
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

//Send poem delivery email
export async function sendPoemDelivery(
  email: string,
  data: { orderId: string; poemContent: string; accessToken: string; title: string }
) {
  const { orderId, poemContent, accessToken, title } = data;
  const trackingUrl = `${process.env.NEXT_PUBLIC_APP_URL}/order/${accessToken}`;
  const reviewUrl = `${process.env.NEXT_PUBLIC_APP_URL}/review/${orderId}`;

  try {
    const { data: result, error } = await resend.emails.send({
      from: FROM_ADDRESS,
      to: email,
      subject: `Your Poem is Ready: "${title}"`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: 'Georgia', serif; line-height: 1.8; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 40px 20px; }
            .header { text-align: center; margin-bottom: 30px; }
            .poem { background: #f9f9f9; padding: 30px; border-left: 4px solid #6366f1; margin: 30px 0; white-space: pre-wrap; font-style: italic; }
            .button { display: inline-block; padding: 12px 30px; background: #6366f1; color: white; text-decoration: none; border-radius: 6px; margin: 10px 5px; }
            .button-secondary { background: #10b981; }
            .footer { text-align: center; margin-top: 30px; font-size: 12px; color: #666; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1 style="margin: 0; font-size: 24px;">NOCTUARY</h1>
              <p style="margin: 5px 0; color: #666; font-size: 14px;">Human Ink, Soul Scripted</p>
            </div>

            <h2 style="text-align: center;">"${title}"</h2>
            
            <div class="poem">${poemContent}</div>
            
            <p style="text-align: center;">
              <a href="${trackingUrl}" class="button">View & Download</a>
              <a href="${reviewUrl}" class="button button-secondary">Share Your Feedback</a>
            </p>
            
            <p style="font-size: 14px; color: #666; text-align: center; margin-top: 30px;">
              <strong>Love your poem?</strong> Help others discover the beauty of human-written poetry by sharing your experience.
            </p>
            
            <p style="font-size: 14px; color: #666; text-align: center;">
              <strong>Copyright Notice:</strong> Full copyright transferred to you. Use this poem however you wish.
            </p>

            <div class="footer">
              <p>© ${new Date().getFullYear()} Noctuary. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `,
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

//Send payment confirmation email
export async function sendPaymentConfirmation(
  email: string,
  data: { orderId: string; amount: number; currency: string }
) {
  const { orderId, amount, currency } = data;

  try {
    const { data: result, error } = await resend.emails.send({
      from: FROM_ADDRESS,
      to: email,
      subject: 'Payment Received - Your Poem is Being Crafted',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: 'Georgia', serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 40px 20px; }
            .header { text-align: center; margin-bottom: 30px; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 8px; }
            .footer { text-align: center; margin-top: 30px; font-size: 12px; color: #666; }
            .button { display: inline-block; padding: 12px 30px; background: #6366f1; color: white; text-decoration: none; border-radius: 6px; margin: 20px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1 style="margin: 0; font-size: 24px;">NOCTUARY</h1>
              <p style="margin: 5px 0; color: #666; font-size: 14px;">Human Ink, Soul Scripted</p>
            </div>

            <div class="content">
              <h2 style="margin-top: 0;">Payment Confirmed ✓</h2>
              
              <p>Your payment of <strong>${currency} ${amount.toFixed(2)}</strong> has been received.</p>
              
              <p>Our poet is now crafting your piece with care and intention.</p>
              
              <a href="${process.env.NEXT_PUBLIC_APP_URL}/order/${orderId}" class="button">
                Track Your Order
              </a>
              
              <p style="font-size: 14px; color: #666; margin-top: 30px;">
                Order ID: ${orderId}
              </p>
            </div>

            <div class="footer">
              <p>© ${new Date().getFullYear()} Noctuary. All rights reserved.</p>
              <p>Questions? Reply to this email.</p>
            </div>
          </div>
        </body>
        </html>
      `,
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

/**
 * Send admin notification for new order
 */
/**
 * Send admin notification for new order
 */
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
  const orderUrl = `${process.env.NEXT_PUBLIC_APP_URL}/admin/dashboard/orders`;

  try {
    const { data: result, error } = await resend.emails.send({
      from: FROM_ADDRESS,
      to: adminEmail,
      subject: `🎨 New ${type} Poem Order - ${currency} ${amount}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: system-ui, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .alert { background: #6366f1; color: white; padding: 20px; border-radius: 8px; text-align: center; }
            .details { background: #f9f9f9; padding: 20px; border-radius: 8px; margin: 20px 0; }
            .button { display: inline-block; padding: 12px 30px; background: #6366f1; color: white; text-decoration: none; border-radius: 6px; margin: 20px 0; }
            table { width: 100%; border-collapse: collapse; }
            td { padding: 8px 0; border-bottom: 1px solid #eee; }
            td:first-child { font-weight: bold; width: 40%; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="alert">
              <h1 style="margin: 0; font-size: 24px;">🎨 New Order Received!</h1>
            </div>

            <div class="details">
              <h2 style="margin-top: 0;">Order Details</h2>
              <table>
                <tr>
                  <td>Order ID:</td>
                  <td><code>${orderId}</code></td>
                </tr>
                <tr>
                  <td>Type:</td>
                  <td><strong>${type} POEM</strong></td>
                </tr>
                ${title ? `
                <tr>
                  <td>Title:</td>
                  <td>${title}</td>
                </tr>
                ` : ''}
                <tr>
                  <td>Amount:</td>
                  <td><strong>${currency} ${amount.toFixed(2)}</strong></td>
                </tr>
                <tr>
                  <td>Customer:</td>
                  <td>${customerEmail}</td>
                </tr>
                <tr>
                  <td>Delivery:</td>
                  <td>Within ${deliveryHours} hours</td>
                </tr>
              </table>
            </div>

            <div style="text-align: center;">
              <a href="${orderUrl}" class="button">
                View in Dashboard
              </a>
            </div>

            <p style="text-align: center; color: #666; font-size: 12px; margin-top: 30px;">
              This is an automated notification from Noctuary
            </p>
          </div>
        </body>
        </html>
      `,
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