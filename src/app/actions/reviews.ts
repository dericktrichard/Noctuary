'use server';

import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

const ReviewSchema = z.object({
  orderId: z.string().uuid(),
  email: z.string().email().transform(val => val.toLowerCase().trim()),
  name: z.string().max(50).trim().nullable(),
  rating: z.number().int().min(1).max(5),
  comment: z.string().min(10).max(500).trim(),
});

export async function submitReviewAction(input: z.infer<typeof ReviewSchema>) {
  try {
    const validated = ReviewSchema.parse(input);

    const order = await prisma.order.findUnique({
      where: { id: validated.orderId },
      select: { status: true, email: true },
    });

    if (!order || order.status !== 'DELIVERED') {
      return {
        success: false,
        error: 'Invalid order or order not delivered yet',
      };
    }

    const normalizedOrderEmail = order.email.toLowerCase().trim();
    if (normalizedOrderEmail !== validated.email) {
      return {
        success: false,
        error: 'Invalid order access',
      };
    }

    const existing = await prisma.testimonial.findUnique({
      where: { orderId: validated.orderId },
    });

    if (existing) {
      return {
        success: false,
        error: 'You have already submitted a review for this order',
      };
    }

    await prisma.testimonial.create({
      data: {
        orderId: validated.orderId,
        email: validated.email,
        name: validated.name,
        rating: validated.rating,
        comment: validated.comment,
        isVisible: false,
      },
    });

    revalidatePath('/');

    return { success: true };
  } catch (error) {
    console.error('[REVIEW] Submission error:', error);

    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: 'Invalid review data',
      };
    }

    return {
      success: false,
      error: 'Failed to submit review. Please try again.',
    };
  }
}