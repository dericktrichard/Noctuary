/**
 * Pricing Configuration
 * Single source of truth for all pricing logic
 */

export const PRICING = {
  QUICK: {
    USD: 0.99,
    KES: 130,
    deliveryHours: 24,
  },
  CUSTOM: {
    MIN_PRICE: {
      USD: 1.99,
      KES: 260,
    },
    MAX_PRICE: {
      USD: 4.99,
      KES: 650,
    },
    MAX_HOURS: 12, // At minimum price
    MIN_HOURS: 6,  // At maximum price
  },
} as const;

/**
 * Calculate delivery hours based on budget for custom poems
 * Lower price = More time, Higher price = Less time
 * $1.99 = 12 hours, $4.99 = 6 hours (linear interpolation)
 */
export function calculateDeliveryHoursFromBudget(budget: number, currency: 'USD' | 'KES' = 'USD'): number {
  const minPrice = PRICING.CUSTOM.MIN_PRICE[currency];
  const maxPrice = PRICING.CUSTOM.MAX_PRICE[currency];
  const maxHours = PRICING.CUSTOM.MAX_HOURS;
  const minHours = PRICING.CUSTOM.MIN_HOURS;

  // Clamp budget to valid range
  const clampedBudget = Math.max(minPrice, Math.min(maxPrice, budget));

  // Linear interpolation: as price increases, hours decrease
  const priceRange = maxPrice - minPrice;
  const hoursRange = maxHours - minHours;
  const priceProgress = (clampedBudget - minPrice) / priceRange;
  
  // Inverse relationship: higher price = lower hours
  const hours = maxHours - (priceProgress * hoursRange);
  
  return Math.round(hours);
}

/**
 * Calculate price for a commission
 */
export function calculatePrice(
  type: 'QUICK' | 'CUSTOM',
  currency: 'USD' | 'KES',
  urgency?: number
): number {
  if (type === 'QUICK') {
    return PRICING.QUICK[currency];
  }

  // For custom, if urgency is provided, calculate price from hours
  if (urgency) {
    const minPrice = PRICING.CUSTOM.MIN_PRICE[currency];
    const maxPrice = PRICING.CUSTOM.MAX_PRICE[currency];
    const maxHours = PRICING.CUSTOM.MAX_HOURS;
    const minHours = PRICING.CUSTOM.MIN_HOURS;

    // Clamp urgency to valid range
    const clampedHours = Math.max(minHours, Math.min(maxHours, urgency));

    // Linear interpolation: as hours decrease, price increases
    const hoursRange = maxHours - minHours;
    const priceRange = maxPrice - minPrice;
    const hoursProgress = (maxHours - clampedHours) / hoursRange;
    
    const price = minPrice + (hoursProgress * priceRange);
    
    return Number(price.toFixed(2));
  }

  // Default to minimum price
  return PRICING.CUSTOM.MIN_PRICE[currency];
}

/**
 * Validate that client-submitted price matches server calculation
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

  if (!urgency || urgency < 6 || urgency > 12) {
    return 12; // Default to max hours
  }

  return urgency;
}

/**
 * Get pricing info for display
 */
export function getPricingInfo(currency: 'USD' | 'KES' = 'USD') {
  return {
    quick: {
      price: PRICING.QUICK[currency],
      deliveryHours: PRICING.QUICK.deliveryHours,
    },
    custom: {
      minPrice: PRICING.CUSTOM.MIN_PRICE[currency],
      maxPrice: PRICING.CUSTOM.MAX_PRICE[currency],
      minHours: PRICING.CUSTOM.MIN_HOURS,
      maxHours: PRICING.CUSTOM.MAX_HOURS,
    },
  };
}