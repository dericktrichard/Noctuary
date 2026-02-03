import 'server-only';
import { prisma } from '@/lib/prisma';
import type { SampleWorkInput, UpdateSampleWorkInput } from '@/lib/validations/schemas';

/**
 * Get all visible sample works for public display
 */
export async function getVisibleSampleWorks() {
  const works = await prisma.sampleWork.findMany({
    where: { isVisible: true },
    orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }],
  });

  return works;
}

/**
 * Get all sample works (for admin)
 */
export async function getAllSampleWorks() {
  const works = await prisma.sampleWork.findMany({
    orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }],
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
 * Create a new sample work
 */
export async function createSampleWork(data: SampleWorkInput) {
  const work = await prisma.sampleWork.create({
    data,
  });

  return work;
}

/**
 * Update an existing sample work
 */
export async function updateSampleWork(data: UpdateSampleWorkInput) {
  const { id, ...updateData } = data;

  const work = await prisma.sampleWork.update({
    where: { id },
    data: updateData,
  });

  return work;
}

/**
 * Delete a sample work
 */
export async function deleteSampleWork(id: string) {
  await prisma.sampleWork.delete({
    where: { id },
  });
}

/**
 * Toggle visibility of a sample work
 */
export async function toggleSampleWorkVisibility(id: string) {
  const work = await prisma.sampleWork.findUnique({
    where: { id },
    select: { isVisible: true },
  });

  if (!work) {
    throw new Error('Sample work not found');
  }

  return prisma.sampleWork.update({
    where: { id },
    data: { isVisible: !work.isVisible },
  });
}

/**
 * Reorder sample works
 */
export async function reorderSampleWorks(orderedIds: string[]) {
  const updates = orderedIds.map((id, index) =>
    prisma.sampleWork.update({
      where: { id },
      data: { sortOrder: index },
    })
  );

  await Promise.all(updates);
}

