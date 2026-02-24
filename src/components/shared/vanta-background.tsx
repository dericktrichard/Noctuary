'use client';

import { useEffect, useRef, useState } from 'react';
import { useTheme } from 'next-themes';

export function VantaBackground() {
  const vantaRef = useRef<HTMLDivElement>(null);
  const vantaEffectRef = useRef<any>(null); 
  const { theme, systemTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Prevent hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted || !vantaRef.current) return;

    const currentTheme = theme === 'system' ? systemTheme : theme;
    const isDark = currentTheme === 'dark';
    const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;

    // Destroy existing effect when theme changes
    if (vantaEffectRef.current) {
      try {
        vantaEffectRef.current.destroy();
        vantaEffectRef.current = null;
      } catch (err) {
        console.error('Error destroying Vanta effect:', err);
      }
    }

    // Dynamically load Vanta with theme-appropriate colors (SSR-safe)
    Promise.all([
      import('vanta/dist/vanta.birds.min'),
      import('three')
    ]).then(([VANTA, THREE]) => {
      if (vantaRef.current) {
        const effect = (VANTA as any).default({
          el: vantaRef.current,
          THREE: THREE,
          mouseControls: !isMobile,
          touchControls: true,
          gyroControls: false,
          minHeight: 200.00,
          minWidth: 200.00,
          scale: isMobile ? 0.8 : 1.00,
          scaleMobile: 0.8,
          backgroundColor: isDark ? 0x0a0a0a : 0xf5f5f5,
          color1: isDark ? 0xff00f1 : 0x6366f1, 
          color2: isDark ? 0x00eaea : 0x06b6d4, 
          colorMode: "lerpGradient",
          wingSpan: isMobile ? 15.00 : 21.00,
          speedLimit: isMobile ? 2.00 : 6.00,
          separation: 54.00,
          alignment: 27.00,
          cohesion: 20.00,
          quantity: isMobile ? 1.50 : 3.00,
          birdSize: isMobile ? 1.0 : 1.5,
        });
        vantaEffectRef.current = effect;
      }
    }).catch((err) => {
      console.error('Vanta.js failed to load:', err);
    });

    // Cleanup on unmount or theme change
    return () => {
      if (vantaEffectRef.current) {
        try {
          vantaEffectRef.current.destroy();
          vantaEffectRef.current = null;
        } catch (err) {
          console.error('Error destroying Vanta effect:', err);
        }
      }
    };
  }, [mounted, theme, systemTheme]); 

  if (!mounted) {
    return null; // Prevent SSR mismatch
  }

  return (
    <div 
      ref={vantaRef} 
      className="fixed inset-0 -z-10 transition-colors duration-500"
      style={{ 
        width: '100%', 
        height: '100%',
      }}
    />
  );
}