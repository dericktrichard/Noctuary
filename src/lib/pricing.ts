/**
 * Pricing Configuration
 * Single source of truth for all pricing logic
 */

export const PRICING = {
  QUICK: {
    USD: 0.99,
    KES: 130, // Approximate KES equivalent
    deliveryHours: 24,
  },
  CUSTOM: {
    BASE: {
      USD: 1.99,
      KES: 260,
    },
    URGENCY: {
      24: { multiplier: 1, hours: 24 },    // Standard: $1.99
      12: { multiplier: 1.5, hours: 12 },  // Fast: $2.99
      6: { multiplier: 2.5, hours: 6 },    // Priority: $4.99
    },
  },
} as const;

/**
 * Calculate price for a commission
 * @param type - 'QUICK' or 'CUSTOM'
 * @param currency - 'USD' or 'KES'
 * @param urgency - Hours (6, 12, 24) - only for CUSTOM
 * @returns The calculated price
 */
export function calculatePrice(
  type: 'QUICK' | 'CUSTOM',
  currency: 'USD' | 'KES',
  urgency?: number
): number {
  if (type === 'QUICK') {
    return PRICING.QUICK[currency];
  }

  // Custom poem pricing
  if (!urgency || ![6, 12, 24].includes(urgency)) {
    throw new Error('Invalid urgency for custom poem');
  }

  const basePrice = PRICING.CUSTOM.BASE[currency];
  const urgencyConfig = PRICING.CUSTOM.URGENCY[urgency as 6 | 12 | 24];
  
  return Number((basePrice * urgencyConfig.multiplier).toFixed(2));
}

/**
 * Validate that client-submitted price matches server calculation
 * CRITICAL SECURITY: Always verify price on server before processing payment
 */
export function validatePrice(
  type: 'QUICK' | 'CUSTOM',
  currency: 'USD' | 'KES',
  clientPrice: number,
  urgency?: number
): boolean {
  const serverPrice = calculatePrice(type, currency, urgency);
  
  // Allow 0.01 difference for rounding
  return Math.abs(serverPrice - clientPrice) < 0.02;
}

/**
 * Get delivery hours based on poem type and urgency
 */
export function getDeliveryHours(type: 'QUICK' | 'CUSTOM', urgency?: number): number {
  if (type === 'QUICK') {
    return PRICING.QUICK.deliveryHours;
  }

  if (!urgency || ![6, 12, 24].includes(urgency)) {
    return 24; // Default to standard
  }

  return PRICING.CUSTOM.URGENCY[urgency as 6 | 12 | 24].hours;
}

/**
 * Get pricing display information for UI
 */
export function getPricingInfo(currency: 'USD' | 'KES' = 'USD') {
  return {
    quick: {
      price: PRICING.QUICK[currency],
      deliveryHours: PRICING.QUICK.deliveryHours,
    },
    custom: {
      standard: {
        price: calculatePrice('CUSTOM', currency, 24),
        hours: 24,
      },
      fast: {
        price: calculatePrice('CUSTOM', currency, 12),
        hours: 12,
      },
      priority: {
        price: calculatePrice('CUSTOM', currency, 6),
        hours: 6,
      },
    },
  };
}
