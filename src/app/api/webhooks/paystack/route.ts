import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const paystackSignature = request.headers.get('x-paystack-signature');

    if (!paystackSignature) {
      console.error('[PAYSTACK WEBHOOK] No signature provided');
      return NextResponse.json({ error: 'No signature' }, { status: 401 });
    }

    // Verify Paystack signature
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

    // Handle charge.success event (payment completed)
    if (event.event === 'charge.success') {
      const { reference, customer, amount, currency } = event.data;

      console.log('[PAYSTACK WEBHOOK] Payment successful:', {
        reference,
        email: customer.email,
        amount: amount / 100, // Paystack sends amount in kobo/cents
        currency,
      });

      // Find order by payment reference
      const order = await prisma.order.findFirst({
        where: {
          paymentId: reference,
          status: 'PENDING',
        },
      });

      if (!order) {
        console.error('[PAYSTACK WEBHOOK] Order not found for reference:', reference);
        return NextResponse.json({ error: 'Order not found' }, { status: 404 });
      }

      // Verify amount matches (convert from kobo to main currency)
      const paidAmount = amount / 100;
      const expectedAmount = Number(order.pricePaid);

      if (Math.abs(paidAmount - expectedAmount) > 0.01) {
        console.error('[PAYSTACK WEBHOOK] Amount mismatch:', {
          expected: expectedAmount,
          received: paidAmount,
        });
        return NextResponse.json({ error: 'Amount mismatch' }, { status: 400 });
      }

      // Update order to PAID
      await prisma.order.update({
        where: { id: order.id },
        data: {
          status: 'PAID',
          paidAt: new Date(),
          paymentStatus: 'success',
        },
      });

      console.log('[PAYSTACK WEBHOOK] Order marked as PAID:', order.id);

      return NextResponse.json({ 
        success: true,
        message: 'Payment verified and order updated' 
      });
    }

    // Handle failed payments
    if (event.event === 'charge.failed') {
      const { reference } = event.data;

      console.log('[PAYSTACK WEBHOOK] Payment failed:', reference);

      const order = await prisma.order.findFirst({
        where: {
          paymentId: reference,
        },
      });

      if (order) {
        await prisma.order.update({
          where: { id: order.id },
          data: {
            status: 'CANCELLED',
            paymentStatus: 'failed',
          },
        });

        console.log('[PAYSTACK WEBHOOK] Order marked as CANCELLED:', order.id);
      }

      return NextResponse.json({ success: true });
    }

    // Acknowledge other events
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