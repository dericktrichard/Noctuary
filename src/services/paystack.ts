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

export async function initializePaystackTransaction(
  email: string,
  amount: number,
  currency: 'KES' = 'KES',
  reference?: string
) {
  try {
    const amountInCents = Math.round(amount * 100);
    const txnReference = reference || `NOC-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

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
      callback_url: `${process.env.NEXT_PUBLIC_APP_URL}/payment/verify?provider=paystack`,
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

    console.log('[PAYSTACK] Transaction initialized:', response.data.data.reference);

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
    
    if (error.response?.status === 429) {
      throw new Error('Too many payment requests. Please try again in a moment.');
    }
    
    if (error.response?.data?.message) {
      throw new Error(error.response.data.message);
    }
    
    throw new Error('Failed to initialize payment. Please try again.');
  }
}

export async function verifyPaystackTransaction(reference: string) {
  try {
    if (!reference || reference.length < 5) {
      throw new Error('Invalid payment reference');
    }

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
      reference,
    });
    
    if (error.response?.status === 404) {
      throw new Error('Payment not found. Please contact support.');
    }
    
    if (error.response?.data?.message) {
      throw new Error(error.response.data.message);
    }
    
    throw new Error('Failed to verify payment. Please try again.');
  }
}