import 'server-only';
import { prisma } from '@/lib/prisma';

/**
 * Get all visible sample works
 */
export async function getVisibleSampleWorks() {
  const works = await prisma.sampleWork.findMany({
    where: { isVisible: true },
    orderBy: { createdAt: 'desc' }, // Show newest first
  });

  return works;
}

/**
 * Get all sample works (admin)
 */
export async function getAllSampleWorks() {
  const works = await prisma.sampleWork.findMany({
    orderBy: { createdAt: 'desc' },
  });

  return works;
}

/**
 * Get sample work by ID
 */
export async function getSampleWorkById(id: string) {
  const work = await prisma.sampleWork.findUnique({
    where: { id },
  });

  return work;
}

/**
 * Create sample work
 */
export async function createSampleWork(data: {
  title: string;
  content: string;
  mood: string;
  imageUrl?: string;
  isVisible?: boolean;
}) {
  const work = await prisma.sampleWork.create({
    data: {
      title: data.title,
      content: data.content,
      mood: data.mood,
      imageUrl: data.imageUrl,
      isVisible: data.isVisible ?? true,
    },
  });

  return work;
}

/**
 * Update sample work
 */
export async function updateSampleWork(
  id: string,
  data: {
    title?: string;
    content?: string;
    mood?: string;
    imageUrl?: string;
    isVisible?: boolean;
  }
) {
  const work = await prisma.sampleWork.update({
    where: { id },
    data,
  });

  return work;
}

/**
 * Delete sample work
 */
export async function deleteSampleWork(id: string) {
  const work = await prisma.sampleWork.delete({
    where: { id },
  });

  return work;
}

/**
 * Toggle visibility
 */
export async function toggleSampleWorkVisibility(id: string) {
  const currentWork = await prisma.sampleWork.findUnique({
    where: { id },
  });

  if (!currentWork) {
    throw new Error('Sample work not found');
  }

  const work = await prisma.sampleWork.update({
    where: { id },
    data: {
      isVisible: !currentWork.isVisible,
    },
  });

  return work;
}