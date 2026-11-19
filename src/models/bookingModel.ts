import { db } from '../db/database';

export interface Booking {
  id: number;
  event_id: number;
  customer: string;
  qty: number;
  total: number;
}

/** MODEL: all SQL for the `bookings` table. */
export const BookingModel = {
  async create(b: { eventId: number; customer: string; qty: number; total: number }): Promise<Booking> {
    const { rows } = await db.query<Booking>(
      `INSERT INTO bookings (event_id, customer, qty, total)
       VALUES ($1, $2, $3, $4)
       RETURNING id, event_id, customer, qty, total`,
      [b.eventId, b.customer, b.qty, b.total],
    );
    return rows[0]!;
  },

  /** A customer looks up their own booking by its number. */
  async findById(id: number): Promise<Booking[]> {
    // FIX: a parameter. (Escaping quotes would not have helped here: "0 OR 1=1" has none.)
    const { rows } = await db.query<Booking>(
      'SELECT id, event_id, customer, qty, total FROM bookings WHERE id = $1',
      [id],
    );
    return rows;
  },
};
