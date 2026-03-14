'use client';

import { useEffect, useRef, useState, useMemo } from 'react';
import { useTheme } from 'next-themes';

export function VantaBackground() {
  const vantaRef = useRef<HTMLDivElement>(null);
  const vantaEffectRef = useRef<any>(null);
  const loadAttemptRef = useRef(0);
  const { theme, systemTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [loadError, setLoadError] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const currentTheme = theme === 'system' ? systemTheme : theme;
  const isDark = currentTheme === 'dark';

  const config = useMemo(() => {
    const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
    const isVerySmall = typeof window !== 'undefined' && window.innerWidth < 375;

    if (isVerySmall) return null;

    return {
      mouseControls: !isMobile,
      touchControls: true,
      gyroControls: false,
      minHeight: 200,
      minWidth: 200,
      scale: isMobile ? 0.8 : 1.0,
      scaleMobile: 0.8,
      backgroundColor: isDark ? 0x0a0a0a : 0xf5f5f5,
      color1: isDark ? 0xff00f1 : 0x6366f1,
      color2: isDark ? 0x00eaea : 0x06b6d4,
      colorMode: 'lerpGradient' as const,
      wingSpan: isMobile ? 15.0 : 21.0,
      speedLimit: isMobile ? 2.0 : 6.0,
      separation: 54.0,
      alignment: 27.0,
      cohesion: 20.0,
      quantity: isMobile ? 1.5 : 3.0,
      birdSize: isMobile ? 1.0 : 1.5,
    };
  }, [isDark]);

  useEffect(() => {
    if (!mounted || !vantaRef.current || !config || loadError) return;

    if (vantaEffectRef.current) {
      try {
        vantaEffectRef.current.destroy();
        vantaEffectRef.current = null;
      } catch (err) {
        console.error('[VANTA] Cleanup error:', err);
      }
    }

    const loadVanta = async () => {
      try {
        loadAttemptRef.current += 1;
        
        const [VANTA, THREE] = await Promise.all([
          import('vanta/dist/vanta.birds.min'),
          import('three')
        ]);

        if (vantaRef.current && !vantaEffectRef.current) {
          const effect = (VANTA as any).default({
            el: vantaRef.current,
            THREE: THREE,
            ...config
          });
          
          vantaEffectRef.current = effect;
          console.log('[VANTA] Initialized successfully');
        }
      } catch (err) {
        console.error('[VANTA] Load error:', err);
        
        if (loadAttemptRef.current < 3) {
          setTimeout(loadVanta, 1000 * loadAttemptRef.current);
        } else {
          setLoadError(true);
          console.error('[VANTA] Max retry attempts reached');
        }
      }
    };

    loadVanta();

    return () => {
      if (vantaEffectRef.current) {
        try {
          vantaEffectRef.current.destroy();
          vantaEffectRef.current = null;
        } catch (err) {
          console.error('[VANTA] Cleanup error:', err);
        }
      }
    };
  }, [mounted, config, loadError]);

  if (!mounted || loadError) {
    return null;
  }

  return (
    <div 
      ref={vantaRef} 
      className="fixed inset-0 -z-10 transition-colors duration-500"
      style={{ 
        width: '100%', 
        height: '100%',
      }}
      aria-hidden="true"
    />
  );
}