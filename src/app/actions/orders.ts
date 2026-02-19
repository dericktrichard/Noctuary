'use server';

import { z } from 'zod';
import { headers } from 'next/headers';
import { checkOrderRateLimit } from '@/lib/rate-limit';
import { createOrder, updateOrderPayment, getOrderCountByEmail } from '@/services/orders';
import { sendOrderConfirmation, sendPaymentConfirmation } from '@/services/email';
import { calculatePrice, calculateDeliveryHoursFromBudget } from '@/lib/pricing';

// Validation schemas - UPDATED to accept both USD and KES ranges
const QuickPoemSchema = z.object({
  type: z.literal('QUICK'),
  email: z.string().email(),
  currency: z.enum(['USD', 'KES']),
});

const CustomPoemSchema = z.object({
  type: z.literal('CUSTOM'),
  email: z.string().email(),
  title: z.string().min(3).max(100),
  mood: z.string().min(1),
  instructions: z.string().optional(),
  budget: z.number().min(0.99).max(1000), // Accept wide range, validate currency-specific later
  currency: z.enum(['USD', 'KES']),
});

type OrderInput = z.infer<typeof QuickPoemSchema> | z.infer<typeof CustomPoemSchema>;

/**
 * Create a new order (before payment)
 */

export async function createOrderAction(input: OrderInput) {
  try {
    // Rate limiting
    const headersList = await headers();
    const ip = headersList.get('x-forwarded-for') || 'unknown';
    const identifier = `${ip}-${input.email}`;
    
    const rateLimit = await checkOrderRateLimit(identifier);
    if (!rateLimit.success) {
      return {
        success: false,
        error: 'Too many orders. Please try again in an hour.',
      };
    }

    // Validate input
    const validatedData = input.type === 'QUICK' 
      ? QuickPoemSchema.parse(input)
      : CustomPoemSchema.parse(input);

    // Currency-specific validation for custom poems
    if (validatedData.type === 'CUSTOM') {
      const customData = validatedData as z.infer<typeof CustomPoemSchema>;
      
      // Validate budget based on currency
      if (customData.currency === 'USD') {
        if (customData.budget < 1.99 || customData.budget > 4.99) {
          return {
            success: false,
            error: 'USD budget must be between $1.99 and $4.99',
          };
        }
      } else if (customData.currency === 'KES') {
        if (customData.budget < 260 || customData.budget > 650) {
          return {
            success: false,
            error: 'KES budget must be between Ksh 260 and Ksh 650',
          };
        }
      }
    }

    // Calculate pricing
    let pricePaid: number;
    let deliveryHours: number;

    if (validatedData.type === 'QUICK') {
      pricePaid = calculatePrice('QUICK', validatedData.currency);
      deliveryHours = 24;
    } else {
      const customData = validatedData as z.infer<typeof CustomPoemSchema>;
      pricePaid = customData.budget;
      deliveryHours = calculateDeliveryHoursFromBudget(customData.budget, validatedData.currency);
    }

    // Create order
    const order = await createOrder({
      email: validatedData.email,
      type: validatedData.type,
      currency: validatedData.currency,
      title: 'title' in validatedData ? validatedData.title : undefined,
      mood: 'mood' in validatedData ? validatedData.mood : undefined,
      instructions: 'instructions' in validatedData ? validatedData.instructions : undefined,
      pricePaid,
      deliveryHours,
    });

    return {
      success: true,
      orderId: order.id,
      amount: Number(order.pricePaid),
      currency: order.currency,
    };
  } catch (error) {
    console.error('Create order error:', error);
    
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
 * Create PayPal order (server-side)
 */
export async function createPayPalOrderAction(orderId: string, amount: number) {
  try {
    const { createPayPalOrder } = await import('@/services/paypal');
    
    const paypalOrder = await createPayPalOrder(amount, 'USD');

    return {
      success: true,
      paypalOrderId: paypalOrder.id,
      orderId,
    };
  } catch (error) {
    console.error('PayPal order creation error:', error);
    return {
      success: false,
      error: 'Failed to create PayPal order. Please try again.',
    };
  }
}

/**
 * Verify PayPal payment and update order
 */
export async function verifyPayPalPaymentAction(orderId: string, paypalOrderId: string) {
  try {
    const { capturePayPalPayment } = await import('@/services/paypal');
    
    const captureResult = await capturePayPalPayment(paypalOrderId);

    if (captureResult.status !== 'COMPLETED') {
      return {
        success: false,
        error: 'Payment was not completed',
      };
    }

    const order = await updateOrderPayment(orderId, {
      paymentProvider: 'PAYPAL',
      paymentId: paypalOrderId,
      paymentStatus: captureResult.status,
      pricePaid: parseFloat(captureResult.amount.value),
    });

    const orderCount = await getOrderCountByEmail(order.email);
    const isFirstTime = orderCount === 1;

    try {
      await sendOrderConfirmation(order.email, {
        orderId: order.id,
        accessToken: order.accessToken,
        type: order.type,
        deliveryHours: order.deliveryHours,
        isFirstTime,
      });

      await sendPaymentConfirmation(order.email, {
        orderId: order.id,
        amount: Number(order.pricePaid),
        currency: order.currency,
      });
    } catch (emailError) {
      console.error('Email notification failed (non-critical):', emailError);
    }

    return {
      success: true,
      accessToken: order.accessToken,
    };
  } catch (error) {
    console.error('PayPal verification error:', error);
    return {
      success: false,
      error: 'Failed to verify payment. Please contact support.',
    };
  }
}

/**
 * Verify Paystack payment and update order
 */
export async function verifyPaystackPaymentAction(orderId: string, reference: string) {
  try {
    const { verifyPaystackTransaction } = await import('@/services/paystack');
    
    const verification = await verifyPaystackTransaction(reference);

    if (verification.status !== 'success') {
      return {
        success: false,
        error: 'Payment verification failed',
      };
    }

    const order = await updateOrderPayment(orderId, {
      paymentProvider: 'PAYSTACK',
      paymentId: reference,
      paymentStatus: verification.status,
      pricePaid: verification.amount,
    });

    const orderCount = await getOrderCountByEmail(order.email);
    const isFirstTime = orderCount === 1;

    try {
      await sendOrderConfirmation(order.email, {
        orderId: order.id,
        accessToken: order.accessToken,
        type: order.type,
        deliveryHours: order.deliveryHours,
        isFirstTime,
      });

      await sendPaymentConfirmation(order.email, {
        orderId: order.id,
        amount: Number(order.pricePaid),
        currency: order.currency,
      });
    } catch (emailError) {
      console.error('Email notification failed (non-critical):', emailError);
    }

    return {
      success: true,
      accessToken: order.accessToken,
    };
  } catch (error) {
    console.error('Paystack verification error:', error);
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
    
    const result = await initializePaystackTransaction(
      email,
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
    console.error('Paystack initialization error:', error);
    return {
      success: false,
      error: 'Failed to initialize payment. Please try again.',
    };
  }
}