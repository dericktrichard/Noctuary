'use server';

import { revalidatePath } from 'next/cache';
import {
  createSampleWork,
  updateSampleWork,
  deleteSampleWork,
  toggleSampleWorkVisibility,
} from '@/services/sample-works';

export async function createSampleWorkAction(data: {
  title: string;
  content: string;
  mood?: string;
  imageUrl?: string;
}) {
  try {
    const sampleWork = await createSampleWork(data);
    revalidatePath('/admin/dashboard/samples');
    revalidatePath('/');
    return {
      success: true,
      id: sampleWork.id,
    };
  } catch (error) {
    console.error('[SAMPLE_WORK] Create error:', error);
    return {
      success: false,
      error: 'Failed to create sample work',
    };
  }
}

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
    console.error('[SAMPLE_WORK] Update error:', error);
    return {
      success: false,
      error: 'Failed to update sample work',
    };
  }
}

export async function deleteSampleWorkAction(id: string) {
  try {
    await deleteSampleWork(id);
    revalidatePath('/admin/dashboard/samples');
    revalidatePath('/');
    return {
      success: true,
    };
  } catch (error) {
    console.error('[SAMPLE_WORK] Delete error:', error);
    return {
      success: false,
      error: 'Failed to delete sample work',
    };
  }
}

export async function toggleSampleWorkVisibilityAction(id: string) {
  try {
    await toggleSampleWorkVisibility(id);
    revalidatePath('/admin/dashboard/samples');
    revalidatePath('/');
    return {
      success: true,
    };
  } catch (error) {
    console.error('[SAMPLE_WORK] Toggle visibility error:', error);
    return {
      success: false,
      error: 'Failed to toggle visibility',
    };
  }
}