'use client';

import { useState } from 'react';
import { GlassCard } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Sparkles, ArrowRight, ChevronUp } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface SampleWork {
  id: string;
  title: string;
  content: string;
  mood: string | null;
  imageUrl: string | null;
}

interface SampleWorksProps {
  samples: SampleWork[];
}

export function SampleWorksClient({ samples }: SampleWorksProps) {
  const [showAll, setShowAll] = useState(false);
  const displayCount = showAll ? samples.length : Math.min(4, samples.length);

  if (samples.length === 0) {
    return null;
  }

  return (
    <section id="samples" className="py-10 px-4 relative overflow-hidden">
      <div className="container mx-auto max-w-7xl relative z-10">
        {/* Centered Header */}
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full glass-card mb-4"
          >
            <Sparkles className="w-4 h-4" />
            <span className="font-nunito text-xs uppercase tracking-widest">Portfolio</span>
          </motion.div>
          
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4"
          >
            Sample Works
          </motion.h2>
          
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-lg font-nunito text-muted-foreground max-w-2xl mx-auto"
          >
            Each a piece, a flawed creativity.
          </motion.p>

          {/* View More - Only if not showing all */}
          {samples.length > 4 && !showAll && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="mt-6"
            >
              <Button
                onClick={() => setShowAll(true)}
                variant="outline"
                size="lg"
                className="font-nunito gap-2 group"
              >
                View All
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Button>
            </motion.div>
          )}
        </div>

        {/* 4-Column Grid with Stagger Animation */}
        <motion.div 
          layout
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          <AnimatePresence mode="popLayout">
            {samples.slice(0, displayCount).map((work, index) => (
              <motion.div
                key={work.id}
                layout
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: -20 }}
                transition={{
                  duration: 0.5,
                  delay: index * 0.05,
                  layout: { duration: 0.3 },
                  ease: [0.4, 0, 0.2, 1]
                }}
                className="group"
              >
                <div className="relative h-[400px] rounded-2xl overflow-hidden glass-card border border-border hover:border-primary/50 transition-all duration-500 cursor-pointer">
                  <div className="absolute inset-0">
                    {work.imageUrl ? (
                      <img
                        src={work.imageUrl}
                        alt={work.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-primary/20 to-primary/5" />
                    )}
                  </div>

                  <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-transparent opacity-90" />

                  <div className="absolute inset-0 p-6 flex flex-col justify-end">
                    {work.mood && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 + 0.2 }}
                        className="inline-flex w-fit items-center gap-1.5 px-2.5 py-1 rounded-full glass-card mb-3"
                      >
                        <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                        <span className="text-xs font-nunito">{work.mood}</span>
                      </motion.div>
                    )}

                    <motion.h3
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 + 0.3 }}
                      className="text-xl font-bold mb-2 group-hover:text-primary transition-colors"
                    >
                      {work.title}
                    </motion.h3>

                    <motion.p
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 + 0.4 }}
                      className="font-serif text-sm leading-relaxed line-clamp-3 text-muted-foreground"
                    >
                      {work.content}
                    </motion.p>

                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      whileHover={{ opacity: 1, y: 0 }}
                      className="mt-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                    >
                      <div className="flex items-center gap-2 text-xs font-nunito text-primary">
                        <span>Read Full Poem</span>
                        <ArrowRight className="w-3 h-3" />
                      </div>
                    </motion.div>
                  </div>

                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>

        {/* View Less */}
        {samples.length > 4 && showAll && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-center mt-12"
          >
            <Button
              onClick={() => setShowAll(false)}
              variant="outline"
              size="lg"
              className="font-nunito gap-2"
            >
              <ChevronUp className="w-4 h-4" />
              Show Less
            </Button>
          </motion.div>
        )}
      </div>
    </section>
  );
}