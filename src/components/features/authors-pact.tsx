'use client';

import { motion } from 'framer-motion';
import { GlassCard } from '@/components/ui/card';
import { Shield, Copyright, Users, Sparkles } from 'lucide-react';

const guarantees = [
  {
    icon: Shield,
    title: 'No AI',
    description: 'Every word written by a human poet who understands emotion and nuance.',
  },
  {
    icon: Sparkles,
    title: 'No Templates',
    description: 'Each poem is crafted uniquely for you, never from pre-written formulas.',
  },
  {
    icon: Copyright,
    title: 'Full Rights',
    description: 'Complete copyright ownership transfers to you upon delivery.',
  },
  {
    icon: Users,
    title: 'Human Touch',
    description: 'Authentic emotional expression from lived experience, not algorithms.',
  },
];

export function AuthorsPact() {
  return (
    <section id="pact" className="py-24 px-4 relative overflow-hidden">
      {/* Subtle Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }} />
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="font-serif text-4xl md:text-5xl font-bold mb-4">
            The Author&apos;s Pact
          </h2>
          <p className="text-white/60 font-caption text-lg max-w-2xl mx-auto">
            Our promise to you: authentic human creativity in every line
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left: Guarantees Grid */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="grid sm:grid-cols-2 gap-6"
          >
            {guarantees.map((item, index) => {
              const Icon = item.icon;
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                >
                  <GlassCard className="p-6 h-full hover:bg-white/[0.08] transition-all duration-300">
                    <div className="mb-4">
                      <div className="w-12 h-12 glass-light rounded-xl flex items-center justify-center">
                        <Icon className="w-6 h-6" strokeWidth={1.5} />
                      </div>
                    </div>
                    <h3 className="font-serif text-xl font-bold mb-2">
                      {item.title}
                    </h3>
                    <p className="text-white/70 font-caption text-sm leading-relaxed">
                      {item.description}
                    </p>
                  </GlassCard>
                </motion.div>
              );
            })}
          </motion.div>

          {/* Right: Narrative */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <GlassCard className="p-8 lg:p-10">
              <div className="space-y-6 text-white/80 font-caption leading-relaxed">
                <p className="text-lg">
                  In an age where artificial intelligence can generate text in milliseconds, 
                  <strong className="text-white"> we choose a different path.</strong>
                </p>
                
                <p>
                  Every poem commissioned through Noctuary is written by a human poet—someone 
                  who understands emotion, nuance, and the weight of words.
                </p>

                <div className="glass-light rounded-xl p-6 border border-white/10">
                  <p className="font-serif text-xl font-bold text-white mb-3">
                    This is our guarantee:
                  </p>
                  <p className="text-white/90">
                    No AI. No templates. No shortcuts.
                  </p>
                </div>

                <p>
                  When you commission a poem, you&apos;re not just purchasing words arranged 
                  aesthetically. You&apos;re investing in authentic human creativity, in the 
                  vulnerability of expression, in the deliberate craft that comes only from 
                  lived experience.
                </p>

                <p className="text-white font-semibold">
                  This is our promise. This is Noctuary.
                </p>
              </div>
            </GlassCard>
          </motion.div>
        </div>
      </div>
    </section>
  );
}