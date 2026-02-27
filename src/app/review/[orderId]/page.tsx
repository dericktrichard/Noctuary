import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { ReviewForm } from '@/components/features/review-form';

interface ReviewPageProps {
  params: Promise<{ orderId: string }>;
}

export default async function ReviewPage({ params }: ReviewPageProps) {
  const { orderId } = await params;

  // Get order details
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    select: {
      id: true,
      email: true,
      type: true,
      title: true,
      status: true,
      deliveredAt: true,
    },
  });

  if (!order || order.status !== 'DELIVERED') {
    notFound();
  }

  // Check if review already exists
  const existingReview = await prisma.testimonial.findUnique({
    where: { orderId },
  });

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">Share Your Experience</h1>
          <p className="font-nunito text-muted-foreground">
            Help others discover the beauty of human-written poetry
          </p>
        </div>

        {existingReview ? (
          <div className="glass-card p-8 rounded-lg border border-border text-center">
            <div className="text-5xl mb-4">✓</div>
            <h2 className="text-xl font-bold mb-2">Thank You!</h2>
            <p className="font-nunito text-muted-foreground">
              Your feedback has been submitted and is awaiting approval.
            </p>
          </div>
        ) : (
          <ReviewForm orderId={order.id} email={order.email} />
        )}
      </div>
    </div>
  );
}