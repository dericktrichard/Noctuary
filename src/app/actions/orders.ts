'use server';

import { z } from 'zod';
import { headers } from 'next/headers';
import { checkOrderRateLimit } from '@/lib/rate-limit';
import { createOrder, updateOrderPayment, getOrderCountByEmail } from '@/services/orders';
import { createStripeCheckoutSession, verifyStripePayment } from '@/services/stripe';
import { sendPaymentConfirmation, sendAdminOrderNotification } from '@/services/email';
import { getCurrentPricing } from './pricing';
import { prisma } from '@/lib/prisma';

// Validation schemas with automatic email normalization
const QuickPoemSchema = z.object({
  type: z.literal('QUICK'),
  email: z.string()
    .email('Please enter a valid email address')
    .transform(val => val.toLowerCase().trim()), 
  currency: z.enum(['USD', 'KES']),
});

const CustomPoemSchema = z.object({
  type: z.literal('CUSTOM'),
  email: z.string()
    .email('Please enter a valid email address')
    .transform(val => val.toLowerCase().trim()),
  title: z.string().min(3).max(100),
  mood: z.string().min(1),
  instructions: z.string().optional(),
  budget: z.number().min(0.5).max(1000), 
  currency: z.enum(['USD', 'KES']),
});

type OrderInput = z.infer<typeof QuickPoemSchema> | z.infer<typeof CustomPoemSchema>;

// Create a new order
export async function createOrderAction(input: OrderInput) {
  try {
    // Rate limiting by email
    const headersList = await headers();
    const identifier = input.email.toLowerCase().trim();
    
    const rateLimit = await checkOrderRateLimit(identifier);
    if (!rateLimit.success) {
      return {
        success: false,
        error: 'You have reached the maximum number of orders (5) per day. Please try again tomorrow.',
      };
    }

    // Validate and normalize input
    const validatedData = input.type === 'QUICK' 
      ? QuickPoemSchema.parse(input)
      : CustomPoemSchema.parse(input);

    const normalizedEmail = validatedData.email;

    const pricing = await getCurrentPricing();

    // Currency-specific validation for custom poems
    if (validatedData.type === 'CUSTOM') {
      const customData = validatedData as z.infer<typeof CustomPoemSchema>;
      
      if (customData.currency === 'USD') {
        if (customData.budget < pricing.custom.minUsd || customData.budget > pricing.custom.maxUsd) {
          return {
            success: false,
            error: `USD budget must be between $${pricing.custom.minUsd.toFixed(2)} and $${pricing.custom.maxUsd.toFixed(2)}`,
          };
        }
      } else if (customData.currency === 'KES') {
        if (customData.budget < pricing.custom.minKes || customData.budget > pricing.custom.maxKes) {
          return {
            success: false,
            error: `KES budget must be between Ksh ${pricing.custom.minKes} and Ksh ${pricing.custom.maxKes}`,
          };
        }
      }
    }

    // Calculate pricing
    let pricePaid: number;
    let deliveryHours: number;

    if (validatedData.type === 'QUICK') {
      pricePaid = validatedData.currency === 'USD' ? pricing.quick.usd : pricing.quick.kes;
      deliveryHours = 24;
    } else {
      const customData = validatedData as z.infer<typeof CustomPoemSchema>;
      pricePaid = customData.budget;
      
      // Calculate delivery hours (12h to 6h based on budget)
      const min = customData.currency === 'USD' ? pricing.custom.minUsd : pricing.custom.minKes;
      const max = customData.currency === 'USD' ? pricing.custom.maxUsd : pricing.custom.maxKes;
      const ratio = (pricePaid - min) / (max - min);
      deliveryHours = Math.round(12 - (ratio * 6));
    }

    // Create order (status: PENDING)
    const order = await createOrder({
      email: normalizedEmail,
      type: validatedData.type,
      currency: validatedData.currency,
      title: 'title' in validatedData ? validatedData.title : undefined,
      mood: 'mood' in validatedData ? validatedData.mood : undefined,
      instructions: 'instructions' in validatedData ? validatedData.instructions : undefined,
      pricePaid,
      deliveryHours,
    });

    // Auto-cancel order after 3 minutes if payment not completed
    setTimeout(async () => {
      try {
        const checkOrder = await prisma.order.findUnique({
          where: { id: order.id },
          select: { status: true }
        });

        // Cancel if still PENDING after 3 minutes
        if (checkOrder?.status === 'PENDING') {
          await prisma.order.update({
            where: { id: order.id },
            data: { status: 'CANCELLED' }
          });
          console.log(`[ORDER] Auto-cancelled order ${order.id} (payment timeout)`);
        }
      } catch (error) {
        console.error(`[ORDER] Auto-cancel failed for ${order.id}:`, error);
      }
    }, 3 * 60 * 1000); 

    return {
      success: true,
      orderId: order.id,
      amount: Number(order.pricePaid),
      currency: order.currency,
    };
  } catch (error) {
    console.error('[ORDER] Create error:', error);
    
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: 'Invalid form data. Please check your inputs.',
      };
    }

    return {
      success: false,
      error: 'Failed to create order. Please try again.',
    };
  }
}

