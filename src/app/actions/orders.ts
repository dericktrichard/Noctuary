'use server';

import { z } from 'zod';
import { createOrder, updateOrderPayment, getOrderCountByEmail } from '@/services/orders';
import { sendOrderConfirmation, sendPaymentConfirmation } from '@/services/email';
import { calculatePrice, calculateDeliveryHoursFromBudget } from '@/lib/pricing';

// Validation schemas
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
  budget: z.number().min(1.99).max(4.99),
  currency: z.enum(['USD', 'KES']),
});

type OrderInput = z.infer<typeof QuickPoemSchema> | z.infer<typeof CustomPoemSchema>;

/**
 * Create a new order (before payment)
 */
export async function createOrderAction(input: OrderInput) {
  try {
    // Validate input
    const validatedData = input.type === 'QUICK' 
      ? QuickPoemSchema.parse(input)
      : CustomPoemSchema.parse(input);

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
 * Verify PayPal payment and update order
 */
export async function verifyPayPalPaymentAction(orderId: string, paypalOrderId: string) {
  try {
    const { capturePayPalPayment } = await import('@/services/paypal');
    
    // Capture the payment
    const captureResult = await capturePayPalPayment(paypalOrderId);

    if (captureResult.status !== 'COMPLETED') {
      return {
        success: false,
        error: 'Payment was not completed',
      };
    }

    // Update order
    const order = await updateOrderPayment(orderId, {
      paymentProvider: 'PAYPAL',
      paymentId: paypalOrderId,
      paymentStatus: captureResult.status,
      pricePaid: parseFloat(captureResult.amount.value),
    });

    // Check if first-time customer
    const orderCount = await getOrderCountByEmail(order.email);
    const isFirstTime = orderCount === 1;

    // Send confirmation email
    await sendOrderConfirmation(order.email, {
      orderId: order.id,
      accessToken: order.accessToken,
      type: order.type,
      deliveryHours: order.deliveryHours,
      isFirstTime,
    });

    // Send payment confirmation
    await sendPaymentConfirmation(order.email, {
      orderId: order.id,
      amount: Number(order.pricePaid),
      currency: order.currency,
    });

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
    
    // Verify the transaction
    const verification = await verifyPaystackTransaction(reference);

    if (verification.status !== 'success') {
      return {
        success: false,
        error: 'Payment verification failed',
      };
    }

    // Update order
    const order = await updateOrderPayment(orderId, {
      paymentProvider: 'PAYSTACK',
      paymentId: reference,
      paymentStatus: verification.status,
      pricePaid: verification.amount,
    });

    // Check if first-time customer
    const orderCount = await getOrderCountByEmail(order.email);
    const isFirstTime = orderCount === 1;

    // Send confirmation email
    await sendOrderConfirmation(order.email, {
      orderId: order.id,
      accessToken: order.accessToken,
      type: order.type,
      deliveryHours: order.deliveryHours,
      isFirstTime,
    });

    // Send payment confirmation
    await sendPaymentConfirmation(order.email, {
      orderId: order.id,
      amount: Number(order.pricePaid),
      currency: order.currency,
    });

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
      `NOC-${orderId}`
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