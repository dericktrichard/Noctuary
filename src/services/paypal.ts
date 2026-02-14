import 'server-only';
import axios from 'axios';

const PAYPAL_API_BASE = process.env.PAYPAL_MODE === 'live'
  ? 'https://api-m.paypal.com'
  : 'https://api-m.sandbox.paypal.com';

const PAYPAL_CLIENT_ID = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID!;
const PAYPAL_CLIENT_SECRET = process.env.PAYPAL_CLIENT_SECRET!;

/**
 * Get PayPal access token
 */
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
        timeout: 10000, // 10 second timeout
      }
    );

    return response.data.access_token;
  } catch (error: any) {
    console.error('PayPal auth error:', error.response?.data || error.message);
    throw new Error('Failed to authenticate with PayPal');
  }
}

/**
 * Create PayPal order
 */
export async function createPayPalOrder(amount: number, currency: 'USD' = 'USD') {
  try {
    const accessToken = await getAccessToken();

    console.log('Creating PayPal order with amount:', amount);

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
            description: 'Noctuary Poetry Commission',
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
        timeout: 15000, // 15 second timeout
      }
    );

    console.log('PayPal order created successfully:', response.data.id);

    return {
      id: response.data.id,
      status: response.data.status,
    };
  } catch (error: any) {
    console.error('PayPal order creation error:', {
      message: error.message,
      status: error.response?.status,
      data: error.response?.data,
    });
    throw new Error('Failed to create PayPal order');
  }
}

/**
 * Capture PayPal payment
 */
export async function capturePayPalPayment(orderId: string) {
  try {
    const accessToken = await getAccessToken();

    console.log('Capturing PayPal payment for order:', orderId);

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

    console.log('PayPal payment captured:', response.data.status);

    return {
      id: response.data.id,
      status: response.data.status,
      payer: response.data.payer,
      amount: response.data.purchase_units[0].payments.captures[0].amount,
    };
  } catch (error: any) {
    console.error('PayPal capture error:', {
      message: error.message,
      status: error.response?.status,
      data: error.response?.data,
    });
    throw new Error('Failed to capture PayPal payment');
  }
}

/**
 * Get PayPal order details
 */
export async function getPayPalOrder(orderId: string) {
  try {
    const accessToken = await getAccessToken();

    const response = await axios.get(
      `${PAYPAL_API_BASE}/v2/checkout/orders/${orderId}`,
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        timeout: 10000,
      }
    );

    return response.data;
  } catch (error: any) {
    console.error('PayPal get order error:', error.response?.data || error.message);
    throw new Error('Failed to get PayPal order');
  }
}