import { db } from '../db/database';

export interface Event {
  id: number;
  title: string;
  venue: string;
  price: number;
}

/** MODEL: all SQL for the `events` table. */
export const EventModel = {
  /** Events whose title contains `q` (case-insensitive). */
  async search(q: string): Promise<Event[]> {
    // FIX: q travels as a parameter, so it is always data, never SQL.
    const { rows } = await db.query<Event>(
      "SELECT id, title, venue, price FROM events WHERE title ILIKE '%' || $1 || '%' ORDER BY id",
      [q],
    );
    return rows;
  },

  async findById(id: number): Promise<Event | undefined> {
    const { rows } = await db.query<Event>(
      'SELECT id, title, venue, price FROM events WHERE id = $1',
      [id],
    );
    return rows[0];
  },
};
