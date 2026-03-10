import { createHmac, randomBytes } from 'crypto';

const SECRET = process.env.MAGIC_LINK_SECRET!;

if (!SECRET) {
  throw new Error('MAGIC_LINK_SECRET environment variable is not set');
}

export function generateAccessToken(): string {
  return randomBytes(32).toString('hex');
}

export function generateMagicLinkToken(orderId: string, email: string): string {
  const timestamp = Date.now();
  const payload = `${orderId}.${email}.${timestamp}`;
  
  const signature = createHmac('sha256', SECRET)
    .update(payload)
    .digest('base64url');
  
  return `${payload}.${signature}`;
}

export function generateMagicLink(accessToken: string): string {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  return `${baseUrl}/order/${accessToken}`;
}