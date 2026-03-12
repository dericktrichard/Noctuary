import 'server-only';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export async function verifyAdminSession(token: string) {
  try {
    if (!token || token.length < 32) {
      return null;
    }

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
      if (session) {
        await prisma.adminSession.delete({ where: { id: session.id } }).catch(() => {});
      }
      return null;
    }

    return session.admin;
  } catch (error) {
    console.error('[AUTH] Session verification error:', error);
    return null;
  }
}

export async function verifyAdminCredentials(email: string, password: string) {
  try {
    if (!email || !password) {
      return null;
    }

    const normalizedEmail = email.toLowerCase().trim();

    const admin = await prisma.admin.findUnique({
      where: { email: normalizedEmail },
      select: {
        id: true,
        email: true,
        name: true,
        passwordHash: true, 
      },
    });

    if (!admin) {
      await new Promise(resolve => setTimeout(resolve, 100));
      return null;
    }

    const isValid = await bcrypt.compare(password, admin.passwordHash);

    if (!isValid) {
      await new Promise(resolve => setTimeout(resolve, 100));
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

export async function cleanupExpiredSessions() {
  try {
    const result = await prisma.adminSession.deleteMany({
      where: { expiresAt: { lt: new Date() } }
    });

    if (result.count > 0) {
      console.log(`[AUTH] Cleaned up ${result.count} expired sessions`);
    }

    return result.count;
  } catch (error) {
    console.error('[AUTH] Session cleanup error:', error);
    return 0;
  }
}