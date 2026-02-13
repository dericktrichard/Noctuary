import 'server-only';
import axios from 'axios';

const PAYSTACK_BASE_URL = 'https://api.paystack.co';
const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY!;

const paystackClient = axios.create({
  baseURL: PAYSTACK_BASE_URL,
  headers: {
    Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
    'Content-Type': 'application/json',
  },
});

// Initialize Paystack transaction
export async function initializePaystackTransaction(
  email: string,
  amount: number,
  currency: 'KES' = 'KES',
  reference?: string
) {
  try {
    // Paystack amount is in kobo/cents (multiply by 100)
    const amountInCents = Math.round(amount * 100);

    const response = await paystackClient.post('/transaction/initialize', {
      email,
      amount: amountInCents,
      currency,
      reference: reference || `NOC-${Date.now()}`,
      callback_url: `${process.env.NEXT_PUBLIC_APP_URL}/payment/verify`,
      metadata: {
        custom_fields: [
          {
            display_name: 'Service',
            variable_name: 'service',
            value: 'Poetry Commission',
          },
        ],
      },
      channels: ['mobile_money', 'card'], // Enable M-Pesa + Card
    });

    return {
      authorizationUrl: response.data.data.authorization_url,
      accessCode: response.data.data.access_code,
      reference: response.data.data.reference,
    };
  } catch (error: any) {
    console.error('Paystack initialization error:', error.response?.data || error);
    throw new Error('Failed to initialize Paystack transaction');
  }
}

// Verify Paystack transaction

export async function verifyPaystackTransaction(reference: string) {
  try {
    const response = await paystackClient.get(`/transaction/verify/${reference}`);

    return {
      status: response.data.data.status,
      reference: response.data.data.reference,
      amount: response.data.data.amount / 100, // Convert back from kobo/cents
      currency: response.data.data.currency,
      paidAt: response.data.data.paid_at,
      channel: response.data.data.channel,
      customer: response.data.data.customer,
    };
  } catch (error: any) {
    console.error('Paystack verification error:', error.response?.data || error);
    throw new Error('Failed to verify Paystack transaction');
  }
}

// Get transaction details
export async function getPaystackTransaction(reference: string) {
  try {
    const response = await paystackClient.get(`/transaction/verify/${reference}`);
    return response.data.data;
  } catch (error: any) {
    console.error('Paystack get transaction error:', error.response?.data || error);
    throw new Error('Failed to get Paystack transaction');
  }
}