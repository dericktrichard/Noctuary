'use client';

import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Feather, ShieldCheck } from 'lucide-react';

export function HeroSection() {
  const scrollToCommission = () => {
    document.querySelector('#commission')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section 
      id="home" 
      className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20"
    >
      <div className="relative z-10 max-w-7xl mx-auto px-6 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* LEFT CONTENT */}
          <div className="lg:col-span-5 text-left order-2 lg:order-1">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
            >
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full glass-card mb-6">
                <ShieldCheck className="w-4 h-4 text-foreground/60" />
                <span className="font-nunito text-xs uppercase tracking-widest text-muted-foreground">
                  100% Human Penned
                </span>
              </div>
              
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold leading-[0.9] mb-8">
                Human Ink, <br />
                <span className="text-muted-foreground italic font-normal">Soul Scripted.</span>
              </h1>
              
              <p className="font-nunito text-lg text-muted-foreground mb-8 max-w-md leading-relaxed">
                To move a bit beyond the digital noise. <br/> Commission a bespoke poem crafted with intention, heartbeat, 
                and the timeless touch of human hands.
              </p>

              <div className="flex flex-wrap gap-4">
                <Button
                  size="lg"
                  onClick={scrollToCommission}
                  className="font-nunito font-bold rounded-full px-10"
                >
                  Choose Your Poem
                </Button>
                <div className="flex -space-x-3 items-center ml-4">
                  {[1, 2, 3].map((i) => (
                    <div 
                      key={i} 
                      className="w-10 h-10 rounded-full border-2 border-background glass-card flex items-center justify-center overflow-hidden"
                    >
                      <img src={`https://i.pravatar.cc/100?img=${i+10}`} alt="User" className="w-full h-full object-cover" />
                    </div>
                  ))}
                  <div className="pl-6 text-sm font-nunito text-muted-foreground">
                    <span className="text-foreground font-bold block">10+</span>
                    Commissions Done
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* CENTER ART PIECE */}
          <div className="lg:col-span-7 relative order-1 lg:order-2 flex justify-center lg:justify-end">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 1.2, ease: "easeOut" }}
              className="relative w-full max-w-[500px] aspect-square"
            >
              {/* Animated glow */}
              <motion.div
                animate={{
                  scale: [1, 1.15, 1],
                  opacity: [0.2, 0.4, 0.2],
                }}
                transition={{
                  duration: 10,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                className="absolute inset-0 bg-primary/20 blur-[100px] rounded-full"
              />

              {/* Main Image */}
              <div 
                className="relative w-full h-full rounded-2xl overflow-hidden"
                style={{
                  WebkitMaskImage: 'radial-gradient(circle, rgba(0,0,0,1) 60%, rgba(0,0,0,0) 100%)',
                  maskImage: 'radial-gradient(circle, rgba(0,0,0,1) 60%, rgba(0,0,0,0) 100%)',
                }}
              >
                <motion.img 
                  src="https://images.unsplash.com/photo-1533271802434-53997a5f9e6c?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" 
                  alt="Atmospheric Ink and Quill"
                  className="w-full h-full object-cover dark:grayscale-[0.2] dark:brightness-[0.5] light:grayscale-[0.1] light:brightness-[0.8]"
                  animate={{
                    scale: [1, 1.1, 1],
                  }}
                  transition={{
                    duration: 10,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-background/40 pointer-events-none" />
              </div>

              {/* Floating Element 1: Stats Badge */}
              <motion.div 
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 3 }}
                className="absolute -top-4 -right-4 p-4 glass-card rounded-2xl backdrop-blur-md hidden md:block z-20"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 glass-light rounded-lg">
                    <Feather className="w-5 h-5 text-foreground/60" />
                  </div>
                  <div>
                    <div className="text-[10px] font-nunito text-muted-foreground uppercase tracking-tight">
                      Current Status
                    </div>
                    <div className="text-sm font-bold">Accepting Commissions</div>
                  </div>
                </div>
              </motion.div>

              {/* Floating Element 2: Quote */}
              <motion.div 
                animate={{ y: [0, 10, 0] }}
                transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                className="absolute -bottom-6 -right-2 p-4 glass-card rounded-2xl max-w-[200px] hidden lg:block z-20 shadow-2xl"
              >
                <p className="italic text-sm text-muted-foreground leading-relaxed">
                  "A literati world penned by inked words." ..Aprel
                </p>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-3 opacity-30">
        <div className="w-[1px] h-12 bg-gradient-to-b from-foreground to-transparent" />
        <span className="font-nunito text-[9px] uppercase tracking-[0.4em]">Scroll</span>
      </div>
    </section>
  );
}