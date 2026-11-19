import { PGlite } from '@electric-sql/pglite';
import { pgcrypto } from '@electric-sql/pglite/contrib/pgcrypto';

/**
 * The DATABASE. This is real PostgreSQL, compiled to WebAssembly (PGlite), running
 * inside the Node process. Nothing to install: it is created in memory and re-seeded
 * every time the server starts, so you can attack it as much as you like.
 *
 * Only the models (src/models/) may import `db`.
 */
export type Db = PGlite;

const SCHEMA = `
  CREATE EXTENSION IF NOT EXISTS pgcrypto;

  CREATE TABLE events (
    id     integer PRIMARY KEY,
    title  text    NOT NULL,
    venue  text    NOT NULL,
    price  integer NOT NULL            -- whole dollars per ticket
  );

  CREATE TABLE users (
    id            integer PRIMARY KEY,
    name          text NOT NULL UNIQUE,
    password_hash text NOT NULL,        -- bcrypt hash, never the password itself
    role          text NOT NULL
  );

  CREATE TABLE bookings (
    id        serial  PRIMARY KEY,
    event_id  integer NOT NULL REFERENCES events(id),
    customer  text    NOT NULL,          -- the customer's email
    qty       integer NOT NULL,
    total     double precision NOT NULL  -- dollars charged
  );
`;

const SEED = `
  INSERT INTO events VALUES
    (1, 'Jazz Night',     'Performing Arts Center', 25),
    (2, 'Robotics Expo',  'Communications Facility', 10),
    (3, 'Spring Concert', 'Carver Gym',             40);

  INSERT INTO users VALUES
    (1, 'alice', crypt('correct-horse-42', gen_salt('bf', 6)), 'admin'),
    (2, 'bob',   crypt('hunter2',          gen_salt('bf', 6)), 'customer'),
    (3, 'carol', crypt('letmein!',         gen_salt('bf', 6)), 'customer');

  INSERT INTO bookings (id, event_id, customer, qty, total) VALUES
    (101, 1, 'bob@example.edu',   2,  50),
    (102, 3, 'carol@example.edu', 1,  40),
    (103, 2, 'dana@example.edu',  4,  40);
  SELECT setval('bookings_id_seq', 103);
`;

/** The one database connection. Set by openDatabase() before the server starts. */
export let db: Db;

/** Creates a fresh, seeded in-memory database. */
export async function openDatabase(): Promise<Db> {
  db = new PGlite({ extensions: { pgcrypto } });
  await db.exec(SCHEMA);
  await db.exec(SEED);
  return db;
}
