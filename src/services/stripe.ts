import 'server-only';
import Stripe from 'stripe';

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('STRIPE_SECRET_KEY is not set');
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2026-02-25.clover',
  typescript: true,
});

export async function createStripePaymentIntent(
  amount: number,
  currency: string,
  metadata: {
    orderId: string;
    email: string;
    type: string;
  }
) {
  try {
    if (amount <= 0 || amount > 999999) {
      throw new Error('Invalid payment amount');
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100),
      currency: currency.toLowerCase(),
      metadata,
      automatic_payment_methods: {
        enabled: true,
      },
    });

    return {
      success: true,
      clientSecret: paymentIntent.client_secret!,
      paymentIntentId: paymentIntent.id,
    };
  } catch (error) {
    console.error('[STRIPE] Payment intent creation failed:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create payment',
    };
  }
}

export async function verifyStripePayment(paymentIntentId: string) {
  try {
    if (!paymentIntentId || !paymentIntentId.startsWith('pi_')) {
      throw new Error('Invalid payment intent ID');
    }

    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    return {
      success: paymentIntent.status === 'succeeded',
      status: paymentIntent.status,
      amount: paymentIntent.amount / 100,
      currency: paymentIntent.currency,
      metadata: paymentIntent.metadata,
    };
  } catch (error) {
    console.error('[STRIPE] Payment verification failed:', error);
    throw error;
  }
}

export async function createStripeCheckoutSession(
  orderId: string,
  email: string,
  amount: number,
  currency: string, 
  successUrl: string,
  cancelUrl: string
) {
  try {
    if (amount <= 0 || amount > 999999) {
      return {
        success: false,
        error: 'Invalid payment amount',
      };
    }

    if (!email.includes('@')) {
      return {
        success: false,
        error: 'Invalid email address',
      };
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: currency.toLowerCase(), 
            product_data: {
              name: 'Custom Poetry Commission',
              description: 'Handwritten poem by flawed poet',
            },
            unit_amount: Math.round(amount * 100), 
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: successUrl,
      cancel_url: cancelUrl,
      customer_email: email,
      metadata: {
        orderId,
        currency,
      },
    });

    return {
      success: true,
      sessionId: session.id,
      url: session.url,
    };
  } catch (error) {
    console.error('[STRIPE] Checkout session creation failed:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create session',
    };
  }
}