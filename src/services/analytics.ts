import 'server-only';
import { prisma } from '@/lib/prisma';
import { OrderStatus } from '@prisma/client';

interface RevenueStats {
  revenue: {
    usd: {
      gross: number;
      fees: number;
      net: number;
    };
    kes: {
      gross: number;
      fees: number;
      net: number;
    };
  };
  byProvider: {
    paypal: number;
    paystack: number;
    stripe: number;
  };
  totalOrders: number;
}

export async function getRevenueStats(
  startDate?: Date,
  endDate?: Date
): Promise<RevenueStats> {
  const whereClause = {
    status: OrderStatus.DELIVERED,
    deliveredAt: {
      gte: startDate,
      lte: endDate,
    },
  };

  const orders = await prisma.order.findMany({
    where: whereClause,
    select: {
      pricePaid: true,
      currency: true,
      paymentProvider: true,
    },
  });

  let usdGross = 0;
  let kesGross = 0;
  let paypalCount = 0;
  let paystackCount = 0;
  let stripeCount = 0;

  orders.forEach((order) => {
    const amount = Number(order.pricePaid);

    if (order.currency === 'USD') {
      usdGross += amount;
    } else if (order.currency === 'KES') {
      kesGross += amount;
    }

    if (order.paymentProvider === 'PAYPAL') {
      paypalCount++;
    } else if (order.paymentProvider === 'PAYSTACK') {
      paystackCount++;
    } else if (order.paymentProvider === 'STRIPE') {
      stripeCount++;
    }
  });

  const paypalFees = usdGross * 0.029 + (paypalCount * 0.30);
  const paystackFees = kesGross * 0.035;
  const stripeFees = usdGross * 0.029 + (stripeCount * 0.30);

  const usdFees = paypalFees + stripeFees;
  const kesFees = paystackFees;

  return {
    revenue: {
      usd: {
        gross: usdGross,
        fees: usdFees,
        net: usdGross - usdFees,
      },
      kes: {
        gross: kesGross,
        fees: kesFees,
        net: kesGross - kesFees,
      },
    },
    byProvider: {
      paypal: paypalCount,
      paystack: paystackCount,
      stripe: stripeCount,
    },
    totalOrders: orders.length,
  };
}

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

  const headers = 'Order ID,Date,Customer,Type,Amount,Currency,Provider,Transaction ID,Delivered\n';
  const rows = orders.map(o => 
    `${o.id},${o.paidAt?.toISOString()},${o.email},${o.type},${o.pricePaid},${o.currency},${o.paymentProvider},${o.paymentId},${o.deliveredAt?.toISOString()}`
  ).join('\n');

  return headers + rows;
}