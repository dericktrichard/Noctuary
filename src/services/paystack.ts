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
  timeout: 15000,
});

//Initialize Paystack transaction
export async function initializePaystackTransaction(
  email: string,
  amount: number,
  currency: 'KES' = 'KES',
  reference?: string
) {
  try {
    const amountInCents = Math.round(amount * 100);
    const txnReference = reference || `NOC-${Date.now()}`;

    console.log('[PAYSTACK] Initializing transaction:', {
      email,
      amount,
      amountInCents,
      currency,
      reference: txnReference,
    });

    const response = await paystackClient.post('/transaction/initialize', {
      email,
      amount: amountInCents,
      currency,
      reference: txnReference,
      callback_url: `${process.env.NEXT_PUBLIC_APP_URL}/payment/verify?provider=paystack`, // Fixed
      metadata: {
        custom_fields: [
          {
            display_name: 'Service',
            variable_name: 'service',
            value: 'Poetry Commission',
          },
        ],
      },
      channels: ['mobile_money', 'card'],
    });

    console.log('[PAYSTACK] Transaction initialized successfully:', {
      reference: response.data.data.reference,
      authorizationUrl: response.data.data.authorization_url,
    });

    return {
      authorizationUrl: response.data.data.authorization_url,
      accessCode: response.data.data.access_code,
      reference: response.data.data.reference,
    };
  } catch (error: any) {
    console.error('[PAYSTACK] Initialization error:', {
      message: error.message,
      status: error.response?.status,
      data: error.response?.data,
    });
    throw new Error('Failed to initialize Paystack transaction');
  }
}

//Verify Paystack transaction
export async function verifyPaystackTransaction(reference: string) {
  try {
    console.log('[PAYSTACK] Verifying transaction:', reference);

    const response = await paystackClient.get(`/transaction/verify/${reference}`);

    console.log('[PAYSTACK] Verification successful:', {
      status: response.data.data.status,
      amount: response.data.data.amount / 100,
      channel: response.data.data.channel,
    });

    return {
      status: response.data.data.status,
      reference: response.data.data.reference,
      amount: response.data.data.amount / 100,
      currency: response.data.data.currency,
      paidAt: response.data.data.paid_at,
      channel: response.data.data.channel,
      customer: response.data.data.customer,
    };
  } catch (error: any) {
    console.error('[PAYSTACK] Verification error:', {
      message: error.message,
      status: error.response?.status,
      data: error.response?.data,
    });
    throw new Error('Failed to verify Paystack transaction');
  }
}

//Get transaction details
export async function getPaystackTransaction(reference: string) {
  try {
    const response = await paystackClient.get(`/transaction/verify/${reference}`);
    return response.data.data;
  } catch (error: any) {
    console.error('[PAYSTACK] Get transaction error:', {
      message: error.message,
      status: error.response?.status,
      data: error.response?.data,
    });
    throw new Error('Failed to get Paystack transaction');
  }
}