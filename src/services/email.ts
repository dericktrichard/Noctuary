import 'server-only';
import { Resend } from 'resend';
import { generateMagicLink } from '@/lib/magic-link';
import { formatCurrency, formatDate } from '@/lib/utils';

const resend = new Resend(process.env.RESEND_API_KEY);
const fromEmail = process.env.RESEND_FROM_EMAIL || 'Noctuary <orders@noctuary.com>';

/**
 * Send order confirmation email with magic link
 */
export async function sendOrderConfirmation(
  orderId: string,
  email: string,
  orderDetails: {
    type: string;
    price: number;
    currency: string;
    deliveryHours: number;
  },
  isFirstTimer: boolean
) {
  const magicLink = generateMagicLink(orderId, email);
  const deliveryDate = new Date();
  deliveryDate.setHours(deliveryDate.getHours() + orderDetails.deliveryHours);

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
          }
          .header {
            background: linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 100%);
            color: white;
            padding: 30px;
            text-align: center;
            border-radius: 8px 8px 0 0;
          }
          .content {
            background: #f9f9f9;
            padding: 30px;
            border-radius: 0 0 8px 8px;
          }
          .button {
            display: inline-block;
            padding: 12px 30px;
            background: #0a0a0a;
            color: white;
            text-decoration: none;
            border-radius: 6px;
            margin: 20px 0;
          }
          .details {
            background: white;
            padding: 20px;
            border-radius: 6px;
            margin: 20px 0;
          }
          .bonus {
            background: #fff3cd;
            border: 1px solid #ffc107;
            padding: 15px;
            border-radius: 6px;
            margin: 20px 0;
          }
          .footer {
            text-align: center;
            margin-top: 30px;
            color: #666;
            font-size: 12px;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>✍️ Order Confirmed</h1>
          <p>Your poetry commission has been received</p>
        </div>
        
        <div class="content">
          <p>Thank you for commissioning a poem from Noctuary. Your order is being prepared by our poet.</p>
          
          ${isFirstTimer ? `
            <div class="bonus">
              <strong>🎉 Welcome Bonus!</strong>
              <p>As a first-time commissioner, you're part of something special. Every word is crafted by human hands, never by algorithms.</p>
            </div>
          ` : ''}
          
          <div class="details">
            <h3>Order Details</h3>
            <p><strong>Order ID:</strong> ${orderId}</p>
            <p><strong>Type:</strong> ${orderDetails.type === 'QUICK' ? 'Quick Poem' : 'Custom Poem'}</p>
            <p><strong>Amount Paid:</strong> ${formatCurrency(orderDetails.price, orderDetails.currency as 'USD' | 'KES')}</p>
            <p><strong>Expected Delivery:</strong> ${formatDate(deliveryDate)}</p>
          </div>
          
          <p><strong>Track your order:</strong></p>
          <a href="${magicLink}" class="button">View Order Status</a>
          
          <p style="font-size: 14px; color: #666;">
            This link is valid for 7 days. Save it to check your order status and receive your poem when it's ready.
          </p>
          
          <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">
          
          <p><strong>The Noctuary Promise:</strong></p>
          <p style="font-size: 14px;">
            Every poem is written by a human poet. No AI. No templates. Just authentic emotional expression crafted specifically for you.
          </p>
        </div>
        
        <div class="footer">
          <p>© ${new Date().getFullYear()} Noctuary. Human Ink, Digital Canvas.</p>
          <p>Questions? Reply to this email.</p>
        </div>
      </body>
    </html>
  `;

  try {
    await resend.emails.send({
      from: fromEmail,
      to: email,
      subject: `Order Confirmed - Your Poem is Being Written ✍️`,
      html,
    });

    return { success: true };
  } catch (error) {
    console.error('Failed to send order confirmation:', error);
    return { success: false, error };
  }
}

/**
 * Send poem delivery email
 */
export async function sendPoemDelivery(
  orderId: string,
  email: string,
  poemContent: string,
  orderType: string
) {
  const magicLink = generateMagicLink(orderId, email);

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
          }
          .header {
            background: linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 100%);
            color: white;
            padding: 30px;
            text-align: center;
            border-radius: 8px 8px 0 0;
          }
          .content {
            background: #f9f9f9;
            padding: 30px;
            border-radius: 0 0 8px 8px;
          }
          .poem {
            background: white;
            padding: 30px;
            border-left: 4px solid #0a0a0a;
            margin: 20px 0;
            font-family: 'Georgia', serif;
            font-size: 16px;
            line-height: 1.8;
            white-space: pre-wrap;
          }
          .button {
            display: inline-block;
            padding: 12px 30px;
            background: #0a0a0a;
            color: white;
            text-decoration: none;
            border-radius: 6px;
            margin: 20px 0;
          }
          .rights {
            background: #e8f5e9;
            border: 1px solid #4caf50;
            padding: 15px;
            border-radius: 6px;
            margin: 20px 0;
            font-size: 14px;
          }
          .footer {
            text-align: center;
            margin-top: 30px;
            color: #666;
            font-size: 12px;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>📜 Your Poem is Ready</h1>
          <p>Crafted with care, just for you</p>
        </div>
        
        <div class="content">
          <p>Your commissioned poem has been completed. Thank you for entrusting us with your words.</p>
          
          <div class="poem">${poemContent}</div>
          
          <div class="rights">
            <strong>✓ Full Copyright Transfer</strong>
            <p style="margin: 10px 0 0 0;">
              This poem is now yours. You own all rights to use, modify, publish, or share it as you wish. No attribution required.
            </p>
          </div>
          
          <p>You can always access your poem at:</p>
          <a href="${magicLink}" class="button">View Your Poem</a>
          
          <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">
          
          <p style="font-size: 14px; color: #666;">
            We hope these words bring you joy. If you ever need another poem, we'd be honored to write for you again.
          </p>
          
          <p style="font-size: 14px; color: #666;">
            <strong>Order ID:</strong> ${orderId}
          </p>
        </div>
        
        <div class="footer">
          <p>© ${new Date().getFullYear()} Noctuary. Human Ink, Digital Canvas.</p>
          <p>Questions? Reply to this email.</p>
        </div>
      </body>
    </html>
  `;

  try {
    await resend.emails.send({
      from: fromEmail,
      to: email,
      subject: `✨ Your Poem Has Arrived`,
      html,
    });

    return { success: true };
  } catch (error) {
    console.error('Failed to send poem delivery:', error);
    return { success: false, error };
  }
}

