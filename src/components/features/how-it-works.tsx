'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, PenTool, Heart, ChevronDown, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';

const steps = [
  {
    icon: Mail,
    title: 'Share Your Vision',
    description: 'Tell us what you need—a quick surprise or a detailed custom piece tailored to your story.',
  },
  {
    icon: PenTool,
    title: 'We Craft Your Words',
    description: 'A real poet writes your poem with care, emotion, and authenticity. No templates, no AI.',
  },
  {
    icon: Heart,
    title: 'Receive & Cherish',
    description: 'Get your unique poem delivered via email. Full copyright transfers to you instantly.',
  },
];

export function HowItWorks() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <section id="how-it-works" className="py-12 px-4 relative">
      <div className="max-w-6xl mx-auto">
        {/* Collapsed State: CTA Button */}
        <AnimatePresence mode="wait">
          {!isOpen ? (
            <motion.div
              key="collapsed"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4 }}
              className="text-center"
            >
              <Button
                onClick={() => setIsOpen(true)}
                size="lg"
                variant="outline"
                className="font-nunito gap-3 px-8 py-6 h-auto group relative overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-primary/0 via-primary/10 to-primary/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <Sparkles className="w-5 h-5 group-hover:rotate-12 transition-transform" />
                <span className="text-base">How Does It Work?</span>
                <ChevronDown className="w-5 h-5 group-hover:translate-y-1 transition-transform" />
              </Button>
            </motion.div>
          ) : (
            <motion.div
              key="expanded"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
            >
              {/* Header */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="text-center mb-16"
              >
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full glass-card mb-4">
                  <Sparkles className="w-4 h-4" />
                  <span className="font-nunito text-xs uppercase tracking-widest">Process</span>
                </div>

                <h2 className="text-4xl md:text-5xl font-bold mb-4">
                  How It Works
                </h2>
                <p className="font-nunito text-lg max-w-2xl mx-auto text-muted-foreground">
                  Three simple steps to your personalized poem
                </p>

                <Button
                  onClick={() => setIsOpen(false)}
                  variant="ghost"
                  size="sm"
                  className="mt-6 font-nunito gap-2"
                >
                  <ChevronDown className="w-4 h-4 rotate-180" />
                  Collapse
                </Button>
              </motion.div>

              {/* Steps with Connecting Path */}
              <div className="relative">
                {/* Connecting Line - Desktop */}
                <div className="hidden lg:block absolute top-24 left-0 right-0 h-0.5">
                  <motion.div
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: 1 }}
                    transition={{ duration: 1.5, delay: 0.3 }}
                    className="h-full bg-gradient-to-r from-transparent via-primary/30 to-transparent origin-left"
                  />
                </div>

                <div className="grid md:grid-cols-3 gap-8 lg:gap-12">
                  {steps.map((step, index) => {
                    const Icon = step.icon;
                    return (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 40 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{
                          duration: 0.6,
                          delay: index * 0.2 + 0.3,
                          ease: [0.4, 0, 0.2, 1]
                        }}
                        className="relative group"
                      >
                        {/* Card */}
                        <div className="relative glass-card rounded-2xl p-8 border border-border hover:border-primary/50 transition-all duration-500 h-full">
                          {/* Gradient Background on Hover */}
                          <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                          <div className="relative z-10">
                            {/* Step Number Badge */}
                            <motion.div
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              transition={{ delay: index * 0.2 + 0.5, type: 'spring' }}
                              className="absolute -top-12 left-1/2 -translate-x-1/2 w-12 h-12 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-bold text-lg font-nunito shadow-lg shadow-primary/25"
                            >
                              {index + 1}
                            </motion.div>

                            {/* Icon */}
                            <div className="mb-6 flex justify-center mt-4">
                              <div className="w-20 h-20 glass-light rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                                <Icon className="w-10 h-10" strokeWidth={1.5} />
                              </div>
                            </div>

                            {/* Content */}
                            <h3 className="text-2xl font-bold mb-3 text-center group-hover:text-primary transition-colors">
                              {step.title}
                            </h3>
                            <p className="font-nunito text-center leading-relaxed text-muted-foreground">
                              {step.description}
                            </p>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}