'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { verifyAdminCredentials } from '@/lib/auth-server';
import { deliverPoem } from '@/services/orders';
import { sendPoemDelivery } from '@/services/email';
import { 
  createSampleWork, 
  updateSampleWork, 
  deleteSampleWork, 
  toggleSampleWorkVisibility 
} from '@/services/sample-works';

/**
 * Admin login action
 */
export async function loginAdminAction(email: string, password: string) {
  try {
    // Verify credentials
    const admin = await verifyAdminCredentials(email, password);

    if (!admin) {
      return {
        success: false,
        error: 'Invalid email or password',
      };
    }

    // Set HTTP-only session cookie with admin ID
    const cookieStore = await cookies();
    cookieStore.set('admin_session', admin.id, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/',
    });

    return {
      success: true,
    };
  } catch (error) {
    console.error('[ADMIN] Login error:', error);
    return {
      success: false,
      error: 'Failed to login. Please try again.',
    };
  }
}

/**
 * Admin logout action
 */
export async function logoutAdminAction() {
  try {
    const cookieStore = await cookies();
    cookieStore.delete('admin_session');
    
    return {
      success: true,
    };
  } catch (error) {
    console.error('[ADMIN] Logout error:', error);
    return {
      success: false,
      error: 'Failed to logout',
    };
  }
}

/**
 * Deliver poem to customer
 */
export async function deliverPoemAction(orderId: string, poemContent: string) {
  try {
    // Deliver the poem (updates order status to DELIVERED)
    const order = await deliverPoem(orderId, poemContent);

    // Try to send email, but don't fail if it errors
    try {
      await sendPoemDelivery(order.email, {
        orderId: order.id,
        poemContent: order.poemContent!,
        accessToken: order.accessToken,
        title: order.title || `${order.type} Poem`,
      });
      console.log('[EMAIL] Poem delivery email sent successfully');
    } catch (emailError) {
      // Email failed but poem is delivered - this is non-critical
      console.error('[EMAIL] Failed to send delivery email (non-critical):', emailError);
    }

    // Revalidate the dashboard page to show updated order
    revalidatePath('/admin/dashboard');

    return {
      success: true,
    };
  } catch (error) {
    console.error('[ADMIN] Deliver poem error:', error);
    return {
      success: false,
      error: 'Failed to deliver poem. Please try again.',
    };
  }
}

/**
 * Create sample work
 */
export async function createSampleWorkAction(data: {
  title: string;
  content: string;
  mood?: string;
  imageUrl?: string;
  isVisible?: boolean;
}) {
  try {
    await createSampleWork(data);
    
    // Revalidate pages that show samples
    revalidatePath('/');
    revalidatePath('/admin/dashboard/samples');

    return {
      success: true,
    };
  } catch (error) {
    console.error('[ADMIN] Create sample work error:', error);
    return {
      success: false,
      error: 'Failed to create sample work. Please try again.',
    };
  }
}

/**
 * Update sample work
 */
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
    
    // Revalidate pages
    revalidatePath('/');
    revalidatePath('/admin/dashboard/samples');

    return {
      success: true,
    };
  } catch (error) {
    console.error('[ADMIN] Update sample work error:', error);
    return {
      success: false,
      error: 'Failed to update sample work. Please try again.',
    };
  }
}

/**
 * Delete sample work
 */
export async function deleteSampleWorkAction(id: string) {
  try {
    await deleteSampleWork(id);
    
    // Revalidate pages
    revalidatePath('/');
    revalidatePath('/admin/dashboard/samples');

    return {
      success: true,
    };
  } catch (error) {
    console.error('[ADMIN] Delete sample work error:', error);
    return {
      success: false,
      error: 'Failed to delete sample work. Please try again.',
    };
  }
}

/**
 * Toggle sample work visibility
 */
export async function toggleSampleWorkVisibilityAction(id: string) {
  try {
    await toggleSampleWorkVisibility(id);
    
    // Revalidate pages
    revalidatePath('/');
    revalidatePath('/admin/dashboard/samples');

    return {
      success: true,
    };
  } catch (error) {
    console.error('[ADMIN] Toggle visibility error:', error);
    return {
      success: false,
      error: 'Failed to toggle visibility. Please try again.',
    };
  }
}