'use client';

import { motion } from 'framer-motion';
import { GlassCard } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Quote, Star } from 'lucide-react';

// Mock testimonials - will be replaced with dynamic data from database
const testimonials = [
  {
    id: '1',
    name: 'Sarah Mitchell',
    poemTitle: 'Eternal Sunshine',
    content: 'The custom poem for my husband brought tears to both our eyes. It captured our journey perfectly.',
    rating: 5,
    date: 'January 2026',
  },
  {
    id: '2',
    name: 'James Ochieng',
    poemTitle: 'Vows of Forever',
    content: 'I needed something special for my wedding vows. Noctuary delivered a beautiful piece that felt authentically mine.',
    rating: 5,
    date: 'December 2025',
  },
  {
    id: '3',
    name: 'Emily Chen',
    poemTitle: 'In Loving Memory',
    content: 'The poet understood the depth of my loss and created something truly meaningful. Thank you for your sensitivity.',
    rating: 5,
    date: 'November 2025',
  },
];

export function Testimonials() {
  return (
    <section className="py-24 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Voices of Feedback
          </h2>
          <p className="font-nunito text-lg max-w-2xl mx-auto text-muted-foreground">
            True reviews of those who have commissioned poetry under Noctuary
          </p>
        </motion.div>

        {/* Testimonials Grid */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={testimonial.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
            >
              <GlassCard className="p-6 h-full flex flex-col glass-hover">
                {/* Quote Icon */}
                <div className="mb-4">
                  <Quote className="w-8 h-8 text-muted-foreground" />
                </div>

                {/* Star Rating with Count */}
                <div className="flex items-center gap-2 mb-4">
                  <div className="flex gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star 
                        key={i} 
                        className={`w-4 h-4 ${
                          i < testimonial.rating 
                            ? 'fill-foreground text-foreground' 
                            : 'text-muted-foreground'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-sm font-nunito text-muted-foreground">
                    {testimonial.rating}/5
                  </span>
                </div>

                {/* Content */}
                <p className="font-nunito leading-relaxed mb-4 flex-grow text-muted-foreground">
                  &ldquo;{testimonial.content}&rdquo;
                </p>

                {/* Poem Title */}
                <p className="text-sm italic mb-4 text-muted-foreground font-nunito">
                  Poem: {testimonial.poemTitle}
                </p>

                {/* Author Info - Horizontal Layout */}
                <div className="border-t border-border pt-4">
                  <div className="flex items-center justify-between">
                    <p className="font-bold">
                      {testimonial.name}
                    </p>
                    <p className="text-xs font-nunito text-muted-foreground">
                      {testimonial.date}
                    </p>
                  </div>
                </div>
              </GlassCard>
            </motion.div>
          ))}
        </div>

        {/* View More Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center"
        >
          <Button variant="glass" size="lg" className="font-nunito">
            View More Reviews
          </Button>
        </motion.div>
      </div>
    </section>
  );
}