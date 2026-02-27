import { prisma } from '@/lib/prisma';
import { TestimonialsClient } from './testimonials';

export async function Testimonials() {
  const testimonials = await prisma.testimonial.findMany({
    where: { isVisible: true },
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      name: true,
      rating: true,
      comment: true,
    },
  });

  if (testimonials.length === 0) {
    return null;
  }

  return <TestimonialsClient testimonials={testimonials} />;
}