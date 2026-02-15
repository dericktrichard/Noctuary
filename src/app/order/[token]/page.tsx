import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getOrderByAccessToken } from '@/services/orders';
import { OrderStatus } from '@prisma/client';
import { GlassCard } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, Clock, Pencil, Package, Home } from 'lucide-react';

export default async function OrderTrackingPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  
  const order = await getOrderByAccessToken(token);

  if (!order) {
    notFound();
  }

  const getStatusIcon = (status: OrderStatus) => {
    switch (status) {
      case 'PENDING':
        return <Clock className="w-8 h-8 text-yellow-500" />;
      case 'PAID':
        return <CheckCircle className="w-8 h-8 text-green-500" />;
      case 'WRITING':
        return <Pencil className="w-8 h-8 text-blue-500" />;
      case 'DELIVERED':
        return <Package className="w-8 h-8 text-green-600" />;
      case 'CANCELLED':
        return <CheckCircle className="w-8 h-8 text-red-500" />;
      default:
        return <Clock className="w-8 h-8" />;
    }
  };

  const getStatusMessage = (status: OrderStatus) => {
    switch (status) {
      case 'PENDING':
        return 'Awaiting payment confirmation...';
      case 'PAID':
        return 'Payment received! Our poet will begin crafting your piece shortly.';
      case 'WRITING':
        return 'Your poem is being written with care and intention.';
      case 'DELIVERED':
        return 'Your poem has been delivered! Check your email.';
      case 'CANCELLED':
        return 'This order has been cancelled.';
      default:
        return 'Processing your order...';
    }
  };

  return (
    <div className="min-h-screen py-24 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Order Tracking</h1>
          <p className="font-nunito text-muted-foreground">
            Order ID: {order.id}
          </p>
        </div>

        {/* Status Card */}
        <GlassCard className="p-8 mb-8">
          <div className="flex flex-col items-center text-center mb-8">
            {getStatusIcon(order.status)}
            <h2 className="text-2xl font-bold mt-4 mb-2">
              {order.status.charAt(0) + order.status.slice(1).toLowerCase()}
            </h2>
            <p className="font-nunito text-muted-foreground">
              {getStatusMessage(order.status)}
            </p>
          </div>

          {/* Order Details */}
          <div className="space-y-4 border-t border-border pt-6">
            <div className="flex justify-between">
              <span className="font-nunito text-muted-foreground">Type:</span>
              <span className="font-bold">
                {order.type === 'QUICK' ? 'Quick Poem' : 'Custom Poem'}
              </span>
            </div>
            
            {order.title && (
              <div className="flex justify-between">
                <span className="font-nunito text-muted-foreground">Title:</span>
                <span className="font-bold">{order.title}</span>
              </div>
            )}
            
            {order.mood && (
              <div className="flex justify-between">
                <span className="font-nunito text-muted-foreground">Mood:</span>
                <span className="font-bold">{order.mood}</span>
              </div>
            )}
            
            <div className="flex justify-between">
              <span className="font-nunito text-muted-foreground">Delivery Time:</span>
              <span className="font-bold">{order.deliveryHours} hours</span>
            </div>
            
            <div className="flex justify-between">
              <span className="font-nunito text-muted-foreground">Amount Paid:</span>
              <span className="font-bold">
                {order.currency} {Number(order.pricePaid).toFixed(2)}
              </span>
            </div>
            
            <div className="flex justify-between">
              <span className="font-nunito text-muted-foreground">Ordered:</span>
              <span className="font-bold font-nunito">
                {new Date(order.createdAt).toLocaleDateString('en-US', {
                  month: 'long',
                  day: 'numeric',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </span>
            </div>
          </div>

          {/* Return Home Button */}
          <div className="mt-8 pt-6 border-t border-border">
            <Link href="/" className="block">
              <Button variant="outline" size="lg" className="w-full font-nunito">
                <Home className="w-5 h-5 mr-2" />
                Return to Homepage
              </Button>
            </Link>
          </div>
        </GlassCard>

        {/* Poem Display (if delivered) */}
        {order.status === 'DELIVERED' && order.poemContent && (
          <GlassCard className="p-8">
            <h3 className="text-2xl font-bold mb-6 text-center">
              {order.title || 'Your Poem'}
            </h3>
            <div className="prose prose-invert max-w-none">
              <pre className="whitespace-pre-wrap font-serif text-lg leading-relaxed">
                {order.poemContent}
              </pre>
            </div>
            <div className="mt-8 pt-6 border-t border-border">
              <p className="text-sm font-nunito text-muted-foreground text-center">
                © {new Date().getFullYear()} - Full copyright transferred to you
              </p>
            </div>
          </GlassCard>
        )}

        {/* Instructions Display (for poet reference) */}
        {order.instructions && order.status !== 'DELIVERED' && (
          <GlassCard className="p-6 mt-8">
            <h4 className="font-bold mb-3">Special Instructions:</h4>
            <p className="font-nunito text-muted-foreground italic">
              {order.instructions}
            </p>
          </GlassCard>
        )}

        {/* Additional Info for Non-Delivered Orders */}
        {order.status !== 'DELIVERED' && (
          <div className="mt-8 text-center">
            <p className="font-nunito text-sm text-muted-foreground">
              💡 Bookmark this page or save the link - you'll need it to view your completed poem
            </p>
            <p className="font-nunito text-xs text-muted-foreground mt-2">
              We'll also send you an email when your poem is ready
            </p>
          </div>
        )}
      </div>
    </div>
  );
}