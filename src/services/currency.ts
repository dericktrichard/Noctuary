import 'server-only';

/**
 * Fetch current USD to KES exchange rate
 */
export async function fetchExchangeRate(): Promise<number> {
  try {
    const response = await fetch(
      'https://api.exchangerate-api.com/v4/latest/USD',
      { next: { revalidate: 3600 } } // Cache for 1 hour
    );
    
    if (!response.ok) {
      throw new Error('Failed to fetch exchange rate');
    }
    
    const data = await response.json();
    return data.rates.KES || 150; // Fallback to ~150 if API fails
  } catch (error) {
    console.error('Currency API error:', error);
    return 150; // Fallback rate
  }
}

/**
 * Convert USD to KES using current rate
 */
export async function convertUSDToKES(usd: number): Promise<number> {
  const rate = await fetchExchangeRate();
  return Math.round(usd * rate);
}

/**
 * Get pricing with current exchange rates
 */
export async function getPricingWithLiveRates() {
  const rate = await fetchExchangeRate();
  
  return {
    exchangeRate: rate,
    quick: {
      USD: 0.99,
      KES: Math.round(0.99 * rate),
    },
    custom: {
      min: {
        USD: 1.99,
        KES: Math.round(1.99 * rate),
      },
      max: {
        USD: 4.99,
        KES: Math.round(4.99 * rate),
      },
    },
  };
}