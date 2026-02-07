import 'server-only';

/**
 * Fetch current USD to KES exchange rate
 * Using exchangerate-api.com (free tier: 1,500 requests/month)
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
    return data.rates.KES || 130; // Fallback to 130 if API fails
  } catch (error) {
    console.error('Currency API error:', error);
    return 130; // Fallback rate
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
 * Get pricing in both currencies
 */
export async function getPricingWithCurrentRates() {
  const rate = await fetchExchangeRate();
  
  return {
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
    exchangeRate: rate,
  };
}