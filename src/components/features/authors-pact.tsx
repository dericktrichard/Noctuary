'use client';

import { motion } from 'framer-motion';
import { GlassCard } from '@/components/ui/card';
import { Shield, Copyright, Users, Sparkles, Check } from 'lucide-react';

const guarantees = [
  { icon: Shield, title: 'No AI', desc: 'Human-written poetry' },
  { icon: Sparkles, title: 'No Templates', desc: 'Unique every time' },
  { icon: Copyright, title: 'Full Rights', desc: 'You own it completely' },
  { icon: Users, title: 'Human Touch', desc: 'Honest expression' },
];

const beliefs = [
  'The soul matters in every word',
  'Human connection beats artificial generation',
  'Poetry is an art, not automation',
];

export function AuthorsPact() {
  return (
    <section id="pact" className="py-10 px-4 relative overflow-hidden">
      <div className="absolute inset-0 opacity-5">
        <div 
          className="absolute inset-0" 
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }} 
        />
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Right-aligned Header */}
        <div className="mb-16 md:pr-12 flex flex-col items-end text-right">
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full glass-card mb-4"
          >
            <Shield className="w-4 h-4" />
            <span className="font-nunito text-xs uppercase tracking-widest">Guarantee</span>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4"
          >
            The Author&apos;s Pact
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-lg font-nunito text-muted-foreground max-w-2xl"
          >
            Preserving human honesty in every piece.
          </motion.p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left: Compact 2x2 Grid */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="grid grid-cols-2 gap-4"
          >
            {guarantees.map((item, index) => {
              const Icon = item.icon;
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <GlassCard className="p-6 h-full glass-hover group">
                    <div className="w-12 h-12 glass-light rounded-xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                      <Icon className="w-6 h-6" strokeWidth={1.5} />
                    </div>
                    <h3 className="text-lg font-bold mb-1">
                      {item.title}
                    </h3>
                    <p className="font-nunito text-xs text-muted-foreground">
                      {item.desc}
                    </p>
                  </GlassCard>
                </motion.div>
              );
            })}
          </motion.div>

          {/* Right: Condensed Narrative */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <GlassCard className="p-8 lg:p-10">
              <h3 className="text-2xl font-bold mb-6">
                Why Noctuary?
              </h3>

              <div className="space-y-4 mb-6">
                {beliefs.map((belief, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -10 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 + 0.3 }}
                    className="flex items-start gap-3"
                  >
                    <div className="mt-1 w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <Check className="w-3 h-3 text-primary" strokeWidth={3} />
                    </div>
                    <p className="font-nunito text-muted-foreground leading-relaxed">
                      {belief}
                    </p>
                  </motion.div>
                ))}
              </div>

              <div className="pt-6 border-t border-border">
                <p className="font-bold text-foreground">
                  This is my promise. This is Noctuary.
                </p>
              </div>
            </GlassCard>
          </motion.div>
        </div>
      </div>
    </section>
  );
}