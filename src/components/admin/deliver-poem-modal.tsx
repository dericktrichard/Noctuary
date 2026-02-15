'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { OrderStatus } from '@prisma/client';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { GlassCard } from '@/components/ui/card';
import { X } from 'lucide-react';
import { deliverPoemAction } from '@/app/actions/admin';

interface SerializedOrder {
  id: string;
  status: OrderStatus;
  poemContent: string | null;
}

interface DeliverPoemModalProps {
  order: SerializedOrder;
  onClose: () => void;
}

export function DeliverPoemModal({ order, onClose }: DeliverPoemModalProps) {
  const router = useRouter();
  const [poemContent, setPoemContent] = useState(order.poemContent || '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!poemContent.trim()) {
      setError('Please write the poem content');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      const result = await deliverPoemAction(order.id, poemContent);

      if (result.success) {
        router.refresh();
        onClose();
      } else {
        setError(result.error || 'Failed to deliver poem');
      }
    } catch (err) {
      setError('Something went wrong');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80">
      <GlassCard className="w-full max-w-3xl max-h-[90vh] overflow-y-auto p-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold">
              {order.status === 'DELIVERED' ? 'View Poem' : 'Deliver Poem'}
            </h2>
            <p className="font-nunito text-sm text-muted-foreground mt-1">
              Order: {order.id}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg glass-hover"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block font-nunito text-sm mb-2">
              Poem Content
            </label>
            <Textarea
              value={poemContent}
              onChange={(e) => setPoemContent(e.target.value)}
              placeholder="Write the poem here..."
              rows={15}
              className="font-serif text-lg leading-relaxed"
              disabled={order.status === 'DELIVERED'}
            />
          </div>

          {error && (
            <div className="p-3 rounded-lg bg-destructive/10 border border-destructive">
              <p className="text-sm font-nunito text-destructive">{error}</p>
            </div>
          )}

          {order.status !== 'DELIVERED' && (
            <div className="flex gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                className="flex-1 font-nunito"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 font-nunito"
              >
                {isSubmitting ? 'Delivering...' : 'Deliver Poem'}
              </Button>
            </div>
          )}
        </form>
      </GlassCard>
    </div>
  );
}