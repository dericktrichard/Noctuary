export const PRICING = {
  QUICK: {
    PRICE: {
      USD: 0.99,
      KES: 130,
    },
    DELIVERY_HOURS: 24,
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
    MIN_HOURS: 6,
    MAX_HOURS: 12,
  },
};

export function calculatePrice(type: 'QUICK' | 'CUSTOM', currency: 'USD' | 'KES', deliveryHours?: number): number {
  if (type === 'QUICK') {
    return PRICING.QUICK.PRICE[currency];
  }

  // For custom poems, return middle price if no hours specified
  const min = PRICING.CUSTOM.MIN_PRICE[currency];
  const max = PRICING.CUSTOM.MAX_PRICE[currency];
  return (min + max) / 2;
}

export function calculateDeliveryHoursFromBudget(budget: number, currency: 'USD' | 'KES'): number {
  const min = PRICING.CUSTOM.MIN_PRICE[currency];
  const max = PRICING.CUSTOM.MAX_PRICE[currency];
  const minHours = PRICING.CUSTOM.MIN_HOURS;
  const maxHours = PRICING.CUSTOM.MAX_HOURS;

  // Clamp budget to valid range
  const clampedBudget = Math.max(min, Math.min(max, budget));

  // Linear interpolation (inverse): higher budget = fewer hours
  const ratio = (clampedBudget - min) / (max - min);
  const hours = maxHours - ratio * (maxHours - minHours);

  return Math.round(hours);
}