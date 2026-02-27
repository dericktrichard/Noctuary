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

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this testimonial?')) return;

    const result = await deleteTestimonialAction(id);
    
    if (result.success) {
      setItems(items.filter(t => t.id !== id));
      toast.success('Testimonial deleted');
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
    <div className="space-y-4">
      {items.map((testimonial) => (
        <div
          key={testimonial.id}
          className="glass-card p-6 rounded-lg border border-border"
        >
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              {/* Rating */}
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

              {/* Comment */}
              <p className="font-nunito text-sm mb-4">{testimonial.comment}</p>

              {/* Author */}
              <div className="text-xs text-muted-foreground font-nunito">
                <span className="font-bold">
                  {testimonial.name || 'Anonymous'}
                </span>
                {' • '}
                {new Date(testimonial.createdAt).toLocaleDateString()}
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-2">
              <Button
                size="sm"
                variant={testimonial.isVisible ? 'default' : 'outline'}
                onClick={() => handleToggleVisibility(testimonial.id)}
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
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}