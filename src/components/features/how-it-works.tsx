'use client';

import { motion } from 'framer-motion';
import { Mail, PenTool, Heart } from 'lucide-react';

const steps = [
  {
    icon: Mail,
    title: 'Share Your Vision',
    description: 'Tell us what you need—a quick surprise or a detailed custom piece.',
  },
  {
    icon: PenTool,
    title: 'We Craft Your Words',
    description: 'A human poet writes your poem with care, emotion, and authenticity.',
  },
  {
    icon: Heart,
    title: 'Receive & Cherish',
    description: 'Get your unique poem delivered via email. Full copyright transfers to you.',
  },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="py-24 px-4 relative">
      <div className="max-w-6xl mx-auto">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="font-serif text-4xl md:text-5xl font-bold mb-4">
            How It Works
          </h2>
          <p className="text-white/60 font-caption text-lg max-w-2xl mx-auto">
            Three simple steps to your personalized poem
          </p>
        </motion.div>

        {/* Steps Grid */}
        <div className="grid md:grid-cols-3 gap-8 md:gap-12">
          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
                className="relative"
              >
                {/* Connecting Line (hidden on mobile) */}
                {index < steps.length - 1 && (
                  <div className="hidden md:block absolute top-12 left-[60%] w-full h-0.5 bg-gradient-to-r from-white/20 to-transparent" />
                )}

                {/* Step Card */}
                <div className="glass-card rounded-2xl p-8 hover:bg-white/5 transition-all duration-300 relative z-10">
                  {/* Step Number */}
                  <div className="absolute -top-4 -left-4 w-10 h-10 bg-white text-black rounded-full flex items-center justify-center font-bold text-lg font-caption">
                    {index + 1}
                  </div>

                  {/* Icon */}
                  <div className="mb-6 flex justify-center">
                    <div className="w-16 h-16 glass-light rounded-2xl flex items-center justify-center">
                      <Icon className="w-8 h-8 text-white" strokeWidth={1.5} />
                    </div>
                  </div>

                  {/* Content */}
                  <h3 className="font-serif text-2xl font-bold mb-3 text-center">
                    {step.title}
                  </h3>
                  <p className="text-white/70 font-caption text-center leading-relaxed">
                    {step.description}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}