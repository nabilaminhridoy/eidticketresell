import { db } from '@/lib/db';
import {
  ONLINE_COPY_PLATFORM_FEE_PERCENTAGE,
  COUNTER_COPY_PLATFORM_FEE_PERCENTAGE,
  PLATFORM_FEE_MINIMUM,
} from '@/lib/constants';

// In-memory cache for platform fee settings (refreshed every 60 seconds)
let feeCache: {
  onlineFee: number;
  counterFee: number;
  minimumFee: number;
  updatedAt: number;
} | null = null;

const CACHE_DURATION_MS = 60_000; // 1 minute

/**
 * Get platform fee percentages from database settings.
 * Falls back to constants if settings are not configured.
 * 
 * Returns:
 * - onlineFee: Platform fee % for Online Copy tickets
 * - counterFee: Platform fee % for Counter copy tickets
 * - minimumFee: Minimum fee amount in BDT
 */
export async function getPlatformFees(): Promise<{
  onlineFee: number;
  counterFee: number;
  minimumFee: number;
}> {
  // Check cache
  if (feeCache && Date.now() - feeCache.updatedAt < CACHE_DURATION_MS) {
    return feeCache;
  }

  try {
    const settings = await db.setting.findMany({
      where: {
        key: {
          in: ['platform_fee_online', 'platform_fee_counter', 'platform_fee_minimum'],
        },
      },
    });

    const settingsMap: Record<string, string> = {};
    for (const s of settings) {
      settingsMap[s.key] = s.value;
    }

    const onlineFee = parseFloat(settingsMap['platform_fee_online']) || ONLINE_COPY_PLATFORM_FEE_PERCENTAGE;
    const counterFee = parseFloat(settingsMap['platform_fee_counter']) || COUNTER_COPY_PLATFORM_FEE_PERCENTAGE;
    const minimumFee = parseFloat(settingsMap['platform_fee_minimum']) || PLATFORM_FEE_MINIMUM;

    // Update cache
    feeCache = {
      onlineFee,
      counterFee,
      minimumFee,
      updatedAt: Date.now(),
    };

    return feeCache;
  } catch (error) {
    console.error('Failed to read platform fee settings from DB, using constants:', error);
    // Return defaults from constants
    return {
      onlineFee: ONLINE_COPY_PLATFORM_FEE_PERCENTAGE,
      counterFee: COUNTER_COPY_PLATFORM_FEE_PERCENTAGE,
      minimumFee: PLATFORM_FEE_MINIMUM,
    };
  }
}

/**
 * Calculate platform fee for a given price and ticket type.
 * Uses admin-configured percentages from the database.
 */
export async function calculatePlatformFee(
  price: number,
  ticketType: 'online_copy' | 'counter_copy'
): Promise<number> {
  const fees = await getPlatformFees();
  const feePercentage = ticketType === 'online_copy' ? fees.onlineFee : fees.counterFee;
  return Math.max(fees.minimumFee, Math.round(price * (feePercentage / 100)));
}
