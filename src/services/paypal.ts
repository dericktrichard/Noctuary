import 'server-only';
import axios from 'axios';

const PAYPAL_API_BASE = process.env.NEXT_PUBLIC_PAYPAL_MODE === 'live'
  ? 'https://api-m.paypal.com'
  : 'https://api-m.sandbox.paypal.com';

const PAYPAL_CLIENT_ID = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID!;
const PAYPAL_CLIENT_SECRET = process.env.PAYPAL_CLIENT_SECRET!;

async function getAccessToken(): Promise<string> {
  const auth = Buffer.from(`${PAYPAL_CLIENT_ID}:${PAYPAL_CLIENT_SECRET}`).toString('base64');

  try {
    const response = await axios.post(
      `${PAYPAL_API_BASE}/v1/oauth2/token`,
      'grant_type=client_credentials',
      {
        headers: {
          'Authorization': `Basic ${auth}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        timeout: 10000,
      }
    );
    return response.data.access_token;
  } catch (error: any) {
    console.error('[PAYPAL] Auth error:', error.response?.status);
    throw new Error('Failed to authenticate with PayPal');
  }
}

export async function createPayPalOrder(amount: number, currency: 'USD' = 'USD') {
  try {
    if (amount <= 0 || amount > 999999) {
      throw new Error('Invalid payment amount');
    }

    const accessToken = await getAccessToken();

    const response = await axios.post(
      `${PAYPAL_API_BASE}/v2/checkout/orders`,
      {
        intent: 'CAPTURE',
        purchase_units: [
          {
            amount: {
              currency_code: currency,
              value: amount.toFixed(2),
            },
            description: 'Custom Poetry Commission',
          },
        ],
        application_context: {
          brand_name: 'Noctuary',
          landing_page: 'NO_PREFERENCE',
          user_action: 'PAY_NOW',
          return_url: `${process.env.NEXT_PUBLIC_APP_URL}/payment/success`,
          cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/payment/cancelled`,
        },
      },
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        timeout: 15000,
      }
    );

    const approvalLink = response.data.links.find((link: any) => link.rel === 'approve');

    if (!approvalLink?.href) {
      throw new Error('PayPal approval URL not found');
    }

    return {
      id: response.data.id,
      status: response.data.status,
      approvalUrl: approvalLink.href,
    };
  } catch (error: any) {
    console.error('[PAYPAL] Order creation error:', error.response?.status);
    
    if (error.response?.status === 401) {
      throw new Error('PayPal authentication failed. Please contact support.');
    }
    
    if (error.message.includes('Invalid payment amount')) {
      throw error;
    }
    
    throw new Error('Failed to create PayPal order. Please try again.');
  }
}

export async function capturePayPalPayment(orderId: string) {
  try {
    if (!orderId || orderId.length < 5) {
      throw new Error('Invalid PayPal order ID');
    }

    const accessToken = await getAccessToken();

    console.log('[PAYPAL] Capturing payment:', orderId);

    const response = await axios.post(
      `${PAYPAL_API_BASE}/v2/checkout/orders/${orderId}/capture`,
      {},
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        timeout: 15000,
      }
    );

    console.log('[PAYPAL] Payment captured:', response.data.status);

    return {
      id: response.data.id,
      status: response.data.status,
      payer: response.data.payer,
      amount: response.data.purchase_units[0].payments.captures[0].amount,
    };
  } catch (error: any) {
    console.error('[PAYPAL] Capture error:', {
      status: error.response?.status,
      orderId,
    });
    
    if (error.response?.status === 404) {
      throw new Error('PayPal order not found. Please try again or contact support.');
    }
    
    if (error.response?.status === 422) {
      throw new Error('Payment already processed or order expired.');
    }
    
    throw new Error('Failed to process PayPal payment. Please contact support.');
  }
}