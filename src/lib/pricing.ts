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

export type PricingConfig = {
  quick: {
    usd: number;
    kes: number;
  };
  custom: {
    minUsd: number;
    maxUsd: number;
    minKes: number;
    maxKes: number;
  };
};

export const DEFAULT_PRICING_CONFIG: PricingConfig = {
  quick: {
    usd: PRICING.QUICK.PRICE.USD,
    kes: PRICING.QUICK.PRICE.KES,
  },
  custom: {
    minUsd: PRICING.CUSTOM.MIN_PRICE.USD,
    maxUsd: PRICING.CUSTOM.MAX_PRICE.USD,
    minKes: PRICING.CUSTOM.MIN_PRICE.KES,
    maxKes: PRICING.CUSTOM.MAX_PRICE.KES,
  },
};

export function calculatePrice(type: 'QUICK' | 'CUSTOM', currency: 'USD' | 'KES'): number {
  if (type === 'QUICK') {
    return PRICING.QUICK.PRICE[currency];
  }

  const min = PRICING.CUSTOM.MIN_PRICE[currency];
  const max = PRICING.CUSTOM.MAX_PRICE[currency];
  return (min + max) / 2;
}

export function calculateDeliveryHoursFromBudget(
  budget: number,
  currency: 'USD' | 'KES',
  pricing: PricingConfig = DEFAULT_PRICING_CONFIG
): number {
  const min = currency === 'USD' ? pricing.custom.minUsd : pricing.custom.minKes;
  const max = currency === 'USD' ? pricing.custom.maxUsd : pricing.custom.maxKes;
  const minHours = PRICING.CUSTOM.MIN_HOURS;
  const maxHours = PRICING.CUSTOM.MAX_HOURS;

  const clampedBudget = Math.max(min, Math.min(max, budget));
  const ratio = (clampedBudget - min) / (max - min);
  const hours = maxHours - ratio * (maxHours - minHours);

  return Math.round(hours);
}

export function validatePrice(
  type: 'QUICK' | 'CUSTOM',
  currency: 'USD' | 'KES',
  clientPrice: number,
  deliveryHours?: number,
  pricing: PricingConfig = DEFAULT_PRICING_CONFIG
): boolean {
  if (type === 'QUICK') {
    const expectedPrice = currency === 'USD' ? pricing.quick.usd : pricing.quick.kes;
    return Math.abs(clientPrice - expectedPrice) < 0.01;
  }

  const min = currency === 'USD' ? pricing.custom.minUsd : pricing.custom.minKes;
  const max = currency === 'USD' ? pricing.custom.maxUsd : pricing.custom.maxKes;
  
  if (clientPrice < min - 0.01 || clientPrice > max + 0.01) {
    return false;
  }

  if (deliveryHours !== undefined) {
    const expectedHours = calculateDeliveryHoursFromBudget(clientPrice, currency, pricing);
    return Math.abs(deliveryHours - expectedHours) <= 1;
  }

  return true;
}