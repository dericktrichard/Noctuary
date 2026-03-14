import { prisma } from '@/lib/prisma';
import { TestimonialsList } from '@/components/admin/testimonials-list';
import { Suspense } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { Star } from 'lucide-react';

async function TestimonialsStats({ testimonials }: { testimonials: any[] }) {
  const stats = {
    total: testimonials.length,
    visible: testimonials.filter(t => t.isVisible).length,
    hidden: testimonials.filter(t => !t.isVisible).length,
    avgRating: testimonials.length > 0 
      ? (testimonials.reduce((sum, t) => sum + t.rating, 0) / testimonials.length).toFixed(1)
      : '0.0',
  };

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
      <div className="glass-card p-4 rounded-lg border border-border">
        <p className="text-xs font-nunito text-muted-foreground uppercase tracking-wide">Total Reviews</p>
        <p className="text-2xl font-bold mt-1">{stats.total}</p>
      </div>
      <div className="glass-card p-4 rounded-lg border border-border">
        <p className="text-xs font-nunito text-muted-foreground uppercase tracking-wide">Average Rating</p>
        <div className="flex items-center gap-2 mt-1">
          <p className="text-2xl font-bold text-yellow-500">{stats.avgRating}</p>
          <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
        </div>
      </div>
      <div className="glass-card p-4 rounded-lg border border-border">
        <p className="text-xs font-nunito text-muted-foreground uppercase tracking-wide">Visible</p>
        <p className="text-2xl font-bold mt-1 text-green-500">{stats.visible}</p>
      </div>
      <div className="glass-card p-4 rounded-lg border border-border">
        <p className="text-xs font-nunito text-muted-foreground uppercase tracking-wide">Hidden</p>
        <p className="text-2xl font-bold mt-1 text-muted-foreground">{stats.hidden}</p>
      </div>
    </div>
  );
}

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
        <h1 className="text-3xl font-bold tracking-tight">Testimonials</h1>
        <p className="font-nunito text-muted-foreground mt-2">
          Manage customer reviews and build social proof
        </p>
      </div>

      <Suspense fallback={
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => (
            <Skeleton key={i} className="h-20 rounded-lg" />
          ))}
        </div>
      }>
        <TestimonialsStats testimonials={serialized} />
      </Suspense>

      <TestimonialsList testimonials={serialized} />
    </div>
  );
}