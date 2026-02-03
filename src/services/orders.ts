import 'server-only';
import { prisma } from '@/lib/prisma';
import { calculateDeadline } from '@/lib/utils';
import { PoemType, Status } from '@prisma/client';
import type { CommissionInput } from '@/lib/validations/schemas';

/**
 * Create a new order
 */
export async function createOrder(data: CommissionInput) {
  const { type, email, paymentMethod, currency, ...details } = data;

  const urgency = type === 'CUSTOM' ? data.urgency : 24;
  const deadline = calculateDeadline(urgency);

  const order = await prisma.order.create({
    data: {
      email,
      type: type as PoemType,
      status: 'PENDING' as Status,
      topic: 'topic' in details ? details.topic : undefined,
      title: 'title' in details ? details.title : undefined,
      mood: 'mood' in details ? details.mood : undefined,
      recipient: 'recipient' in details ? details.recipient : undefined,
      instructions: 'instructions' in details ? details.instructions : undefined,
      urgency,
      pricePaid: 0, // Will be updated after payment verification
      currency,
      paymentMethod,
      paymentVerified: false,
      deadline,
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
export async function verifyPayment(
  orderId: string,
  paymentId: string,
  pricePaid: number
) {
  const order = await prisma.order.update({
    where: { id: orderId },
    data: {
      paymentVerified: true,
      paymentId,
      pricePaid,
    },
  });

  return order;
}

/**
 * Update order status
 */
export async function updateOrderStatus(orderId: string, status: Status) {
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
      status: 'DELIVERED' as Status,
      poemContent,
      deliveredAt: new Date(),
    },
  });

  return order;
}

/**
 * Get all orders (for admin dashboard)
 * Sorted by priority: Status > Type > Price > Deadline
 */
export async function getAllOrders() {
  const orders = await prisma.order.findMany({
    orderBy: [
      { status: 'asc' }, // PENDING first
      { type: 'desc' },  // CUSTOM before QUICK
      { pricePaid: 'desc' },
      { deadline: 'asc' },
    ],
  });

  return orders;
}

/**
 * Get orders by status
 */
export async function getOrdersByStatus(status: Status) {
  const orders = await prisma.order.findMany({
    where: { status },
    orderBy: [
      { type: 'desc' },
      { pricePaid: 'desc' },
      { deadline: 'asc' },
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
      paymentVerified: true,
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
      paymentVerified: true,
    },
  });
}

/**
 * Get recent orders for dashboard stats
 */
export async function getDashboardStats() {
  const [total, pending, writing, delivered, todayOrders] = await Promise.all([
    prisma.order.count(),
    prisma.order.count({ where: { status: 'PENDING' } }),
    prisma.order.count({ where: { status: 'WRITING' } }),
    prisma.order.count({ where: { status: 'DELIVERED' } }),
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
    writing,
    delivered,
    todayOrders,
  };
}
