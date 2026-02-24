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
          mouseControls: true,
          touchControls: true,
          gyroControls: false,
          minHeight: 200.00,
          minWidth: 200.00,
          scale: isMobile ? 0.8 : 1.00,
          scaleMobile: 0.8,
          // Dynamic background based on theme
          backgroundColor: isDark ? 0x0a0a0a : 0xf5f5f5,
          // Dynamic bird colors based on theme
          color1: isDark ? 0xff00f1 : 0x6366f1, // Pink in dark, Indigo in light
          color2: isDark ? 0x00eaea : 0x06b6d4, // Cyan in dark, Sky blue in light
          colorMode: "lerpGradient",
          wingSpan: 21.00,
          speedLimit: isMobile ? 4.00 : 6.00,
          separation: 54.00,
          alignment: 27.00,
          cohesion: 20.00,
          quantity: isMobile ? 2.00 : 3.00,
          birdSize: isMobile ? 1.2 : 1.5,
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