import 'server-only';

const FALLBACK_RATE = 130;

// In-memory cache to prevent multiple API calls
let cachedRate: { rate: number; timestamp: number } | null = null;
const CACHE_DURATION = 60 * 60 * 1000; // 1 hour

export async function getUSDtoKESRate(): Promise<number> {
  // Check in-memory cache first
  if (cachedRate && Date.now() - cachedRate.timestamp < CACHE_DURATION) {
    console.log(`[CURRENCY] Using cached rate: ${cachedRate.rate}`);
    return cachedRate.rate;
  }

  try {
    const response = await fetch(
      'https://open.er-api.com/v6/latest/USD',
      { 
        next: { revalidate: 3600 },
        cache: 'force-cache'
      }
    );
    
    if (!response.ok) throw new Error('API request failed');
    
    const data = await response.json();
    const rate = data.rates.KES;
    
    if (!rate || isNaN(rate)) throw new Error('Invalid rate');
    
    const roundedRate = Math.round(rate);
    cachedRate = { rate: roundedRate, timestamp: Date.now() };
    
    console.log(`[CURRENCY] Fetched fresh USD to KES rate: ${roundedRate}`);
    return roundedRate;
    
  } catch (error) {
    console.error('[CURRENCY] Using fallback:', error);
    if (cachedRate) return cachedRate.rate;
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