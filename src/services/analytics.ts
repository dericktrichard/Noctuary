import 'server-only';
import { prisma } from '@/lib/prisma';
import { OrderStatus } from '@prisma/client';

//Get revenue statistics
export async function getRevenueStats(startDate?: Date, endDate?: Date) {
  const where = {
    status: OrderStatus.DELIVERED, // Use enum instead of string
    paidAt: {
      gte: startDate || new Date(0),
      lte: endDate || new Date(),
    },
  };

  const orders = await prisma.order.findMany({
    where,
    select: {
      pricePaid: true,
      currency: true,
      paymentProvider: true,
      paidAt: true,
    },
  });

  // Separate by currency
  const usdOrders = orders.filter(o => o.currency === 'USD');
  const kesOrders = orders.filter(o => o.currency === 'KES');

  const usdRevenue = usdOrders.reduce((sum, o) => sum + Number(o.pricePaid), 0);
  const kesRevenue = kesOrders.reduce((sum, o) => sum + Number(o.pricePaid), 0);

  // Payment provider fees (approximate)
  const paypalFee = usdOrders
    .filter(o => o.paymentProvider === 'PAYPAL')
    .reduce((sum, o) => sum + (Number(o.pricePaid) * 0.029 + 0.30), 0);

  const paystackFee = kesOrders
    .filter(o => o.paymentProvider === 'PAYSTACK')
    .reduce((sum, o) => sum + (Number(o.pricePaid) * 0.035), 0);

  return {
    totalOrders: orders.length,
    revenue: {
      usd: {
        gross: usdRevenue,
        fees: paypalFee,
        net: usdRevenue - paypalFee,
      },
      kes: {
        gross: kesRevenue,
        fees: paystackFee,
        net: kesRevenue - paystackFee,
      },
    },
    byProvider: {
      paypal: usdOrders.length,
      paystack: kesOrders.length,
    },
  };
}

//Export transactions for accounting
export async function exportTransactions(format: 'csv' | 'json' = 'csv') {
  const orders = await prisma.order.findMany({
    where: { status: OrderStatus.DELIVERED },
    orderBy: { paidAt: 'desc' },
    select: {
      id: true,
      email: true,
      type: true,
      pricePaid: true,
      currency: true,
      paymentProvider: true,
      paymentId: true,
      paidAt: true,
      deliveredAt: true,
    },
  });

  if (format === 'json') {
    return orders;
  }

  // CSV format for Excel/accounting software
  const headers = 'Order ID,Date,Customer,Type,Amount,Currency,Provider,Transaction ID,Delivered\n';
  const rows = orders.map(o => 
    `${o.id},${o.paidAt?.toISOString()},${o.email},${o.type},${o.pricePaid},${o.currency},${o.paymentProvider},${o.paymentId},${o.deliveredAt?.toISOString()}`
  ).join('\n');

  return headers + rows;
}