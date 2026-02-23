'use client';

import { motion } from 'framer-motion';
import { GlassCard } from '@/components/ui/card';
import { Shield, Copyright, Users, Sparkles } from 'lucide-react';

const guarantees = [
  {
    icon: Shield,
    title: 'No AI',
    description: 'Every word written by me, a human poet.',
  },
  {
    icon: Sparkles,
    title: 'No Templates',
    description: 'Each poem is crafted uniquely for you.',
  },
  {
    icon: Copyright,
    title: 'Full Rights',
    description: 'Complete copyright ownership transfers to you upon delivery.',
  },
  {
    icon: Users,
    title: 'Human Touch',
    description: 'Honest and Flawed expression from lived and read experience.',
  },
];

export function AuthorsPact() {
  return (
    <section id="pact" className="py-24 px-4 relative overflow-hidden">
      {/* Subtle Background Pattern */}
      <div className="absolute inset-0 opacity-10 dark:opacity-10 light:opacity-[0.08]">
        <div 
          className="absolute inset-0" 
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }} 
        />
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
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            The Author&apos;s Pact
          </h2>
          <p className="font-nunito text-lg max-w-2xl mx-auto text-muted-foreground">
            Trying to preserve human honesty in each poetry piece.
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
                  <GlassCard className="p-6 h-full glass-hover">
                    <div className="mb-4">
                      <div className="w-12 h-12 glass-light rounded-xl flex items-center justify-center">
                        <Icon className="w-6 h-6" strokeWidth={1.5} />
                      </div>
                    </div>
                    <h3 className="text-xl font-bold mb-2">
                      {item.title}
                    </h3>
                    <p className="font-nunito text-sm leading-relaxed text-muted-foreground">
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
              <div className="space-y-6 font-nunito leading-relaxed text-muted-foreground">
                <p className="text-lg">
                  In this age where artificial intelligence can generate text in milliseconds, 
                  <strong className="text-foreground"> I choose a different - older path.</strong> <br/>
                  I don&apos;t just want to write poems. But craft an essense.
                </p>

                <p className="text-foreground">
                  Noctuary was born from a simple belief, that the soul matters, and that the human 
                  touch in writing creates connections that artificial intelligence never can.<br/>
                  In a world increasingly dominated by AI, we stand as guardians of authentic expression. 
                  Every poem I create is written by me, one who dares claim to understand the weight of words, 
                  the rhythm of emotion, and the art of capturing what makes each piece unique.
                </p>

                <p className="font-bold text-foreground">
                  This is my promise. AND. This is Noctuary.
                </p>
              </div>
            </GlassCard>
          </motion.div>
        </div>
      </div>
    </section>
  );
}