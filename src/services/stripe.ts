import 'server-only';
import Stripe from 'stripe';

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('STRIPE_SECRET_KEY is not set');
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2026-02-25.clover',
  typescript: true,
});

/**
 * Create a Stripe Payment Intent
 */
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
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Stripe uses cents
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

/**
 * Verify a Stripe Payment Intent
 */
export async function verifyStripePayment(paymentIntentId: string) {
  try {
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

/**
 * Create a Stripe Checkout Session (alternative approach)
 */
export async function createStripeCheckoutSession(
  orderId: string,
  email: string,
  amount: number,
  currency: string,
  successUrl: string,
  cancelUrl: string
) {
  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: currency.toLowerCase(),
            product_data: {
              name: 'Poetry Commission',
              description: `Order ID: ${orderId}`,
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