/**
 * Send admin notification for new order
 */
export async function sendAdminNotification(
  orderId: string,
  orderDetails: {
    type: string;
    email: string;
    price: number;
    currency: string;
    urgency: number;
  }
) {
  const adminEmail = process.env.NEXT_PUBLIC_ADMIN_EMAIL;
  
  if (!adminEmail) {
    console.warn('NEXT_PUBLIC_ADMIN_EMAIL not set, skipping admin notification');
    return { success: false };
  }

  const dashboardUrl = `${process.env.NEXT_PUBLIC_APP_URL}/admin`;

  const html = `
    <!DOCTYPE html>
    <html>
      <body style="font-family: sans-serif; padding: 20px;">
        <h2>🔔 New Order Received</h2>
        <p><strong>Order ID:</strong> ${orderId}</p>
        <p><strong>Type:</strong> ${orderDetails.type}</p>
        <p><strong>Email:</strong> ${orderDetails.email}</p>
        <p><strong>Price:</strong> ${formatCurrency(orderDetails.price, orderDetails.currency as 'USD' | 'KES')}</p>
        <p><strong>Urgency:</strong> ${orderDetails.urgency} hours</p>
        <p><a href="${dashboardUrl}">Go to Dashboard</a></p>
      </body>
    </html>
  `;

  try {
    await resend.emails.send({
      from: fromEmail,
      to: adminEmail,
      subject: `New ${orderDetails.type} Order - ${orderId}`,
      html,
    });

    return { success: true };
  } catch (error) {
    console.error('Failed to send admin notification:', error);
    return { success: false, error };
  }
}
