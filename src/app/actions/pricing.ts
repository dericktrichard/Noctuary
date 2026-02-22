'use server';

import { getUSDtoKESRate } from '@/services/currency';

export interface DynamicPricing {
  exchangeRate: number;
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
}

// Get current pricing with live exchange rates
export async function getCurrentPricing(): Promise<DynamicPricing> {
  const rate = await getUSDtoKESRate();
  
  const quickUsd = 0.99;
  const customMinUsd = 1.99;
  const customMaxUsd = 4.99;

  return {
    exchangeRate: rate,
    quick: {
      usd: quickUsd,
      kes: Math.round(quickUsd * rate),
    },
    custom: {
      minUsd: customMinUsd,
      maxUsd: customMaxUsd,
      minKes: Math.round(customMinUsd * rate),
      maxKes: Math.round(customMaxUsd * rate),
    },
  };
}