import 'server-only';
import { prisma } from '@/lib/prisma';
import { PoemType, OrderStatus, Currency, PaymentProvider } from '@prisma/client';

export async function createOrder(data: {
  email: string;
  type: 'QUICK' | 'CUSTOM';
  currency: 'USD' | 'KES';
  title?: string;
  mood?: string;
  instructions?: string;
  pricePaid: number;
  deliveryHours: number;
}) {
  const order = await prisma.order.create({
    data: {
      email: data.email.toLowerCase().trim(),
      type: data.type as PoemType,
      status: OrderStatus.PENDING,
      title: data.title?.trim(),
      mood: data.mood,
      instructions: data.instructions?.trim(),
      pricePaid: data.pricePaid,
      currency: data.currency as Currency,
      deliveryHours: data.deliveryHours,
    },
  });

  return order;
}

export async function getOrderById(orderId: string) {
  if (!orderId) {
    throw new Error('Order ID is required');
  }

  const order = await prisma.order.findUnique({
    where: { id: orderId },
  });

  return order;
}

export async function getOrderByAccessToken(accessToken: string) {
  if (!accessToken || accessToken.length < 32) {
    return null;
  }

  const order = await prisma.order.findUnique({
    where: { accessToken },
  });

  return order;
}

export async function updateOrderPayment(
  orderId: string,
  paymentData: {
    paymentProvider: 'PAYPAL' | 'PAYSTACK' | 'STRIPE';
    paymentId: string;
    paymentStatus: string;
    pricePaid: number;
  }
) {
  const order = await prisma.order.update({
    where: { id: orderId },
    data: {
      status: OrderStatus.PAID,
      paymentProvider: paymentData.paymentProvider as PaymentProvider,
      paymentId: paymentData.paymentId,
      paymentStatus: paymentData.paymentStatus,
      pricePaid: paymentData.pricePaid,
      paidAt: new Date(),
    },
  });

  return order;
}

export async function updateOrderStatus(orderId: string, status: OrderStatus) {
  const order = await prisma.order.update({
    where: { id: orderId },
    data: { status },
  });

  return order;
}

export async function deliverPoem(orderId: string, poemContent: string) {
  if (!poemContent || poemContent.trim().length < 20) {
    throw new Error('Poem content is too short');
  }

  const order = await prisma.order.update({
    where: { id: orderId },
    data: {
      status: OrderStatus.DELIVERED,
      poemContent: poemContent.trim(),
      deliveredAt: new Date(),
    },
  });

  return order;
}

export async function getAllOrders() {
  const orders = await prisma.order.findMany({
    orderBy: [
      { status: 'desc' },
      { type: 'desc' },
      { pricePaid: 'desc' },
      { createdAt: 'desc' },
    ],
  });

  return orders;
}

export async function getOrdersByStatus(status: OrderStatus) {
  const orders = await prisma.order.findMany({
    where: { status },
    orderBy: [
      { type: 'desc' },
      { pricePaid: 'desc' },
      { createdAt: 'asc' },
    ],
  });

  return orders;
}

export async function isFirstTimeCustomer(email: string): Promise<boolean> {
  const normalizedEmail = email.toLowerCase().trim();
  
  const orderCount = await prisma.order.count({
    where: { 
      email: normalizedEmail,
      status: {
        in: [OrderStatus.PAID, OrderStatus.WRITING, OrderStatus.DELIVERED],
      },
    },
  });

  return orderCount === 1;
}

export async function getDashboardStats() {
  const [total, pending, paid, writing, delivered, todayOrders] = await Promise.all([
    prisma.order.count(),
    prisma.order.count({ where: { status: OrderStatus.PENDING } }),
    prisma.order.count({ where: { status: OrderStatus.PAID } }),
    prisma.order.count({ where: { status: OrderStatus.WRITING } }),
    prisma.order.count({ where: { status: OrderStatus.DELIVERED } }),
    prisma.order.count({
      where: {
        createdAt: {
          gte: new Date(new Date().setHours(0, 0, 0, 0)),
        },
      },
    }),
  ]);

  return {
    total,
    pending,
    paid,
    writing,
    delivered,
    todayOrders,
  };
}