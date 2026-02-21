'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { GlassCard } from '@/components/ui/card';
import { X, Info } from 'lucide-react';
import { deliverPoemAction } from '@/app/actions/admin';
import { toast } from 'sonner';

interface DeliverPoemModalProps {
  order: {
    id: string;
    email: string;
    type: string;
    title: string | null;
    mood: string | null;
    instructions: string | null;
    pricePaid: number;
    currency: string;
    deliveryHours: number;
    poemContent: string | null;
  };
  onClose: () => void;
}

export function DeliverPoemModal({ order, onClose }: DeliverPoemModalProps) {
  const router = useRouter();
  const [poemContent, setPoemContent] = useState(order.poemContent || '');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!poemContent.trim()) {
      toast.error('Please write the poem content');
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await deliverPoemAction(order.id, poemContent);

      if (result.success) {
        toast.success('Poem delivered successfully! Customer will be notified.');
        router.refresh();
        onClose();
      } else {
        toast.error(result.error || 'Failed to deliver poem');
      }
    } catch (err) {
      toast.error('Something went wrong');
    } finally {
      setIsSubmitting(false);
    }
  };

  const isCustomPoem = order.type === 'CUSTOM';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <GlassCard className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="p-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold">
                {order.poemContent ? 'View Poem' : 'Deliver Poem'}
              </h2>
              <p className="font-nunito text-sm text-muted-foreground mt-1">
                Order ID: {order.id.slice(0, 8)}...
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-lg glass-hover"
              disabled={isSubmitting}
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Order Details */}
          <div className="mb-6 p-4 rounded-lg bg-muted/50 border border-border">
            <div className="flex items-start gap-2 mb-3">
              <Info className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <h3 className="font-semibold font-nunito mb-2">Order Details</h3>
                <div className="grid md:grid-cols-2 gap-3 text-sm font-nunito">
                  <div>
                    <span className="text-muted-foreground">Customer:</span>
                    <span className="ml-2 font-medium">{order.email}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Type:</span>
                    <span className="ml-2 font-medium">{order.type}</span>
                  </div>
                  {isCustomPoem && order.title && (
                    <div>
                      <span className="text-muted-foreground">Title:</span>
                      <span className="ml-2 font-medium">{order.title}</span>
                    </div>
                  )}
                  {isCustomPoem && order.mood && (
                    <div>
                      <span className="text-muted-foreground">Mood:</span>
                      <span className="ml-2 font-medium">{order.mood}</span>
                    </div>
                  )}
                  <div>
                    <span className="text-muted-foreground">Amount:</span>
                    <span className="ml-2 font-medium">
                      {order.currency} {order.pricePaid.toFixed(2)}
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Delivery Time:</span>
                    <span className="ml-2 font-medium">{order.deliveryHours}h</span>
                  </div>
                </div>

                {/* Special Instructions */}
                {isCustomPoem && order.instructions && (
                  <div className="mt-4 pt-4 border-t border-border">
                    <span className="text-muted-foreground font-semibold block mb-2">
                      Special Instructions:
                    </span>
                    <p className="text-foreground whitespace-pre-wrap leading-relaxed">
                      {order.instructions}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Poem Editor */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <Label htmlFor="poem-content" className="text-base font-nunito">
                {order.poemContent ? 'Poem Content' : 'Write the Poem'}
              </Label>
              <Textarea
                id="poem-content"
                value={poemContent}
                onChange={(e) => setPoemContent(e.target.value)}
                placeholder="Write your poem here..."
                rows={16}
                className="mt-2 font-serif text-base leading-relaxed"
                disabled={!!order.poemContent || isSubmitting}
              />
            </div>

            {!order.poemContent && (
              <div className="flex gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={onClose}
                  className="flex-1 font-nunito"
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="flex-1 font-nunito"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Delivering...' : 'Deliver Poem'}
                </Button>
              </div>
            )}
          </form>
        </div>
      </GlassCard>
    </div>
  );
}