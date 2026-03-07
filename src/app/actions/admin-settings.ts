'use server';

import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';
import { verifyAdminSession } from '@/lib/auth-server';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

/**
 * Update admin email
 */
export async function updateAdminEmailAction(newEmail: string, password: string) {
  try {
    // Verify admin session
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get('admin_session');

    if (!sessionCookie) {
      return { success: false, error: 'Not authenticated' };
    }

    const admin = await verifyAdminSession(sessionCookie.value);

    if (!admin) {
      return { success: false, error: 'Invalid session' };
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, admin.passwordHash);

    if (!isPasswordValid) {
      return { success: false, error: 'Incorrect password' };
    }

    // Check if new email is already in use
    const emailExists = await prisma.admin.findUnique({
      where: { email: newEmail.toLowerCase() },
    });

    if (emailExists && emailExists.id !== admin.id) {
      return { success: false, error: 'Email already in use' };
    }

    // Update email
    await prisma.admin.update({
      where: { id: admin.id },
      data: { email: newEmail.toLowerCase() },
    });

    // Clear session (force re-login)
    cookieStore.delete('admin_session');

    console.log(`[ADMIN] Email updated for admin ${admin.id}`);

    return { success: true };
  } catch (error) {
    console.error('[ADMIN] Update email error:', error);
    return { success: false, error: 'Failed to update email' };
  }
}

/**
 * Update admin password
 */
export async function updateAdminPasswordAction(currentPassword: string, newPassword: string) {
  try {
    // Verify admin session
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get('admin_session');

    if (!sessionCookie) {
      return { success: false, error: 'Not authenticated' };
    }

    const admin = await verifyAdminSession(sessionCookie.value);

    if (!admin) {
      return { success: false, error: 'Invalid session' };
    }

    // Verify current password
    const isPasswordValid = await bcrypt.compare(currentPassword, admin.passwordHash);

    if (!isPasswordValid) {
      return { success: false, error: 'Current password is incorrect' };
    }

    // Validate new password
    if (newPassword.length < 8) {
      return { success: false, error: 'Password must be at least 8 characters' };
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const newPasswordHash = await bcrypt.hash(newPassword, salt);

    // Update password
    await prisma.admin.update({
      where: { id: admin.id },
      data: { passwordHash: newPasswordHash },
    });

    // Generate new session token
    const newSessionToken = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30); // 30 days

    await prisma.adminSession.create({
      data: {
        adminId: admin.id,
        token: newSessionToken,
        expiresAt,
      },
    });

    // Update cookie with new session
    cookieStore.set('admin_session', newSessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      expires: expiresAt,
    });

    console.log(`[ADMIN] Password updated for admin ${admin.id}`);

    return { success: true };
  } catch (error) {
    console.error('[ADMIN] Update password error:', error);
    return { success: false, error: 'Failed to update password' };
  }
}