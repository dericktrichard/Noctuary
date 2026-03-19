import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const { orderId } = await request.json();

    if (!orderId) {
      return NextResponse.json({ error: 'Order ID required' }, { status: 400 });
    }

    // Only cancel if still PENDING (not if already PAID/WRITING/etc)
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      select: { status: true },
    });

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    if (order.status !== 'PENDING') {
      return NextResponse.json({ 
        success: false, 
        message: 'Order already processed' 
      });
    }

    await prisma.order.update({
      where: { id: orderId },
      data: { status: 'CANCELLED' },
    });

    console.log(`[AUTO-CANCEL] Order ${orderId} cancelled after timeout`);

    return NextResponse.json({ 
      success: true, 
      message: 'Order cancelled' 
    });
  } catch (error) {
    console.error('[AUTO-CANCEL] Error:', error);
    return NextResponse.json(
      { error: 'Failed to cancel order' },
      { status: 500 }
    );
  }
}