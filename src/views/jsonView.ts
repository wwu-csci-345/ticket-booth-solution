import type { Response } from 'express';

/** The VIEW layer of MVC: one place that shapes every JSON response. */
export const view = {
  ok(res: Response, data: unknown) {
    return res.status(200).json({ data });
  },
  created(res: Response, data: unknown) {
    return res.status(201).json({ data });
  },
  error(res: Response, status: number, message: string) {
    return res.status(status).json({ error: { status, message } });
  },
};
