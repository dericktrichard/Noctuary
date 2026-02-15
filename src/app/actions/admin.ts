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