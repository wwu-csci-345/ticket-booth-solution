import { db } from '../db/database';

export interface User {
  id: number;
  name: string;
  role: string;
}

/** MODEL: all SQL for the `users` table. */
export const UserModel = {
  /**
   * Returns the user if the name and password match, otherwise undefined.
   * The database checks the password against the bcrypt hash with crypt().
   */
  async login(name: string, password: string): Promise<User | undefined> {
    // FIX: parameters instead of pasting name and password into the SQL text.
    const { rows } = await db.query<User>(
      'SELECT id, name, role FROM users WHERE name = $1 AND password_hash = crypt($2, password_hash)',
      [name, password],
    );
    return rows[0];
  },
};
