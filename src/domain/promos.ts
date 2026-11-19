import { ValidationError } from '../errors';

/**
 * Promo codes and the discount each one gives.
 * STUDENT pays 80% of the price, STAFF pays 50%.
 *
 * A Map, not a plain object: a plain object also "has" inherited keys such as
 * "toString" and "constructor", and a missing key gives undefined instead of an error.
 */
const PROMOS = new Map<string, number>([
  ['STUDENT', 0.8],
  ['STAFF', 0.5],
]);

/** The fraction of the price to charge. No code means full price. Unknown code: fail closed. */
export function discountRate(code?: string): number {
  if (code === undefined) return 1;
  const rate = PROMOS.get(code);
  if (rate === undefined) throw new ValidationError('unknown promo code');
  return rate;
}
