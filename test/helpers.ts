import type { Server } from 'node:http';
import type { AddressInfo } from 'node:net';
import { openDatabase } from '../src/db/database';
import { createApp } from '../src/app';

/** Starts the app on a free port with a fresh database. Returns a small fetch helper. */
export async function startServer() {
  await openDatabase();
  const server: Server = await new Promise((resolve) => {
    const s = createApp().listen(0, () => resolve(s));
  });
  const base = `http://localhost:${(server.address() as AddressInfo).port}`;

  async function call(method: 'GET' | 'POST', path: string, body?: unknown) {
    const res = await fetch(base + path, {
      method,
      headers: body === undefined ? {} : { 'Content-Type': 'application/json' },
      body: body === undefined ? undefined : JSON.stringify(body),
    });
    return { status: res.status, json: (await res.json()) as any };
  }

  return {
    get: (path: string) => call('GET', path),
    post: (path: string, body: unknown) => call('POST', path, body),
    close: () => new Promise<void>((r) => server.close(() => r())),
  };
}
