import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { startServer } from './helpers';

/**
 * Normal use of the API by honest customers. All of these must pass after your
 * fixes: a fix that breaks honest customers is not a fix.
 */
let api: Awaited<ReturnType<typeof startServer>>;
beforeAll(async () => { api = await startServer(); });
afterAll(async () => { await api.close(); });

describe('events', () => {
  it('searches by title', async () => {
    const r = await api.get('/api/events?q=jazz');
    expect(r.status).toBe(200);
    expect(r.json.data).toEqual([{ id: 1, title: 'Jazz Night', venue: 'Performing Arts Center', price: 25 }]);
  });

  it('an empty search lists every event', async () => {
    const r = await api.get('/api/events');
    expect(r.json.data.map((e: { id: number }) => e.id)).toEqual([1, 2, 3]);
  });

  it('a search with an apostrophe is just text', async () => {
    const r = await api.get('/api/events?q=' + encodeURIComponent("Rock 'n' Roll"));
    expect(r.status).toBe(200);
    expect(r.json.data).toEqual([]);
  });

  it('shows one event', async () => {
    const r = await api.get('/api/events/3');
    expect(r.json.data.title).toBe('Spring Concert');
  });
});

describe('login', () => {
  it('accepts the right password', async () => {
    const r = await api.post('/api/login', { name: 'alice', password: 'correct-horse-42' });
    expect(r.status).toBe(200);
    expect(r.json.data.user).toEqual({ id: 1, name: 'alice', role: 'admin' });
  });

  it('rejects a wrong password', async () => {
    const r = await api.post('/api/login', { name: 'alice', password: 'guess' });
    expect(r.status).toBe(401);
  });
});

describe('bookings', () => {
  it('books tickets at full price', async () => {
    const r = await api.post('/api/bookings', { eventId: 1, customer: 'erin@example.edu', qty: 2, price: 25 });
    expect(r.status).toBe(201);
    expect(r.json.data).toMatchObject({ event_id: 1, customer: 'erin@example.edu', qty: 2, total: 50 });
  });

  it('applies a promo code', async () => {
    const r = await api.post('/api/bookings', { eventId: 3, customer: 'erin@example.edu', qty: 1, price: 40, promo: 'STUDENT' });
    expect(r.status).toBe(201);
    expect(r.json.data.total).toBe(32);
  });

  it('looks up one booking by number', async () => {
    const r = await api.get('/api/bookings/101');
    expect(r.status).toBe(200);
    expect(r.json.data).toHaveLength(1);
    expect(r.json.data[0]).toMatchObject({ id: 101, customer: 'bob@example.edu' });
  });
});
