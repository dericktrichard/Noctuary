import 'server-only';
import { prisma } from '@/lib/prisma';
import { PoemType, OrderStatus, Currency, PaymentProvider } from '@prisma/client';

/**
 * Create a new order
 */
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
      email: data.email,
      type: data.type as PoemType,
      status: OrderStatus.PENDING,
      title: data.title,
      mood: data.mood,
      instructions: data.instructions,
      pricePaid: data.pricePaid,
      currency: data.currency as Currency,
      deliveryHours: data.deliveryHours,
    },
  });

  return order;
}

/**
 * Get order by ID
 */
export async function getOrderById(orderId: string) {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
  });

  return order;
}

/**
 * Get order by access token (magic link)
 */
export async function getOrderByAccessToken(accessToken: string) {
  const order = await prisma.order.findUnique({
    where: { accessToken },
  });

  return order;
}

/**
 * Get order by ID and email (for client access)
 */
export async function getOrderByIdAndEmail(orderId: string, email: string) {
  const order = await prisma.order.findFirst({
    where: {
      id: orderId,
      email,
    },
  });

  return order;
}

/**
 * Update order after payment verification
 */
export async function updateOrderPayment(
  orderId: string,
  paymentData: {
    paymentProvider: 'PAYPAL' | 'PAYSTACK';
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

/**
 * Update order status
 */
export async function updateOrderStatus(orderId: string, status: OrderStatus) {
  const order = await prisma.order.update({
    where: { id: orderId },
    data: { status },
  });

  return order;
}

/**
 * Deliver poem to client
 */
export async function deliverPoem(orderId: string, poemContent: string) {
  const order = await prisma.order.update({
    where: { id: orderId },
    data: {
      status: OrderStatus.DELIVERED,
      poemContent,
      deliveredAt: new Date(),
    },
  });

  return order;
}

/**
 * Get all orders (for admin dashboard)
 * Sorted by priority: Status > Type > Price > Created
 */
export async function getAllOrders() {
  const orders = await prisma.order.findMany({
    orderBy: [
      { status: 'asc' },     // PENDING first
      { type: 'desc' },      // CUSTOM before QUICK
      { pricePaid: 'desc' }, // Higher price first
      { createdAt: 'asc' },  // Oldest first
    ],
  });

  return orders;
}

/**
 * Get orders by status
 */
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

/**
 * Check if email is a first-time customer
 */
export async function isFirstTimeCustomer(email: string): Promise<boolean> {
  const orderCount = await prisma.order.count({
    where: { 
      email,
      status: {
        in: [OrderStatus.PAID, OrderStatus.WRITING, OrderStatus.DELIVERED],
      },
    },
  });

  return orderCount === 1;
}

/**
 * Get order count by email
 */
export async function getOrderCountByEmail(email: string): Promise<number> {
  return prisma.order.count({
    where: { 
      email,
      status: {
        in: [OrderStatus.PAID, OrderStatus.WRITING, OrderStatus.DELIVERED],
      },
    },
  });
}

/**
 * Get dashboard stats
 */
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