'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Star, Quote, ArrowRight } from 'lucide-react';
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
  const displayCount = showAll ? testimonials.length : Math.min(6, testimonials.length);

  if (testimonials.length === 0) {
    return null;
  }

  return (
    <section id="testimonials" className="py-24 px-4 relative overflow-hidden">
      <div className="max-w-7xl mx-auto relative z-10">
        {/* Left-aligned Header */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between mb-16 gap-6 md:pl-12">
          <div className="max-w-2xl">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="inline-flex items-center gap-2 px-3 py-1 rounded-full glass-card mb-4"
            >
              <Quote className="w-4 h-4" />
              <span className="font-nunito text-xs uppercase tracking-widest">Testimonials</span>
            </motion.div>

            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4"
            >
              Voices of Feedback
            </motion.h2>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-lg font-nunito text-muted-foreground"
            >
              Real stories from people who commissioned with us.
            </motion.p>
          </div>

          {testimonials.length > 6 && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <Button
                onClick={() => setShowAll(!showAll)}
                variant="outline"
                size="lg"
                className="font-nunito gap-2 group"
              >
                {showAll ? 'Show Less' : `View All ${testimonials.length}`}
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Button>
            </motion.div>
          )}
        </div>

        {/* Masonry-style Grid */}
        <motion.div 
          layout
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          <AnimatePresence mode="popLayout">
            {testimonials.slice(0, displayCount).map((testimonial, index) => (
              <motion.div
                key={testimonial.id}
                layout
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: -20 }}
                transition={{
                  duration: 0.5,
                  delay: index * 0.05,
                  layout: { duration: 0.3 },
                  ease: [0.4, 0, 0.2, 1]
                }}
                className="group"
              >
                <div className="relative p-8 rounded-2xl glass-card border border-border hover:border-primary/50 transition-all duration-500 h-full">
                  <div className="absolute top-6 right-6 opacity-5 group-hover:opacity-10 transition-opacity">
                    <Quote className="w-24 h-24" strokeWidth={1} />
                  </div>

                  <div className="relative z-10">
                    <div className="flex gap-1 mb-6">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <motion.div
                          key={star}
                          initial={{ opacity: 0, scale: 0 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: index * 0.05 + star * 0.05 }}
                        >
                          <Star
                            className={`w-5 h-5 ${
                              star <= testimonial.rating
                                ? 'fill-yellow-400 text-yellow-400'
                                : 'fill-muted text-muted'
                            }`}
                          />
                        </motion.div>
                      ))}
                    </div>

                    <blockquote className="mb-6">
                      <p className="font-nunito text-base leading-relaxed relative">
                        <span className="text-primary text-2xl absolute -left-2 -top-2">"</span>
                        <span className="inline-block pl-4">{testimonial.comment}</span>
                        <span className="text-primary text-2xl">"</span>
                      </p>
                    </blockquote>

                    <div className="flex items-center gap-3 pt-4 border-t border-border">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                        <span className="font-bold text-sm">
                          {testimonial.name ? testimonial.name.charAt(0).toUpperCase() : 'A'}
                        </span>
                      </div>
                      <div>
                        <p className="font-semibold text-sm">
                          {testimonial.name || 'Anonymous'}
                        </p>
                        <p className="text-xs text-muted-foreground font-nunito">
                          Verified Customer
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none">
                    <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-primary/5 via-transparent to-primary/5" />
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      </div>
    </section>
  );
}