import 'server-only';
import { prisma } from '@/lib/prisma';

/**
 * Verify admin session from cookie value (admin ID)
 */
export async function verifyAdminSession(token: string) {
  try {
    const session = await prisma.adminSession.findUnique({
      where: { token },
      include: { 
        admin: {
          select: {
            id: true,
            name: true,
            email: true,
            passwordHash: true,
          }
        } 
      },
    });

    if (!session || session.expiresAt < new Date()) {
      return null;
    }

    return session.admin;
  } catch (error) {
    console.error('Session verification error:', error);
    return null;
  }
}

/**
 * Verify admin credentials and return admin if valid
 */
export async function verifyAdminCredentials(email: string, password: string) {
  try {
    const admin = await prisma.admin.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        name: true,
        passwordHash: true, 
      },
    });

    if (!admin) {
      return null;
    }

    // Import bcrypt for password verification
    const bcrypt = require('bcryptjs');
    const isValid = await bcrypt.compare(password, admin.passwordHash); 

    if (!isValid) {
      return null;
    }

    return {
      id: admin.id,
      email: admin.email,
      name: admin.name,
    };
  } catch (error) {
    console.error('[AUTH] Credential verification error:', error);
    return null;
  }
}