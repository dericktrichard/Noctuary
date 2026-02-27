'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Star, ChevronDown, ChevronUp } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface Testimonial {
  id: string;
  name: string | null;
  rating: number;
  comment: string;
}

interface TestimonialsProps {
  testimonials: Testimonial[];
}

export function TestimonialsClient({ testimonials }: TestimonialsProps) {
  const [showAll, setShowAll] = useState(false);
  const displayedTestimonials = showAll ? testimonials : testimonials.slice(0, 3);

  if (testimonials.length === 0) {
    return null;
  }

  return (
    <section id="testimonials" className="py-24 px-4 overflow-hidden">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Voices of Feedback
          </h2>
          <p className="font-nunito text-lg text-muted-foreground max-w-2xl mx-auto">
            Reviews from people who commissioned with us.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence mode="popLayout">
            {displayedTestimonials.map((testimonial, index) => (
              <motion.div
                key={testimonial.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
              >
                <div className="glass-card p-6 rounded-lg border border-border hover:border-primary transition-colors h-full">
                  {/* Rating */}
                  <div className="flex gap-1 mb-4">
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
                  <p className="font-nunito text-sm mb-4 line-clamp-4">
                    "{testimonial.comment}"
                  </p>

                  {/* Author */}
                  <p className="text-xs text-muted-foreground font-nunito">
                    — {testimonial.name || 'Anonymous Client'}
                  </p>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* View More Button */}
        {testimonials.length > 3 && (
          <div className="text-center mt-12">
            <Button
              onClick={() => setShowAll(!showAll)}
              variant="outline"
              size="lg"
              className="font-nunito gap-2"
            >
              {showAll ? (
                <>
                  View Less <ChevronUp className="w-5 h-5" />
                </>
              ) : (
                <>
                  View More <ChevronDown className="w-5 h-5" />
                </>
              )}
            </Button>
          </div>
        )}
      </div>
    </section>
  );
}