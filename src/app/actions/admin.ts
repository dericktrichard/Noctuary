'use server';

import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';
import { verifyAdminCredentials, cleanupExpiredSessions } from '@/lib/auth-server';
import { deliverPoem } from '@/services/orders';
import { sendPoemDelivery } from '@/services/email';
import { 
  createSampleWork, 
  updateSampleWork, 
  deleteSampleWork, 
  toggleSampleWorkVisibility 
} from '@/services/sample-works';
import { prisma } from '@/lib/prisma';
import crypto from 'crypto';

export async function loginAdminAction(email: string, password: string) {
  try {
    const admin = await verifyAdminCredentials(email, password);

    if (!admin) {
      return {
        success: false,
        error: 'Invalid email or password',
      };
    }

    const sessionToken = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    await prisma.adminSession.create({
      data: {
        adminId: admin.id,
        token: sessionToken,
        expiresAt,
      },
    });

    const cookieStore = await cookies();
    cookieStore.set('admin_session', sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7,
      path: '/',
    });

    await cleanupExpiredSessions();

    return { success: true };
  } catch (error) {
    console.error('[ADMIN] Login error:', error);
    return {
      success: false,
      error: 'Failed to login. Please try again.',
    };
  }
}

export async function logoutAdminAction() {
  try {
    const cookieStore = await cookies();
    const sessionToken = cookieStore.get('admin_session');

    if (sessionToken) {
      await prisma.adminSession.deleteMany({
        where: { token: sessionToken.value },
      });
    }

    cookieStore.delete('admin_session');
    
    return { success: true };
  } catch (error) {
    console.error('[ADMIN] Logout error:', error);
    return {
      success: false,
      error: 'Failed to logout',
    };
  }
}

export async function deliverPoemAction(orderId: string, poemContent: string) {
  try {
    const order = await deliverPoem(orderId, poemContent);

    try {
      await sendPoemDelivery(order.email, {
        orderId: order.id,
        poemContent: order.poemContent!,
        accessToken: order.accessToken,
        title: order.title || `${order.type} Poem`,
      });
      console.log('[EMAIL] Poem delivery email sent successfully');
    } catch (emailError) {
      console.error('[EMAIL] Failed to send delivery email (non-critical):', emailError);
    }

    revalidatePath('/admin/dashboard');

    return { success: true };
  } catch (error) {
    console.error('[ADMIN] Deliver poem error:', error);
    return {
      success: false,
      error: 'Failed to deliver poem. Please try again.',
    };
  }
}

export async function createSampleWorkAction(data: {
  title: string;
  content: string;
  mood?: string;
  imageUrl?: string;
  isVisible?: boolean;
}) {
  try {
    await createSampleWork(data);
    
    revalidatePath('/');
    revalidatePath('/admin/dashboard/samples');

    return { success: true };
  } catch (error) {
    console.error('[ADMIN] Create sample work error:', error);
    return {
      success: false,
      error: 'Failed to create sample work. Please try again.',
    };
  }
}

export async function updateSampleWorkAction(
  id: string,
  data: {
    title: string;
    content: string;
    mood?: string;
    imageUrl?: string;
    isVisible?: boolean;
  }
) {
  try {
    await updateSampleWork(id, data);
    
    revalidatePath('/');
    revalidatePath('/admin/dashboard/samples');

    return { success: true };
  } catch (error) {
    console.error('[ADMIN] Update sample work error:', error);
    return {
      success: false,
      error: 'Failed to update sample work. Please try again.',
    };
  }
}

export async function deleteSampleWorkAction(id: string) {
  try {
    await deleteSampleWork(id);
    
    revalidatePath('/');
    revalidatePath('/admin/dashboard/samples');

    return { success: true };
  } catch (error) {
    console.error('[ADMIN] Delete sample work error:', error);
    return {
      success: false,
      error: 'Failed to delete sample work. Please try again.',
    };
  }
}

export async function toggleSampleWorkVisibilityAction(id: string) {
  try {
    await toggleSampleWorkVisibility(id);
    
    revalidatePath('/');
    revalidatePath('/admin/dashboard/samples');

    return { success: true };
  } catch (error) {
    console.error('[ADMIN] Toggle visibility error:', error);
    return {
      success: false,
      error: 'Failed to toggle visibility. Please try again.',
    };
  }
}

export async function toggleTestimonialVisibilityAction(id: string) {
  try {
    const testimonial = await prisma.testimonial.findUnique({
      where: { id },
      select: { isVisible: true },
    });

    if (!testimonial) {
      return { success: false, error: 'Testimonial not found' };
    }

    await prisma.testimonial.update({
      where: { id },
      data: { isVisible: !testimonial.isVisible },
    });

    revalidatePath('/');
    revalidatePath('/admin/dashboard/testimonials');

    return { success: true };
  } catch (error) {
    console.error('[ADMIN] Toggle testimonial error:', error);
    return { success: false, error: 'Failed to update' };
  }
}

export async function deleteTestimonialAction(id: string) {
  try {
    await prisma.testimonial.delete({
      where: { id },
    });

    revalidatePath('/');
    revalidatePath('/admin/dashboard/testimonials');

    return { success: true };
  } catch (error) {
    console.error('[ADMIN] Delete testimonial error:', error);
    return { success: false, error: 'Failed to delete' };
  }
}

export async function acceptOrderAction(orderId: string) {
  try {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      select: { status: true }
    });

    if (!order || order.status !== 'PAID') {
      return {
        success: false,
        error: 'Can only accept PAID orders'
      };
    }

    await prisma.order.update({
      where: { id: orderId },
      data: { 
        status: 'WRITING',
        writingStartedAt: new Date()
      }
    });

    revalidatePath('/admin/dashboard');
    revalidatePath('/admin/dashboard/orders');

    return { success: true };
  } catch (error) {
    console.error('[ADMIN] Accept order error:', error);
    return {
      success: false,
      error: 'Failed to accept order. Please try again.'
    };
  }
}

export async function rejectOrderAction(orderId: string, reason: string) {
  try {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      select: { status: true, instructions: true }
    });

    if (!order || order.status !== 'PAID') {
      return {
        success: false,
        error: 'Can only reject PAID orders'
      };
    }

    await prisma.order.update({
      where: { id: orderId },
      data: { 
        status: 'CANCELLED',
        instructions: `[REJECTED: ${reason}]\n\n${order.instructions || ''}`
      }
    });

    console.log(`[ADMIN] Order ${orderId} rejected: ${reason}`);

    revalidatePath('/admin/dashboard');
    revalidatePath('/admin/dashboard/orders');

    return { success: true };
  } catch (error) {
    console.error('[ADMIN] Reject order error:', error);
    return {
      success: false,
      error: 'Failed to reject order. Please try again.'
    };
  }
}