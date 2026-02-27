'use client';

import { useState } from 'react';
import { GlassCard } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronDown, ChevronUp } from 'lucide-react';
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
  const displayedSamples = showAll ? samples : samples.slice(0, 3);

  if (samples.length === 0) {
    return null;
  }

  return (
    <section id="samples" className="py-24 px-4">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Sample Works
          </h2>
          <p className="text-lg font-nunito text-muted-foreground max-w-2xl mx-auto">
            A glimpse into the craft. Each a genius and flawed write.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          <AnimatePresence mode="popLayout">
            {displayedSamples.map((work, index) => (
              <motion.div
                key={work.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
              >
                <GlassCard className="p-6 hover:scale-[1.02] transition-transform duration-300 h-full">
                  {work.imageUrl && (
                    <div className="w-full h-48 mb-4 rounded-lg overflow-hidden">
                      <img
                        src={work.imageUrl}
                        alt={work.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}

                  <h3 className="text-xl font-bold mb-2">{work.title}</h3>
                  
                  {work.mood && (
                    <p className="text-sm font-nunito text-muted-foreground italic mb-3">
                      {work.mood}
                    </p>
                  )}

                  <p className="font-serif text-sm leading-relaxed whitespace-pre-line line-clamp-6">
                    {work.content}
                  </p>
                </GlassCard>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* View More Button */}
        {samples.length > 3 && (
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
                  View More ({samples.length - 3} more) <ChevronDown className="w-5 h-5" />
                </>
              )}
            </Button>
          </div>
        )}
      </div>
    </section>
  );
}