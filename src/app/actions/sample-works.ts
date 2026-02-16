'use server';

import { revalidatePath } from 'next/cache';
import {
  createSampleWork,
  updateSampleWork,
  deleteSampleWork,
  toggleSampleWorkVisibility,
} from '@/services/sample-works';

/**
 * Create a new sample work
 */
export async function createSampleWorkAction(data: {
  title: string;
  content: string;
  mood?: string;
  imageUrl?: string;
}) {
  try {
    const sampleWork = await createSampleWork(data);
    revalidatePath('/admin/dashboard/samples');
    return {
      success: true,
      id: sampleWork.id,
    };
  } catch (error) {
    console.error('Create sample work error:', error);
    return {
      success: false,
      error: 'Failed to create sample work',
    };
  }
}

/**
 * Update a sample work
 */
export async function updateSampleWorkAction(
  id: string,
  data: {
    title?: string;
    content?: string;
    mood?: string;
    imageUrl?: string;
    isVisible?: boolean;
  }
) {
  try {
    await updateSampleWork(id, data);
    revalidatePath('/admin/dashboard/samples');
    revalidatePath('/');
    return {
      success: true,
    };
  } catch (error) {
    console.error('Update sample work error:', error);
    return {
      success: false,
      error: 'Failed to update sample work',
    };
  }
}

/**
 * Delete a sample work
 */
export async function deleteSampleWorkAction(id: string) {
  try {
    await deleteSampleWork(id);
    revalidatePath('/admin/dashboard/samples');
    revalidatePath('/');
    return {
      success: true,
    };
  } catch (error) {
    console.error('Delete sample work error:', error);
    return {
      success: false,
      error: 'Failed to delete sample work',
    };
  }
}

/**
 * Toggle sample work visibility
 */
export async function toggleSampleWorkVisibilityAction(id: string) {
  try {
    await toggleSampleWorkVisibility(id);
    revalidatePath('/admin/dashboard/samples');
    revalidatePath('/');
    return {
      success: true,
    };
  } catch (error) {
    console.error('Toggle visibility error:', error);
    return {
      success: false,
      error: 'Failed to toggle visibility',
    };
  }
}