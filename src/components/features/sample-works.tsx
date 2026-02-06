'use client';

import { motion } from 'framer-motion';
import { GlassCard } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

// Mock sample poems - will be replaced with dynamic data from database
const samplePoems = [
  {
    id: '1',
    title: 'Whispers of Dawn',
    excerpt: 'Between the silence and the light,\nWhere shadows dance with morning bright,\nA soul awakens, soft and new,\nPainting skies in golden hue...',
    mood: 'Peaceful',
    author: 'Noctuary Poet',
  },
  {
    id: '2',
    title: 'Love Unspoken',
    excerpt: 'Your name, a melody I dare not sing,\nYet echoes in every breath I bring.\nIn stolen glances, words untold,\nA story written, brave and bold...',
    mood: 'Romantic',
    author: 'Noctuary Poet',
  },
  {
    id: '3',
    title: 'Rising Phoenix',
    excerpt: 'From ashes deep, I spread my wings,\nEmbracing all that courage brings.\nNo longer bound by yesterday,\nI forge tomorrow, come what may...',
    mood: 'Motivational',
    author: 'Noctuary Poet',
  },
];

export function SampleWorks() {
  return (
    <section id="samples" className="py-24 px-4 bg-white/[0.02]">
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
            Sample Works
          </h2>
          <p className="text-white/60 font-caption text-lg max-w-2xl mx-auto">
            Glimpses of human creativity—each poem crafted with intention, never by algorithm
          </p>
        </motion.div>

        {/* Sample Cards Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          {samplePoems.map((poem, index) => (
            <motion.div
              key={poem.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
            >
              <GlassCard className="p-8 h-full flex flex-col group hover:bg-white/[0.08] transition-all duration-300 cursor-pointer">
             
                {/* Mood Badge */}
                <div className="mb-4">
                  <span className="inline-block px-3 py-1 text-xs font-caption tracking-wider bg-white/10 rounded-full">
                    {poem.mood.toUpperCase()}
                  </span>
                </div>

                {/* Title */}
                <h3 className="font-serif text-2xl font-bold mb-4 group-hover:text-white/90 transition-colors">
                  {poem.title}
                </h3>

                {/* Excerpt */}
                <div className="flex-grow mb-6">
                  <p className="text-white/70 font-caption leading-relaxed whitespace-pre-line italic">
                    {poem.excerpt}
                  </p>
                </div>

                {/* Author */}
                <div className="pt-4 border-t border-white/10">
                  <p className="text-sm text-white/50 font-caption">— {poem.author}</p>
                </div>
              </GlassCard>
            </motion.div>
          ))}
        </div>

        {/* View All Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center"
        >
          <Button variant="glass" size="lg" className="font-caption">
            View All Samples
          </Button>
        </motion.div>
      </div>
    </section>
  );
}