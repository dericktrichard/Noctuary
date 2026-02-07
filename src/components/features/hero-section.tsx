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
      className="relative min-h-screen flex items-center justify-center overflow-hidden bg-[#030014] pt-20"
    >
      {/* --- REFINED ATMOSPHERIC BACKGROUND --- */}
      <div className="absolute inset-0 w-full h-full pointer-events-none">
        {/* Deep Vignette: Darker edges, very subtle glow behind your content */}
        <div className="absolute inset-0 bg-[#02010a]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[70vw] h-[70vw] bg-indigo-500/5 rounded-full blur-[120px]" />
        
        {/* Texture Overlay: Makes the digital black feel like real paper/canvas */}
        <div 
          className="absolute inset-0 opacity-[0.03] mix-blend-overlay" 
          style={{ backgroundImage: `url('https://www.transparenttextures.com/patterns/handmade-paper.png')` }}
        />

        {/* Static Light Beam: A very faint "moonlight" streak across the back */}
        <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/[0.02] to-transparent opacity-50" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* --- LEFT CONTENT (Text) --- */}
          <div className="lg:col-span-5 text-left order-2 lg:order-1">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
            >
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 mb-6">
                <ShieldCheck className="w-4 h-4 text-amber-200/60" />
                <span className="font-nunito text-xs uppercase tracking-widest text-white/50">100% Human Penned</span>
              </div>
              
              <h1 className="font-philosopher text-4xl md:text-4xl lg:text-7xl font-bold leading-[0.9] mb-8 text-white">
                Human Ink, <br />
                <span className="text-white/30 italic font-normal">Soul Scripted.</span>
              </h1>
              
              <p className="font-nunito text-lg text-white/60 mb-8 max-w-md leading-relaxed">
                To move beyond the digital noise.<br/> Commission a bespoke poem crafted with intention, heartbeat, and the timeless touch of human hands.
              </p>

              <div className="flex flex-wrap gap-4">
                <Button
                  size="sm"
                  onClick={scrollToCommission}
                  className="bg-white text-black hover:bg-neutral-200 font-nunito font-bold rounded-full px-10 py-6 h-auto"
                >
                  Choose Your Poem
                </Button>
                <div className="flex -space-x-3 items-center ml-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="w-10 h-10 rounded-full border-2 border-[#030014] bg-neutral-800 flex items-center justify-center overflow-hidden">
                       <img src={`https://i.pravatar.cc/100?img=${i+10}`} alt="User" />
                    </div>
                  ))}
                  <div className="pl-6 text-sm font-nunito text-white/40">
                    <span className="text-white font-bold block">100+</span>
                    Commissions Done
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* --- CENTER ART PIECE --- */}
          <div className="lg:col-span-7 relative order-1 lg:order-2 flex justify-center lg:justify-left">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 1.2, ease: "easeOut" }}
              className="relative w-full max-w-[500px] aspect-square"
            >
              {/* THE SPILL: Animated glow that matches the image's "pulse" */}
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
                className="absolute inset-0 bg-indigo-500/20 blur-[100px] rounded-full"
              />

              {/* Main Decorative Image Holder */}
              <div 
                className="relative w-full h-full rounded-2xl overflow-hidden"
                style={{
                  /* Mask fades the edges so the 'outline' isn't visible */
                  WebkitMaskImage: 'radial-gradient(circle, rgba(0,0,0,1) 60%, rgba(0,0,0,0) 100%)',
                  maskImage: 'radial-gradient(circle, rgba(0,0,0,1) 60%, rgba(0,0,0,0) 100%)',
                }}
              >
                <motion.img 
                  src="https://images.unsplash.com/photo-1516410529446-2c777cb7366d?auto=format&fit=crop&q=80&w=800" 
                  alt="Atmospheric Ink and Quill"
                  className="w-full h-full object-cover grayscale-[0.3] brightness-[0.8]"
                  animate={{
                    scale: [1, 1.1, 1],
                  }}
                  transition={{
                    duration: 10,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                />
                {/* Static Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#030014] via-transparent to-[#030014]/40 pointer-events-none" />
              </div>

              {/* Floating Element 1: Stats/Badge */}
              <motion.div 
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay : 3 }}
                className="absolute -top-4 -right-4 p-4 glass-card border border-white/10 rounded-2xl backdrop-blur-md hidden md:block z-20"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-amber-500/10 rounded-lg border border-amber-500/20">
                    <Feather className="w-5 h-5 text-amber-200/60" />
                  </div>
                  <div>
                    <div className="text-[10px] font-nunito text-white/30 uppercase tracking-tighter">Current Status</div>
                    <div className="text-sm font-philosopher font-bold text-white/80">Accepting Commissions</div>
                  </div>
                </div>
              </motion.div>

              {/* Floating Element 2: Small Quote */}
              <motion.div 
                className="absolute -bottom-6 -right-2 p-4 glass-card border border-white/5 rounded-2xl max-w-[200px] hidden lg:block z-20 shadow-2xl"
              >
                <p className="font-philosopher italic text-sm text-white/40 leading-relaxed">
                  "Words are but the shadow of the heart's true ink."
                </p>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* --- SCROLL INDICATOR --- */}
      <div className="absolute bottom-8 left-3/5 -translate-x-1/2 flex flex-col items-center gap-3 opacity-30">
        <div className="w-[1px] h-12 bg-gradient-to-b from-white to-transparent" />
        <span className="font-nunito text-[9px] uppercase tracking-[0.4em] text-white">Scroll</span>
      </div>
    </section>
  );
}