/**
 * Create PayPal order
 */
export async function createPayPalOrderAction(orderId: string, amount: number) {
  try {
    const { createPayPalOrder } = await import('@/services/paypal');
    
    const paypalOrder = await createPayPalOrder(amount, 'USD');

    return {
      success: true,
      paypalOrderId: paypalOrder.id,
      orderId,
      approvalUrl: paypalOrder.approvalUrl
    };
  } catch (error) {
    console.error('[PAYPAL] Order creation error:', error);
    return {
      success: false,
      error: 'Failed to create PayPal order. Please try again.',
    };
  }
}

/**
 * Verify PayPal payment
 */
export async function verifyPayPalPaymentAction(orderId: string, paypalOrderId: string) {
  try {
    const { capturePayPalPayment } = await import('@/services/paypal');
    
    const captureResult = await capturePayPalPayment(paypalOrderId);

    if (captureResult.status !== 'COMPLETED') {
      // Mark as cancelled if payment failed
      await prisma.order.update({
        where: { id: orderId },
        data: { status: 'CANCELLED' }
      });

      return {
        success: false,
        error: 'Payment was not completed',
      };
    }

    // Update order: PENDING → PAID
    const order = await updateOrderPayment(orderId, {
      paymentProvider: 'PAYPAL',
      paymentId: paypalOrderId,
      paymentStatus: captureResult.status,
      pricePaid: parseFloat(captureResult.amount.value),
    });

    // Send payment confirmation email 
    try {
      await sendPaymentConfirmation(order.email, {
        orderId: order.id,
        amount: Number(order.pricePaid),
        currency: order.currency,
      });
      console.log('[EMAIL] Payment confirmation sent');
    } catch (emailError) {
      console.error('[EMAIL] Payment confirmation failed (non-critical):', emailError);
    }

    // Send admin notification
    try {
      await sendAdminOrderNotification({
        orderId: order.id,
        type: order.type,
        amount: Number(order.pricePaid),
        currency: order.currency,
        customerEmail: order.email,
        title: order.title,
        deliveryHours: order.deliveryHours,
      });
      console.log('[EMAIL] Admin notification sent');
    } catch (emailError) {
      console.error('[EMAIL] Admin notification failed (non-critical):', emailError);
    }

    return {
      success: true,
      accessToken: order.accessToken,
    };
  } catch (error) {
    console.error('[PAYPAL] Verification error:', error);
    
    // Mark as cancelled on error
    try {
      await prisma.order.update({
        where: { id: orderId },
        data: { status: 'CANCELLED' }
      });
    } catch (updateError) {
      console.error('[ORDER] Failed to mark as cancelled:', updateError);
    }

    return {
      success: false,
      error: 'Failed to verify payment. Please contact support.',
    };
  }
}

/**
 * Verify Paystack payment
 */
export async function verifyPaystackPaymentAction(orderId: string, reference: string) {
  try {
    const { verifyPaystackTransaction } = await import('@/services/paystack');
    
    const verification = await verifyPaystackTransaction(reference);

    if (verification.status !== 'success') {
      // Mark as cancelled if payment failed
      await prisma.order.update({
        where: { id: orderId },
        data: { status: 'CANCELLED' }
      });

      return {
        success: false,
        error: 'Payment verification failed',
      };
    }

    // Update order: PENDING → PAID
    const order = await updateOrderPayment(orderId, {
      paymentProvider: 'PAYSTACK',
      paymentId: reference,
      paymentStatus: verification.status,
      pricePaid: verification.amount,
    });

    // Send payment confirmation email 
    try {
      await sendPaymentConfirmation(order.email, {
        orderId: order.id,
        amount: Number(order.pricePaid),
        currency: order.currency,
      });
      console.log('[EMAIL] Payment confirmation sent');
    } catch (emailError) {
      console.error('[EMAIL] Payment confirmation failed (non-critical):', emailError);
    }

    // Send admin notification
    try {
      await sendAdminOrderNotification({
        orderId: order.id,
        type: order.type,
        amount: Number(order.pricePaid),
        currency: order.currency,
        customerEmail: order.email,
        title: order.title,
        deliveryHours: order.deliveryHours,
      });
      console.log('[EMAIL] Admin notification sent');
    } catch (emailError) {
      console.error('[EMAIL] Admin notification failed (non-critical):', emailError);
    }

    return {
      success: true,
      accessToken: order.accessToken,
    };
  } catch (error) {
    console.error('[PAYSTACK] Verification error:', error);
    
    // Mark as cancelled on error
    try {
      await prisma.order.update({
        where: { id: orderId },
        data: { status: 'CANCELLED' }
      });
    } catch (updateError) {
      console.error('[ORDER] Failed to mark as cancelled:', updateError);
    }

    return {
      success: false,
      error: 'Failed to verify payment. Please contact support.',
    };
  }
}

