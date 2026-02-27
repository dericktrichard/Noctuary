'use server';

import { z } from 'zod';
import { headers } from 'next/headers';
import { checkOrderRateLimit } from '@/lib/rate-limit';
import { createOrder, updateOrderPayment, getOrderCountByEmail } from '@/services/orders';
import { sendPaymentConfirmation } from '@/services/email';
import { getCurrentPricing } from './pricing';
import { prisma } from '@/lib/prisma';

// Validation schemas - Accept wide range, validate dynamically
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
  budget: z.number().min(0.5).max(1000), 
  currency: z.enum(['USD', 'KES']),
});

type OrderInput = z.infer<typeof QuickPoemSchema> | z.infer<typeof CustomPoemSchema>;

export async function createOrderAction(input: OrderInput) {
  try {
    // Rate limiting
    const headersList = await headers();
    const ip = headersList.get('x-forwarded-for') || 'unknown';
    const identifier = input.email; // Rate limit by email instead of IP
    
    const rateLimit = await checkOrderRateLimit(identifier);
    if (!rateLimit.success) {
      return {
        success: false,
        error: 'You have reached the maximum number of orders (5) per day. Please try again tomorrow.',
      };
    }

    // Validate input
    const validatedData = input.type === 'QUICK' 
      ? QuickPoemSchema.parse(input)
      : CustomPoemSchema.parse(input);

    // Get current pricing with live exchange rates
    const pricing = await getCurrentPricing();

    // Currency-specific validation for custom poems
    if (validatedData.type === 'CUSTOM') {
      const customData = validatedData as z.infer<typeof CustomPoemSchema>;
      
      // Validate budget based on currency with dynamic pricing
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
      
      // Calculate delivery hours
      const min = customData.currency === 'USD' ? pricing.custom.minUsd : pricing.custom.minKes;
      const max = customData.currency === 'USD' ? pricing.custom.maxUsd : pricing.custom.maxKes;
      const ratio = (pricePaid - min) / (max - min);
      deliveryHours = Math.round(12 - (ratio * 6)); // 12h to 6h
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

// Create PayPal order (server-side)
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

// Verify PayPal payment and update order
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

    // Update order with payment info
    const order = await updateOrderPayment(orderId, {
      paymentProvider: 'PAYPAL',
      paymentId: paypalOrderId,
      paymentStatus: captureResult.status,
      pricePaid: parseFloat(captureResult.amount.value),
    });

    // Send ONLY payment confirmation email 
    try {
      await sendPaymentConfirmation(order.email, {
        orderId: order.id,
        amount: Number(order.pricePaid),
        currency: order.currency,
      });
      console.log('[EMAIL] Payment confirmation sent successfully');
    } catch (emailError) {
      console.error('[EMAIL] Payment confirmation failed (non-critical):', emailError);
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

// Verify Paystack payment and update order
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

    // Update order with payment info
    const order = await updateOrderPayment(orderId, {
      paymentProvider: 'PAYSTACK',
      paymentId: reference,
      paymentStatus: verification.status,
      pricePaid: verification.amount,
    });

    // Send ONLY payment confirmation email 
    try {
      await sendPaymentConfirmation(order.email, {
        orderId: order.id,
        amount: Number(order.pricePaid),
        currency: order.currency,
      });
      console.log('[EMAIL] Payment confirmation sent successfully');
    } catch (emailError) {
      console.error('[EMAIL] Payment confirmation failed (non-critical):', emailError);
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

// Initialize Paystack transaction
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

// Cancel an order
export async function cancelOrderAction(orderId: string) {
  try {
    // Update order status to CANCELLED
    await prisma.order.update({
      where: { id: orderId },
      data: { status: 'CANCELLED' },
    });

    return { success: true };
  } catch (error) {
    console.error('Cancel order error:', error);
    return { success: false };
  }
}