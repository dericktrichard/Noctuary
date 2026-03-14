import 'server-only';
import { prisma } from '@/lib/prisma';

export async function getVisibleSampleWorks() {
  return prisma.sampleWork.findMany({
    where: { isVisible: true },
    orderBy: { createdAt: 'desc' },
  });
}

export async function getSampleWorks() {
  return prisma.sampleWork.findMany({
    orderBy: { createdAt: 'desc' },
  });
}

export async function getSampleWorkById(id: string) {
  return prisma.sampleWork.findUnique({
    where: { id },
  });
}

export async function createSampleWork(data: {
  title: string;
  content: string;
  mood?: string;
  imageUrl?: string;
}) {
  return prisma.sampleWork.create({
    data: {
      title: data.title,
      content: data.content,
      mood: data.mood || null,
      imageUrl: data.imageUrl || '',
      isVisible: true,
    },
  });
}

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
  return prisma.sampleWork.update({
    where: { id },
    data,
  });
}

export async function deleteSampleWork(id: string) {
  return prisma.sampleWork.delete({
    where: { id },
  });
}

export async function toggleSampleWorkVisibility(id: string) {
  const work = await getSampleWorkById(id);
  if (!work) throw new Error('Sample work not found');

  return prisma.sampleWork.update({
    where: { id },
    data: { isVisible: !work.isVisible },
  });
}