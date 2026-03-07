import 'server-only';
import { prisma } from '@/lib/prisma';

/**
 * Get admin statistics for settings page
 */
export async function getAdminStats() {
  try {
    const [totalOrders, deliveredOrders, pendingOrders] = await Promise.all([
      prisma.order.count(),
      prisma.order.count({ where: { status: 'DELIVERED' } }),
      prisma.order.count({ 
        where: { 
          status: { 
            in: ['PENDING', 'PAID', 'WRITING'] 
          } 
        } 
      }),
    ]);

    return {
      totalOrders,
      deliveredOrders,
      pendingOrders,
    };
  } catch (error) {
    console.error('[ADMIN] Stats error:', error);
    return {
      totalOrders: 0,
      deliveredOrders: 0,
      pendingOrders: 0,
    };
  }
}