import { db } from '@/lib/db';

/**
 * Generates a prefixed sequential ID using the Counter model.
 * 
 * Prefix mapping:
 * - KYC- → Kyc records
 * - ETR- → Ticket records
 * - ORD- → Order records
 * - TXN- → Transaction (Payment Transaction) records
 * - WLT- → Transaction (Wallet Transaction) records
 * - WDR- → Withdrawal records
 * - PAY- → Payout (Withdrawal approved) records
 * - REF- → Refund records
 * - DSP- → Dispute records
 * - SUP- → Support Ticket records
 */

type IdPrefix = 'KYC' | 'ETR' | 'ORD' | 'TXN' | 'WLT' | 'WDR' | 'PAY' | 'REF' | 'DSP' | 'SUP';

const PREFIX_COUNTER_NAMES: Record<IdPrefix, string> = {
  KYC: 'kyc_seq',
  ETR: 'ticket_seq',
  ORD: 'order_seq',
  TXN: 'txn_seq',
  WLT: 'wlt_seq',
  WDR: 'wdr_seq',
  PAY: 'pay_seq',
  REF: 'ref_seq',
  DSP: 'dsp_seq',
  SUP: 'sup_seq',
};

/**
 * Generates the next sequential prefixed ID.
 * Uses atomic counter increment via Prisma upsert to ensure uniqueness.
 * 
 * @param prefix - The ID prefix (e.g., 'KYC', 'ETR', 'ORD')
 * @returns The generated ID string (e.g., 'KYC-1', 'ETR-1', 'ORD-1')
 */
export async function generatePrefixedId(prefix: IdPrefix): Promise<string> {
  const counterName = PREFIX_COUNTER_NAMES[prefix];

  // Atomically increment the counter using upsert
  const counter = await db.counter.upsert({
    where: { name: counterName },
    update: { value: { increment: 1 } },
    create: { name: counterName, value: 1 },
  });

  return `${prefix}-${counter.value}`;
}

/**
 * Generates multiple prefixed IDs in batch for seeding.
 * For each prefix, returns IDs starting from the current counter value + 1.
 * 
 * @param prefix - The ID prefix
 * @param count - Number of IDs to generate
 * @returns Array of generated ID strings
 */
export async function generatePrefixedIdsBatch(prefix: IdPrefix, count: number): Promise<string[]> {
  const counterName = PREFIX_COUNTER_NAMES[prefix];

  // Atomically set counter to count
  const counter = await db.counter.upsert({
    where: { name: counterName },
    update: { value: count },
    create: { name: counterName, value: count },
  });

  // Generate IDs 1 through count
  const ids: string[] = [];
  for (let i = 1; i <= count; i++) {
    ids.push(`${prefix}-${i}`);
  }

  return ids;
}

/**
 * Format an existing prefixed ID for display.
 * Just returns the ID as-is since the format is already user-friendly.
 */
export function formatPrefixedId(id: string): string {
  return id;
}
