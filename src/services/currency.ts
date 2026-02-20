import 'server-only';

const FALLBACK_RATE = 130;

/**
 * Get real-time USD to KES exchange rate
 * Used server-side only for payment conversion
 */
export async function getUSDtoKESRate(): Promise<number> {
  try {
    const response = await fetch(
      'https://open.er-api.com/v6/latest/USD',
      { next: { revalidate: 3600 } }
    );
    
    if (!response.ok) throw new Error('API request failed');
    
    const data = await response.json();
    const rate = data.rates.KES;
    
    if (!rate || isNaN(rate)) throw new Error('Invalid rate');
    
    console.log(`[CURRENCY] Live USD to KES rate: ${rate}`);
    return Math.round(rate);
    
  } catch (error) {
    console.error('[CURRENCY] Using fallback rate:', error);
    return FALLBACK_RATE;
  }
}

export async function convertUSDtoKES(usd: number): Promise<number> {
  const rate = await getUSDtoKESRate();
  return Math.round(usd * rate);
}

export async function convertKEStoUSD(kes: number): Promise<number> {
  const rate = await getUSDtoKESRate();
  return Math.round((kes / rate) * 100) / 100;
}