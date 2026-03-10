'use server';

import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';
import { verifyAdminSession } from '@/lib/auth-server';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

export async function updateAdminEmailAction(newEmail: string, password: string) {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get('admin_session');

    if (!sessionCookie) {
      return { success: false, error: 'Not authenticated' };
    }

    const admin = await verifyAdminSession(sessionCookie.value);

    if (!admin) {
      return { success: false, error: 'Invalid session' };
    }

    const isPasswordValid = await bcrypt.compare(password, admin.passwordHash);

    if (!isPasswordValid) {
      return { success: false, error: 'Incorrect password' };
    }

    const normalizedEmail = newEmail.toLowerCase().trim();

    const emailExists = await prisma.admin.findUnique({
      where: { email: normalizedEmail },
    });

    if (emailExists && emailExists.id !== admin.id) {
      return { success: false, error: 'Email already in use' };
    }

    await prisma.admin.update({
      where: { id: admin.id },
      data: { email: normalizedEmail },
    });

    await prisma.adminSession.deleteMany({
      where: { adminId: admin.id }
    });

    cookieStore.delete('admin_session');

    console.log(`[ADMIN] Email updated for admin ${admin.id}`);

    return { success: true };
  } catch (error) {
    console.error('[ADMIN] Update email error:', error);
    return { success: false, error: 'Failed to update email' };
  }
}

export async function updateAdminPasswordAction(currentPassword: string, newPassword: string) {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get('admin_session');

    if (!sessionCookie) {
      return { success: false, error: 'Not authenticated' };
    }

    const admin = await verifyAdminSession(sessionCookie.value);

    if (!admin) {
      return { success: false, error: 'Invalid session' };
    }

    const isPasswordValid = await bcrypt.compare(currentPassword, admin.passwordHash);

    if (!isPasswordValid) {
      return { success: false, error: 'Current password is incorrect' };
    }

    if (newPassword.length < 8) {
      return { success: false, error: 'Password must be at least 8 characters' };
    }

    const newPasswordHash = await bcrypt.hash(newPassword, 10);

    await prisma.admin.update({
      where: { id: admin.id },
      data: { passwordHash: newPasswordHash },
    });

    await prisma.adminSession.deleteMany({
      where: { adminId: admin.id }
    });

    const newSessionToken = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    await prisma.adminSession.create({
      data: {
        adminId: admin.id,
        token: newSessionToken,
        expiresAt,
      },
    });

    cookieStore.set('admin_session', newSessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7,
      path: '/',
    });

    console.log(`[ADMIN] Password updated for admin ${admin.id}`);

    return { success: true };
  } catch (error) {
    console.error('[ADMIN] Update password error:', error);
    return { success: false, error: 'Failed to update password' };
  }
}