/**
 * Initialize Paystack transaction
 */
export async function initializePaystackPaymentAction(orderId: string, email: string, amount: number) {
  try {
    const { initializePaystackTransaction } = await import('@/services/paystack');
    
    // Normalize email before sending to Paystack
    const normalizedEmail = email.toLowerCase().trim();
    
    const result = await initializePaystackTransaction(
      normalizedEmail,
      amount,
      'KES',
      `NOC-${orderId}-${Date.now()}`
    );

    return {
      success: true,
      authorizationUrl: result.authorizationUrl,
      reference: result.reference,
    };
  } catch (error) {
    console.error('[PAYSTACK] Initialization error:', error);
    return {
      success: false,
      error: 'Failed to initialize payment. Please try again.',
    };
  }
}

/**
 * Create Stripe checkout session
 */
export async function createStripeSessionAction(orderId: string, email: string, amount: number) {
  try {
    // Normalize email before sending to Stripe
    const normalizedEmail = email.toLowerCase().trim();
    
    const successUrl = `${process.env.NEXT_PUBLIC_APP_URL}/payment/success?session_id={CHECKOUT_SESSION_ID}`;
    const cancelUrl = `${process.env.NEXT_PUBLIC_APP_URL}/payment/cancelled`;

    const result = await createStripeCheckoutSession(
      orderId,
      normalizedEmail,
      amount,
      'USD',
      successUrl,
      cancelUrl
    );

    if (!result.success || !result.url) {
      return {
        success: false,
        error: result.error || 'Failed to create Stripe session',
      };
    }

    return {
      success: true,
      url: result.url,
      sessionId: result.sessionId,
    };
  } catch (error) {
    console.error('[STRIPE] Session creation error:', error);
    return {
      success: false,
      error: 'Failed to initialize Stripe payment. Please try again.',
    };
  }
}

/**
 * Verify Stripe payment
 */
export async function verifyStripePaymentAction(sessionId: string) {
  try {
    const { stripe } = await import('@/services/stripe');
    
    // Retrieve the checkout session
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (session.payment_status !== 'paid') {
      const orderId = session.metadata?.orderId;
      
      // Mark as cancelled if payment failed
      if (orderId) {
        await prisma.order.update({
          where: { id: orderId },
          data: { status: 'CANCELLED' }
        });
      }

      return {
        success: false,
        error: 'Payment was not completed',
      };
    }

    const orderId = session.metadata?.orderId;
    if (!orderId) {
      return {
        success: false,
        error: 'Order ID not found',
      };
    }

    // Update order: PENDING → PAID
    const order = await updateOrderPayment(orderId, {
      paymentProvider: 'STRIPE',
      paymentId: session.payment_intent as string,
      paymentStatus: session.payment_status,
      pricePaid: (session.amount_total || 0) / 100,
    });

    // Send payment confirmation email
    try {
      await sendPaymentConfirmation(order.email, {
        orderId: order.id,
        amount: Number(order.pricePaid),
        currency: order.currency,
      });
      console.log('[EMAIL] Payment confirmation sent');
    } catch (emailError) {
      console.error('[EMAIL] Payment confirmation failed (non-critical):', emailError);
    }

    // Send admin notification
    try {
      await sendAdminOrderNotification({
        orderId: order.id,
        type: order.type,
        amount: Number(order.pricePaid),
        currency: order.currency,
        customerEmail: order.email,
        title: order.title,
        deliveryHours: order.deliveryHours,
      });
      console.log('[EMAIL] Admin notification sent');
    } catch (emailError) {
      console.error('[EMAIL] Admin notification failed (non-critical):', emailError);
    }

    return {
      success: true,
      accessToken: order.accessToken,
    };
  } catch (error) {
    console.error('[STRIPE] Verification error:', error);
    return {
      success: false,
      error: 'Failed to verify payment. Please contact support.',
    };
  }
}

/**
 * Manually cancel an order
 */
export async function cancelOrderAction(orderId: string) {
  try {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      select: { status: true }
    });

    // Allow cancelling PENDING or PAID orders
    if (!order || (order.status !== 'PENDING' && order.status !== 'PAID')) {
      return {
        success: false,
        error: 'Cannot cancel this order (already writing or delivered)'
      };
    }

    await prisma.order.update({
      where: { id: orderId },
      data: { status: 'CANCELLED' },
    });

    console.log(`[ORDER] Manually cancelled order ${orderId}`);

    return { success: true };
  } catch (error) {
    console.error('[ORDER] Cancel error:', error);
    return { 
      success: false,
      error: 'Failed to cancel order'
    };
  }
}