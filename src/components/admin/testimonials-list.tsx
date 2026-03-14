'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Eye, EyeOff, Trash2, Star } from 'lucide-react';
import { toggleTestimonialVisibilityAction, deleteTestimonialAction } from '@/app/actions/admin';
import { toast } from 'sonner';

interface Testimonial {
  id: string;
  orderId: string;
  email: string;
  name: string | null;
  rating: number;
  comment: string;
  isVisible: boolean;
  createdAt: string;
}

interface TestimonialsListProps {
  testimonials: Testimonial[];
}

export function TestimonialsList({ testimonials }: TestimonialsListProps) {
  const [items, setItems] = useState(testimonials);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleToggleVisibility = async (id: string) => {
    const result = await toggleTestimonialVisibilityAction(id);
    
    if (result.success) {
      setItems(items.map(t => 
        t.id === id ? { ...t, isVisible: !t.isVisible } : t
      ));
      toast.success('Visibility updated');
    } else {
      toast.error('Failed to update');
    }
  };

  const handleDelete = (id: string) => {
    setDeletingId(id);
  };

  const confirmDelete = async () => {
    if (!deletingId) return;

    const result = await deleteTestimonialAction(deletingId);
    
    if (result.success) {
      setItems(items.filter(t => t.id !== deletingId));
      toast.success('Testimonial deleted');
      setDeletingId(null);
    } else {
      toast.error('Failed to delete');
    }
  };

  if (items.length === 0) {
    return (
      <div className="text-center py-12 glass-card rounded-lg border border-border">
        <p className="font-nunito text-muted-foreground">No testimonials yet</p>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-4">
        {items.map((testimonial) => (
          <div
            key={testimonial.id}
            className="glass-card p-6 rounded-lg border border-border hover:border-primary/50 transition-colors"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex gap-1 mb-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`w-5 h-5 ${
                        star <= testimonial.rating
                          ? 'fill-yellow-400 text-yellow-400'
                          : 'text-gray-300'
                      }`}
                    />
                  ))}
                </div>

                <p className="font-nunito text-sm mb-4 leading-relaxed">{testimonial.comment}</p>

                <div className="text-xs text-muted-foreground font-nunito">
                  <span className="font-bold">
                    {testimonial.name || 'Anonymous'}
                  </span>
                  {' • '}
                  {new Date(testimonial.createdAt).toLocaleDateString()}
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant={testimonial.isVisible ? 'default' : 'outline'}
                  onClick={() => handleToggleVisibility(testimonial.id)}
                  className="font-nunito"
                >
                  {testimonial.isVisible ? (
                    <><Eye className="w-4 h-4 mr-2" /> Visible</>
                  ) : (
                    <><EyeOff className="w-4 h-4 mr-2" /> Hidden</>
                  )}
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => handleDelete(testimonial.id)}
                  className="font-nunito"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {deletingId && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-card rounded-lg border border-border p-6 max-w-md w-full shadow-xl">
            <h3 className="text-lg font-bold mb-2">Delete Testimonial?</h3>
            <p className="text-sm text-muted-foreground mb-6">
              This action cannot be undone. The testimonial will be permanently removed.
            </p>
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => setDeletingId(null)}
                className="flex-1 font-nunito"
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={confirmDelete}
                className="flex-1 font-nunito"
              >
                Delete
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}