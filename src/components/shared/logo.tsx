'use client';

import { motion } from 'framer-motion';

interface LogoProps {
  variant?: 'default' | 'light';
  size?: 'sm' | 'md' | 'lg';
}

export function Logo({ variant = 'default', size = 'md' }: LogoProps) {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16',
  };

  const textSizeClasses = {
    sm: 'text-lg',
    md: 'text-xl',
    lg: 'text-2xl',
  };

  const fillColor = variant === 'light' ? '#f2f2f2' : '#f2f2f2';

  return (
    <div className="flex items-center gap-3">
      {/* Monogram Icon */}
      <motion.div
        initial={{ opacity: 0, rotate: -10 }}
        animate={{ opacity: 1, rotate: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className={sizeClasses[size]}
      >
        <svg
          viewBox="0 0 100 100"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full"
        >
          {/* Elegant N with quill flourish */}
          <motion.path
            d="M20 75 L20 25 L30 25 L60 60 L60 25 L70 25 L70 75 L60 75 L30 40 L30 75 Z"
            stroke={fillColor}
            strokeWidth="2"
            fill="none"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 1 }}
            transition={{ duration: 1.5, ease: 'easeInOut' }}
          />
          
          {/* Quill flourish */}
          <motion.path
            d="M75 20 Q80 15, 85 20 L75 30 Q78 25, 75 20 Z"
            fill={fillColor}
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.8 }}
          />
          
          {/* Ink drop */}
          <motion.circle
            cx="80"
            cy="28"
            r="2"
            fill={fillColor}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 1.2 }}
          />
        </svg>
      </motion.div>

      {/* Wordmark */}
      <motion.span
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6, delay: 0.3 }}
        className={`font-serif font-bold tracking-[0.2em] ${textSizeClasses[size]}`}
        style={{ letterSpacing: '0.2em' }}
      >
        NOCTUARY
      </motion.span>
    </div>
  );
}