'use client';

import { motion } from 'framer-motion';
import { GlassCard } from '@/components/ui/card';
import { Star } from 'lucide-react';

// Mock testimonials - will be replaced with dynamic data from database
const testimonials = [
  {
    id: '1',
    name: 'Sarah Mitchell',
    role: 'Gift for Anniversary',
    content: 'The custom poem for my husband brought tears to both our eyes. It captured our journey perfectly. Worth every penny.',
    rating: 5,
    date: 'January 2026',
  },
  {
    id: '2',
    name: 'James Ochieng',
    role: 'Wedding Vows',
    content: 'I needed something special for my wedding vows. Noctuary delivered a beautiful piece that felt authentically mine.',
    rating: 5,
    date: 'December 2025',
  },
  {
    id: '3',
    name: 'Emily Chen',
    role: 'Memorial Tribute',
    content: 'The poet understood the depth of my loss and created something truly meaningful. Thank you for your sensitivity.',
    rating: 5,
    date: 'November 2025',
  },
  {
    id: '4',
    name: 'Michael Karanja',
    role: 'Birthday Surprise',
    content: 'Quick poem option was perfect! Got it within hours and my mom loved it. Simple process, beautiful result.',
    rating: 5,
    date: 'January 2026',
  },
  {
    id: '5',
    name: 'Rachel Thompson',
    role: 'Proposal Poem',
    content: 'Used a custom poem for my proposal. She said yes! The words were exactly what I couldn\'t express myself.',
    rating: 5,
    date: 'December 2025',
  },
];

export function Testimonials() {
  return (
    <section className="py-24 px-4 bg-white/[0.02]">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="font-serif text-4xl md:text-5xl font-bold mb-4">
            Voices of Connection
          </h2>
          <p className="text-white/60 font-caption text-lg max-w-2xl mx-auto">
            Real stories from people who found the perfect words through Noctuary
          </p>
        </motion.div>

        {/* Testimonials Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={testimonial.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
            >
              <GlassCard className="p-6 h-full flex flex-col hover:bg-white/[0.08] transition-all duration-300">
                {/* Star Rating */}
                <div className="flex gap-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>

                {/* Content */}
                <p className="text-white/80 font-caption leading-relaxed mb-6 flex-grow">
                  &ldquo;{testimonial.content}&rdquo;
                </p>

                {/* Author Info */}
                <div className="border-t border-white/10 pt-4">
                  <p className="font-serif font-bold text-white mb-1">
                    {testimonial.name}
                  </p>
                  <p className="text-sm text-white/50 font-caption">
                    {testimonial.role}
                  </p>
                  <p className="text-xs text-white/40 font-caption mt-1">
                    {testimonial.date}
                  </p>
                </div>
              </GlassCard>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}