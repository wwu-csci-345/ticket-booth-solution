import type { Request, Response, NextFunction } from 'express';
import { HttpError } from '../errors';
import { view } from '../views/jsonView';

/**
 * Turns any thrown error into a JSON response.
 *
 * DEMO ONLY: for a 500 it sends the raw error message (including database errors)
 * back to the client so you can see what the database said. A real server would
 * log it and send a generic message instead.
 */
export function errorHandler(err: unknown, _req: Request, res: Response, _next: NextFunction) {
  const status = err instanceof HttpError ? err.status : 500;
  const message = err instanceof Error ? err.message : 'Unexpected error';
  if (status >= 500) console.error('ERROR', message);
  view.error(res, status, message);
}
