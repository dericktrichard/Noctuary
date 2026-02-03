import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Merges Tailwind CSS classes with proper precedence
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format currency based on locale
 */
export function formatCurrency(amount: number, currency: 'USD' | 'KES' = 'USD'): string {
  const formatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
  });
  
  return formatter.format(amount);
}

/**
 * Calculate deadline based on urgency hours
 */
export function calculateDeadline(urgencyHours: number): Date {
  const deadline = new Date();
  deadline.setHours(deadline.getHours() + urgencyHours);
  return deadline;
}

/**
 * Format date for display
 */
export function formatDate(date: Date | string): string {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(date));
}

/**
 * Convert KES to USD (approximate)
 */
export function convertKESToUSD(kes: number): number {
  const rate = parseFloat(process.env.EXCHANGE_RATE_KES_TO_USD || '0.0077');
  return kes * rate;
}

/**
 * Convert USD to KES (approximate)
 */
export function convertUSDToKES(usd: number): number {
  const rate = parseFloat(process.env.EXCHANGE_RATE_KES_TO_USD || '0.0077');
  return Math.round(usd / rate);
}

/**
 * Truncate text with ellipsis
 */
export function truncate(text: string, length: number): string {
  if (text.length <= length) return text;
  return text.substring(0, length) + '...';
}

/**
 * Sleep utility for delays
 */
export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
