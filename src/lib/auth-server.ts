import 'server-only';
import { prisma } from '@/lib/prisma';

/**
 * Verify admin session from cookie value (admin ID)
 * Returns admin if valid, null if invalid
 */
export async function verifyAdminSession(sessionValue: string) {
  try {
    // sessionValue is the admin ID from the cookie
    const admin = await prisma.admin.findUnique({
      where: {
        id: sessionValue,
      },
      select: {
        id: true,
        email: true,
        name: true,
      },
    });

    return admin;
  } catch (error) {
    console.error('[AUTH] Session verification error:', error);
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