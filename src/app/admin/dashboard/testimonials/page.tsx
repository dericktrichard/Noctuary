import { prisma } from '@/lib/prisma';
import { TestimonialsList } from '@/components/admin/testimonials-list';

export default async function TestimonialsPage() {
  const testimonials = await prisma.testimonial.findMany({
    orderBy: { createdAt: 'desc' },
  });

  const serialized = testimonials.map((t) => ({
    ...t,
    createdAt: t.createdAt.toISOString(),
    updatedAt: t.updatedAt.toISOString(),
  }));

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Testimonials</h1>
        <p className="font-nunito text-muted-foreground mt-2">
          Manage customer reviews and feedback
        </p>
      </div>

      <TestimonialsList testimonials={serialized} />
    </div>
  );
}