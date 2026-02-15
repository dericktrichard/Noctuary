'use server';

import { z } from 'zod';
import { verifyPassword, createAdminSession, destroyAdminSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

/**
 * Admin login
 */
export async function loginAdminAction(email: string, password: string) {
  try {
    const validated = LoginSchema.parse({ email, password });

    const admin = await prisma.admin.findUnique({
      where: { email: validated.email },
    });

    if (!admin) {
      return {
        success: false,
        error: 'Invalid credentials',
      };
    }

    const isValid = await verifyPassword(validated.password, admin.passwordHash);

    if (!isValid) {
      return {
        success: false,
        error: 'Invalid credentials',
      };
    }

    await createAdminSession(admin.id);

    return {
      success: true,
    };
  } catch (error) {
    console.error('Admin login error:', error);
    return {
      success: false,
      error: 'Login failed',
    };
  }
}

/**
 * Admin logout
 */
export async function logoutAdminAction() {
  await destroyAdminSession();
  return { success: true };
}

/**
 * Deliver poem to customer
 */
export async function deliverPoemAction(orderId: string, poemContent: string) {
  try {
    const { deliverPoem } = await import('@/services/orders');
    const { sendPoemDelivery } = await import('@/services/email');

    const order = await deliverPoem(orderId, poemContent);

    // Send delivery email
    await sendPoemDelivery(order.email, {
      orderId: order.id,
      accessToken: order.accessToken,
      title: order.title || undefined,
      poemContent: order.poemContent!,
    });

    return {
      success: true,
    };
  } catch (error) {
    console.error('Deliver poem error:', error);
    return {
      success: false,
      error: 'Failed to deliver poem',
    };
  }
}