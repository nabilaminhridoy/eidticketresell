import { cookies } from 'next/headers';

const JWT_SECRET = process.env.JWT_SECRET || 'eid-ticket-resell-secret-key-2024';

export async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  const hash = await hashPassword(password);
  return hash === hashedPassword;
}

export function generateToken(payload: Record<string, unknown>): string {
  const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const payloadStr = btoa(JSON.stringify({ ...payload, iat: Date.now(), exp: Date.now() + 7 * 24 * 60 * 60 * 1000 }));
  const signature = btoa(`${header}.${payloadStr}.${JWT_SECRET}`);
  return `${header}.${payloadStr}.${signature}`;
}

export function verifyToken(token: string): Record<string, unknown> | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const payload = JSON.parse(atob(parts[1]));
    if (payload.exp && payload.exp < Date.now()) return null;
    return payload;
  } catch {
    return null;
  }
}

export function generateTicketId(count: number): string {
  return `ETR-${count}`;
}

export function generateOrderId(count: number): string {
  return `ORD-${count}`;
}

export function generateKycId(count: number): string {
  return `KYC-${count}`;
}

export function generatePaymentId(count: number): string {
  return `TXN-${count}`;
}

export function generateWithdrawalId(count: number): string {
  return `WDR-${count}`;
}

export function generatePayoutId(count: number): string {
  return `PAY-${count}`;
}

export function generateWalletTransactionId(count: number): string {
  return `WLT-${count}`;
}

export function generateRefundId(count: number): string {
  return `REF-${count}`;
}

export function generateDisputeId(count: number): string {
  return `DSP-${count}`;
}

export function generateSupportId(count: number): string {
  return `SUP-${count}`;
}
