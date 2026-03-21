import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { prisma } from '@/lib/prisma';
import { sendPaymentConfirmation, sendAdminOrderNotification } from '@/services/email';

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const paystackSignature = request.headers.get('x-paystack-signature');

    if (!paystackSignature) {
      console.error('[PAYSTACK WEBHOOK] No signature provided');
      return NextResponse.json({ error: 'No signature' }, { status: 401 });
    }

    const hash = crypto
      .createHmac('sha512', process.env.PAYSTACK_SECRET_KEY!)
      .update(body)
      .digest('hex');

    if (hash !== paystackSignature) {
      console.error('[PAYSTACK WEBHOOK] Invalid signature');
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
    }

    const event = JSON.parse(body);
    console.log('[PAYSTACK WEBHOOK] Event received:', event.event);

    if (event.event === 'charge.success') {
      const { reference, customer, amount, currency } = event.data;

      console.log('[PAYSTACK WEBHOOK] Payment successful:', {
        reference,
        email: customer.email,
        amount: amount / 100,
        currency,
      });

      const paidAmount = amount / 100;

      const result = await prisma.order.updateMany({
        where: {
          paymentId: reference,
          status: 'PENDING',
        },
        data: {
          status: 'PAID',
          paidAt: new Date(),
          paymentStatus: 'success',
        },
      });

      if (result.count === 0) {
        console.log('[PAYSTACK WEBHOOK] Order already processed or not found');
        return NextResponse.json({ 
          success: true,
          message: 'Already processed or not found' 
        });
      }

      const order = await prisma.order.findFirst({
        where: { paymentId: reference },
      });

      if (!order) {
        console.error('[PAYSTACK WEBHOOK] Order not found after update');
        return NextResponse.json({ error: 'Order not found' }, { status: 404 });
      }

      const expectedAmount = Number(order.pricePaid);

      if (Math.abs(paidAmount - expectedAmount) > 0.01) {
        console.error('[PAYSTACK WEBHOOK] Amount mismatch:', {
          expected: expectedAmount,
          received: paidAmount,
        });
        
        await prisma.order.update({
          where: { id: order.id },
          data: { status: 'CANCELLED', paymentStatus: 'amount_mismatch' },
        });

        return NextResponse.json({ error: 'Amount mismatch' }, { status: 400 });
      }

      console.log('[PAYSTACK WEBHOOK] Order marked as PAID:', order.id);

      Promise.all([
        sendPaymentConfirmation(order.email, {
          accessToken: order.accessToken,
          amount: Number(order.pricePaid),
          currency: order.currency,
        }),
        sendAdminOrderNotification({
          orderId: order.id,
          type: order.type,
          amount: Number(order.pricePaid),
          currency: order.currency,
          customerEmail: order.email,
          title: order.title,
          deliveryHours: order.deliveryHours,
        }),
      ]).catch((error) => {
        console.error('[PAYSTACK WEBHOOK] Email error (non-critical):', error);
      });

      return NextResponse.json({ 
        success: true,
        message: 'Payment verified and order updated' 
      });
    }

    if (event.event === 'charge.failed') {
      const { reference } = event.data;

      console.log('[PAYSTACK WEBHOOK] Payment failed:', reference);

      await prisma.order.updateMany({
        where: {
          paymentId: reference,
          status: 'PENDING',
        },
        data: {
          status: 'CANCELLED',
          paymentStatus: 'failed',
        },
      });

      console.log('[PAYSTACK WEBHOOK] Order marked as CANCELLED');

      return NextResponse.json({ success: true });
    }

    console.log('[PAYSTACK WEBHOOK] Unhandled event:', event.event);
    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('[PAYSTACK WEBHOOK] Error:', error);
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
}