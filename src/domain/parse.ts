import { ValidationError } from '../errors';

/**
 * A booking request we can trust. Note what is NOT here: the price.
 * The client sends choices (which event, how many, which code);
 * the server owns facts (what a ticket costs).
 */
export interface BookingRequest {
  eventId: number;
  customer: string;
  qty: number;
  promo?: string;
}

/**
 * Parse, don't validate: turn the untrusted JSON body of POST /api/bookings into a
 * BookingRequest, or throw a ValidationError (the error handler turns it into a 400).
 * Any other field in the body (such as "price") is ignored.
 */
export function parseBookingRequest(json: unknown): BookingRequest {
  if (typeof json !== 'object' || json === null || Array.isArray(json)) {
    throw new ValidationError('body must be a JSON object');
  }
  const { eventId, customer, qty, promo } = json as Record<string, unknown>;

  if (typeof eventId !== 'number' || !Number.isInteger(eventId) || eventId < 1) {
    throw new ValidationError('eventId must be a positive integer');
  }
  if (typeof customer !== 'string' || !/^[^@\s]{1,64}@[^@\s]{1,64}$/.test(customer)) {
    throw new ValidationError('customer must be an email address');
  }
  if (typeof qty !== 'number' || !Number.isInteger(qty) || qty < 1 || qty > 10) {
    throw new ValidationError('qty must be an integer 1..10');
  }
  if (promo !== undefined && (typeof promo !== 'string' || !/^[A-Z0-9]{1,20}$/.test(promo))) {
    throw new ValidationError('promo must be 1-20 capital letters or digits');
  }

  return promo === undefined ? { eventId, customer, qty } : { eventId, customer, qty, promo };
}
