import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { startServer } from './helpers';

/**
 * Every attack from Part A of the quiz, replayed against the fixed code.
 * (Instructor copy, useful for grading: copy this file into a student's repo and run npm test.)
 */
let api: Awaited<ReturnType<typeof startServer>>;
beforeAll(async () => { api = await startServer(); });
afterAll(async () => { await api.close(); });

const order = (extra: object) => ({ eventId: 3, customer: 'mallory@example.edu', qty: 2, ...extra });

describe('A1: the server owns the price', () => {
  it('ignores a price sent by the client', async () => {
    const r = await api.post('/api/bookings', order({ price: 0.01 }));
    expect(r.status).toBe(201);
    expect(r.json.data.total).toBe(80);
  });
});

describe("A2: parse, don't validate; fail closed", () => {
  it.each([
    ['negative qty', { qty: -2 }],
    ['zero qty', { qty: 0 }],
    ['fractional qty', { qty: 2.5 }],
    ['string qty', { qty: '3' }],
    ['huge qty', { qty: 1e308 }],
    ['missing customer', { customer: undefined }],
    ['eventId as SQL', { eventId: '1 OR 1=1' }],
    ['unknown promo', { promo: 'BOGUS' }],
    ['inherited key as promo', { promo: 'toString' }],
  ])('%s -> 400', async (_name, extra) => {
    const r = await api.post('/api/bookings', order(extra));
    expect(r.status).toBe(400);
  });

  it('a body that is not an object -> 400', async () => {
    const r = await api.post('/api/bookings', [1, 2, 3]);
    expect(r.status).toBe(400);
  });

  it('none of the rejected requests wrote a row', async () => {
    expect((await api.get('/api/bookings/105')).status).toBe(404);
  });
});

describe('A3: login bypass', () => {
  it.each([
    ["alice' --", 'x'],
    ["x' OR 1=1 --", 'x'],
    ['alice', "x') OR 1=1 --"],
  ])('name %j password %j -> 401', async (name, password) => {
    const r = await api.post('/api/login', { name, password });
    expect(r.status).toBe(401);
  });
});

describe('A4: UNION through the search box', () => {
  it('returns no rows, and no hashes', async () => {
    const q = "zzz' UNION SELECT id, name, password_hash, 0 FROM users --";
    const r = await api.get('/api/events?q=' + encodeURIComponent(q));
    expect(r.status).toBe(200);
    expect(r.json.data).toEqual([]);
    expect(JSON.stringify(r.json)).not.toContain('$2a$');
  });
});

describe('A5: numeric injection', () => {
  it('0 OR 1=1 is rejected, not run', async () => {
    const r = await api.get('/api/bookings/' + encodeURIComponent('0 OR 1=1'));
    expect(r.status).toBe(400);
  });
});
