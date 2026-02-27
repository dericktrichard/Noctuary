'use server';

import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

const ReviewSchema = z.object({
  orderId: z.string().uuid(),
  email: z.string().email(),
  name: z.string().max(50).nullable(),
  rating: z.number().min(1).max(5),
  comment: z.string().min(10).max(500),
});

export async function submitReviewAction(input: z.infer<typeof ReviewSchema>) {
  try {
    // Validate input
    const validated = ReviewSchema.parse(input);

    // Check if order exists and is delivered
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

    // Verify email matches
    if (order.email !== validated.email) {
      return {
        success: false,
        error: 'Invalid order access',
      };
    }

    // Check if review already exists
    const existing = await prisma.testimonial.findUnique({
      where: { orderId: validated.orderId },
    });

    if (existing) {
      return {
        success: false,
        error: 'You have already submitted a review for this order',
      };
    }

    // Create testimonial
    await prisma.testimonial.create({
      data: {
        orderId: validated.orderId,
        email: validated.email,
        name: validated.name,
        rating: validated.rating,
        comment: validated.comment,
        isVisible: false, // Requires admin approval
      },
    });

    // Revalidate homepage to show new testimonial (once approved)
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