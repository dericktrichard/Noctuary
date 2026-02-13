import 'server-only';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

const FROM_EMAIL = 'onboarding@resend.dev';
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

/**
 * Send order confirmation email
 */
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
            <h2>Thank you for your commission! 🖋️</h2>
            
            <p>Your ${orderData.type === 'QUICK' ? 'quick poem' : 'custom poem'} order has been received and will be crafted with care by a human poet.</p>
            
            <div class="highlight">
              <strong>Expected Delivery:</strong> Within ${orderData.deliveryHours} hours<br>
              <strong>Order ID:</strong> ${orderData.orderId}
            </div>
            
            ${orderData.isFirstTime ? `
              <div style="background: #fffbeb; padding: 15px; border-left: 4px solid #f59e0b; margin: 20px 0;">
                <strong>🎉 First Commission Bonus!</strong><br>
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
            <p>© ${new Date().getFullYear()} Noctuary. All rights reserved.</p>
            <p>Questions? Reply to this email or visit our website.</p>
          </div>
        </div>
      </body>
    </html>
  `;

  try {
    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: email,
      subject,
      html,
    });

    if (error) {
      console.error('Email send error:', error);
      throw new Error('Failed to send confirmation email');
    }

    return data;
  } catch (error) {
    console.error('Email service error:', error);
    throw error;
  }
}

/**
 * Send poem delivery email
 */
export async function sendPoemDelivery(
  email: string,
  orderData: {
    orderId: string;
    accessToken: string;
    title?: string;
    poemContent: string;
  }
) {
  const viewUrl = `${APP_URL}/order/${orderData.accessToken}`;
  
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body { font-family: 'Georgia', serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { text-align: center; padding: 30px 0; border-bottom: 2px solid #f0f0f0; }
          .content { padding: 30px 0; }
          .poem { 
            background: #f8f8f8; 
            padding: 30px; 
            margin: 30px 0;
            border-left: 4px solid #000;
            white-space: pre-wrap;
            font-family: 'Georgia', serif;
            line-height: 1.8;
          }
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
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1 style="margin: 0; font-size: 32px; letter-spacing: 2px;">NOCTUARY</h1>
            <p style="margin: 10px 0 0 0; color: #666;">Human Ink, Digital Canvas</p>
          </div>
          
          <div class="content">
            <h2>Your poem is ready! ✨</h2>
            
            ${orderData.title ? `<h3 style="font-style: italic; color: #666;">"${orderData.title}"</h3>` : ''}
            
            <p>We're delighted to present your commissioned poem, crafted with care and intention:</p>
            
            <div class="poem">
${orderData.poemContent}
            </div>
            
            <div style="background: #fffbeb; padding: 15px; border-left: 4px solid #f59e0b; margin: 20px 0;">
              <strong>📜 Copyright Notice</strong><br>
              Full copyright of this poem has been transferred to you. You may use it however you wish.
            </div>
            
            <p>You can view and download your poem anytime:</p>
            
            <div style="text-align: center;">
              <a href="${viewUrl}" class="button">View Your Poem</a>
            </div>
            
            <p style="margin-top: 30px;">
              Thank you for commissioning with Noctuary. We hope these words bring meaning to your life.
            </p>
            
            <p style="font-style: italic; color: #666; text-align: center;">
              — With gratitude, your poet
            </p>
          </div>
          
          <div class="footer">
            <p>© ${new Date().getFullYear()} Noctuary. All rights reserved.</p>
            <p>We'd love to hear your thoughts. Reply to share your feedback!</p>
          </div>
        </div>
      </body>
    </html>
  `;

  try {
    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: email,
      subject: orderData.title 
        ? `Your Poem "${orderData.title}" Has Been Delivered`
        : 'Your Poem Has Been Delivered',
      html,
    });

    if (error) {
      console.error('Email send error:', error);
      throw new Error('Failed to send delivery email');
    }

    return data;
  } catch (error) {
    console.error('Email service error:', error);
    throw error;
  }
}

/**
 * Send payment confirmation email
 */
export async function sendPaymentConfirmation(
  email: string,
  orderData: {
    orderId: string;
    amount: number;
    currency: string;
  }
) {
  const html = `
    <!DOCTYPE html>
    <html>
      <body style="font-family: Georgia, serif; padding: 20px;">
        <h2>Payment Confirmed</h2>
        <p>Your payment of ${orderData.currency} ${orderData.amount.toFixed(2)} has been received.</p>
        <p>Order ID: ${orderData.orderId}</p>
        <p>Our poet will begin working on your commission shortly.</p>
      </body>
    </html>
  `;

  try {
    await resend.emails.send({
      from: FROM_EMAIL,
      to: email,
      subject: 'Payment Confirmed - Noctuary',
      html,
    });
  } catch (error) {
    console.error('Payment confirmation email error:', error);
  }
}