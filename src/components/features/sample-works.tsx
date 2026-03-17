'use client';

import { useState } from 'react';
import { GlassCard } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Sparkles, ArrowRight, ChevronUp, X } from 'lucide-react';
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
  const [selectedWork, setSelectedWork] = useState<SampleWork | null>(null);
  
  const displayCount = showAll ? samples.length : Math.min(4, samples.length);

  if (samples.length === 0) return null;

  return (
    <section id="samples" className="py-20 px-4 relative overflow-hidden">
      <div className="container mx-auto max-w-7xl relative z-10">
        {/* Centered Header */}
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full glass-card mb-4"
          >
            <Sparkles className="w-4 h-4 text-primary" />
            <span className="font-nunito text-xs uppercase tracking-widest">Portfolio</span>
          </motion.div>
          
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl md:text-6xl font-bold mb-4"
          >
            Sample Works
          </motion.h2>
          
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-lg font-nunito text-muted-foreground max-w-2xl mx-auto italic"
          >
            "Each a piece, a flawed creativity."
          </motion.p>
        </div>

        {/* 4-Column Grid */}
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
                transition={{ duration: 0.5, delay: index * 0.05 }}
                onClick={() => setSelectedWork(work)}
                className="group cursor-pointer"
              >
                <div className="relative h-[450px] rounded-2xl overflow-hidden glass-card border border-border group-hover:border-primary/50 transition-all duration-500 shadow-xl">
                  {/* Background Image/Fallback */}
                  <div className="absolute inset-0 z-0">
                    {work.imageUrl ? (
                      <img
                        src={work.imageUrl}
                        alt={work.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-primary/20 to-secondary/20" />
                    )}
                    {/* Darker Overlay for Text Readability */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent" />
                  </div>

                  {/* Content Overlay */}
                  <div className="absolute inset-0 p-6 flex flex-col justify-end z-10">
                    {work.mood && (
                      <div className="inline-flex w-fit items-center gap-1.5 px-2.5 py-1 rounded-full glass-card mb-3 border-white/10">
                        <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                        <span className="text-[10px] font-bold uppercase tracking-wider font-nunito">{work.mood}</span>
                      </div>
                    )}

                    <h3 className="text-2xl font-bold mb-3 group-hover:text-primary transition-colors duration-300">
                      {work.title}
                    </h3>

                    {/* FIXED: Using whitespace-pre-line to respect admin line breaks */}
                    <p className="font-serif text-sm leading-relaxed line-clamp-6 text-gray-200 whitespace-pre-line opacity-80 group-hover:opacity-100 transition-opacity">
                      {work.content}
                    </p>

                    <div className="mt-4 pt-4 border-t border-white/10 flex items-center gap-2 text-xs font-nunito text-primary font-bold tracking-widest uppercase">
                      <span>Read Full Work</span>
                      <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>

        {/* View Controls */}
        <div className="text-center mt-12">
          {samples.length > 4 && (
            <Button
              onClick={() => setShowAll(!showAll)}
              variant="outline"
              size="lg"
              className="font-nunito gap-2 group border-primary/20 hover:bg-primary/5"
            >
              {showAll ? <ChevronUp className="w-4 h-4" /> : <ArrowRight className="w-4 h-4" />}
              {showAll ? 'Show Less' : `View All ${samples.length} Samples`}
            </Button>
          )}
        </div>
      </div>

      {/* FULL SAMPLE MODAL */}
      <AnimatePresence>
        {selectedWork && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-10">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedWork(null)}
              className="absolute inset-0 bg-black/90 backdrop-blur-xl"
            />
            
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-5xl max-h-[90vh] glass-card border-border overflow-hidden rounded-3xl shadow-2xl flex flex-col md:flex-row"
            >
              {/* Close Button */}
              <button 
                onClick={() => setSelectedWork(null)}
                className="absolute top-4 right-4 z-50 p-2 rounded-full glass-card hover:bg-red-500/20 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Modal Image Section */}
              <div className="w-full md:w-1/2 h-64 md:h-auto overflow-hidden relative">
                {selectedWork.imageUrl ? (
                  <img
                    src={selectedWork.imageUrl}
                    alt={selectedWork.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-primary/30 to-background" />
                )}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent to-black/20" />
              </div>

              {/* Modal Text Section */}
              <div className="w-full md:w-1/2 p-8 md:p-12 overflow-y-auto bg-card/50 custom-scrollbar">
                <div className="max-w-md mx-auto">
                  {selectedWork.mood && (
                    <span className="text-primary text-xs font-bold uppercase tracking-[0.2em] mb-4 block">
                      {selectedWork.mood}
                    </span>
                  )}
                  <h2 className="text-3xl md:text-5xl font-bold mb-8 leading-tight">
                    {selectedWork.title}
                  </h2>
                  
                  {/* RESPECTED LINE BREAKS */}
                  <div className="font-serif text-lg md:text-xl leading-[1.8] text-foreground/90 whitespace-pre-line pb-12">
                    {selectedWork.content}
                  </div>
                  
                  <div className="pt-8 border-t border-border/50">
                    <p className="font-nunito text-xs text-muted-foreground uppercase tracking-widest">
                      Composed by Noctuary
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  );
}