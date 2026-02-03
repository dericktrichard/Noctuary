import { createHmac, timingSafeEqual } from 'crypto';

const SECRET = process.env.MAGIC_LINK_SECRET;

if (!SECRET) {
  throw new Error('MAGIC_LINK_SECRET environment variable is not set');
}

/**
 * Generate a signed token for magic link
 * Format: {orderId}.{email}.{timestamp}.{signature}
 */
export function generateMagicLinkToken(orderId: string, email: string): string {
  const timestamp = Date.now();
  const payload = `${orderId}.${email}.${timestamp}`;
  
  const signature = createHmac('sha256', SECRET)
    .update(payload)
    .digest('base64url');
  
  return `${payload}.${signature}`;
}

/**
 * Verify a magic link token
 * Returns { valid: true, orderId, email } or { valid: false, error }
 */
export function verifyMagicLinkToken(token: string): 
  | { valid: true; orderId: string; email: string }
  | { valid: false; error: string } {
  
  try {
    const parts = token.split('.');
    
    if (parts.length !== 4) {
      return { valid: false, error: 'Invalid token format' };
    }
    
    const [orderId, email, timestamp, providedSignature] = parts;
    
    // Check if token is expired (7 days)
    const tokenAge = Date.now() - parseInt(timestamp);
    const maxAge = 7 * 24 * 60 * 60 * 1000; // 7 days in milliseconds
    
    if (tokenAge > maxAge) {
      return { valid: false, error: 'Token expired' };
    }
    
    // Verify signature
    const payload = `${orderId}.${email}.${timestamp}`;
    const expectedSignature = createHmac('sha256', SECRET)
      .update(payload)
      .digest('base64url');
    
    const providedBuffer = Buffer.from(providedSignature);
    const expectedBuffer = Buffer.from(expectedSignature);
    
    if (providedBuffer.length !== expectedBuffer.length) {
      return { valid: false, error: 'Invalid signature' };
    }
    
    if (!timingSafeEqual(providedBuffer, expectedBuffer)) {
      return { valid: false, error: 'Invalid signature' };
    }
    
    return { valid: true, orderId, email };
  } catch (error) {
    return { valid: false, error: 'Token verification failed' };
  }
}

/**
 * Generate magic link URL
 */
export function generateMagicLink(orderId: string, email: string): string {
  const token = generateMagicLinkToken(orderId, email);
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  
  return `${baseUrl}/order/${orderId}?token=${encodeURIComponent(token)}`;
}
